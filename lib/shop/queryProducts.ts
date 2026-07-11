import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export type ShopSort = 'newest' | 'price_asc' | 'price_desc'

export interface QueryProductsParams {
  categoryId?: string
  brandId?: string
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
}

export async function queryProducts(
  supabase: SupabaseClient<Database>,
  params: QueryProductsParams
) {
  const page = params.page ?? 0
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*, brand:brands(name)', { count: 'exact' })
    .eq('is_active', true)

  if (params.categoryId) query = query.eq('category_id', params.categoryId)
  if (params.brandId) query = query.eq('brand_id', params.brandId)
  if (params.q) {
    const term = params.q.trim()
    if (term) {
      query = query.or(
        `name_bn.ilike.%${term}%,name_en.ilike.%${term}%,description_bn.ilike.%${term}%,description_en.ilike.%${term}%,tags.cs.{${term}}`
      )
    }
  }
  if (params.minPrice != null) query = query.gte('price', params.minPrice)
  if (params.maxPrice != null) query = query.lte('price', params.maxPrice)

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
    products: (data ?? []) as unknown as ProductWithBrand[],
    total: count ?? 0,
    hasMore: count != null ? to + 1 < count : false,
  }
}
