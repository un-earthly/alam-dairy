import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { formatPrice } from '@/lib/format'
import type { Database } from '@/lib/supabase/types'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

type Product = Database['public']['Tables']['products']['Row'] | ProductWithBrand

export default function HeroTopSeller({
  product,
  basePath,
  locale,
}: {
  product: Product
  basePath: string
  locale: string
}) {
  const name = locale === 'bn' ? product.name_bn : product.name_en
  const price = product.sale_price ?? product.price

  return (
    <Link
      href={`${basePath}/${product.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card/90 p-3 pr-4 shadow-sm backdrop-blur transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:max-w-xs"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {product.images[0] ? (
          <Image src={product.images[0]} alt={name} width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground/30">
            {product.type === 'cattle' ? '🐄' : product.type === 'dairy' ? '🥛' : '🌾'}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
          <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
          {locale === 'bn' ? 'সর্বাধিক বিক্রিত' : 'Top Seller'}
        </span>
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="text-sm font-bold text-success">৳{formatPrice(price, locale)}</p>
      </div>
    </Link>
  )
}
