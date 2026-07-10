-- Checkout pipeline: order numbers, guest access tokens, atomic order creation, RLS hardening

-- New order columns
alter table public.orders
  add column if not exists order_number text unique,
  add column if not exists access_token uuid not null default gen_random_uuid(),
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists delivery_fee numeric not null default 0;

create sequence if not exists public.order_number_seq;

-- Staff check helper (security definer so policies avoid recursive profile lookups)
create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

grant execute on function public.is_staff() to anon, authenticated;

-- Atomic order creation: recomputes prices server-side, decrements stock, inserts order + items.
-- Callable only via the service role (execute revoked from anon/authenticated below).
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
  v_qty integer;
  v_unit_price numeric;
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
    v_qty := (v_item->>'quantity')::integer;

    if v_product_id is null or v_qty is null or v_qty <= 0 then
      raise exception 'invalid_item';
    end if;

    update public.products
      set stock = stock - v_qty
      where id = v_product_id and is_active = true and stock >= v_qty
      returning coalesce(sale_price, price) into v_unit_price;

    if not found then
      raise exception 'insufficient_stock';
    end if;

    v_total := v_total + v_unit_price * v_qty;

    insert into public.order_items (order_id, product_id, quantity, unit_price, total)
    values (v_order_id, v_product_id, v_qty, v_unit_price, v_unit_price * v_qty);
  end loop;

  update public.orders set total = v_total where id = v_order_id;

  return query select v_order_id, v_order_number, v_access_token;
end;
$$;

revoke execute on function public.create_order(uuid, jsonb, text, text, text, text, jsonb)
  from public, anon, authenticated;

-- RLS hardening: no direct client writes to orders/order_items
drop policy if exists "orders_insert_any" on public.orders;
drop policy if exists "order_items_insert" on public.order_items;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own" on public.orders for select using (
  user_id = auth.uid() or public.is_staff()
);

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders for update using (public.is_staff());

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())
  )
);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products for all
  using (public.is_staff()) with check (public.is_staff());

-- Staff can view all profiles (admin customers page)
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles for select using (public.is_staff());
