'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Brand = Database['public']['Tables']['brands']['Row']

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchBrandsPage({
  cursor,
  pageSize,
  search,
}: {
  cursor: number
  pageSize: number
  search?: string
}): Promise<PageData<Brand>> {
  const supabase = await createClient()

  let query = supabase
    .from('brands')
    .select('id, name, logo_url, is_active', { count: 'exact' })

  if (search?.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    query = query.ilike('name', searchTerm)
  }

  query = query.order('name', { ascending: true }).range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) throw new Error(`Failed to fetch brands: ${error.message}`)

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
