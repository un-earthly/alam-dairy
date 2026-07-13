'use server'

import { createClient } from '@/lib/supabase/server'

interface SubscriptionRow {
  id: string
  frequency: string
  quantity: number
  unit_price: number
  status: string
  next_billing_date: string
  last_renewal_status: string | null
  last_renewal_error: string | null
  last_renewal_at: string | null
  products: { name_en: string } | null
  profiles: { full_name: string | null; phone: string | null } | null
}

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchSubscriptionsPage({
  cursor,
  pageSize,
  status,
}: {
  cursor: number
  pageSize: number
  status?: string
}): Promise<PageData<SubscriptionRow>> {
  const supabase = await createClient()

  let query = supabase.from('subscriptions').select(
    'id, frequency, quantity, unit_price, status, next_billing_date, last_renewal_status, last_renewal_error, last_renewal_at, products(name_en), profiles(full_name, phone)',
    { count: 'exact' }
  )

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false }).range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) throw new Error(`Failed to fetch subscriptions: ${error.message}`)

  return {
    rows: (data ?? []) as SubscriptionRow[],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
