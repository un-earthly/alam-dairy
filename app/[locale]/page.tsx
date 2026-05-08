import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ShieldCheck, Truck, Star, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  return <HomeContent />
}

function HomeContent() {
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:py-24">
          <p className="text-green-200 text-sm font-medium mb-3 tracking-widest uppercase">Bangladesh</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{t('hero_title')}</h1>
          <p className="mt-4 text-green-100 text-base sm:text-lg max-w-xl mx-auto">{t('hero_subtitle')}</p>
        </div>
      </section>

      {/* Two lanes */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* B2C lane */}
          <div className="group relative overflow-hidden rounded-2xl bg-amber-50 border border-amber-100 p-8 flex flex-col gap-4">
            <div className="text-4xl">🥛</div>
            <h2 className="text-2xl font-bold text-amber-900">{t('consumer_title')}</h2>
            <p className="text-amber-700 text-sm leading-relaxed">{t('consumer_desc')}</p>
            <Link href="./shop" className="mt-auto">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
                {t('consumer_cta')}
              </Button>
            </Link>
          </div>

          {/* B2B lane */}
          <div className="group relative overflow-hidden rounded-2xl bg-green-50 border border-green-100 p-8 flex flex-col gap-4">
            <div className="text-4xl">🐄</div>
            <h2 className="text-2xl font-bold text-green-900">{t('farmer_title')}</h2>
            <p className="text-green-700 text-sm leading-relaxed">{t('farmer_desc')}</p>
            <Link href="./farm" className="mt-auto">
              <Button className="bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto">
                {t('farmer_cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-y">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">
            {t('trust_title')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: <ShieldCheck className="h-6 w-6 text-green-600" />, label: t('trust_halal') },
              { icon: <Leaf className="h-6 w-6 text-green-600" />, label: t('trust_fresh') },
              { icon: <Truck className="h-6 w-6 text-green-600" />, label: t('trust_delivery') },
              { icon: <Star className="h-6 w-6 text-green-600" />, label: t('trust_vet') },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm">
                {item.icon}
                <span className="text-xs font-medium text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
