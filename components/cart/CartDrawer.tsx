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
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="font-medium text-gray-500">{t('empty')}</p>
            <p className="text-sm text-gray-400">{t('empty_desc')}</p>
            <Button variant="outline" onClick={close} className="mt-2">
              {t('continue_shopping')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    {item.image ? (
                      <Image src={item.image} alt="" width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-medium leading-tight">
                      {locale === 'bn' ? item.name_bn : item.name_en}
                    </p>
                    <p className="text-sm text-green-700 font-semibold">
                      {tc('taka')}{(item.price * item.quantity).toLocaleString('bn-BD')}
                    </p>

                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="h-6 w-6 rounded border text-sm font-bold hover:bg-gray-100 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="h-6 w-6 rounded border text-sm font-bold hover:bg-gray-100 flex items-center justify-center"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-500"
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
                <span>{t('subtotal')}</span>
                <span className="text-green-700 text-lg">
                  {tc('taka')}{total().toLocaleString('bn-BD')}
                </span>
              </div>
              <Separator />
              <Link href={`/${locale}/checkout`} onClick={close}>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
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
