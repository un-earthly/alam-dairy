-- Product media gallery, variants, bulk pricing tiers, and variant-aware checkout.

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_bn text,
  alt_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, url)
);
create index product_media_product_idx on public.product_media(product_id, sort_order);

alter table public.product_media enable row level security;
create policy "product_media_public_read" on public.product_media for select using (
  exists (select 1 from public.products p where p.id = product_id and p.is_active = true)
  or public.is_staff()
);
create policy "product_media_admin_all" on public.product_media for all using (public.is_staff()) with check (public.is_staff());

-- One-time backfill: existing `images text[]` becomes product_media rows.
insert into public.product_media (product_id, url, sort_order)
select p.id, img, ord - 1
from public.products p, unnest(p.images) with ordinality as t(img, ord)
where not exists (select 1 from public.product_media pm where pm.product_id = p.id)
on conflict (product_id, url) do nothing;

-- Keep products.images in sync so every existing read path (ProductCard, PDP,
-- AddToCartButton, cart store's `image` field) keeps working unmodified.
-- product_media becomes the source of truth going forward; images[] mirrors it.
create or replace function public.sync_product_images()
returns trigger language plpgsql as $$
declare
  v_product_id uuid;
begin
  v_product_id := coalesce(new.product_id, old.product_id);
  update public.products
    set images = coalesce((
      select array_agg(url order by sort_order, created_at)
      from public.product_media where product_id = v_product_id
    ), '{}')
    where id = v_product_id;
  return null;
end;
$$;

drop trigger if exists product_media_sync_images on public.product_media;
create trigger product_media_sync_images
  after insert or update or delete on public.product_media
  for each row execute procedure public.sync_product_images();

-- Variants: opt-in/additive. Zero rows = product behaves exactly as today.
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text,
  name_bn text not null,
  name_en text not null,
  attributes jsonb not null default '{}',
  price numeric not null,
  sale_price numeric,
  stock integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants(product_id);

alter table public.product_variants enable row level security;
create policy "product_variants_public_read" on public.product_variants for select using (
  (is_active = true and exists (select 1 from public.products p where p.id = product_id and p.is_active = true))
  or public.is_staff()
);
create policy "product_variants_admin_all" on public.product_variants for all using (public.is_staff()) with check (public.is_staff());

create table public.bulk_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  min_qty integer not null check (min_qty > 1),
  price numeric not null check (price >= 0),
  created_at timestamptz not null default now()
);
create unique index bulk_pricing_tiers_unique_idx on public.bulk_pricing_tiers (
  product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), min_qty
);

alter table public.bulk_pricing_tiers enable row level security;
create policy "bulk_pricing_tiers_public_read" on public.bulk_pricing_tiers for select using (true);
create policy "bulk_pricing_tiers_admin_all" on public.bulk_pricing_tiers for all using (public.is_staff()) with check (public.is_staff());

alter table public.order_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null;

-- create_order: body-only change, signature unchanged, so the existing checkout
-- action (which only ever sends {id, quantity}) keeps working untouched —
-- variant_id and bulk tiers are additive reads inside the loop.
create or replace function public.create_order(
  p_user_id uuid,
  p_address jsonb,
  p_payment_method text,
  p_notes text,
  p_contact_phone text,
  p_contact_email text,
  p_items jsonb
)
returns table (order_id uuid, order_number text, access_token uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_access_token uuid;
  v_item jsonb;
  v_product_id uuid;
  v_variant_id uuid;
  v_qty integer;
  v_unit_price numeric;
  v_tier_price numeric;
  v_total numeric := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;

  v_order_number := 'AD' || to_char(now(), 'YYMMDD') || '-' || nextval('public.order_number_seq');

  insert into public.orders
    (user_id, status, total, payment_method, payment_status, address, notes,
     order_number, contact_phone, contact_email)
  values
    (p_user_id, 'pending', 0, p_payment_method, 'pending', p_address, p_notes,
     v_order_number, p_contact_phone, p_contact_email)
  returning orders.id, orders.access_token into v_order_id, v_access_token;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'id')::uuid;
    v_variant_id := nullif(v_item->>'variant_id', '')::uuid;
    v_qty := (v_item->>'quantity')::integer;

    if v_product_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'invalid_item';
    end if;

    if v_variant_id is not null then
      update public.product_variants
        set stock = stock - v_qty
        where id = v_variant_id and product_id = v_product_id and is_active = true and stock >= v_qty
        returning coalesce(sale_price, price) into v_unit_price;
    else
      update public.products
        set stock = stock - v_qty
        where id = v_product_id and is_active = true and stock >= v_qty
        returning coalesce(sale_price, price) into v_unit_price;
    end if;

    if not found then
      raise exception 'insufficient_stock';
    end if;

    -- bulk tier: prefer a variant-specific tier over a generic (variant_id null) one
    select price into v_tier_price
      from public.bulk_pricing_tiers
      where product_id = v_product_id
        and (variant_id = v_variant_id or variant_id is null)
        and min_qty <= v_qty
      order by (variant_id is not null) desc, min_qty desc
      limit 1;
    if v_tier_price is not null and v_tier_price < v_unit_price then
      v_unit_price := v_tier_price;
    end if;

    v_total := v_total + v_unit_price * v_qty;

    insert into public.order_items (order_id, product_id, variant_id, quantity, unit_price, total)
    values (v_order_id, v_product_id, v_variant_id, v_qty, v_unit_price, v_unit_price * v_qty);
  end loop;

  update public.orders set total = v_total where id = v_order_id;

  return query select v_order_id, v_order_number, v_access_token;
end;
$$;

revoke execute on function public.create_order(uuid, jsonb, text, text, text, text, jsonb)
  from public, anon, authenticated;
