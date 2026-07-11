import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import ReviewList from '@/components/product/ReviewList'
import ReviewForm from '@/components/product/ReviewForm'
import type { Database, Json } from '@/lib/supabase/types'

type Review = Database['public']['Tables']['product_reviews']['Row']

export default function ProductTabs({
  description,
  meta,
  reviews,
  reviewCount,
  averageRating,
  verifiedUserIds,
  productId,
  locale,
  isLoggedIn,
  loginHref,
}: {
  description: string | null
  meta: Json
  reviews: Review[]
  reviewCount: number
  averageRating: number
  verifiedUserIds: Set<string>
  productId: string
  locale: string
  isLoggedIn: boolean
  loginHref: string
}) {
  const isBn = locale === 'bn'
  const metaObj = meta && typeof meta === 'object' && !Array.isArray(meta) ? (meta as Record<string, string>) : null

  return (
    <Tabs defaultValue="description" className="mt-10">
      <TabsList variant="line" className="border-b w-full justify-start">
        <TabsTrigger value="description">{isBn ? 'বিবরণ' : 'Description'}</TabsTrigger>
        {metaObj && Object.keys(metaObj).length > 0 && (
          <TabsTrigger value="specs">{isBn ? 'বিস্তারিত' : 'Specifications'}</TabsTrigger>
        )}
        <TabsTrigger value="reviews">
          {isBn ? 'রিভিউ' : 'Reviews'} {reviewCount > 0 && `(${reviewCount})`}
        </TabsTrigger>
        <TabsTrigger value="delivery">{isBn ? 'ডেলিভারি' : 'Delivery'}</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="py-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description || (isBn ? 'কোনো বিবরণ নেই।' : 'No description available.')}
        </p>
      </TabsContent>

      {metaObj && Object.keys(metaObj).length > 0 && (
        <TabsContent value="specs" className="py-5">
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(metaObj).map(([key, value], i) => (
                  <tr key={key} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-2 font-medium text-gray-600 w-2/5 capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2 text-gray-800">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      )}

      <TabsContent value="reviews" className="py-5 space-y-6">
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              / 5 {isBn ? `(${reviewCount}টি রিভিউ)` : `(${reviewCount} reviews)`}
            </span>
          </div>
        )}
        <ReviewForm productId={productId} locale={locale} isLoggedIn={isLoggedIn} loginHref={loginHref} />
        <ReviewList reviews={reviews} locale={locale} verifiedUserIds={verifiedUserIds} />
      </TabsContent>

      <TabsContent value="delivery" className="py-5 space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>{isBn ? 'ঢাকার মধ্যে দ্রুত ডেলিভারি, সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে।' : 'Fast delivery within Dhaka, usually within 24-48 hours.'}</p>
        <p>{isBn ? 'ক্যাশ অন ডেলিভারি উপলব্ধ। পণ্য গ্রহণের সময় পরিশোধ করুন।' : 'Cash on delivery available. Pay when you receive your order.'}</p>
        <p>{isBn ? '১০০% খামার-তাজা গ্যারান্টি — সন্তুষ্ট না হলে যোগাযোগ করুন।' : '100% farm-fresh guarantee — contact us if you\'re not satisfied.'}</p>
      </TabsContent>
    </Tabs>
  )
}
