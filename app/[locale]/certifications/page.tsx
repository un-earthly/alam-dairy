import { getTranslations } from 'next-intl/server'
import { BadgeCheck } from 'lucide-react'
import PageHero from '@/components/site/PageHero'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('certifications')
    return { title: `${t('hero_eyebrow')} - Alam Dairy`, description: t('hero_subtitle') }
}

export default async function CertificationsPage({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('certifications')

    const certs = [
        { name: t('cert1_name'), issuer: t('cert1_issuer'), desc: t('cert1_desc') },
        { name: t('cert2_name'), issuer: t('cert2_issuer'), desc: t('cert2_desc') },
        { name: t('cert3_name'), issuer: t('cert3_issuer'), desc: t('cert3_desc') },
        { name: t('cert4_name'), issuer: t('cert4_issuer'), desc: t('cert4_desc') },
    ]

    return (
        <div>
            <PageHero
                eyebrow={t('hero_eyebrow')}
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                image="https://res.cloudinary.com/oeon1p4w/image/upload/v1783768901/marketing/photos/scenic/barn.webp"
            />

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="bl" size={230} rotate={7} opacity={0.34} />
                <div className="mx-auto max-w-5xl px-4">
                    <Reveal className="text-center">
                        <p className="mx-auto max-w-3xl leading-relaxed text-muted-foreground">{t('intro_text')}</p>
                    </Reveal>

                    <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {certs.map((cert, i) => (
                            <Reveal key={cert.name} delay={i * 80}>
                                <article className="h-full rounded-[2rem] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pasture/15">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center blob-2 bg-pasture text-cream">
                                            <BadgeCheck className="h-5 w-5" />
                                        </div>
                                        <h2 className="font-display text-xl font-semibold text-forest dark:text-foreground">{cert.name}</h2>
                                    </div>
                                    <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{cert.issuer}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{cert.desc}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal className="mt-10">
                        <div className="rounded-[2rem] border border-border bg-secondary/70 p-6 text-center">
                            <h3 className="font-display text-xl font-semibold text-forest dark:text-foreground">{t('note_title')}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('note_text')}</p>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    )
}
