'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Order = Database['public']['Tables']['orders']['Row']

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
    query = query.eq('status', status)
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
