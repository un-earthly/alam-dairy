'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ShieldCheck, Truck, Star, Leaf, ArrowRight, ShoppingBag, Smartphone, Milk, Wheat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return <HomeContent />
}

function RevealSection({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className={cn(!inView && 'opacity-0', inView && 'animate-fade-in-up', className)}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function HomeContent() {
  const t = useTranslations('landing')
  const tCommon = useTranslations('common')

  const { ref: statsRef, inView: statsInView } = useInView()
  const { ref: lanesRef, inView: lanesInView } = useInView()
  const { ref: stepsRef, inView: stepsInView } = useInView()
  const { ref: productsRef, inView: productsInView } = useInView()
  const { ref: trustRef, inView: trustInView } = useInView()
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView()

  const testimonials = [
    { initials: 'RU', name: t('testimonial_1_name'), location: t('testimonial_1_location'), text: t('testimonial_1_text') },
    { initials: 'NB', name: t('testimonial_2_name'), location: t('testimonial_2_location'), text: t('testimonial_2_text') },
    { initials: 'KH', name: t('testimonial_3_name'), location: t('testimonial_3_location'), text: t('testimonial_3_text') },
  ]

  const steps = [
    { step: '01', icon: <ShoppingBag className="h-7 w-7 text-white" />, title: t('how_step1_title'), desc: t('how_step1_desc') },
    { step: '02', icon: <Smartphone className="h-7 w-7 text-white" />, title: t('how_step2_title'), desc: t('how_step2_desc') },
    { step: '03', icon: <Truck className="h-7 w-7 text-white" />, title: t('how_step3_title'), desc: t('how_step3_desc') },
  ]

  const featuredProducts = [
    { icon: <Milk className="h-14 w-14 text-primary/60" />, name: t('product_milk'),   price: '৳ 80',  unit: '/litre', tag: t('tag_bestseller') },
    { icon: <Leaf className="h-14 w-14 text-primary/60" />, name: t('product_yogurt'), price: '৳ 60',  unit: '/kg',    tag: t('tag_fresh') },
    { icon: <Wheat className="h-14 w-14 text-primary/60" />, name: t('product_ghee'),  price: '৳ 950', unit: '/kg',    tag: t('tag_premium') },
  ]

  return (
    <div>

      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-gradient-to-br from-violet-800 via-purple-700 to-blue-700 text-white sm:min-h-[88vh]">
        <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-40 right-1/3 h-[500px] w-[500px] rounded-full bg-violet-400/25 blur-3xl animate-float-slow" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-24 text-center sm:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-blue-100 backdrop-blur-sm animate-in fade-in-0 slide-in-from-bottom-3 duration-700">
            🇧🇩 <span>Trusted Across Bangladesh</span>
          </div>
          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight drop-shadow-sm sm:text-6xl lg:text-7xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: '120ms' }}
          >
            {t('hero_title')}
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-purple-100 sm:text-xl animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: '240ms' }}
          >
            {t('hero_subtitle')}
          </p>
          <div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: '360ms' }}
          >
            <Link href="./shop">
              <Button
                size="lg"
                className="gap-2 bg-white px-8 font-semibold text-violet-700 shadow-xl shadow-violet-900/30 hover:bg-violet-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {t('consumer_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="./farm">
              <Button
                size="lg"
                variant="ghost"
                className="border border-white/30 px-8 text-white hover:bg-white/10 transition-all duration-200"
              >
                {t('farmer_cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Stats bar ─────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-violet-700 via-purple-600 to-blue-600 py-8 text-white">
        <div
          ref={statsRef}
          className={cn(
            'mx-auto max-w-7xl px-4',
            !statsInView && 'opacity-0',
            statsInView && 'animate-fade-in-up'
          )}
        >
          <div className="grid grid-cols-2 divide-x divide-white/20 sm:grid-cols-4">
            {[
              { value: '2,500+', label: t('stats_customers') },
              { value: '50+',    label: t('stats_products') },
              { value: '100%',   label: t('stats_delivery') },
              { value: '10+',    label: t('stats_years') },
            ].map((stat, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-5 text-center',
                  !statsInView && 'opacity-0',
                  statsInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="text-2xl font-extrabold tabular-nums sm:text-3xl">{stat.value}</span>
                <span className="text-xs text-purple-100 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Two lanes ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <RevealSection className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('lanes_title')}</h2>
          <p className="mt-3 text-muted-foreground">{t('lanes_subtitle')}</p>
        </RevealSection>
        <div ref={lanesRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* B2C */}
          <div
            className={cn(
              'group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 dark:border-violet-800/30 dark:from-violet-950/30 dark:to-blue-950/30',
              !lanesInView && 'opacity-0',
              lanesInView && 'animate-fade-in-up'
            )}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-violet-200/60 blur-2xl transition-colors group-hover:bg-violet-300/70 dark:bg-violet-600/10" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/25">
              <Milk className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-violet-900 dark:text-violet-200">{t('consumer_title')}</h2>
            <p className="text-sm leading-relaxed text-violet-700/80 dark:text-violet-300/70">{t('consumer_desc')}</p>
            <Link href="./shop" className="mt-auto">
              <Button className="gap-2 bg-violet-600 text-white hover:bg-violet-700 sm:w-auto">
                {t('consumer_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* B2B */}
          <div
            className={cn(
              'group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:border-blue-800/30 dark:from-blue-950/30 dark:to-indigo-950/30',
              !lanesInView && 'opacity-0',
              lanesInView && 'animate-fade-in-up'
            )}
            style={{ animationDelay: '120ms' }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-blue-200/60 blur-2xl transition-colors group-hover:bg-blue-300/70 dark:bg-blue-600/10" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25">
              <Truck className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-200">{t('farmer_title')}</h2>
            <p className="text-sm leading-relaxed text-blue-700/80 dark:text-blue-300/70">{t('farmer_desc')}</p>
            <Link href="./farm" className="mt-auto">
              <Button className="gap-2 bg-blue-700 text-white hover:bg-blue-800 sm:w-auto">
                {t('farmer_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. How it works ──────────────────────────────────── */}
      <section className="bg-gradient-to-b from-muted/40 to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection className="mb-14 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('how_title')}</h2>
            <p className="mt-3 text-muted-foreground">{t('how_subtitle')}</p>
          </RevealSection>
          <div ref={stepsRef} className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className={cn(
                  'relative flex flex-col items-center gap-4 text-center',
                  !stepsInView && 'opacity-0',
                  stepsInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25">
                  {item.icon}
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-violet-700 shadow-md dark:bg-slate-800 dark:text-violet-300">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Featured products ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <RevealSection className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('featured_title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('featured_subtitle')}</p>
          </div>
          <Link href="./shop" className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors sm:flex">
            {tCommon('see_all')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </RevealSection>
        <div ref={productsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <div
              key={product.name}
              className={cn(
                'group overflow-hidden rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10',
                !productsInView && 'opacity-0',
                productsInView && 'animate-fade-in-up'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-44 items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-violet-950/30 dark:via-purple-950/20 dark:to-blue-950/30">
                {product.icon}
              </div>
              <div className="p-5">
                <span className="mb-2 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {product.tag}
                </span>
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <p className="mt-1">
                  <span className="text-lg font-bold text-success">{product.price}</span>
                  <span className="ml-1 text-xs text-muted-foreground">{product.unit}</span>
                </p>
                <Link href="./shop">
                  <Button className="mt-4 w-full bg-gradient-to-r from-violet-600 to-blue-600 font-medium text-white hover:from-violet-700 hover:to-blue-700 transition-all duration-200">
                    {t('consumer_cta')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="./shop">
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5">
              {tCommon('see_all')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 6. Trust badges ──────────────────────────────────── */}
      <section className="border-y bg-background py-14">
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection>
            <h2 className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('trust_title')}
            </h2>
          </RevealSection>
          <div ref={trustRef} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: <ShieldCheck className="h-6 w-6" />, label: t('trust_halal') },
              { icon: <Leaf className="h-6 w-6" />,        label: t('trust_fresh') },
              { icon: <Truck className="h-6 w-6" />,       label: t('trust_delivery') },
              { icon: <Star className="h-6 w-6" />,        label: t('trust_vet') },
            ].map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-5 text-center dark:border-violet-800/20 dark:from-violet-950/20 dark:to-blue-950/20',
                  !trustInView && 'opacity-0',
                  trustInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md shadow-violet-500/20">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. Testimonials ──────────────────────────────────── */}
      <section className="bg-gradient-to-b from-background to-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t('testimonials_title')}</h2>
          </RevealSection>
          <div ref={testimonialsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((item, i) => (
              <div
                key={item.name}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                  !testimonialsInView && 'opacity-0',
                  testimonialsInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-muted-foreground">"{item.text}"</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white shadow-sm">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Final CTA ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-800 via-purple-700 to-blue-700 py-20 text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-3xl animate-float" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <RevealSection>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t('cta_title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-purple-100">{t('cta_subtitle')}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="./shop">
                <Button size="lg" className="gap-2 bg-white px-10 font-semibold text-violet-700 shadow-xl shadow-violet-900/30 hover:bg-violet-50 transition-all duration-200 hover:scale-[1.02]">
                  {t('cta_primary')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="./farm">
                <Button size="lg" variant="ghost" className="border border-white/30 px-10 text-white hover:bg-white/10">
                  {t('cta_secondary')}
                </Button>
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

    </div>
  )
}
