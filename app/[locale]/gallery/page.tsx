import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import PageHero from '@/components/site/PageHero'
import ParallaxBand from '@/components/site/ParallaxBand'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('gallery')
    return { title: `${t('hero_eyebrow')} - Alam Dairy`, description: t('hero_subtitle') }
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('gallery')

    const herdShots = [
        '/photos/scenic/cow-herd.webp',
        '/photos/scenic/calves-field.webp',
        '/photos/cow-portrait.jpg',
        '/photos/scenic/pasture-mist.webp',
    ]
    const landShots = [
        '/photos/scenic/crop-field.webp',
        '/photos/scenic/golden-field.webp',
        '/photos/scenic/rice-paddy.webp',
        '/photos/scenic/farm-landscape.webp',
    ]
    const workShots = [
        '/photos/scenic/dairy-farm.webp',
        '/photos/scenic/tractor.webp',
        '/photos/milking.jpg',
        '/photos/scenic/farmer-hands.webp',
    ]

    return (
        <div>
            <PageHero
                eyebrow={t('hero_eyebrow')}
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                image="/photos/scenic/farm-landscape.webp"
                tall
            />

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="bl" size={230} rotate={8} opacity={0.3} />
                <GalleryGrid title={t('herd_title')} shots={herdShots} />
            </section>

            <ParallaxBand image="/photos/scenic/rural-road.webp" className="min-h-[35vh] sm:min-h-[42vh]" />

            <section className="py-16 sm:py-24">
                <GalleryGrid title={t('land_title')} shots={landShots} reverse />
            </section>

            <section className="relative overflow-hidden bg-secondary/50 py-16 sm:py-24">
                <CornerOrnament corner="tr" size={210} rotate={-8} opacity={0.34} className="scale-y-[-1]" />
                <GalleryGrid title={t('work_title')} shots={workShots} />
            </section>
        </div>
    )
}

function GalleryGrid({ title, shots, reverse = false }: { title: string; shots: string[]; reverse?: boolean }) {
    const items = reverse ? [...shots].reverse() : shots
    return (
        <div className="mx-auto max-w-7xl px-4">
            <Reveal className="mb-10 text-center">
                <h2 className="font-display text-3xl font-semibold tracking-wide text-forest sm:text-4xl dark:text-foreground">{title}</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                {items.map((src, i) => (
                    <Reveal key={src} delay={i * 80}>
                        <Image
                            src={src}
                            alt={title}
                            width={700}
                            height={900}
                            className="blob-2 aspect-[4/5] w-full object-cover shadow-lg shadow-forest/10 transition-transform duration-300 hover:scale-[1.02]"
                            sizes="(min-width: 1024px) 24vw, 50vw"
                        />
                    </Reveal>
                ))}
            </div>
        </div>
    )
}
