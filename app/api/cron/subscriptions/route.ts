import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('process_due_subscriptions')

  if (error) {
    console.error('process_due_subscriptions failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const summary = {
    processed: data?.length ?? 0,
    succeeded: data?.filter((r) => !r.failed && !r.skipped).length ?? 0,
    skipped: data?.filter((r) => r.skipped).length ?? 0,
    failed: data?.filter((r) => r.failed).length ?? 0,
  }
  console.log('Subscription renewal batch:', summary)

  return NextResponse.json(summary)
}
