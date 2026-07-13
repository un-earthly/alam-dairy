import { fetchCategoriesPage } from './actions'
import CategoriesTableClient from './categories-table-client'

export default async function AdminCategoriesPage() {
  const initialData = await fetchCategoriesPage({
    cursor: 0,
    pageSize: 20,
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Categories</h1>
      <CategoriesTableClient initialCategories={initialData.rows} />
    </div>
  )
}
