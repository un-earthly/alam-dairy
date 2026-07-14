'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type Profile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'phone' | 'email' | 'role' | 'is_farmer' | 'created_at'
>

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchCustomersPage({
  cursor,
  pageSize,
  search,
}: {
  cursor: number
  pageSize: number
  search?: string
}): Promise<PageData<Profile>> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, phone, email, role, is_farmer, created_at', { count: 'exact' })

  if (search?.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    query = query.or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`)
  }

  query = query.order('created_at', { ascending: false }).range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) throw new Error(`Failed to fetch customers: ${error.message}`)

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
