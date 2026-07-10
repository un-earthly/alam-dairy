'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ShoppingCart, Menu, X, LogOut, User, Package, Milk, Truck, Leaf,
  BookOpen, Camera, Sprout, BadgeCheck, Phone,
} from 'lucide-react'
import { useState, useEffect, useSyncExternalStore } from 'react'
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
import Logo from './Logo'
import MegaMenu, { type MegaSection, type MegaLink } from './MegaMenu'

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
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(initialUser)
  const supabase = createClient()
  const router = useRouter()
  const base = `/${locale}`
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  )

  useEffect(() => {
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

  const megaSections: MegaSection[] = [
    {
      label: t('products'),
      columns: [
        {
          heading: t('shop'),
          links: [
            { href: `${base}/shop`, label: t('mega_dairy'), desc: t('mega_dairy_desc'), icon: <Milk className="h-4 w-4" /> },
            { href: `${base}/shop?type=milk`, label: t('mega_milk'), icon: <Milk className="h-4 w-4" /> },
            { href: `${base}/shop?type=yogurt`, label: t('mega_yogurt'), icon: <Leaf className="h-4 w-4" /> },
            { href: `${base}/shop?type=ghee`, label: t('mega_ghee'), icon: <Sprout className="h-4 w-4" /> },
          ],
        },
        {
          heading: t('farm'),
          links: [
            { href: `${base}/farm`, label: t('mega_supplies'), desc: t('mega_supplies_desc'), icon: <Truck className="h-4 w-4" /> },
            { href: `${base}/farm?type=cattle`, label: t('mega_cattle'), icon: <BadgeCheck className="h-4 w-4" /> },
            { href: `${base}/farm?type=feed`, label: t('mega_feed'), icon: <Sprout className="h-4 w-4" /> },
          ],
        },
      ],
      feature: {
        href: `${base}/shop`,
        image: '/photos/milk-pour.jpg',
        title: t('mega_products_feature'),
        cta: t('mega_products_cta'),
      },
    },
    {
      label: t('company'),
      columns: [
        {
          heading: t('company'),
          links: [
            { href: `${base}/about`, label: t('about'), desc: t('about_desc'), icon: <User className="h-4 w-4" /> },
            { href: `${base}/our-story`, label: t('story'), desc: t('story_desc'), icon: <BookOpen className="h-4 w-4" /> },
            { href: `${base}/sustainability`, label: t('sustainability'), desc: t('sustainability_desc'), icon: <Sprout className="h-4 w-4" /> },
            { href: `${base}/certifications`, label: t('certifications'), desc: t('certifications_desc'), icon: <BadgeCheck className="h-4 w-4" /> },
          ],
        },
      ],
      feature: {
        href: `${base}/our-story`,
        image: '/photos/scenic/pasture-mist.webp',
        title: t('mega_company_feature'),
        cta: t('mega_company_cta'),
      },
    },
  ]

  const plainLinks: MegaLink[] = [
    { href: `${base}/gallery`, label: t('gallery') },
    { href: `${base}/contact`, label: t('contact') },
  ]

  const mobileGroups: { heading: string; links: { href: string; label: string; icon: React.ReactNode }[] }[] = [
    {
      heading: t('products'),
      links: [
        { href: `${base}/shop`, label: t('shop'), icon: <Milk className="h-4 w-4" /> },
        { href: `${base}/farm`, label: t('farm'), icon: <Truck className="h-4 w-4" /> },
      ],
    },
    {
      heading: t('company'),
      links: [
        { href: `${base}/about`, label: t('about'), icon: <User className="h-4 w-4" /> },
        { href: `${base}/our-story`, label: t('story'), icon: <BookOpen className="h-4 w-4" /> },
        { href: `${base}/sustainability`, label: t('sustainability'), icon: <Sprout className="h-4 w-4" /> },
        { href: `${base}/certifications`, label: t('certifications'), icon: <BadgeCheck className="h-4 w-4" /> },
        { href: `${base}/gallery`, label: t('gallery'), icon: <Camera className="h-4 w-4" /> },
        { href: `${base}/contact`, label: t('contact'), icon: <Phone className="h-4 w-4" /> },
      ],
    },
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
          <Logo
            height={32}
            priority
            className="shrink-0 transition-transform duration-200 group-hover:scale-105 dark:brightness-0 dark:invert"
          />
          <span className="font-display text-sm font-semibold text-foreground leading-tight">
            {locale === 'bn' ? 'আলম ডেইরি' : 'Alam Dairy'}
          </span>
        </Link>

        {/* Desktop nav: mega menu */}
        <MegaMenu sections={megaSections} plainLinks={plainLinks} />

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
            <Link href={`${base}/auth`} className={cn(buttonVariants({ size: 'sm' }), 'hidden lg:flex ml-1')}>
              {t('login')}
            </Link>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ml-0.5"
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
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t bg-background/95 backdrop-blur-lg px-4 py-3 lg:hidden animate-slide-down">
          <nav className="flex flex-col gap-0.5">
            {mobileGroups.map((group) => (
              <div key={group.heading} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {group.heading}
                </p>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <span className="text-pasture">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
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
