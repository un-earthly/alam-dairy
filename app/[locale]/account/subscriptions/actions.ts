'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const idSchema = z.object({ id: z.uuid() })

async function requireOwnSubscription(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: sub } = await supabase.from('subscriptions').select('id, user_id').eq('id', id).single()
  if (!sub || sub.user_id !== user.id) return null
  return supabase
}

export async function pauseSubscription(input: { id: string }) {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }
  const supabase = await requireOwnSubscription(parsed.data.id)
  if (!supabase) return { ok: false as const }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'paused', paused_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
  if (error) return { ok: false as const }
  revalidatePath('/[locale]/account/subscriptions', 'page')
  return { ok: true as const }
}

export async function resumeSubscription(input: { id: string }) {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }
  const supabase = await requireOwnSubscription(parsed.data.id)
  if (!supabase) return { ok: false as const }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'active', paused_at: null })
    .eq('id', parsed.data.id)
  if (error) return { ok: false as const }
  revalidatePath('/[locale]/account/subscriptions', 'page')
  return { ok: true as const }
}

export async function cancelSubscription(input: { id: string }) {
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }
  const supabase = await requireOwnSubscription(parsed.data.id)
  if (!supabase) return { ok: false as const }

  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', parsed.data.id)
  if (error) return { ok: false as const }
  revalidatePath('/[locale]/account/subscriptions', 'page')
  return { ok: true as const }
}

export async function toggleSkipNextCycle(input: { id: string; skip: boolean }) {
  const parsed = z.object({ id: z.uuid(), skip: z.boolean() }).safeParse(input)
  if (!parsed.success) return { ok: false as const }
  const supabase = await requireOwnSubscription(parsed.data.id)
  if (!supabase) return { ok: false as const }

  const { error } = await supabase
    .from('subscriptions')
    .update({ skip_next_cycle: parsed.data.skip })
    .eq('id', parsed.data.id)
  if (error) return { ok: false as const }
  revalidatePath('/[locale]/account/subscriptions', 'page')
  return { ok: true as const }
}
