'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import { startSubscription } from '@/app/[locale]/shop/[slug]/actions'
import VariantPicker from '@/components/product/VariantPicker'
import type { Database, SubscriptionFrequency } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']
type Variant = Database['public']['Tables']['product_variants']['Row']
type BulkTier = Database['public']['Tables']['bulk_pricing_tiers']['Row']
type SubPlan = Database['public']['Tables']['product_subscription_plans']['Row']

const FREQUENCY_LABELS: Record<SubscriptionFrequency, { en: string; bn: string }> = {
  daily: { en: 'Daily', bn: 'প্রতিদিন' },
  weekly: { en: 'Weekly', bn: 'সাপ্তাহিক' },
  biweekly: { en: 'Every 2 weeks', bn: 'প্রতি ২ সপ্তাহে' },
  monthly: { en: 'Monthly', bn: 'মাসিক' },
}

export default function PurchaseOptions({
  product,
  variants,
  bulkTiers,
  subscriptionPlans,
  locale,
}: {
  product: Product
  variants: Variant[]
  bulkTiers: BulkTier[]
  subscriptionPlans: SubPlan[]
  locale: string
}) {
  const t = useTranslations('shop')
  const tc = useTranslations('common')
  const addItem = useCart((s) => s.addItem)
  const openCart = useCartDrawer((s) => s.open)
  const isBn = locale === 'bn'

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(variants[0]?.id ?? null)
  const [quantity, setQuantity] = useState(1)
  const [subscribeOpen, setSubscribeOpen] = useState(false)
  const [selectedFrequency, setSelectedFrequency] = useState<SubscriptionFrequency | null>(
    subscriptionPlans[0]?.frequency ?? null
  )
  const [subForm, setSubForm] = useState({ name: '', phone: '', email: '', address: '', area: '' })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null
  const basePrice = selectedVariant ? selectedVariant.sale_price ?? selectedVariant.price : product.sale_price ?? product.price
  const originalPrice = selectedVariant ? selectedVariant.price : product.price
  const stock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = stock === 0

  const applicableTiers = useMemo(
    () => bulkTiers.filter((t) => !t.variant_id).sort((a, b) => a.min_qty - b.min_qty),
    [bulkTiers]
  )
  const effectiveTier = [...applicableTiers].reverse().find((tier) => quantity >= tier.min_qty)
  const effectivePrice = effectiveTier && effectiveTier.price < basePrice ? effectiveTier.price : basePrice

  const selectedPlan = subscriptionPlans.find((p) => p.frequency === selectedFrequency)
  const subscriptionPrice = selectedPlan ? basePrice * (1 - selectedPlan.discount_percent / 100) : basePrice

  function handleAddToCart() {
    addItem({
      id: product.id,
      variant_id: selectedVariant?.id,
      name_bn: selectedVariant ? `${product.name_bn} — ${selectedVariant.name_bn}` : product.name_bn,
      name_en: selectedVariant ? `${product.name_en} — ${selectedVariant.name_en}` : product.name_en,
      price: effectivePrice,
      unit: product.unit,
      quantity,
      image: product.images[0] ?? null,
      type: product.type,
    })
    openCart()
  }

  async function handleStartSubscription(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFrequency) return
    setPending(true)
    setError('')
    try {
      const result = await startSubscription(locale, {
        product_id: product.id,
        variant_id: selectedVariant?.id,
        quantity,
        frequency: selectedFrequency,
        payment_method: 'cod',
        ...subForm,
      })
      if (result && result.ok === false) {
        setError(result.error)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div className="space-y-1.5">
          <Label>{isBn ? 'ধরন বেছে নিন' : 'Choose an option'}</Label>
          <VariantPicker variants={variants} locale={locale} selectedId={selectedVariantId} onSelect={setSelectedVariantId} />
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-green-700">
          {tc('taka')}{effectivePrice.toLocaleString('bn-BD')}
        </span>
        <span className="text-gray-400 text-sm">/{product.unit}</span>
        {effectivePrice < originalPrice && (
          <span className="text-sm text-gray-400 line-through ml-1">
            {tc('taka')}{originalPrice.toLocaleString('bn-BD')}
          </span>
        )}
      </div>

      {applicableTiers.length > 0 && (
        <div className="rounded-xl border overflow-hidden text-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-3 py-1.5 text-left font-medium">{isBn ? 'পরিমাণ' : 'Quantity'}</th>
                <th className="px-3 py-1.5 text-right font-medium">{isBn ? 'একক মূল্য' : 'Unit price'}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-1.5">1 – {applicableTiers[0].min_qty - 1}</td>
                <td className="px-3 py-1.5 text-right">{tc('taka')}{basePrice.toLocaleString('bn-BD')}</td>
              </tr>
              {applicableTiers.map((tier, i) => (
                <tr key={tier.id}>
                  <td className="px-3 py-1.5">
                    {tier.min_qty}{applicableTiers[i + 1] ? ` – ${applicableTiers[i + 1].min_qty - 1}` : '+'}
                  </td>
                  <td className="px-3 py-1.5 text-right font-medium text-green-700">
                    {tc('taka')}{tier.price.toLocaleString('bn-BD')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-9 w-9 text-lg font-bold hover:bg-muted"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-9 w-9 text-lg font-bold hover:bg-muted"
          >
            +
          </button>
        </div>

        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="h-5 w-5" />
          {isOutOfStock ? t('out_of_stock') : t('add_to_cart')}
        </Button>
      </div>

      {stock > 0 && stock < 10 && (
        <p className="text-sm text-orange-600 font-medium">
          {isBn ? `মাত্র ${stock}টি বাকি!` : `Only ${stock} left!`}
        </p>
      )}

      {subscriptionPlans.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <RefreshCw className="h-4 w-4 text-primary" />
            {isBn ? 'সাবস্ক্রাইব করে সাশ্রয় করুন' : 'Subscribe & Save'}
          </div>
          <div className="flex flex-wrap gap-2">
            {subscriptionPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedFrequency(plan.frequency)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  selectedFrequency === plan.frequency
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isBn ? FREQUENCY_LABELS[plan.frequency].bn : FREQUENCY_LABELS[plan.frequency].en}
                {plan.discount_percent > 0 && (
                  <span className="ml-1 text-xs text-green-600">-{plan.discount_percent}%</span>
                )}
              </button>
            ))}
          </div>
          {selectedFrequency && (
            <p className="text-sm text-muted-foreground">
              {tc('taka')}{subscriptionPrice.toLocaleString('bn-BD')} /{product.unit} —{' '}
              {isBn ? FREQUENCY_LABELS[selectedFrequency].bn : FREQUENCY_LABELS[selectedFrequency].en}
            </p>
          )}
          <Button type="button" variant="outline" className="w-full gap-2" onClick={() => setSubscribeOpen(true)} disabled={isOutOfStock}>
            <RefreshCw className="h-4 w-4" />
            {isBn ? 'সাবস্ক্রিপশন শুরু করুন' : 'Start Subscription'}
          </Button>
        </div>
      )}

      <Dialog open={subscribeOpen} onOpenChange={setSubscribeOpen}>
        <DialogContent className="max-w-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isBn ? 'সাবস্ক্রিপশন শুরু করুন' : 'Start Subscription'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStartSubscription} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sub-name">{isBn ? 'নাম' : 'Name'}</Label>
              <Input id="sub-name" required value={subForm.name} onChange={(e) => setSubForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub-phone">{isBn ? 'ফোন' : 'Phone'}</Label>
              <Input id="sub-phone" required placeholder="01XXXXXXXXX" value={subForm.phone} onChange={(e) => setSubForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub-address">{isBn ? 'ঠিকানা' : 'Address'}</Label>
              <Input id="sub-address" required value={subForm.address} onChange={(e) => setSubForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub-area">{isBn ? 'এলাকা' : 'Area'}</Label>
              <Input id="sub-area" required value={subForm.area} onChange={(e) => setSubForm((f) => ({ ...f, area: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {pending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {tc('loading')}</> : (isBn ? 'নিশ্চিত করুন' : 'Confirm Subscription')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
