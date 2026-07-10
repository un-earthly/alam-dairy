import { createClient } from '@/lib/supabase/server'
import ImportedProductsClient from './imported-client'

export default async function ImportedProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, slug, name_en, name_bn, description_en, type, price, sale_price, unit, stock, is_active, images')
    .contains('tags', ['imported:agromukam'])
    .order('type', { ascending: true })
    .order('name_en', { ascending: true })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Imported from Agromukam</h1>
        <p className="text-sm text-gray-500 mt-1">
          {products?.length ?? 0} products seeded from agromukam.com, images hosted on Cloudinary. All start
          hidden from the public shop (inactive) — activate the ones you want to actually sell.
        </p>
      </div>
      <ImportedProductsClient products={products ?? []} />
    </div>
  )
}
