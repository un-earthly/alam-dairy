import { getTranslations } from 'next-intl/server'
import { Sun, Recycle, Droplets, Leaf, HeartHandshake, Flame } from 'lucide-react'
import PageHero from '@/components/site/PageHero'
import ParallaxBand from '@/components/site/ParallaxBand'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('sustainability')
    return { title: `${t('hero_eyebrow')} - Alam Dairy`, description: t('hero_subtitle') }
}

export default async function SustainabilityPage({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('sustainability')

    const pillars = [
        { icon: <Flame className="h-6 w-6" />, title: t('pillar1_title'), desc: t('pillar1_desc') },
        { icon: <Sun className="h-6 w-6" />, title: t('pillar2_title'), desc: t('pillar2_desc') },
        { icon: <Recycle className="h-6 w-6" />, title: t('pillar3_title'), desc: t('pillar3_desc') },
        { icon: <Droplets className="h-6 w-6" />, title: t('pillar4_title'), desc: t('pillar4_desc') },
        { icon: <Leaf className="h-6 w-6" />, title: t('pillar5_title'), desc: t('pillar5_desc') },
        { icon: <HeartHandshake className="h-6 w-6" />, title: t('pillar6_title'), desc: t('pillar6_desc') },
    ]

    return (
        <div>
            <PageHero
                eyebrow={t('hero_eyebrow')}
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                image="/photos/scenic/rice-paddy.webp"
                tall
            />

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="bl" size={230} rotate={8} opacity={0.34} />
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <Reveal>
                        <p className="font-accent text-lg text-butter">{t('intro_eyebrow')}</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-5xl dark:text-foreground">
                            {t('intro_title')}
                        </h2>
                        <p className="mx-auto mt-5 max-w-3xl leading-relaxed text-muted-foreground">{t('intro_text')}</p>
                    </Reveal>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-16 sm:pb-24">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {pillars.map((item, i) => (
                        <Reveal key={item.title} delay={i * 80}>
                            <article className="h-full rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15">
                                <div className="flex h-12 w-12 items-center justify-center blob-2 bg-pasture text-cream shadow-md shadow-pasture/25">
                                    {item.icon}
                                </div>
                                <h3 className="mt-4 font-display text-xl font-semibold text-forest dark:text-foreground">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </section>

            <ParallaxBand image="/photos/scenic/haystack.webp">
                <Reveal>
                    <p className="font-accent text-2xl leading-relaxed text-butter sm:text-3xl">&ldquo;{t('band_quote')}&rdquo;</p>
                </Reveal>
            </ParallaxBand>

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="tl" size={210} rotate={7} opacity={0.26} />
                <CornerOrnament corner="tr" size={220} rotate={-9} opacity={0.3} className="scale-y-[-1]" />
                <div className="mx-auto max-w-4xl px-4 text-center">
                    <Reveal>
                        <p className="font-accent text-lg text-butter">{t('commit_eyebrow')}</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">
                            {t('commit_title')}
                        </h2>
                    </Reveal>
                    <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
                        {[t('commit1'), t('commit2'), t('commit3'), t('commit4')].map((item, i) => (
                            <Reveal key={item} delay={i * 90}>
                                <div className="rounded-2xl border border-border bg-card px-5 py-4 text-sm text-foreground shadow-sm">{item}</div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
