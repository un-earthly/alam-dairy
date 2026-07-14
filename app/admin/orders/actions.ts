'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { Database, OrderStatus } from '@/lib/supabase/types'

type Order = Database['public']['Tables']['orders']['Row']

const updateStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']),
})

export async function updateOrderStatus(input: { orderId: string; status: string }) {
  const parsed = updateStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin', 'staff'].includes(profile.role)) return { ok: false as const }

  // RLS policy orders_update_admin also enforces the role check
  const { error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.orderId)

  if (error) return { ok: false as const }

  revalidatePath('/admin/orders')
  return { ok: true as const }
}

export interface FetchOrdersParams {
  cursor: number
  pageSize: number
  search?: string
  status?: string | null
  sortKey?: string
  sortDir?: 'asc' | 'desc'
}

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchOrdersPage({
  cursor,
  pageSize,
  search,
  status,
  sortKey = 'created_at',
  sortDir = 'desc',
}: FetchOrdersParams): Promise<PageData<Order>> {
  const supabase = await createClient()

  let query = supabase.from('orders').select('*', { count: 'exact' })

  // Apply search filter
  if (search?.trim()) {
    const searchTerm = `%${search.trim()}%`
    query = query.or(`order_number.ilike.${searchTerm},id.ilike.${searchTerm}`)
  }

  // Apply status filter
  if (status && status !== 'all') {
    query = query.eq('status', status as OrderStatus)
  }

  // Apply sorting
  query = query.order(sortKey, { ascending: sortDir === 'asc' })

  // Apply pagination
  query = query.range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
