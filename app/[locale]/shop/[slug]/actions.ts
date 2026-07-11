'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { submitReviewSchema, type SubmitReviewInput } from '@/lib/validation/review'
import { startSubscriptionSchema, type StartSubscriptionInput } from '@/lib/validation/subscription'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function submitReview(input: SubmitReviewInput): Promise<ActionResult> {
  const parsed = submitReviewSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid_input' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthorized' }

  const { error } = await supabase.from('product_reviews').insert({
    product_id: parsed.data.product_id,
    user_id: user.id,
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body || null,
    is_approved: false,
    order_item_id: null,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function startSubscription(locale: string, input: StartSubscriptionInput) {
  const parsed = startSubscriptionSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const, error: 'invalid_input' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('create_subscription', {
    p_user_id: user?.id ?? null,
    p_product_id: parsed.data.product_id,
    p_variant_id: parsed.data.variant_id ?? null,
    p_quantity: parsed.data.quantity,
    p_frequency: parsed.data.frequency,
    p_address: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      area: parsed.data.area,
    },
    p_payment_method: parsed.data.payment_method,
    p_contact_phone: parsed.data.phone,
    p_contact_email: parsed.data.email || null,
  })

  if (error || !data || data.length === 0) {
    console.error('startSubscription failed:', error?.message)
    return { ok: false as const, error: error?.message ?? 'error' }
  }

  const { order_number, access_token } = data[0]
  redirect(`/${locale}/checkout/confirmation?order=${order_number}&token=${access_token}`)
}
