import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PageHero from '@/components/site/PageHero'
import Timeline from '@/components/site/Timeline'
import ParallaxBand from '@/components/site/ParallaxBand'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('story')
    return { title: `${t('hero_eyebrow')} - Alam Dairy`, description: t('hero_subtitle') }
}

export default async function StoryPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations('story')
    const base = `/${locale}`

    const milestones = [
        { year: '2015', title: t('m2015_title'), text: t('m2015_text'), image: '/photos/scenic/dairy-farm.webp' },
        { year: '2016', title: t('m2016_title'), text: t('m2016_text'), image: '/photos/scenic/farmer-hands.webp' },
        { year: '2017', title: t('m2017_title'), text: t('m2017_text'), image: '/photos/scenic/milk-splash.webp' },
        { year: '2018', title: t('m2018_title'), text: t('m2018_text'), image: '/photos/scenic/rural-road.webp' },
        { year: '2020', title: t('m2020_title'), text: t('m2020_text'), image: '/photos/scenic/rice-paddy.webp' },
        { year: '2021', title: t('m2021_title'), text: t('m2021_text'), image: '/photos/scenic/calves-field.webp' },
        { year: '2022', title: t('m2022_title'), text: t('m2022_text'), image: '/photos/scenic/tractor.webp' },
        { year: '2024', title: t('m2024_title'), text: t('m2024_text'), image: '/photos/scenic/golden-field.webp' },
        { year: '2026', title: t('m2026_title'), text: t('m2026_text'), image: '/photos/scenic/cow-herd.webp' },
    ]

    return (
        <div>
            <PageHero
                eyebrow={t('hero_eyebrow')}
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                image="/photos/scenic/pasture-mist.webp"
                tall
            />

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="bl" size={240} rotate={8} opacity={0.35} />
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 lg:grid-cols-[5fr_6fr]">
                    <Reveal>
                        <p className="font-accent text-lg text-butter">{t('intro_eyebrow')}</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-5xl dark:text-foreground">
                            {t('intro_title')}
                        </h2>
                        <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">{t('intro_p1')}</p>
                        <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">{t('intro_p2')}</p>
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
                            <p className="font-accent text-2xl leading-relaxed text-forest dark:text-foreground">&ldquo;{t('legacy_quote')}&rdquo;</p>
                            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('legacy_sign')}</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <ParallaxBand image="/photos/scenic/crop-field.webp" className="min-h-[38vh] sm:min-h-[46vh]">
                <Reveal>
                    <p className="font-accent text-2xl text-butter sm:text-3xl">{t('timeline_eyebrow')}</p>
                    <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide sm:text-4xl">{t('timeline_title')}</h2>
                </Reveal>
            </ParallaxBand>

            <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
                <CornerOrnament corner="tr" size={200} rotate={-8} opacity={0.25} className="scale-y-[-1]" />
                <Timeline milestones={milestones} />
            </section>

            <section className="relative overflow-hidden bg-forest py-20 text-cream">
                <CornerOrnament corner="tl" size={200} rotate={4} opacity={0.22} onDark />
                <CornerOrnament corner="br" size={220} rotate={-5} opacity={0.2} onDark />
                <div className="relative mx-auto max-w-3xl px-4 text-center">
                    <Reveal>
                        <h2 className="font-display text-3xl font-semibold tracking-wide sm:text-4xl">{t('cta_title')}</h2>
                        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            <Link href={`${base}/shop`}>
                                <Button size="lg" className="gap-2 bg-butter px-10 font-semibold text-forest hover:bg-butter/90">
                                    {t('cta_primary')} <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href={`${base}/contact`}>
                                <Button size="lg" variant="ghost" className="border border-cream/30 px-10 text-cream hover:bg-cream/10">
                                    {t('cta_secondary')}
                                </Button>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    )
}
