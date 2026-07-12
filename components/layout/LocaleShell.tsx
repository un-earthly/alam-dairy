'use client'

import { usePathname } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { ToastViewport } from '@/components/ui/toast'

export default function LocaleShell({
    children,
    locale,
    initialUser,
}: {
    children: React.ReactNode
    locale: string
    initialUser: SupabaseUser | null
}) {
    const pathname = usePathname()
    const hideFooter = pathname === `/${locale}/auth`

    return (
        <div className="flex min-h-screen flex-col">
            <Header locale={locale} initialUser={initialUser} />
            <main className="flex-1">{children}</main>
            {!hideFooter && <Footer locale={locale} />}
            <CartDrawer />
            <ToastViewport />
        </div>
    )
}