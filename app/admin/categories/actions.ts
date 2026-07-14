'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

export type Category = Pick<
  Database['public']['Tables']['categories']['Row'],
  'id' | 'name_en' | 'parent_id' | 'is_active' | 'sort_order'
>

export interface PageData<T> {
  rows: T[]
  nextCursor: number | null
  total: number
}

export async function fetchCategoriesPage({
  cursor,
  pageSize,
  search,
}: {
  cursor: number
  pageSize: number
  search?: string
}): Promise<PageData<Category>> {
  const supabase = await createClient()

  let query = supabase
    .from('categories')
    .select('id, name_en, parent_id, is_active, sort_order', { count: 'exact' })

  if (search?.trim()) {
    const searchTerm = `%${search.trim().toLowerCase()}%`
    query = query.ilike('name_en', searchTerm)
  }

  query = query.order('sort_order', { ascending: true }).range(cursor, cursor + pageSize - 1)

  const { data, count, error } = await query

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)

  return {
    rows: data ?? [],
    nextCursor: data && data.length === pageSize ? cursor + pageSize : null,
    total: count ?? 0,
  }
}
