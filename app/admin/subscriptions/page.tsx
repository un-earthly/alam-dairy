import { fetchSubscriptionsPage } from './actions'
import SubscriptionsTableClient from './subscriptions-table-client'

export default async function AdminSubscriptionsPage() {
  const initialData = await fetchSubscriptionsPage({
    cursor: 0,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recurring orders are generated automatically each night. Retry any that failed.
        </p>
      </div>
      <SubscriptionsTableClient initialSubscriptions={initialData.rows} />
    </div>
  )
}
