'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useCart } from '@/lib/store/cart'
import { placeOrder } from '@/app/[locale]/checkout/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

const AREAS_BN = ['মিরপুর', 'ধানমন্ডি', 'মোহাম্মদপুর', 'উত্তরা', 'বনানী', 'গুলশান', 'মালিবাগ', 'রামপুরা']
const AREAS_EN = ['Mirpur', 'Dhanmondi', 'Mohammadpur', 'Uttara', 'Banani', 'Gulshan', 'Malibag', 'Rampura']

const FIELD_KEYS = ['name', 'phone', 'email', 'address', 'area'] as const

export default function CheckoutForm({ locale }: { locale: string }) {
  const t = useTranslations('checkout')
  const tc = useTranslations('common')
  const tCart = useTranslations('cart')
  const { items, total } = useCart()
  const isBn = locale === 'bn'

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    notes: '',
  })
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})

  const areas = isBn ? AREAS_BN : AREAS_EN

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setFieldErrors((fe) => ({ ...fe, [field]: undefined }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0 || pending) return

    setError('')
    setFieldErrors({})

    startTransition(async () => {
      const result = await placeOrder(locale, {
        ...form,
        payment_method: 'cod',
        items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
      })
      // On success the action redirects and never returns
      if (result?.ok === false) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors)
        if (result.error === 'insufficient_stock') setError(t('errors.insufficient_stock'))
        else if (result.error) setError(tc('error'))
      }
    })
  }

  function fieldError(field: (typeof FIELD_KEYS)[number]) {
    if (!fieldErrors[field]) return null
    return <p className="text-xs text-red-600 mt-1">{t(`errors.${field}`)}</p>
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🛒</p>
        <p>{isBn ? 'কার্ট খালি' : 'Your cart is empty'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order summary */}
      <div className="rounded-xl border p-4 space-y-3">
        <h2 className="font-semibold text-sm text-gray-600 uppercase tracking-wider">
          {isBn ? 'অর্ডার সারসংক্ষেপ' : 'Order Summary'}
        </h2>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {locale === 'bn' ? item.name_bn : item.name_en} × {item.quantity}
            </span>
            <span className="font-medium">{tc('taka')}{(item.price * item.quantity).toLocaleString('bn-BD')}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-bold">
          <span>{tCart('subtotal')}</span>
          <span className="text-green-700">{tc('taka')}{total().toLocaleString('bn-BD')}</span>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              placeholder={isBn ? 'আপনার নাম' : 'Your name'}
            />
            {fieldError('name')}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('phone')}</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              required
              placeholder="01XXXXXXXXX"
            />
            {fieldError('phone')}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder={isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (optional)'}
          />
          {fieldError('email')}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">{t('address')}</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            required
            placeholder={isBn ? 'বাড়ি নম্বর, রাস্তা, এলাকা' : 'House, road, area'}
          />
          {fieldError('address')}
        </div>

        <div className="space-y-1.5">
          <Label>{t('area')}</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {areas.map((area) => (
              <button
                type="button"
                key={area}
                onClick={() => set('area', area)}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                  form.area === area
                    ? 'border-green-600 bg-green-50 text-green-700 font-medium'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
          {fieldError('area')}
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-3">
        <Label>{t('payment_method')}</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border-2 border-green-600 bg-green-50 p-3 text-sm font-medium text-green-700 text-center">
            💵 {t('cod')}
          </div>
          {(['bkash', 'nagad'] as const).map((method) => (
            <div
              key={method}
              className="rounded-xl border border-gray-200 p-3 text-sm text-gray-400 text-center cursor-not-allowed"
            >
              💳 {t(method)}
              <span className="block text-[10px] mt-0.5">{t('coming_soon')}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">{t('cod_note')}</p>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes">{t('notes')}</Label>
        <Input
          id="notes"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder={isBn ? 'যেকোনো বিশেষ নির্দেশনা...' : 'Any special instructions...'}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />{tc('loading')}</>
        ) : t('place_order')}
      </Button>
    </form>
  )
}
