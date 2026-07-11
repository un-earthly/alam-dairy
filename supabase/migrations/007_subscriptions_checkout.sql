-- Subscription checkout: renewal engine + create-subscription entry point.
-- Both are security-definer, callable only via the service role (see revokes
-- at the bottom), mirroring create_order's pattern.

create or replace function public.process_subscription_renewal(
  p_subscription_id uuid,
  p_strict boolean default false
)
returns table (
  order_id uuid, order_number text, access_token uuid,
  skipped boolean, failed boolean, error_reason text
)
language plpgsql security definer set search_path = public
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_unit_price numeric;
  v_tier_price numeric;
  v_order_id uuid;
  v_order_number text;
  v_access_token uuid;
  v_product_active boolean;
begin
  select * into v_sub from public.subscriptions where id = p_subscription_id for update;
  if not found then raise exception 'subscription_not_found'; end if;

  if v_sub.status <> 'active' then
    if p_strict then raise exception 'subscription_not_active'; end if;
    return query select null::uuid, null::text, null::uuid, false, true, 'not_active';
    return;
  end if;

  if exists (select 1 from public.subscription_orders where subscription_id = p_subscription_id and cycle_date = current_date) then
    return query select null::uuid, null::text, null::uuid, false, true, 'already_processed_today';
    return;
  end if;

  if v_sub.skip_next_cycle then
    update public.subscriptions
      set skip_next_cycle = false,
          next_billing_date = public.next_subscription_date(next_billing_date, frequency)
      where id = p_subscription_id;
    insert into public.subscription_orders (subscription_id, order_id, cycle_date, skipped)
      values (p_subscription_id, null, current_date, true);
    return query select null::uuid, null::text, null::uuid, true, false, null;
    return;
  end if;

  select is_active into v_product_active from public.products where id = v_sub.product_id;
  if v_product_active is not true then
    if p_strict then raise exception 'insufficient_stock'; end if;
    update public.subscriptions set last_renewal_status = 'failed', last_renewal_error = 'product_inactive', last_renewal_at = now() where id = p_subscription_id;
    return query select null::uuid, null::text, null::uuid, false, true, 'product_inactive';
    return;
  end if;

  if v_sub.variant_id is not null then
    update public.product_variants
      set stock = stock - v_sub.quantity
      where id = v_sub.variant_id and is_active = true and stock >= v_sub.quantity
      returning coalesce(sale_price, price) into v_unit_price;
  else
    update public.products
      set stock = stock - v_sub.quantity
      where id = v_sub.product_id and stock >= v_sub.quantity
      returning coalesce(sale_price, price) into v_unit_price;
  end if;

  if not found then
    if p_strict then raise exception 'insufficient_stock'; end if;
    update public.subscriptions set last_renewal_status = 'failed', last_renewal_error = 'insufficient_stock', last_renewal_at = now() where id = p_subscription_id;
    return query select null::uuid, null::text, null::uuid, false, true, 'insufficient_stock';
    return;
  end if;

  v_unit_price := v_unit_price * (1 - v_sub.discount_percent / 100.0);

  select price into v_tier_price
    from public.bulk_pricing_tiers
    where product_id = v_sub.product_id
      and (variant_id = v_sub.variant_id or variant_id is null)
      and min_qty <= v_sub.quantity
    order by (variant_id is not null) desc, min_qty desc
    limit 1;
  if v_tier_price is not null and v_tier_price < v_unit_price then
    v_unit_price := v_tier_price;
  end if;

  insert into public.orders
    (user_id, status, total, payment_method, payment_status, address, notes,
     order_number, contact_phone, contact_email)
  values
    (v_sub.user_id, 'pending', v_unit_price * v_sub.quantity, v_sub.payment_method, 'pending', v_sub.address,
     'Subscription renewal', 'AD' || to_char(now(), 'YYMMDD') || '-' || nextval('public.order_number_seq'),
     v_sub.contact_phone, v_sub.contact_email)
  returning id, order_number, access_token into v_order_id, v_order_number, v_access_token;

  insert into public.order_items (order_id, product_id, variant_id, quantity, unit_price, total)
  values (v_order_id, v_sub.product_id, v_sub.variant_id, v_sub.quantity, v_unit_price, v_unit_price * v_sub.quantity);

  insert into public.subscription_orders (subscription_id, order_id, cycle_date, skipped)
  values (p_subscription_id, v_order_id, current_date, false);

  update public.subscriptions
    set last_order_id = v_order_id,
        next_billing_date = public.next_subscription_date(next_billing_date, frequency),
        last_renewal_status = 'success',
        last_renewal_error = null,
        last_renewal_at = now()
    where id = p_subscription_id;

  return query select v_order_id, v_order_number, v_access_token, false, false, null;
end;
$$;

create or replace function public.create_subscription(
  p_user_id uuid,
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_frequency text,
  p_address jsonb,
  p_payment_method text,
  p_contact_phone text,
  p_contact_email text
)
returns table (subscription_id uuid, order_id uuid, order_number text, access_token uuid)
language plpgsql security definer set search_path = public
as $$
declare
  v_plan public.product_subscription_plans%rowtype;
  v_base_price numeric;
  v_subscription_id uuid;
  v_result record;
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'invalid_item'; end if;

  select * into v_plan from public.product_subscription_plans
    where product_id = p_product_id
      and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null))
      and frequency = p_frequency
      and is_active = true
    limit 1;
  if not found then raise exception 'plan_not_found'; end if;

  if p_variant_id is not null then
    select coalesce(sale_price, price) into v_base_price from public.product_variants where id = p_variant_id and is_active = true;
  else
    select coalesce(sale_price, price) into v_base_price from public.products where id = p_product_id and is_active = true;
  end if;
  if v_base_price is null then raise exception 'product_unavailable'; end if;

  insert into public.subscriptions
    (user_id, product_id, variant_id, frequency, quantity, discount_percent, unit_price,
     status, next_billing_date, address, payment_method, contact_phone, contact_email)
  values
    (p_user_id, p_product_id, p_variant_id, p_frequency, p_quantity, v_plan.discount_percent,
     v_base_price * (1 - v_plan.discount_percent / 100.0),
     'active', current_date, p_address, p_payment_method, p_contact_phone, p_contact_email)
  returning id into v_subscription_id;

  select * into v_result from public.process_subscription_renewal(v_subscription_id, true);

  return query select v_subscription_id, v_result.order_id, v_result.order_number, v_result.access_token;
end;
$$;

revoke execute on function public.process_subscription_renewal(uuid, boolean) from public, anon, authenticated;
revoke execute on function public.create_subscription(uuid, uuid, uuid, integer, text, jsonb, text, text, text) from public, anon, authenticated;
