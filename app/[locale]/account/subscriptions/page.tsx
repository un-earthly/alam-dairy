import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubscriptionsClient from './subscriptions-client'

export default async function AccountSubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isBn = locale === 'bn'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/auth`)

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, frequency, quantity, unit_price, status, next_billing_date, skip_next_cycle, products(name_bn, name_en)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'url(https://res.cloudinary.com/oeon1p4w/image/upload/v1783768887/marketing/doodle.png)', backgroundSize: '420px' }}
      />
      <div className="relative mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isBn ? 'আমার সাবস্ক্রিপশন' : 'My Subscriptions'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? 'পুনরাবৃত্ত ডেলিভারি পরিচালনা করুন — স্থগিত, পুনরায় শুরু বা বাতিল করুন।'
              : 'Manage your recurring deliveries — pause, resume, or cancel anytime.'}
          </p>
        </div>
        <SubscriptionsClient subscriptions={subscriptions ?? []} locale={locale} />
      </div>
    </div>
  )
}
