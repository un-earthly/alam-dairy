import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'bn' | 'en')) notFound()

  const messages = await getMessages()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header locale={locale} initialUser={user} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
        <CartDrawer />
      </div>
    </NextIntlClientProvider>
  )
}
