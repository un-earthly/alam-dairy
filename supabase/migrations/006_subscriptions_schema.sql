-- Subscription purchasing schema. Automation (later migration) means a
-- cron-generated recurring ORDER, not an auto-charge — there is no payment
-- gateway integration in this codebase (payment_method is effectively 'cod'
-- only at the checkout validation layer today).

create or replace function public.next_subscription_date(p_date date, p_frequency text)
returns date language sql immutable as $$
  select case p_frequency
    when 'daily' then p_date + 1
    when 'weekly' then p_date + 7
    when 'biweekly' then p_date + 14
    when 'monthly' then (p_date + interval '1 month')::date
    else p_date + 7
  end;
$$;

create table public.product_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  frequency text not null check (frequency in ('daily','weekly','biweekly','monthly')),
  discount_percent numeric not null default 0 check (discount_percent between 0 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index product_subscription_plans_unique_idx on public.product_subscription_plans (
  product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid), frequency
);

alter table public.product_subscription_plans enable row level security;
create policy "subscription_plans_public_read" on public.product_subscription_plans for select using (is_active = true or public.is_staff());
create policy "subscription_plans_admin_all" on public.product_subscription_plans for all using (public.is_staff()) with check (public.is_staff());

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  frequency text not null check (frequency in ('daily','weekly','biweekly','monthly')),
  quantity integer not null check (quantity > 0),
  discount_percent numeric not null default 0,
  unit_price numeric not null,
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  next_billing_date date not null,
  skip_next_cycle boolean not null default false,
  paused_at timestamptz,
  cancelled_at timestamptz,
  address jsonb not null default '{}',
  payment_method text not null check (payment_method in ('bkash','nagad','card','cod','bank_transfer')),
  contact_phone text,
  contact_email text,
  last_order_id uuid references public.orders(id) on delete set null,
  last_renewal_status text check (last_renewal_status in ('success','failed')),
  last_renewal_error text,
  last_renewal_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions(user_id);
create index subscriptions_due_idx on public.subscriptions(status, next_billing_date);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

alter table public.subscriptions enable row level security;
create policy "subscriptions_select_own" on public.subscriptions for select using (user_id = auth.uid() or public.is_staff());
create policy "subscriptions_admin_all" on public.subscriptions for all using (public.is_staff()) with check (public.is_staff());
-- Intentionally no customer INSERT/UPDATE policy yet: subscriptions are created
-- only via the security-definer create_subscription() RPC and renewed via
-- process_subscription_renewal() (both added in a later migration). Customer
-- self-service pause/resume/cancel/skip lands together with a protective
-- trigger in a later migration — shipping a raw UPDATE policy before that
-- guard exists would let a customer rewrite their own price/next_billing_date.

create table public.subscription_orders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  cycle_date date not null,
  skipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (subscription_id, cycle_date)
);

alter table public.subscription_orders enable row level security;
create policy "subscription_orders_select" on public.subscription_orders for select using (
  exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_staff()))
);
create policy "subscription_orders_admin_all" on public.subscription_orders for all using (public.is_staff()) with check (public.is_staff());
