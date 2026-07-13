import { fetchCustomersPage } from './actions'
import CustomersTableClient from './customers-table-client'

export default async function AdminCustomersPage() {
  const initialData = await fetchCustomersPage({
    cursor: 0,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      <CustomersTableClient initialCustomers={initialData.rows} />
    </div>
  )
}
