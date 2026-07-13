import { fetchOrdersPage } from './actions'
import OrdersTableClient from './orders-table-client'

export default async function AdminOrdersPage() {
  const initialData = await fetchOrdersPage({
    cursor: 0,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>
      <OrdersTableClient initialOrders={initialData.rows} />
    </div>
  )
}
