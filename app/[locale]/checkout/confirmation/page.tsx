import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2 } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { Separator } from '@/components/ui/separator'
import ClearCartOnMount from '@/components/checkout/ClearCartOnMount'
import { Link } from '@/i18n/navigation'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ order?: string; token?: string }>
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { order, token } = await searchParams
  const t = await getTranslations('confirmation')
  const tc = await getTranslations('common')

  if (!order || !token || !UUID_RE.test(token)) notFound()

  const admin = createAdminClient()
  const { data } = await admin
    .from('orders')
    .select(
      'order_number, total, delivery_fee, status, payment_method, address, created_at, order_items(quantity, unit_price, total, products(name_bn, name_en, unit))'
    )
    .eq('order_number', order)
    .eq('access_token', token)
    .single()

  if (!data) notFound()

  const isBn = locale === 'bn'

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <ClearCartOnMount />

      <div className="text-center mb-8">
        <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-600 mt-2">{t('subtitle')}</p>
      </div>

      <div className="rounded-xl border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('order_number')}</span>
          <span className="font-mono font-bold text-green-700">{data.order_number}</span>
        </div>
        <Separator />

        <div className="space-y-2">
          {data.order_items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {isBn ? item.products?.name_bn : item.products?.name_en} × {item.quantity}
              </span>
              <span className="font-medium">
                {tc('taka')}{item.total.toLocaleString('bn-BD')}
              </span>
            </div>
          ))}
        </div>
        <Separator />

        <div className="flex justify-between font-bold">
          <span>{t('total')}</span>
          <span className="text-green-700">{tc('taka')}{data.total.toLocaleString('bn-BD')}</span>
        </div>
      </div>

      <div className="rounded-xl bg-green-50 border border-green-200 p-4 mt-6 text-sm text-green-800">
        {t('cod_instructions')}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/shop"
          className="inline-block rounded-lg bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium transition-colors"
        >
          {t('continue_shopping')}
        </Link>
      </div>
    </div>
  )
}
