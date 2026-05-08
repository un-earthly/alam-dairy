-- Profiles (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  phone text,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'farmer', 'admin', 'staff')),
  is_farmer boolean not null default false,
  credit_limit numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  name_en text not null,
  description_bn text,
  description_en text,
  type text not null check (type in ('dairy', 'feed', 'cattle', 'equipment', 'vet_supply')),
  price numeric not null,
  sale_price numeric,
  unit text not null default 'piece',
  stock integer not null default 0,
  is_active boolean not null default true,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists products_type_idx on public.products(type);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_slug_idx on public.products(slug);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','confirmed','processing','dispatched','delivered','cancelled')),
  total numeric not null,
  payment_method text not null check (payment_method in ('bkash','nagad','card','cod','bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  address jsonb not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);

-- Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  unit_price numeric not null,
  total numeric not null
);

create index if not exists order_items_order_idx on public.order_items(order_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles: users can read/update their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Products: publicly readable, only admin/staff can mutate
create policy "products_public_read" on public.products for select using (is_active = true);
create policy "products_admin_all" on public.products for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'))
);

-- Orders: users see own orders, admin sees all
create policy "orders_select_own" on public.orders for select using (
  user_id = auth.uid() or
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'))
);
create policy "orders_insert_any" on public.orders for insert with check (true);
create policy "orders_update_admin" on public.orders for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'))
);

-- Order items: follow order visibility
create policy "order_items_select" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (
      o.user_id = auth.uid() or
      exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'))
    )
  )
);
create policy "order_items_insert" on public.order_items for insert with check (true);

-- Seed: sample dairy products
insert into public.products (slug, name_bn, name_en, type, price, unit, stock, is_active, tags, images)
values
  ('fresh-milk-1l', 'তাজা দুধ ১ লিটার', 'Fresh Milk 1 Litre', 'dairy', 80, 'litre', 200, true, '{"milk","fresh","halal"}', '{}'),
  ('mishti-doi-500g', 'মিষ্টি দই ৫০০ গ্রাম', 'Mishti Doi 500g', 'dairy', 120, '500g', 50, true, '{"yogurt","sweets","halal"}', '{}'),
  ('pure-ghee-500g', 'খাঁটি ঘি ৫০০ গ্রাম', 'Pure Ghee 500g', 'dairy', 850, '500g', 30, true, '{"ghee","halal"}', '{}'),
  ('cattle-feed-50kg', 'গরুর খাবার ৫০ কেজি', 'Cattle Feed 50kg', 'feed', 1200, '50kg bag', 100, true, '{"feed","cattle"}', '{}'),
  ('mineral-block', 'মিনারেল ব্লক', 'Mineral Block', 'vet_supply', 350, 'piece', 40, true, '{"vet","mineral"}', '{}')
on conflict (slug) do nothing;
