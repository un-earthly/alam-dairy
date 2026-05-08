'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/cart'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'

const AREAS_BN = ['মিরপুর', 'ধানমন্ডি', 'মোহাম্মদপুর', 'উত্তরা', 'বনানী', 'গুলশান', 'মালিবাগ', 'রামপুরা']
const AREAS_EN = ['Mirpur', 'Dhanmondi', 'Mohammadpur', 'Uttara', 'Banani', 'Gulshan', 'Malibag', 'Rampura']

export default function CheckoutForm({ locale }: { locale: string }) {
  const t = useTranslations('checkout')
  const tc = useTranslations('common')
  const tCart = useTranslations('cart')
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const isBn = locale === 'bn'

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    area: '',
    payment_method: 'cod' as 'bkash' | 'nagad' | 'cod',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const areas = isBn ? AREAS_BN : AREAS_EN

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone || !form.address || !form.area) return
    if (items.length === 0) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          status: 'pending',
          total: total(),
          payment_method: form.payment_method,
          payment_status: 'pending',
          address: {
            name: form.name,
            phone: form.phone,
            address: form.address,
            area: form.area,
          },
          notes: form.notes || null,
        })
        .select('id')
        .single()

      if (orderErr || !order) throw orderErr ?? new Error('Order failed')

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total: item.price * item.quantity,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      clearCart()
      router.push(`/${locale}/account/orders?success=${order.id}`)
    } catch {
      setError(tc('error'))
    } finally {
      setLoading(false)
    }
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
          </div>
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
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-3">
        <Label>{t('payment_method')}</Label>
        <div className="grid grid-cols-3 gap-3">
          {(['bkash', 'nagad', 'cod'] as const).map((method) => (
            <button
              type="button"
              key={method}
              onClick={() => set('payment_method', method)}
              className={`rounded-xl border p-3 text-sm font-medium transition-colors ${
                form.payment_method === method
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              {method === 'bkash' && '💳 '}
              {method === 'nagad' && '💳 '}
              {method === 'cod' && '💵 '}
              {t(method)}
            </button>
          ))}
        </div>
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
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />{tc('loading')}</>
        ) : t('place_order')}
      </Button>
    </form>
  )
}
