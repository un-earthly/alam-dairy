import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { queryProducts, type ShopSort } from '@/lib/shop/queryProducts'

const SORTS: ShopSort[] = ['newest', 'price_asc', 'price_desc']

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const sortParam = params.get('sort')
  const supabase = await createClient()

  const result = await queryProducts(supabase, {
    categoryId: params.get('category') ?? undefined,
    brandId: params.get('brand') ?? undefined,
    q: params.get('q') ?? undefined,
    minPrice: params.get('min') ? Number(params.get('min')) : undefined,
    maxPrice: params.get('max') ? Number(params.get('max')) : undefined,
    sort: SORTS.includes(sortParam as ShopSort) ? (sortParam as ShopSort) : 'newest',
    page: params.get('page') ? Number(params.get('page')) : 0,
  })

  return NextResponse.json(result)
}
