'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database, ProductType } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export interface FetchProductsParams {
  cursor: number
  pageSize: number
  search?: string
  type?: string | null
  status?: string | null
  sortKey?: string
  sortDir?: 'asc' | 'desc'
}

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchProductsPage({
  cursor,
  pageSize,
  search,
  type,
  status,
  sortKey = 'name_en',
  sortDir = 'asc',
}: FetchProductsParams): Promise<PageData<Product>> {
  const supabase = await createClient()

  let query = supabase.from('products').select('*', { count: 'exact' })

  // Apply search filter
  if (search?.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    query = query.or(`name_en.ilike.${searchTerm},slug.ilike.${searchTerm}`)
  }

  // Apply type filter
  if (type && type !== 'all') {
    query = query.eq('type', type as ProductType)
  }

  // Apply status filter
  if (status && status !== 'all') {
    switch (status) {
      case 'active':
        query = query.eq('is_active', true)
        break
      case 'hidden':
        query = query.eq('is_active', false)
        break
      case 'featured':
        query = query.eq('is_featured', true)
        break
      case 'low_stock':
        query = query.lt('stock', 10).gt('stock', 0)
        break
      case 'out_of_stock':
        query = query.eq('stock', 0)
        break
    }
  }

  // Apply sorting
  query = query.order(sortKey, { ascending: sortDir === 'asc' })

  // Apply pagination
  query = query.range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
