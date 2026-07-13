import { fetchBrandsPage } from './actions'
import BrandsTableClient from './brands-table-client'

export default async function AdminBrandsPage() {
  const initialData = await fetchBrandsPage({
    cursor: 0,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Brands</h1>
      <BrandsTableClient initialBrands={initialData.rows} />
    </div>
  )
}
