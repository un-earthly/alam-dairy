import { createClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_en')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
      <CategoryForm categories={categories ?? []} />
    </div>
  )
}
