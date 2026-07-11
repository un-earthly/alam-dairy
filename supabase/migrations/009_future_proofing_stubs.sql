-- Schema-only future-proofing for coupons, wishlist, loyalty, gift cards,
-- flash sales, bundles, multi-warehouse inventory, vendor marketplace, and
-- B2B pricing. No admin/storefront UI ships with this migration — these are
-- reserved tables for later feature work, not built-out features.

-- Coupons
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percent','fixed')),
  value numeric not null check (value > 0),
  min_order_total numeric not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  per_user_limit integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz not null default now()
);
alter table public.orders
  add column if not exists coupon_id uuid references public.coupons(id) on delete set null,
  add column if not exists discount_total numeric not null default 0;

-- Wishlist (user-owned)
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index wishlists_unique_idx on public.wishlists (
  user_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Loyalty
create table public.loyalty_accounts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  points_balance integer not null default 0,
  updated_at timestamptz not null default now()
);
create table public.loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  points_delta integer not null,
  reason text,
  created_at timestamptz not null default now()
);

-- Gift cards
create table public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_value numeric not null check (initial_value > 0),
  balance numeric not null,
  is_active boolean not null default true,
  issued_to_user_id uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.gift_card_redemptions (
  id uuid primary key default gen_random_uuid(),
  gift_card_id uuid not null references public.gift_cards(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount numeric not null,
  redeemed_at timestamptz not null default now()
);

-- Flash sales
create table public.flash_sales (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.flash_sale_products (
  id uuid primary key default gen_random_uuid(),
  flash_sale_id uuid not null references public.flash_sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  sale_price numeric not null
);
create unique index flash_sale_products_unique_idx on public.flash_sale_products (
  flash_sale_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Bundles
create table public.bundles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  name_en text not null,
  price numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);

-- Pre-order/backorder are already product-level flags from migration 003
-- (products.allow_backorder, products.preorder_release_date) — attributes,
-- not entities, so no stub table here.

-- Multi-warehouse
create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address jsonb not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.inventory_levels (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  stock integer not null default 0,
  updated_at timestamptz not null default now()
);
create unique index inventory_levels_unique_idx on public.inventory_levels (
  warehouse_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);
-- products.stock remains the single source of truth used by create_order /
-- process_subscription_renewal until multi-warehouse is actually built.

-- Marketplace (multi-vendor) — ties into profiles.role='farmer', already present
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  commission_percent numeric not null default 0,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.products
  add column if not exists vendor_id uuid references public.vendors(id) on delete set null;

-- B2B pricing — ties into profiles.credit_limit, already present but unused today
create table public.b2b_price_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  role text,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  price numeric not null,
  min_qty integer not null default 1,
  created_at timestamptz not null default now()
);

-- RLS: admin-only for all of the above except the two user-owned tables.
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.wishlists enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_ledger enable row level security;
alter table public.gift_cards enable row level security;
alter table public.gift_card_redemptions enable row level security;
alter table public.flash_sales enable row level security;
alter table public.flash_sale_products enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_levels enable row level security;
alter table public.vendors enable row level security;
alter table public.b2b_price_lists enable row level security;

create policy "coupons_admin_all" on public.coupons for all using (public.is_staff()) with check (public.is_staff());
create policy "coupon_redemptions_admin_all" on public.coupon_redemptions for all using (public.is_staff()) with check (public.is_staff());
create policy "wishlists_own" on public.wishlists for all using (user_id = auth.uid() or public.is_staff()) with check (user_id = auth.uid() or public.is_staff());
create policy "loyalty_accounts_select_own" on public.loyalty_accounts for select using (user_id = auth.uid() or public.is_staff());
create policy "loyalty_accounts_admin_write" on public.loyalty_accounts for insert with check (public.is_staff());
create policy "loyalty_accounts_admin_update" on public.loyalty_accounts for update using (public.is_staff());
create policy "loyalty_ledger_admin_all" on public.loyalty_ledger for all using (public.is_staff()) with check (public.is_staff());
create policy "gift_cards_admin_all" on public.gift_cards for all using (public.is_staff()) with check (public.is_staff());
create policy "gift_card_redemptions_admin_all" on public.gift_card_redemptions for all using (public.is_staff()) with check (public.is_staff());
create policy "flash_sales_public_read" on public.flash_sales for select using (is_active = true);
create policy "flash_sales_admin_all" on public.flash_sales for all using (public.is_staff()) with check (public.is_staff());
create policy "flash_sale_products_public_read" on public.flash_sale_products for select using (true);
create policy "flash_sale_products_admin_all" on public.flash_sale_products for all using (public.is_staff()) with check (public.is_staff());
create policy "bundles_public_read" on public.bundles for select using (is_active = true);
create policy "bundles_admin_all" on public.bundles for all using (public.is_staff()) with check (public.is_staff());
create policy "bundle_items_public_read" on public.bundle_items for select using (true);
create policy "bundle_items_admin_all" on public.bundle_items for all using (public.is_staff()) with check (public.is_staff());
create policy "warehouses_admin_all" on public.warehouses for all using (public.is_staff()) with check (public.is_staff());
create policy "inventory_levels_admin_all" on public.inventory_levels for all using (public.is_staff()) with check (public.is_staff());
create policy "vendors_admin_all" on public.vendors for all using (public.is_staff()) with check (public.is_staff());
create policy "b2b_price_lists_admin_all" on public.b2b_price_lists for all using (public.is_staff()) with check (public.is_staff());
