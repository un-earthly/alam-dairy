import { getTranslations } from 'next-intl/server'
import { Phone, Mail, MapPin } from 'lucide-react'
import PageHero from '@/components/site/PageHero'
import Reveal from '@/components/site/Reveal'
import CornerOrnament from '@/components/site/CornerOrnament'
import ContactMailtoForm from '@/components/site/ContactMailtoForm'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('contact')
    return { title: `${t('hero_eyebrow')} - Alam Dairy`, description: t('hero_subtitle') }
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    await params
    const t = await getTranslations('contact')

    return (
        <div>
            <PageHero
                eyebrow={t('hero_eyebrow')}
                title={t('hero_title')}
                subtitle={t('hero_subtitle')}
                image="/photos/scenic/rural-road.webp"
            />

            <section className="relative overflow-hidden py-16 sm:py-24">
                <CornerOrnament corner="bl" size={230} rotate={8} opacity={0.34} />
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 lg:grid-cols-[5fr_7fr]">
                    <Reveal>
                        <div className="space-y-4">
                            <InfoCard icon={<Phone className="h-5 w-5" />} title={t('phone_title')} line="01700-000000" hint={t('phone_hours')} />
                            <InfoCard icon={<Mail className="h-5 w-5" />} title={t('email_title')} line="hello@alamdairy.farm" hint="support@alamdairy.farm" />
                            <InfoCard icon={<MapPin className="h-5 w-5" />} title={t('address_title')} line={t('address_line')} hint={t('visit_note')} />
                        </div>
                    </Reveal>
                    <Reveal delay={120}>
                        <ContactMailtoForm />
                    </Reveal>
                </div>
            </section>
        </div>
    )
}

function InfoCard({ icon, title, line, hint }: { icon: React.ReactNode; title: string; line: string; hint: string }) {
    return (
        <article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center blob-2 bg-pasture text-cream">{icon}</div>
                <h2 className="font-display text-xl font-semibold text-forest dark:text-foreground">{title}</h2>
            </div>
            <p className="mt-3 text-sm text-foreground">{line}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </article>
    )
}
