-- Lets admins promote specific products into storefront "featured" spots
-- (homepage/shop highlights) without relying on tags or manual queries.
alter table public.products
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_sort_order integer not null default 0;

create index if not exists products_featured_idx on public.products (is_featured, featured_sort_order)
  where is_featured = true;
