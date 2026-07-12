'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Truck, Star, Leaf, ArrowRight, ShoppingBag, Smartphone, Milk, Wheat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInView } from '@/hooks/useInView'
import { cn } from '@/lib/utils'
import Logo from '@/components/layout/Logo'
import EstdBadge from '@/components/landing/EstdBadge'
import WaveDivider from '@/components/landing/WaveDivider'
import LazyVideo from '@/components/landing/LazyVideo'
import ParallaxBand from '@/components/site/ParallaxBand'
import Timeline from '@/components/site/Timeline'
import CornerOrnament from '@/components/site/CornerOrnament'

const pasturePanorama = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768900/marketing/photos/pasture-panorama.jpg'
const cowPortrait = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768896/marketing/photos/cow-portrait.jpg'
const milkPour = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768899/marketing/photos/milk-pour.jpg'
const calf = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768895/marketing/photos/calf.jpg'
const milking = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768898/marketing/photos/milking.jpg'
const field = 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768897/marketing/photos/field.jpg'

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

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('font-accent text-lg text-butter', className)}>{children}</p>
  )
}

function GrassSprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none">
        <path d="M20 22 C20 14 18 8 14 4" />
        <path d="M20 22 C20 12 22 8 27 5" />
        <path d="M20 22 C19 16 16 13 10 12" />
        <path d="M20 22 C21 16 25 14 31 13" />
      </g>
    </svg>
  )
}

function HomeContent() {
  const t = useTranslations('landing')
  const tCommon = useTranslations('common')
  const tStory = useTranslations('story')

  const { ref: statsRef, inView: statsInView } = useInView()
  const { ref: lanesRef, inView: lanesInView } = useInView()
  const { ref: stepsRef, inView: stepsInView } = useInView()
  const { ref: productsRef, inView: productsInView } = useInView()
  const { ref: trustRef, inView: trustInView } = useInView()
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView()
  const { ref: galleryRef, inView: galleryInView } = useInView()

  const testimonials = [
    { initials: 'RU', name: t('testimonial_1_name'), location: t('testimonial_1_location'), text: t('testimonial_1_text') },
    { initials: 'NB', name: t('testimonial_2_name'), location: t('testimonial_2_location'), text: t('testimonial_2_text') },
    { initials: 'KH', name: t('testimonial_3_name'), location: t('testimonial_3_location'), text: t('testimonial_3_text') },
  ]

  const steps = [
    { step: '01', icon: <ShoppingBag className="h-7 w-7 text-cream" />, title: t('how_step1_title'), desc: t('how_step1_desc') },
    { step: '02', icon: <Smartphone className="h-7 w-7 text-cream" />, title: t('how_step2_title'), desc: t('how_step2_desc') },
    { step: '03', icon: <Truck className="h-7 w-7 text-cream" />, title: t('how_step3_title'), desc: t('how_step3_desc') },
  ]

  const featuredProducts = [
    { icon: <Milk className="h-14 w-14 text-pasture" />, name: t('product_milk'), price: '৳ 80', unit: '/litre', tag: t('tag_bestseller') },
    { icon: <Leaf className="h-14 w-14 text-pasture" />, name: t('product_yogurt'), price: '৳ 60', unit: '/kg', tag: t('tag_fresh') },
    { icon: <Wheat className="h-14 w-14 text-pasture" />, name: t('product_ghee'), price: '৳ 950', unit: '/kg', tag: t('tag_premium') },
  ]

  const galleryShots = [
    { src: cowPortrait, width: 867, height: 1300, alt: 'Dairy cow at the farm', blob: 'blob-1', className: 'rotate-[-2deg] sm:mt-10' },
    { src: milkPour, width: 867, height: 1300, alt: 'Fresh milk being poured', blob: 'blob-2', className: 'rotate-[1.5deg]' },
    { src: calf, width: 1880, height: 1254, alt: 'A young calf', blob: 'blob-3', className: 'rotate-[2deg] sm:mt-16' },
    { src: milking, width: 1880, height: 1253, alt: 'Milk cans on a wooden cart', blob: 'blob-2', className: 'rotate-[-1.5deg] sm:mt-6' },
  ]

  const storyMilestones = [
    { year: '2015', title: tStory('m2015_title'), text: tStory('m2015_text'), image: 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768904/marketing/photos/scenic/dairy-farm.webp' },
    { year: '2018', title: tStory('m2018_title'), text: tStory('m2018_text'), image: 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768912/marketing/photos/scenic/rural-road.webp' },
    { year: '2022', title: tStory('m2022_title'), text: tStory('m2022_text'), image: 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768913/marketing/photos/scenic/tractor.webp' },
    { year: '2026', title: tStory('m2026_title'), text: tStory('m2026_text'), image: 'https://res.cloudinary.com/oeon1p4w/image/upload/v1783768903/marketing/photos/scenic/cow-herd.webp' },
  ]

  return (
    <div>

      {/* ── 1. Hero: farm video, black overlay, glass panel ──── */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-forest text-cream sm:min-h-[88vh]">
        <LazyVideo src="https://res.cloudinary.com/oeon1p4w/video/upload/v1783768893/marketing/hero-720.mp4" poster="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768894/marketing/hero-poster.jpg" className="absolute inset-0" />
        {/* Black gradient overlay for legibility over footage */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.65))' }}
        />
        {/* Nakshi kantha doodles, faint, never competing with the headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-repeat-x opacity-[0.12] invert saturate-0"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768889/marketing/doodle-2.png)', backgroundSize: 'auto 100%' }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:py-28">
          <div className="glass-panel mx-auto max-w-2xl rounded-[2.5rem] px-6 py-10 text-center text-white sm:px-12 sm:py-14 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <Logo height={56} priority className="mx-auto mb-5 brightness-0 invert" />
            <Eyebrow>{t('hero_eyebrow')}</Eyebrow>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-wide drop-shadow-sm sm:text-6xl">
              {t('hero_title')}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {t('hero_subtitle')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="./shop">
                <Button
                  size="lg"
                  className="gap-2 bg-butter px-8 font-semibold text-forest shadow-lg shadow-black/30 hover:bg-butter/90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {t('consumer_cta')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="./farm">
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-white/40 px-8 text-white hover:bg-white/10 transition-all duration-200"
                >
                  {t('farmer_cta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Liquid pour into the next section */}
        <div className="absolute bottom-0 left-0 right-0">
          <WaveDivider fill="var(--background)" />
        </div>
      </section>

      {/* ── 2. Our Story: asymmetric, panorama bleeding off edge ── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-[5fr_6fr] lg:gap-0">
          <RevealSection className="relative z-10">
            <Eyebrow>{t('story_eyebrow')}</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-5xl dark:text-foreground">
              {t('story_title')}
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">{t('story_p1')}</p>
            <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{t('story_p2')}</p>

            {/* Farmer's note */}
            <div className="mt-8 inline-block -rotate-1 rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
              <p className="font-accent text-xl text-forest dark:text-foreground">“{t('farmers_note')}”</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('farmers_note_sign')}
              </p>
            </div>
          </RevealSection>

          <RevealSection delay={150} className="relative lg:-mr-[12vw]">
            <div className="relative overflow-hidden rounded-[3rem] lg:rounded-r-none">
              <Image
                src={pasturePanorama}
                alt="Cows grazing on green pasture"
                width={1880}
                height={1056}
                className="h-64 w-full object-cover sm:h-96"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>
            <EstdBadge className="absolute -bottom-8 left-6 text-forest [&_svg_circle]:fill-cream sm:left-10" />
          </RevealSection>
        </div>
      </section>

      {/* ── 3. Stats bar ─────────────────────────────────────── */}
      <section className="relative bg-forest py-10 text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.07] invert saturate-0"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '420px' }}
        />
        <div
          ref={statsRef}
          className={cn(
            'relative mx-auto max-w-7xl px-4',
            !statsInView && 'opacity-0',
            statsInView && 'animate-fade-in-up'
          )}
        >
          <div className="grid grid-cols-2 divide-x divide-cream/15 sm:grid-cols-4">
            {[
              { value: '2,500+', label: t('stats_customers') },
              { value: '50+', label: t('stats_products') },
              { value: '100%', label: t('stats_delivery') },
              { value: '10+', label: t('stats_years') },
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
                <span className="font-display text-2xl font-semibold tabular-nums text-butter sm:text-3xl">{stat.value}</span>
                <span className="text-xs text-cream/75 sm:text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Two lanes ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <RevealSection className="mb-12 text-center">
          <Eyebrow>{t('lanes_eyebrow')}</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">{t('lanes_title')}</h2>
          <p className="mt-3 text-muted-foreground">{t('lanes_subtitle')}</p>
        </RevealSection>
        <div ref={lanesRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* B2C */}
          <div
            className={cn(
              'group relative flex flex-col gap-4 overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15',
              !lanesInView && 'opacity-0',
              lanesInView && 'animate-fade-in-up'
            )}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 blob-1 bg-pasture/15 blur-2xl transition-colors group-hover:bg-pasture/25" />
            <div className="flex h-14 w-14 items-center justify-center blob-2 bg-pasture text-cream shadow-md shadow-pasture/25">
              <Milk className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-forest dark:text-foreground">{t('consumer_title')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t('consumer_desc')}</p>
            <Link href="./shop" className="mt-auto">
              <Button className="gap-2 bg-pasture text-cream hover:bg-pasture/90 sm:w-auto">
                {t('consumer_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* B2B */}
          <div
            className={cn(
              'group relative flex flex-col gap-4 overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-butter/20',
              !lanesInView && 'opacity-0',
              lanesInView && 'animate-fade-in-up'
            )}
            style={{ animationDelay: '120ms' }}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 blob-3 bg-butter/20 blur-2xl transition-colors group-hover:bg-butter/30" />
            <div className="flex h-14 w-14 items-center justify-center blob-3 bg-forest text-cream shadow-md shadow-forest/25">
              <Truck className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-forest dark:text-foreground">{t('farmer_title')}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t('farmer_desc')}</p>
            <Link href="./farm" className="mt-auto">
              <Button className="gap-2 bg-forest text-cream hover:bg-forest/90 sm:w-auto">
                {t('farmer_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. Gallery: blob-masked, scattered ───────────────── */}
      <section className="relative overflow-hidden bg-secondary/60 py-16 sm:py-24">
        <CornerOrnament corner="tr" size={210} rotate={-8} opacity={0.35} className="scale-y-[-1]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.08] mix-blend-multiply dark:opacity-[0.05] dark:invert dark:saturate-0 dark:mix-blend-screen"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '480px' }}
        />
        <div className="relative mx-auto max-w-7xl px-4">
          <RevealSection className="mb-12 text-center">
            <Eyebrow>{t('gallery_eyebrow')}</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">
              {t('gallery_title')}
            </h2>
          </RevealSection>
          <div ref={galleryRef} className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {galleryShots.map((shot, i) => (
              <div
                key={shot.alt}
                className={cn(
                  'transition-transform duration-300 hover:scale-[1.03]',
                  shot.className,
                  !galleryInView && 'opacity-0',
                  galleryInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={shot.width}
                  height={shot.height}
                  className={cn('aspect-[4/5] w-full object-cover shadow-lg shadow-forest/10', shot.blob)}
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. How it works ──────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection className="mb-14 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">{t('how_title')}</h2>
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
                <div className="relative z-10 flex h-20 w-20 items-center justify-center blob-2 bg-pasture shadow-lg shadow-pasture/25">
                  {item.icon}
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-butter text-xs font-black text-forest shadow-md">
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

      {/* ── 7. Featured products ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-24">
        <RevealSection className="mb-10 flex items-end justify-between">
          <div>
            <Eyebrow>{t('featured_eyebrow')}</Eyebrow>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">{t('featured_title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('featured_subtitle')}</p>
          </div>
          <Link href="./shop" className="hidden items-center gap-1 text-sm font-medium text-pasture hover:text-forest transition-colors sm:flex dark:hover:text-foreground">
            {tCommon('see_all')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </RevealSection>
        <div ref={productsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featuredProducts.map((product, i) => (
            <div
              key={product.name}
              className={cn(
                'group overflow-hidden rounded-[2rem] border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pasture/15',
                !productsInView && 'opacity-0',
                productsInView && 'animate-fade-in-up'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative flex h-44 items-center justify-center bg-secondary/70">
                <div className="transition-transform duration-300 group-hover:animate-sway">{product.icon}</div>
                {/* grass sprig grows on hover */}
                <GrassSprig className="absolute bottom-3 left-6 h-6 w-9 text-pasture opacity-0 group-hover:opacity-100 group-hover:animate-sprout" />
                <GrassSprig className="absolute bottom-3 right-8 h-5 w-7 text-pasture/70 opacity-0 group-hover:opacity-100 group-hover:animate-sprout" />
              </div>
              <div className="p-5">
                <span className="mb-2 inline-block rounded-full bg-butter/20 px-2.5 py-0.5 text-xs font-semibold text-forest dark:text-butter">
                  {product.tag}
                </span>
                <h3 className="font-semibold text-foreground">{product.name}</h3>
                <p className="mt-1">
                  <span className="text-lg font-bold text-pasture">{product.price}</span>
                  <span className="ml-1 text-xs text-muted-foreground">{product.unit}</span>
                </p>
                <Link href="./shop">
                  <Button className="mt-4 w-full bg-pasture font-medium text-cream hover:bg-forest transition-all duration-200">
                    {t('consumer_cta')}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="./shop">
            <Button variant="outline" className="gap-2 border-pasture/30 text-pasture hover:bg-pasture/5">
              {tCommon('see_all')} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── 8.5. Photographic parallax interlude ───────────── */}
      <ParallaxBand image="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768907/marketing/photos/scenic/golden-field.webp" className="min-h-[36vh] sm:min-h-[44vh]" speed={0.5}>
        <RevealSection>
          <p className="font-accent text-2xl text-butter sm:text-3xl">{t('home_band_eyebrow')}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-cream sm:text-4xl">
            {t('home_band_title')}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-cream/85 sm:text-base">
            {t('home_band_subtitle')}
          </p>
        </RevealSection>
      </ParallaxBand>

      {/* ── 9. Trust badges ──────────────────────────────────── */}
      <section className="border-y border-border py-14">
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection>
            <h2 className="mb-10 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('trust_title')}
            </h2>
          </RevealSection>
          <div ref={trustRef} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: <ShieldCheck className="h-6 w-6" />, label: t('trust_halal') },
              { icon: <Leaf className="h-6 w-6" />, label: t('trust_fresh') },
              { icon: <Truck className="h-6 w-6" />, label: t('trust_delivery') },
              { icon: <Star className="h-6 w-6" />, label: t('trust_vet') },
            ].map((item, i) => (
              <div
                key={item.label}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-[1.75rem] border border-border bg-card p-5 text-center',
                  !trustInView && 'opacity-0',
                  trustInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center blob-1 bg-pasture text-cream shadow-md shadow-pasture/20">
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. Timeline teaser ─────────────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <CornerOrnament corner="bl" size={230} rotate={0} opacity={0.32} />
        <div className="mx-auto max-w-7xl px-4">
          <RevealSection className="mb-12 text-center">
            <p className="font-accent text-lg text-butter">{t('timeline_teaser_eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">
              {t('timeline_teaser_title')}
            </h2>
          </RevealSection>
          <Timeline milestones={storyMilestones} />
          <RevealSection className="mt-10 text-center">
            <Link href="./our-story">
              <Button className="gap-2 bg-pasture px-8 text-cream hover:bg-pasture/90">
                {t('timeline_teaser_cta')} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ── 11. Testimonials: glass cards over pasture ───────── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* textured pasture-green backdrop */}
        <Image
          src={field}
          alt=""
          aria-hidden
          fill
          quality={30}
          className="object-cover blur-xs scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-pasture/80 dark:bg-forest/85" />
        {/* kantha corner ornaments */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 right-0 h-48 w-full bg-repeat opacity-20 invert saturate-0"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768889/marketing/doodle-2.png)', backgroundSize: '300px' }}
        />

        <div className="relative mx-auto max-w-7xl px-4">
          <RevealSection className="mb-12 text-center">
            <Eyebrow>{t('testimonials_eyebrow')}</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-white sm:text-4xl">{t('testimonials_title')}</h2>
          </RevealSection>
          <div ref={testimonialsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((item, i) => (
              <div
                key={item.name}
                className={cn(
                  'glass-panel flex flex-col gap-4 rounded-[2rem] p-6 text-white transition-all duration-200 hover:-translate-y-0.5',
                  i === 1 && 'sm:translate-y-6',
                  !testimonialsInView && 'opacity-0',
                  testimonialsInView && 'animate-fade-in-up'
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-butter text-butter" />
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-white/90">“{item.text}”</p>
                <div className="mt-auto flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center blob-1 bg-butter text-sm font-bold text-forest shadow-sm">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-white/70">{item.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Final CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-forest py-20 text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.07] invert saturate-0"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '420px' }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <RevealSection>
            <h2 className="font-display text-3xl font-semibold tracking-wide sm:text-4xl">{t('cta_title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cream/80">{t('cta_subtitle')}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="./shop">
                <Button size="lg" className="gap-2 bg-butter px-10 font-semibold text-forest shadow-xl shadow-black/25 hover:bg-butter/90 transition-all duration-200 hover:scale-[1.02]">
                  {t('cta_primary')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="./farm">
                <Button size="lg" variant="ghost" className="border border-cream/30 px-10 text-cream hover:bg-cream/10">
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
