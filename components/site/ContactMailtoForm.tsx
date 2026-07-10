'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ContactMailtoForm() {
    const t = useTranslations('contact')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')

    const subjectOptions = useMemo(
        () => [t('subject_order'), t('subject_visit'), t('subject_bulk'), t('subject_other')],
        [t]
    )

    const openMail = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const finalSubject = subject || t('subject_other')
        const body = [
            `${t('form_name')}: ${name || '-'}`,
            `${t('form_phone')}: ${phone || '-'}`,
            '',
            `${t('form_message')}:`,
            message || '-',
        ].join('\n')

        const mailto = `mailto:hello@alamdairy.farm?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`
        window.location.href = mailto
    }

    return (
        <form onSubmit={openMail} className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-forest dark:text-foreground">{t('form_title')}</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <Label htmlFor="contact-name">{t('form_name')}</Label>
                    <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                </div>
                <div>
                    <Label htmlFor="contact-phone">{t('form_phone')}</Label>
                    <Input id="contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" />
                </div>
            </div>
            <div className="mt-4">
                <Label htmlFor="contact-subject">{t('form_subject')}</Label>
                <select
                    id="contact-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                    <option value="">{t('subject_other')}</option>
                    {subjectOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>
            <div className="mt-4">
                <Label htmlFor="contact-message">{t('form_message')}</Label>
                <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mt-2 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{t('form_hint')}</p>
                <Button type="submit" className="bg-pasture text-cream hover:bg-pasture/90">{t('form_send')}</Button>
            </div>
        </form>
    )
}
