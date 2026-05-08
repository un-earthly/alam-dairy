'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Menu, X, Leaf } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import LocaleSwitcher from './LocaleSwitcher'

export default function Header({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const count = useCart((s) => s.count())
  const openCart = useCartDrawer((s) => s.open)
  const [menuOpen, setMenuOpen] = useState(false)

  const base = `/${locale}`

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={base} className="flex items-center gap-2 font-bold text-green-700">
          <Leaf className="h-5 w-5" />
          <span className="text-sm leading-tight">
            {locale === 'bn' ? 'আলম ডেইরি' : 'Alam Dairy'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href={`${base}/shop`} className="text-muted-foreground hover:text-foreground transition-colors">
            {t('shop')}
          </Link>
          <Link href={`${base}/farm`} className="text-muted-foreground hover:text-foreground transition-colors">
            {t('farm')}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LocaleSwitcher currentLocale={locale} />
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label={t('cart')}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs bg-green-600">
                {count}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            <Link href={`${base}/shop`} onClick={() => setMenuOpen(false)} className="py-1">
              {t('shop')}
            </Link>
            <Link href={`${base}/farm`} onClick={() => setMenuOpen(false)} className="py-1">
              {t('farm')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
