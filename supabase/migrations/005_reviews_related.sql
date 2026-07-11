-- Customer reviews and related/cross-sell/upsell product relationships.

create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index product_reviews_product_idx on public.product_reviews(product_id);

alter table public.product_reviews enable row level security;
create policy "product_reviews_public_read" on public.product_reviews for select using (
  is_approved = true or user_id = auth.uid() or public.is_staff()
);
create policy "product_reviews_insert_own" on public.product_reviews for insert with check (user_id = auth.uid());
create policy "product_reviews_admin_update" on public.product_reviews for update using (public.is_staff());
create policy "product_reviews_admin_delete" on public.product_reviews for delete using (public.is_staff());

create table public.related_products (
  product_id uuid not null references public.products(id) on delete cascade,
  related_product_id uuid not null references public.products(id) on delete cascade,
  relation_type text not null default 'related' check (relation_type in ('related','cross_sell','upsell')),
  sort_order integer not null default 0,
  primary key (product_id, related_product_id, relation_type),
  check (product_id <> related_product_id)
);

alter table public.related_products enable row level security;
create policy "related_products_public_read" on public.related_products for select using (true);
create policy "related_products_admin_all" on public.related_products for all using (public.is_staff()) with check (public.is_staff());
