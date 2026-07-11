'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'

export default function CartDrawer() {
  const t = useTranslations('cart')
  const tc = useTranslations('common')
  const locale = useLocale()
  const { isOpen, close } = useCartDrawer()
  const { items, removeItem, updateQty, total } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="px-1">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            {t('title')}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground">{t('empty')}</p>
            <p className="text-sm text-muted-foreground">{t('empty_desc')}</p>
            <Button variant="outline" onClick={close} className="mt-2">
              {t('continue_shopping')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <div key={`${item.id}:${item.variant_id ?? ''}`} className="flex gap-3 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.image ? (
                      <Image src={item.image} alt="" width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium text-foreground leading-tight">
                      {locale === 'bn' ? item.name_bn : item.name_en}
                    </p>
                    <p className="text-sm text-success font-semibold">
                      {tc('taka')}{(item.price * item.quantity).toLocaleString('bn-BD')}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1, item.variant_id)}
                        className="h-6 w-6 rounded-md border border-border text-sm font-bold hover:bg-muted hover:border-primary/50 flex items-center justify-center transition-colors duration-100"
                      >
                        −
                      </button>
                      <span className="text-sm w-4 text-center font-medium tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1, item.variant_id)}
                        className="h-6 w-6 rounded-md border border-border text-sm font-bold hover:bg-muted hover:border-primary/50 flex items-center justify-center transition-colors duration-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id, item.variant_id)}
                        className="ml-auto text-muted-foreground/50 hover:text-destructive transition-colors duration-150"
                        aria-label={t('remove')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-foreground">{t('subtotal')}</span>
                <span className="text-success text-lg">
                  {tc('taka')}{total().toLocaleString('bn-BD')}
                </span>
              </div>
              <Separator />
              <Link href={`/${locale}/checkout`} onClick={close}>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  {t('checkout')}
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={close}>
                {t('continue_shopping')}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
