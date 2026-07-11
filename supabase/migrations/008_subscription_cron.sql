-- Cron-driven subscription renewal batch job + customer self-service
-- (pause/resume/cancel/skip-next-cycle) guarded by a trigger so customers
-- can only touch status/skip_next_cycle, never price or billing dates.

create or replace function public.process_due_subscriptions()
returns table (subscription_id uuid, order_id uuid, skipped boolean, failed boolean, error_reason text)
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_row record;
begin
  for v_id in
    select id from public.subscriptions
    where status = 'active' and next_billing_date <= current_date
    order by next_billing_date
  loop
    select * into v_row from public.process_subscription_renewal(v_id, false);
    return query select v_id, v_row.order_id, v_row.skipped, v_row.failed, v_row.error_reason;
  end loop;
end;
$$;

revoke execute on function public.process_due_subscriptions() from public, anon, authenticated;

create or replace function public.enforce_subscription_customer_update()
returns trigger language plpgsql as $$
begin
  if public.is_staff() then
    return new;
  end if;
  if new.user_id is distinct from old.user_id
     or new.product_id is distinct from old.product_id
     or new.variant_id is distinct from old.variant_id
     or new.quantity is distinct from old.quantity
     or new.unit_price is distinct from old.unit_price
     or new.discount_percent is distinct from old.discount_percent
     or new.next_billing_date is distinct from old.next_billing_date
     or new.frequency is distinct from old.frequency
  then
    raise exception 'not_allowed';
  end if;
  if new.status not in ('active','paused','cancelled') then raise exception 'not_allowed'; end if;
  if old.status = 'cancelled' then raise exception 'not_allowed'; end if;
  return new;
end;
$$;

drop trigger if exists subscriptions_customer_update_guard on public.subscriptions;
create trigger subscriptions_customer_update_guard
  before update on public.subscriptions
  for each row execute procedure public.enforce_subscription_customer_update();

create policy "subscriptions_update_own" on public.subscriptions for update using (
  user_id = auth.uid()
) with check (
  user_id = auth.uid()
);
