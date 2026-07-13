'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { use } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params)
  const isBn = locale === 'bn'
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(`/${locale}`)
    })
  }, [locale, router, supabase.auth])

  async function signInWithGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)

    if (!email || !password) {
      setMessage({
        type: 'error',
        text: isBn ? 'ইমেইল এবং পাসওয়ার্ড দিন।' : 'Please enter email and password.',
      })
      return
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setMessage({
          type: 'error',
          text: isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.',
        })
        return
      }

      if (password !== confirmPassword) {
        setMessage({
          type: 'error',
          text: isBn ? 'পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.',
        })
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setMessage({ type: 'error', text: error.message })
          return
        }
        router.replace(`/${locale}`)
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
            data: { full_name: name || undefined },
          },
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
          return
        }

        if (data.session) {
          router.replace(`/${locale}`)
          return
        }

        setMessage({
          type: 'success',
          text: isBn
            ? 'রেজিস্ট্রেশন সফল। ইমেইল যাচাই করে লগইন করুন।'
            : 'Registration successful. Please verify your email, then log in.',
        })
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.05] mix-blend-multiply"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '420px' }}
      />

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-forest via-green-900 to-pasture p-12 text-white relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/3" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-repeat opacity-[0.15] invert saturate-0"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768889/marketing/doodle-2.png)', backgroundSize: '340px' }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Logo height={40} className="shrink-0 brightness-0 invert" />
          <span className="text-xl font-bold tracking-tight">
            {isBn ? 'আলম ডেইরি' : 'Alam Dairy'}
          </span>
        </div>

        {/* Copy */}
        <div className="relative space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            {isBn
              ? 'বাংলাদেশের সেরা\nডেইরি অভিজ্ঞতা'
              : "Bangladesh's finest\ndairy experience"}
          </h1>
          <p className="text-green-200 text-lg leading-relaxed max-w-sm">
            {isBn
              ? 'খাঁটি দুধ, ঘি, পনির থেকে শুরু করে খামার সরবরাহ — সব কিছু এক জায়গায়।'
              : 'From pure milk and ghee to farm supplies — everything in one place.'}
          </p>

          {/* Trust row */}
          <div className="flex flex-wrap gap-3 pt-2">
            {['🥛 Halal Certified', '🐄 Vet-Inspected', '🚚 Daily Delivery'].map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-green-100 backdrop-blur">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <blockquote className="border-l-2 border-emerald-400 pl-4 text-sm text-green-300 italic">
            {isBn
              ? '"তাজা দুধ, বিশুদ্ধ উপাদান — প্রতিটি পণ্যে আমাদের প্রতিশ্রুতি।"'
              : '"Fresh milk, pure ingredients — our promise in every product."'}
          </blockquote>
        </div>
      </div>

      {/* ── Right auth panel ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 bg-background">
        {/* <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-44 w-44 bg-contain bg-no-repeat opacity-20"
          style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768890/marketing/corner-1.png)' }}
        /> */}
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          {/* <div className="flex lg:hidden items-center justify-center gap-2 text-primary font-bold text-lg">
            <Logo height={24} className="shrink-0 dark:brightness-0 dark:invert" />
            {isBn ? 'আলম ডেইরি' : 'Alam Dairy'}
          </div> */}

          {/* Heading */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {mode === 'login'
                ? (isBn ? 'স্বাগতম' : 'Welcome back')
                : (isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create your account')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? (isBn ? 'আপনার অ্যাকাউন্টে সাইন ইন করুন' : 'Sign in to your account to continue')
                : (isBn ? 'ইমেইল দিয়ে রেজিস্ট্রেশন করুন' : 'Register with your email address')}
            </p>
          </div>

          <div className="rounded-full border border-border bg-card p-1 grid grid-cols-2">
            <button
              type="button"
              onClick={() => { setMode('login'); setMessage(null) }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isBn ? 'লগইন' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setMessage(null) }}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isBn ? 'রেজিস্ট্রেশন' : 'Registration'}
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <Label htmlFor="name">{isBn ? 'পূর্ণ নাম' : 'Full name'}</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>
            )}
            <div>
              <Label htmlFor="email">{isBn ? 'ইমেইল' : 'Email'}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" required />
            </div>
            <div>
              <Label htmlFor="password">{isBn ? 'পাসওয়ার্ড' : 'Password'}</Label>
              <div className="relative mt-2">
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <Label htmlFor="confirmPassword">{isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm password'}</Label>
                <div className="relative mt-2">
                  <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pr-10" required />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading
                ? (isBn ? 'অপেক্ষা করুন...' : 'Please wait...')
                : mode === 'login'
                  ? (isBn ? 'লগইন করুন' : 'Login')
                  : (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account')}
            </Button>
          </form>

          {message && (
            <p className={cn(
              'rounded-lg border px-3 py-2 text-sm',
              message.type === 'success'
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-destructive/30 bg-destructive/5 text-destructive'
            )}>
              {message.text}
            </p>
          )}

          {/* Google button */}
          <div className="space-y-4">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full h-12 gap-3 text-base font-medium border-2 hover:bg-muted/50 transition-all"
              disabled={loading}
            >
              <GoogleIcon />
              {isBn ? 'Google দিয়ে সাইন ইন করুন' : 'Continue with Google'}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">
                  {isBn ? 'অথবা' : 'or'}
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            {isBn
              ? 'সাইন ইন করে আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত হচ্ছেন'
              : 'By signing in you agree to our Terms of Service and Privacy Policy'}
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}
