import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name_en').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
  ])

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  )
}
