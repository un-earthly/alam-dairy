'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const updateStatusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']),
})

export async function updateOrderStatus(input: { orderId: string; status: string }) {
  const parsed = updateStatusSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (!profile || !['admin', 'staff'].includes(profile.role)) return { ok: false as const }

  // RLS policy orders_update_admin also enforces the role check
  const { error } = await supabase
    .from('orders')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.orderId)

  if (error) return { ok: false as const }

  revalidatePath('/admin/orders')
  return { ok: true as const }
}
