'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProductRating from '@/components/product/ProductRating'
import QuickViewModal from '@/components/product/QuickViewModal'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import { toastManager } from '@/lib/toast'
import { formatPrice } from '@/lib/format'
import { getMockRating } from '@/lib/mockRating'
import { useTrackRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { Database } from '@/lib/supabase/types'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

type Product = Database['public']['Tables']['products']['Row'] | ProductWithBrand

export default function ProductCard({ product, basePath }: { product: Product; basePath: string }) {
  const locale = useLocale()
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const addItem = useCart((s) => s.addItem)
  const updateQty = useCart((s) => s.updateQty)
  const lineQty = useCart((s) => s.items.find((i) => i.id === product.id && !i.variant_id)?.quantity ?? 0)
  const openCart = useCartDrawer((s) => s.open)
  const trackView = useTrackRecentlyViewed()

  const name = locale === 'bn' ? product.name_bn : product.name_en
  const price = product.sale_price ?? product.price
  const isOnSale = !!product.sale_price
  const discountPct = isOnSale ? Math.round((1 - price / product.price) * 100) : 0
  const brandName = 'brand' in product ? product.brand?.name : undefined
  const isOutOfStock = product.stock === 0
  const hasRealReviews = 'review_count' in product && !!product.review_count
  const { rating, reviewCount } = hasRealReviews
    ? { rating: product.avg_rating!, reviewCount: product.review_count! }
    : getMockRating(product.id)

  function handleAdd() {
    addItem({
      id: product.id,
      name_bn: product.name_bn,
      name_en: product.name_en,
      price,
      unit: product.unit,
      quantity: 1,
      image: product.images[0] ?? null,
      type: product.type,
    })
    openCart()
    toastManager.add({
      title: locale === 'bn' ? 'কার্টে যোগ হয়েছে' : 'Added to cart',
      description: name,
    })
  }

  const stockLabel =
    isOutOfStock
      ? t('out_of_stock')
      : product.stock <= 5
        ? (locale === 'bn' ? `মাত্র ${formatPrice(product.stock, locale)}টি বাকি` : `Only ${product.stock} left`)
        : (locale === 'bn' ? 'স্টকে আছে' : 'In Stock')

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15 ${
        isOutOfStock ? 'opacity-60 grayscale-[0.4]' : ''
      }`}
    >
      {/* Image */}
      <Link
        href={`${basePath}/${product.slug}`}
        onClick={() => trackView(product.id)}
        className="block aspect-square overflow-hidden bg-muted"
      >
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={name}
            width={400}
            height={400}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground/20 text-5xl">
            {product.type === 'cattle' ? '🐄' : product.type === 'dairy' ? '🥛' : '🌾'}
          </div>
        )}
      </Link>

      <QuickViewModal product={product} basePath={basePath} />

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isOnSale && (
          <div className="flex gap-1">
            <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">SALE</Badge>
            <Badge className="bg-foreground text-background text-[10px] px-1.5 py-0.5">-{discountPct}%</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 gap-1.5">
        <Link href={`${basePath}/${product.slug}`} onClick={() => trackView(product.id)}>
          {brandName && (
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{brandName}</span>
          )}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{name}</h3>
        </Link>

        <ProductRating rating={rating} reviewCount={reviewCount} />

        <div>
          <span className="text-base font-bold text-success">
            {tc('taka')}{formatPrice(price, locale)}
          </span>
          <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
          {isOnSale && (
            <span className="ml-2 text-xs text-muted-foreground/50 line-through">
              {tc('taka')}{formatPrice(product.price, locale)}
            </span>
          )}
        </div>

        <p className={`text-[11px] font-medium ${isOutOfStock ? 'text-destructive' : product.stock <= 5 ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {stockLabel}
        </p>

        <div className="mt-auto pt-1">
          {lineQty === 0 ? (
            <Button
              className="flex h-8 w-full items-center justify-center gap-1.5 rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
              onClick={handleAdd}
              disabled={isOutOfStock}
              aria-label={t('add_to_cart')}
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">{t('add_to_cart')}</span>
            </Button>
          ) : (
            <div className="flex h-8 w-full items-center justify-between rounded-full border border-primary/30 bg-primary/5 px-1">
              <button
                onClick={() => updateQty(product.id, lineQty - 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="text-sm font-semibold tabular-nums text-foreground">{lineQty}</span>
              <button
                onClick={() => updateQty(product.id, lineQty + 1)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
