'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchInventoryPage({
  cursor,
  pageSize,
}: {
  cursor: number
  pageSize: number
}): Promise<PageData<Product>> {
  const supabase = await createClient()

  const { data, count, error } = await supabase
    .from('products')
    .select('id, name_en, type, stock, unit, is_active', { count: 'exact' })
    .order('stock', { ascending: true })
    .range(cursor, cursor + pageSize - 1)

  if (error) throw new Error(`Failed to fetch inventory: ${error.message}`)

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
