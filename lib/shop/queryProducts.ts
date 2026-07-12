import type { SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js'
import type { Database, ProductType } from '@/lib/supabase/types'

export type ShopSort = 'newest' | 'price_asc' | 'price_desc' | 'best_selling'

export interface QueryProductsParams {
  categoryId?: string
  brandId?: string
  types?: ProductType[]
  q?: string
  minPrice?: number
  maxPrice?: number
  sort?: ShopSort
  page?: number
  pageSize?: number
}

const DEFAULT_PAGE_SIZE = 24

export type ProductWithBrand = Database['public']['Tables']['products']['Row'] & {
  brand: { name: string } | null
  avg_rating?: number
  review_count?: number
}

// Batch-computes real average rating + review count from approved reviews
// for a page of products, so listing cards show genuine social proof
// instead of a mock everywhere they're rendered.
export async function attachRatings<T extends { id: string }>(
  supabase: SupabaseClient<Database>,
  products: T[]
): Promise<(T & { avg_rating?: number; review_count?: number })[]> {
  if (products.length === 0) return products
  const { data } = await supabase
    .from('product_reviews')
    .select('product_id, rating')
    .eq('is_approved', true)
    .in(
      'product_id',
      products.map((p) => p.id)
    )

  const sums = new Map<string, { sum: number; count: number }>()
  for (const row of data ?? []) {
    const entry = sums.get(row.product_id) ?? { sum: 0, count: 0 }
    entry.sum += row.rating
    entry.count += 1
    sums.set(row.product_id, entry)
  }

  return products.map((p) => {
    const entry = sums.get(p.id)
    if (!entry) return p
    return { ...p, avg_rating: Math.round((entry.sum / entry.count) * 10) / 10, review_count: entry.count }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilters<T extends PostgrestFilterBuilder<any, any, any, any>>(
  query: T,
  params: QueryProductsParams
): T {
  let q = query.eq('is_active', true) as T
  if (params.categoryId) q = q.eq('category_id', params.categoryId) as T
  if (params.brandId) q = q.eq('brand_id', params.brandId) as T
  if (params.types && params.types.length > 0) q = q.in('type', params.types) as T
  if (params.q) {
    const term = params.q.trim()
    if (term) {
      q = q.or(
        `name_bn.ilike.%${term}%,name_en.ilike.%${term}%,description_bn.ilike.%${term}%,description_en.ilike.%${term}%,tags.cs.{${term}}`
      ) as T
    }
  }
  if (params.minPrice != null) q = q.gte('price', params.minPrice) as T
  if (params.maxPrice != null) q = q.lte('price', params.maxPrice) as T
  return q
}

export async function queryProducts(
  supabase: SupabaseClient<Database>,
  params: QueryProductsParams
) {
  const page = params.page ?? 0
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
  const from = page * pageSize
  const to = from + pageSize - 1

  // Best-selling has no cached column to order by in Postgres, so it's
  // resolved in two passes: rank matching ids by order_items volume, then
  // fetch just the current page's rows and re-sort them into that order.
  if (params.sort === 'best_selling') {
    let idQuery = supabase.from('products').select('id')
    idQuery = applyFilters(idQuery, params)
    const { data: idRows, error: idError } = await idQuery.limit(500)
    if (idError) throw idError
    const allIds = (idRows ?? []).map((r) => r.id as string)

    let counts = new Map<string, number>()
    if (allIds.length > 0) {
      const { data: itemRows } = await supabase
        .from('order_items')
        .select('product_id')
        .in('product_id', allIds)
      counts = new Map()
      for (const row of itemRows ?? []) {
        const pid = (row as { product_id: string }).product_id
        counts.set(pid, (counts.get(pid) ?? 0) + 1)
      }
    }

    const rankedIds = allIds.sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0))
    const pageIds = rankedIds.slice(from, to + 1)

    if (pageIds.length === 0) {
      return { products: [] as ProductWithBrand[], total: rankedIds.length, hasMore: false }
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, brand:brands(name)')
      .in('id', pageIds)
    if (error) throw error

    const byId = new Map((data ?? []).map((p) => [p.id, p]))
    const products = pageIds.map((id) => byId.get(id)).filter(Boolean) as unknown as ProductWithBrand[]

    return {
      products: await attachRatings(supabase, products),
      total: rankedIds.length,
      hasMore: to + 1 < rankedIds.length,
    }
  }

  let query = supabase
    .from('products')
    .select('*, brand:brands(name)', { count: 'exact' })
  query = applyFilters(query, params)

  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, count, error } = await query.range(from, to)
  if (error) throw error

  return {
    products: await attachRatings(supabase, (data ?? []) as unknown as ProductWithBrand[]),
    total: count ?? 0,
    hasMore: count != null ? to + 1 < count : false,
  }
}

export async function countProductsByType(
  supabase: SupabaseClient<Database>,
  types: ProductType[]
): Promise<Record<string, number>> {
  const results = await Promise.all(
    types.map((type) =>
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('type', type)
    )
  )
  const counts: Record<string, number> = {}
  types.forEach((type, i) => {
    counts[type] = results[i].count ?? 0
  })
  return counts
}

export async function countProductsByCategory(
  supabase: SupabaseClient<Database>,
  categoryIds: string[],
  extraFilter?: { types?: ProductType[] }
): Promise<Record<string, number>> {
  const results = await Promise.all(
    categoryIds.map((categoryId) => {
      let q = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('category_id', categoryId)
      if (extraFilter?.types && extraFilter.types.length > 0) q = q.in('type', extraFilter.types)
      return q
    })
  )
  const counts: Record<string, number> = {}
  categoryIds.forEach((id, i) => {
    counts[id] = results[i].count ?? 0
  })
  return counts
}
