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

  async function signOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    window.location.href = base
  }

  const avatarFallback = user?.email?.slice(0, 2).toUpperCase() ?? 'U'
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href={base} className="flex items-center gap-2 font-bold text-primary">
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
        <div className="flex items-center gap-1">
          <LocaleSwitcher currentLocale={locale} />
          <ThemeToggle />

          {/* Cart */}
          <Button variant="ghost" size="icon" className="relative" onClick={openCart} aria-label={t('cart')}>
            <ShoppingCart className="h-5 w-5" />
            {mounted && count > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs bg-primary text-primary-foreground">
                {count}
              </Badge>
            )}
          </Button>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
            <Link href={`${base}/auth`} className={cn(buttonVariants({ size: 'sm' }), 'hidden md:flex')}>
              {t('login')}
            </Link>
          )}

          {/* Mobile hamburger */}
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
        <div className="border-t bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            <Link href={`${base}/shop`} onClick={() => setMenuOpen(false)} className="py-1">
              {t('shop')}
            </Link>
            <Link href={`${base}/farm`} onClick={() => setMenuOpen(false)} className="py-1">
              {t('farm')}
            </Link>
            {user ? (
              <>
                <Link href={`${base}/account`} onClick={() => setMenuOpen(false)} className="py-1">
                  {locale === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}
                </Link>
                <button onClick={signOut} className="py-1 text-left text-destructive">
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link href={`${base}/auth`} onClick={() => setMenuOpen(false)} className="py-1 font-medium text-primary">
                {t('login')}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
