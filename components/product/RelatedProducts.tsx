import ProductCard from '@/components/product/ProductCard'
import CornerOrnament from '@/components/site/CornerOrnament'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

export default function RelatedProducts({
  products,
  basePath,
  title,
}: {
  products: ProductWithBrand[]
  basePath: string
  title: string
}) {
  if (products.length === 0) return null

  return (
    <section className="relative overflow-hidden py-16">
      <CornerOrnament corner="br" size={200} rotate={6} opacity={0.3} />
      <div className="relative">
        <h2 className="mb-6 font-display text-2xl font-bold text-foreground">{title}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} basePath={basePath} />
          ))}
        </div>
      </div>
    </section>
  )
}
