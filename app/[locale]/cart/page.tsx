'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useCart } from '@/lib/store/cart'

export default function CartPage() {
  const locale = useLocale()
  const isBn = locale === 'bn'
  const { items, removeItem, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40" />
        <h1 className="text-2xl font-bold">{isBn ? 'কার্ট খালি' : 'Your cart is empty'}</h1>
        <p className="text-muted-foreground text-sm">
          {isBn ? 'কিছু পণ্য যোগ করুন এবং আবার আসুন' : 'Add some products and come back'}
        </p>
        <Link href={`/${locale}/shop`} className={cn(buttonVariants(), 'mt-4')}>
          {isBn ? 'পণ্য দেখুন' : 'Browse Products'}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">{isBn ? 'আপনার কার্ট' : 'Your Cart'}</h1>

      <div className="rounded-xl border bg-card overflow-hidden divide-y divide-border">
        {items.map((item) => {
          const name = locale === 'bn' ? item.name_bn : item.name_en
          return (
            <div key={item.id} className="flex items-center gap-4 p-4">
              {/* Emoji placeholder */}
              <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                {item.type === 'cattle' ? '🐄' : item.type === 'dairy' ? '🥛' : '🌾'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-1">{name}</p>
                <p className="text-xs text-muted-foreground">৳{item.price.toLocaleString()} / {item.unit}</p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQty(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">
                  ৳{(item.price * item.quantity).toLocaleString()}
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="mt-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{isBn ? 'সাবটোটাল' : 'Subtotal'}</span>
          <span className="font-medium text-foreground">৳{total().toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{isBn ? 'ডেলিভারি চার্জ' : 'Delivery'}</span>
          <span>{isBn ? 'চেকআউটে নির্ধারিত হবে' : 'Calculated at checkout'}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>{isBn ? 'মোট' : 'Total'}</span>
          <span className="text-primary">৳{total().toLocaleString()}</span>
        </div>
        <Link href={`/${locale}/checkout`} className={cn(buttonVariants(), 'w-full h-11 text-base gap-2 justify-center')}>
          {isBn ? 'চেকআউট করুন' : 'Proceed to Checkout'}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href={`/${locale}/shop`} className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-center')}>
          {isBn ? 'কেনাকাটা চালিয়ে যান' : 'Continue Shopping'}
        </Link>
      </div>
    </div>
  )
}
