'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShoppingCart, Menu, X, Leaf, LogOut, User, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useCart } from '@/lib/store/cart'
import { useCartDrawer } from '@/lib/store/cartDrawer'
import { createClient } from '@/lib/supabase/client'
import LocaleSwitcher from './LocaleSwitcher'

export default function Header({
  locale,
  initialUser,
}: {
  locale: string
  initialUser: SupabaseUser | null
}) {
  const t = useTranslations('nav')
  const count = useCart((s) => s.count())
  const openCart = useCartDrawer((s) => s.open)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(initialUser)
  const supabase = createClient()
  const router = useRouter()
  const base = `/${locale}`

  useEffect(() => {
    setMounted(true)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    window.location.href = base
  }

  const avatarFallback = user?.email?.slice(0, 2).toUpperCase() ?? 'U'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  const navLinks = [
    { href: `${base}/shop`, label: t('shop') },
    { href: `${base}/farm`, label: t('farm') },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-all duration-300',
        scrolled
          ? 'bg-background/85 shadow-sm supports-[backdrop-filter]:bg-background/70 backdrop-blur-lg'
          : 'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-md'
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300',
          scrolled ? 'h-12' : 'h-16'
        )}
      >
        {/* Logo */}
        <Link href={base} className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-foreground leading-tight">
            {locale === 'bn' ? 'আলম ডেইরি' : 'Alam Dairy'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-muted-foreground hover:text-foreground transition-colors duration-200 after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-primary after:transition-[width] after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-0.5">
          <LocaleSwitcher currentLocale={locale} />
          <ThemeToggle />

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label={t('cart')}>
            <ShoppingCart className="h-4.5 w-4.5" />
            {mounted && count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px] bg-primary text-primary-foreground animate-in zoom-in-50 duration-200">
                {count}
              </Badge>
            )}
          </Button>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ml-1">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent transition-all duration-200 hover:ring-primary/40">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 animate-in slide-in-from-top-2 fade-in-0 duration-150">
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`${base}/account`)} className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  {locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`${base}/account/orders`)} className="gap-2 cursor-pointer">
                  <Package className="h-4 w-4" />
                  {locale === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href={`${base}/auth`} className={cn(buttonVariants({ size: 'sm' }), 'hidden md:flex ml-1')}>
              {t('login')}
            </Link>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-0.5"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen
              ? <X className="h-5 w-5 transition-transform duration-150 rotate-0" />
              : <Menu className="h-5 w-5 transition-transform duration-150 rotate-0" />
            }
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-background/95 backdrop-blur-lg px-4 py-3 md:hidden animate-slide-down">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href={`${base}/account`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link
                href={`${base}/auth`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                {t('login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
