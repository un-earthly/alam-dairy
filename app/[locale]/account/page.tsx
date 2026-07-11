import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Package, User, Settings, ChevronRight, ShieldCheck, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isBn = locale === 'bn'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role, credit_limit, created_at')
    .eq('id', user.id)
    .single() as { data: Pick<Profile, 'full_name' | 'phone' | 'role' | 'credit_limit' | 'created_at'> | null; error: unknown }

  const { count: orderCount } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const displayName = profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const fallback = displayName.slice(0, 2).toUpperCase()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'staff'
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString(isBn ? 'bn-BD' : 'en-GB', { month: 'long', year: 'numeric' })
    : null

  const quickLinks = [
    {
      href: `/${locale}/account/orders`,
      icon: Package,
      label: isBn ? 'আমার অর্ডার' : 'My Orders',
      desc: isBn ? `${orderCount ?? 0}টি অর্ডার` : `${orderCount ?? 0} orders`,
    },
    {
      href: `/${locale}/account/subscriptions`,
      icon: RefreshCw,
      label: isBn ? 'আমার সাবস্ক্রিপশন' : 'My Subscriptions',
      desc: isBn ? 'পুনরাবৃত্ত অর্ডার পরিচালনা করুন' : 'Manage recurring deliveries',
    },
    {
      href: `/${locale}/shop`,
      icon: ShieldCheck,
      label: isBn ? 'পণ্য দেখুন' : 'Browse Products',
      desc: isBn ? 'খাঁটি দুগ্ধজাত পণ্য' : 'Fresh dairy products',
    },
    ...(isAdmin ? [{
      href: '/admin',
      icon: Settings,
      label: isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel',
      desc: isBn ? 'ড্যাশবোর্ড ও ব্যবস্থাপনা' : 'Dashboard & management',
    }] : []),
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {fallback}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground truncate">{displayName}</h1>
                {isAdmin && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {profile?.role}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{user.email}</p>
              {profile?.phone && (
                <p className="text-sm text-muted-foreground">{profile.phone}</p>
              )}
              {memberSince && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isBn ? `সদস্য হয়েছেন ${memberSince}` : `Member since ${memberSince}`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">
              {isBn ? 'মোট অর্ডার' : 'Total Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{orderCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground font-medium">
              {isBn ? 'ক্রেডিট লিমিট' : 'Credit Limit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              ৳{(profile?.credit_limit ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          {isBn ? 'দ্রুত অ্যাক্সেস' : 'Quick Access'}
        </h2>
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {quickLinks.map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Google provider note */}
      <p className="text-center text-xs text-muted-foreground">
        <User className="inline h-3 w-3 mr-1" />
        {isBn ? 'Google দিয়ে সাইন ইন করা অ্যাকাউন্ট' : 'Signed in via Google'}
      </p>
    </div>
  )
}
