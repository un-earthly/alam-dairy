import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Droplets, HeartHandshake, Users, Sprout, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/site/PageHero'
import ParallaxBand from '@/components/site/ParallaxBand'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'
import EstdBadge from '@/components/landing/EstdBadge'
import WaveDivider from '@/components/landing/WaveDivider'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  await params
  const t = await getTranslations('about')
  return { title: `${t('hero_eyebrow')} — Alam Dairy`, description: t('hero_subtitle') }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('about')
  const base = `/${locale}`

  const values = [
    { icon: <Droplets className="h-6 w-6" />, title: t('value1_title'), desc: t('value1_desc') },
    { icon: <HeartHandshake className="h-6 w-6" />, title: t('value2_title'), desc: t('value2_desc') },
    { icon: <Sprout className="h-6 w-6" />, title: t('value3_title'), desc: t('value3_desc') },
    { icon: <Users className="h-6 w-6" />, title: t('value4_title'), desc: t('value4_desc') },
  ]

  return (
    <div>
      <PageHero
        eyebrow={t('hero_eyebrow')}
        title={t('hero_title')}
        subtitle={t('hero_subtitle')}
        image="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768907/marketing/photos/scenic/farm-landscape.webp"
        tall
      />

      {/* Mission */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <CornerOrnament corner="bl" size={260} rotate={8} opacity={0.35} />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-[6fr_5fr]">
          <Reveal>
            <p className="font-accent text-lg text-butter">{t('mission_eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-5xl dark:text-foreground">
              {t('mission_title')}
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">{t('mission_p1')}</p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{t('mission_p2')}</p>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="relative overflow-hidden rounded-[3rem]">
              <Image
                src="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768898/marketing/photos/milking.jpg"
                alt="Milk cans at the farm"
                width={880}
                height={660}
                className="h-72 w-full object-cover sm:h-96"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </div>
            <EstdBadge className="absolute -bottom-8 right-6 text-forest [&_svg_circle]:fill-cream" />
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden bg-secondary/60 py-16 sm:py-24">
        <CornerOrnament corner="tr" size={220} rotate={-10} opacity={0.4} className="scale-y-[-1]" />
        <div className="relative mx-auto max-w-7xl px-4">
          <Reveal className="mb-12 text-center">
            <p className="font-accent text-lg text-butter">{t('values_eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">
              {t('values_title')}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="flex h-full flex-col gap-3 rounded-[2rem] border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-pasture/15">
                  <div className="flex h-12 w-12 items-center justify-center blob-2 bg-pasture text-cream shadow-md shadow-pasture/25">
                    {v.icon}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-forest dark:text-foreground">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Founder quote over parallax herd */}
      <ParallaxBand image="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768903/marketing/photos/scenic/cow-herd.webp">
        <Reveal>
          <p className="font-accent text-2xl leading-relaxed text-butter sm:text-3xl">“{t('band_quote')}”</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-widest text-cream/80">{t('band_sign')}</p>
        </Reveal>
      </ParallaxBand>

      {/* People */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <Image src="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768905/marketing/photos/scenic/farmer-hands.webp" alt="Farmer's hands at work" width={600} height={450} className="blob-1 aspect-square w-full object-cover shadow-lg shadow-forest/10 rotate-[-2deg]" sizes="(min-width: 1024px) 25vw, 45vw" />
              <Image src="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768896/marketing/photos/cow-portrait.jpg" alt="A cow at the farm" width={600} height={450} className="blob-3 aspect-square w-full object-cover shadow-lg shadow-forest/10 mt-8 rotate-[2deg]" sizes="(min-width: 1024px) 25vw, 45vw" />
            </div>
          </Reveal>
          <Reveal delay={120} className="order-1 lg:order-2">
            <p className="font-accent text-lg text-butter">{t('people_eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">
              {t('people_title')}
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">{t('people_desc')}</p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-forest py-20 text-cream">
        <CornerOrnament corner="tl" size={200} rotate={4} opacity={0.25} onDark />
        <CornerOrnament corner="br" size={240} rotate={-3} opacity={0.2} onDark />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-wide sm:text-4xl">{t('cta_title')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cream/80">{t('cta_text')}</p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href={`${base}/contact`}>
                <Button size="lg" className="gap-2 bg-butter px-10 font-semibold text-forest shadow-xl shadow-black/25 hover:bg-butter/90 transition-all duration-200 hover:scale-[1.02]">
                  {t('cta_primary')} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href={`${base}/our-story`}>
                <Button size="lg" variant="ghost" className="border border-cream/30 px-10 text-cream hover:bg-cream/10">
                  {t('cta_secondary')}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="absolute -top-1 left-0 right-0 rotate-180">
          <WaveDivider fill="var(--background)" />
        </div>
      </section>
    </div>
  )
}
