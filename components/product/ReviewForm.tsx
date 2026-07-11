'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitReview } from '@/app/[locale]/shop/[slug]/actions'

export default function ReviewForm({
  productId,
  locale,
  isLoggedIn,
  loginHref,
}: {
  productId: string
  locale: string
  isLoggedIn: boolean
  loginHref: string
}) {
  const router = useRouter()
  const isBn = locale === 'bn'
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!isLoggedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        <a href={loginHref} className="text-primary underline">
          {isBn ? 'লগইন করুন' : 'Log in'}
        </a>{' '}
        {isBn ? 'রিভিউ দিতে।' : 'to write a review.'}
      </p>
    )
  }

  if (done) {
    return (
      <p className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
        {isBn ? 'ধন্যবাদ! আপনার রিভিউ অনুমোদনের অপেক্ষায় আছে।' : 'Thanks! Your review is pending approval.'}
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError(isBn ? 'একটি রেটিং দিন' : 'Please select a rating')
      return
    }
    setPending(true)
    setError('')
    const result = await submitReview({ product_id: productId, rating, title, body })
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setDone(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const value = i + 1
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHoverRating(value)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <Star
                className={`h-6 w-6 ${
                  value <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                }`}
              />
            </button>
          )
        })}
      </div>
      <Input placeholder={isBn ? 'শিরোনাম (ঐচ্ছিক)' : 'Title (optional)'} value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        placeholder={isBn ? 'আপনার অভিজ্ঞতা লিখুন...' : 'Share your experience...'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : isBn ? 'রিভিউ জমা দিন' : 'Submit Review'}
      </Button>
    </form>
  )
}
