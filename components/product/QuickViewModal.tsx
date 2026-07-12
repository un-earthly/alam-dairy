'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ProductRating from '@/components/product/ProductRating'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import { toastManager } from '@/lib/toast'
import { formatPrice } from '@/lib/format'
import { getMockRating } from '@/lib/mockRating'
import type { Database } from '@/lib/supabase/types'
import type { ProductWithBrand } from '@/lib/shop/queryProducts'

type Product = Database['public']['Tables']['products']['Row'] | ProductWithBrand
type Variant = Database['public']['Tables']['product_variants']['Row']
type BulkTier = Database['public']['Tables']['bulk_pricing_tiers']['Row']

export default function QuickViewModal({
  product,
  basePath,
}: {
  product: Product
  basePath: string
}) {
  const locale = useLocale()
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const [open, setOpen] = useState(false)
  const [variants, setVariants] = useState<Variant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [bulkTiers, setBulkTiers] = useState<BulkTier[]>([])
  const addItem = useCart((s) => s.addItem)
  const openCart = useCartDrawer((s) => s.open)

  const name = locale === 'bn' ? product.name_bn : product.name_en
  const description = locale === 'bn' ? product.description_bn : product.description_en
  const hasRealReviews = 'review_count' in product && !!product.review_count
  const { rating, reviewCount } = hasRealReviews
    ? { rating: product.avg_rating!, reviewCount: product.review_count! }
    : getMockRating(product.id)

  useEffect(() => {
    if (!open || !product.has_variants) return
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) {
          setVariants(data)
          setSelectedVariant(data[0]?.id ?? null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [open, product.has_variants, product.id])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const supabase = createClient()
    supabase
      .from('bulk_pricing_tiers')
      .select('*')
      .eq('product_id', product.id)
      .is('variant_id', null)
      .order('min_qty', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) setBulkTiers(data)
      })
    return () => {
      cancelled = true
    }
  }, [open, product.id])

  const activeVariant = variants.find((v) => v.id === selectedVariant)
  const price = activeVariant ? activeVariant.sale_price ?? activeVariant.price : product.sale_price ?? product.price

  function handleAdd() {
    addItem({
      id: product.id,
      variant_id: selectedVariant ?? undefined,
      name_bn: activeVariant ? `${product.name_bn} - ${activeVariant.name_bn}` : product.name_bn,
      name_en: activeVariant ? `${product.name_en} - ${activeVariant.name_en}` : product.name_en,
      price,
      unit: product.unit,
      quantity: 1,
      image: product.images[0] ?? null,
      type: product.type,
    })
    openCart()
    setOpen(false)
    toastManager.add({
      title: locale === 'bn' ? 'কার্টে যোগ হয়েছে' : 'Added to cart',
      description: name,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="icon-sm"
        variant="secondary"
        className="absolute top-2 right-2 rounded-full opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100"
        aria-label={locale === 'bn' ? 'দ্রুত দেখুন' : 'Quick view'}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
      >
        <Search className="h-3.5 w-3.5" />
      </Button>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={name}
                width={400}
                height={400}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-muted-foreground/20">
                {product.type === 'cattle' ? '🐄' : product.type === 'dairy' ? '🥛' : '🌾'}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <ProductRating rating={rating} reviewCount={reviewCount} />

            <div>
              <span className="text-xl font-bold text-success">
                {tc('taka')}{formatPrice(price, locale)}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">/{activeVariant?.name_en ?? product.unit}</span>
            </div>

            {product.has_variants && variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === 'bn' ? 'ভ্যারিয়েন্ট নির্বাচন করুন' : 'Select variant'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        selectedVariant === v.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {locale === 'bn' ? v.name_bn : v.name_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bulkTiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {locale === 'bn' ? 'বাল্ক মূল্য' : 'Bulk pricing'}
                </label>
                <table className="w-full overflow-hidden rounded-lg border border-border text-xs">
                  <tbody>
                    {bulkTiers.map((tier) => (
                      <tr key={tier.id} className="border-b border-border last:border-0">
                        <td className="px-2 py-1.5 text-muted-foreground">
                          {tier.min_qty}+ {product.unit}
                        </td>
                        <td className="px-2 py-1.5 text-right font-semibold text-success">
                          {tc('taka')}{formatPrice(tier.price, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-auto flex flex-col gap-2">
              <Button onClick={handleAdd} disabled={product.stock === 0} className="w-full">
                {t('add_to_cart')}
              </Button>
              <Link href={`${basePath}/${product.slug}`} className="text-center text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline">
                {locale === 'bn' ? 'সম্পূর্ণ বিবরণ দেখুন' : 'View full details'}
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
