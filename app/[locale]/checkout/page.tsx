import { getTranslations } from 'next-intl/server'
import CheckoutForm from '@/components/checkout/CheckoutForm'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('checkout')

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>
      <CheckoutForm locale={locale} />
    </div>
  )
}
