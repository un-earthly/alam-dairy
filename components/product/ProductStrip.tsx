import ProductCard from '@/components/product/ProductCard'
import type { Database } from '@/lib/supabase/types'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

type Product = Database['public']['Tables']['products']['Row'] | ProductWithBrand

export default function ProductStrip({
  title,
  products,
  basePath,
}: {
  title: string
  products: Product[]
  basePath: string
}) {
  if (products.length === 0) return null

  return (
    <div className="mt-10">
      <h2 className="mb-3 text-lg font-bold text-foreground">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((p) => (
          <div key={p.id} className="w-40 shrink-0 sm:w-48">
            <ProductCard product={p} basePath={basePath} />
          </div>
        ))}
      </div>
    </div>
  )
}
