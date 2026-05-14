'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function ProductCard({ product, basePath }: { product: Product; basePath: string }) {
  const locale = useLocale()
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const addItem = useCart((s) => s.addItem)
  const openCart = useCartDrawer((s) => s.open)

  const name = locale === 'bn' ? product.name_bn : product.name_en
  const price = product.sale_price ?? product.price
  const isOnSale = !!product.sale_price

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
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Image */}
      <Link href={`${basePath}/${product.slug}`} className="block aspect-square overflow-hidden bg-muted">
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

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isOnSale && (
          <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">SALE</Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{t('out_of_stock')}</Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 gap-2">
        <Link href={`${basePath}/${product.slug}`}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{name}</h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-success">
              {tc('taka')}{price.toLocaleString('bn-BD')}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
            {isOnSale && (
              <span className="ml-2 text-xs text-muted-foreground/50 line-through">
                {tc('taka')}{product.price.toLocaleString('bn-BD')}
              </span>
            )}
          </div>
          <Button
            size="icon"
            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm transition-transform duration-150 active:scale-95"
            onClick={handleAdd}
            disabled={product.stock === 0}
            aria-label={t('add_to_cart')}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
