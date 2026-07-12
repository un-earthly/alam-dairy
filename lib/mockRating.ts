// Deterministic placeholder rating/review-count for products without enough
// real `product_reviews` yet, so cards always show a social-proof row instead
// of flickering between "has reviews" and "no reviews" layouts.
export function getMockRating(id: string): { rating: number; reviewCount: number } {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  const rating = Math.round((3.6 + (hash % 15) / 10) * 10) / 10
  const reviewCount = 4 + (hash % 96)
  return { rating, reviewCount }
}
