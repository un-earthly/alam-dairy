import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import CornerOrnament from '@/components/site/CornerOrnament'

export default async function NewProductPage() {
  const supabase = await createClient()
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from('categories').select('id, name_en').order('sort_order', { ascending: true }),
    supabase.from('brands').select('id, name').order('name', { ascending: true }),
  ])

  return (
    <div className="relative max-w-2xl space-y-4">
      <CornerOrnament corner="tr" size={120} rotate={-6} opacity={0.15} className="hidden lg:block" />
      <div className="relative">
        <p className="font-accent text-base text-pasture">Alam Dairy Admin</p>
        <h1 className="font-display text-2xl font-bold text-foreground">Add Product</h1>
      </div>
      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  )
}
