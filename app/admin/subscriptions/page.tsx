import { createClient } from '@/lib/supabase/server'
import SubscriptionsClient from './subscriptions-client'

export default async function AdminSubscriptionsPage() {
  const supabase = await createClient()
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select(
      'id, frequency, quantity, unit_price, status, next_billing_date, last_renewal_status, last_renewal_error, last_renewal_at, products(name_en), profiles(full_name, phone)'
    )
    .order('next_billing_date', { ascending: true })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Recurring orders are generated automatically each night. Retry any that failed.
        </p>
      </div>
      <SubscriptionsClient subscriptions={subscriptions ?? []} />
    </div>
  )
}
