'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { placeOrderSchema, type PlaceOrderInput } from '@/lib/validation/order'

export type PlaceOrderResult = {
  ok: false
  error?: 'insufficient_stock' | 'error'
  fieldErrors?: Partial<Record<string, string>>
}

export async function placeOrder(locale: string, input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = placeOrderSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? '')
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.code
    }
    return { ok: false, fieldErrors }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('create_order', {
    p_user_id: user?.id ?? null,
    p_address: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      area: parsed.data.area,
    },
    p_payment_method: parsed.data.payment_method,
    p_notes: parsed.data.notes || null,
    p_contact_phone: parsed.data.phone,
    p_contact_email: parsed.data.email || null,
    p_items: parsed.data.items,
  })

  if (error || !data || data.length === 0) {
    if (error?.message.includes('insufficient_stock')) {
      return { ok: false, error: 'insufficient_stock' }
    }
    console.error('placeOrder failed:', error?.message)
    return { ok: false, error: 'error' }
  }

  const { order_number, access_token } = data[0]
  redirect(`/${locale}/checkout/confirmation?order=${order_number}&token=${access_token}`)
}
