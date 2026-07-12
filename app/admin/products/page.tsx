import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import CornerOrnament from '@/components/site/CornerOrnament'
import AdminProductsTable from '@/components/admin/AdminProductsTable'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="relative space-y-4">
      <CornerOrnament corner="tr" size={140} rotate={-6} opacity={0.15} className="hidden lg:block" />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-accent text-base text-pasture">Alam Dairy Admin</p>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <AdminProductsTable initialProducts={products ?? []} />
    </div>
  )
}
