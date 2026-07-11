import { createClient } from '@/lib/supabase/server'
import ReviewsClient from './review-client'

export default async function AdminReviewsPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('id, rating, title, body, is_approved, created_at, products(name_en), profiles(full_name, phone)')
    .order('is_approved', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">Approve customer reviews before they appear on product pages.</p>
      </div>
      <ReviewsClient reviews={reviews ?? []} />
    </div>
  )
}
