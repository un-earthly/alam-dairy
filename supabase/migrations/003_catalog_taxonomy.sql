-- Catalog taxonomy: categories, brands, and richer product metadata.
-- Additive-only: existing insert/upsert payloads (scripts/seed.mjs,
-- scripts/seed-agromukam-import.mjs, ProductForm) keep working unmodified.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  name_bn text not null,
  name_en text not null,
  description_bn text,
  description_en text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index categories_parent_idx on public.categories(parent_id);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.products
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists brand_id uuid references public.brands(id) on delete set null,
  add column if not exists has_variants boolean not null default false,
  add column if not exists subscription_eligible boolean not null default false,
  add column if not exists allow_backorder boolean not null default false,
  add column if not exists preorder_release_date date,
  add column if not exists seo_title_bn text,
  add column if not exists seo_title_en text,
  add column if not exists seo_description_bn text,
  add column if not exists seo_description_en text,
  add column if not exists og_image_url text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_brand_idx on public.products(brand_id);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

alter table public.categories enable row level security;
alter table public.brands enable row level security;

create policy "categories_public_read" on public.categories for select using (is_active = true);
create policy "categories_admin_all" on public.categories for all using (public.is_staff()) with check (public.is_staff());
create policy "brands_public_read" on public.brands for select using (is_active = true);
create policy "brands_admin_all" on public.brands for all using (public.is_staff()) with check (public.is_staff());

-- Seed root categories 1:1 with the existing `type` enum so every product gets a
-- category_id immediately; a later backfill adds real subcategories for the
-- imported competitor catalog.
insert into public.categories (slug, name_bn, name_en, sort_order) values
  ('dairy', 'দুগ্ধজাত পণ্য', 'Dairy', 1),
  ('cattle', 'গবাদি পশু', 'Cattle', 2),
  ('feed', 'পশুখাদ্য', 'Feed', 3),
  ('equipment', 'সরঞ্জাম', 'Equipment', 4),
  ('vet_supply', 'পশু চিকিৎসা সামগ্রী', 'Vet Supply', 5)
on conflict (slug) do nothing;

update public.products p
  set category_id = c.id
  from public.categories c
  where c.slug = p.type and p.category_id is null;
