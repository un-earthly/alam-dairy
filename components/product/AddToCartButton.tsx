'use client'

import { useTranslations } from 'next-intl'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export default function AddToCartButton({ product, locale }: { product: Product; locale: string }) {
  const t = useTranslations('shop')
  const addItem = useCart((s) => s.addItem)
  const openCart = useCartDrawer((s) => s.open)

  const price = product.sale_price ?? product.price
  const isOutOfStock = product.stock === 0

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
    <Button
      size="lg"
      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
      onClick={handleAdd}
      disabled={isOutOfStock}
    >
      <ShoppingCart className="h-5 w-5" />
      {isOutOfStock ? t('out_of_stock') : t('add_to_cart')}
    </Button>
  )
}
