'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'staff'].includes(profile.role)) return null
  return supabase
}

const idsSchema = z.object({ ids: z.array(z.uuid()).min(1), active: z.boolean() })

export async function setActive(input: { ids: string[]; active: boolean }) {
  const parsed = idsSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }

  const supabase = await requireAdmin()
  if (!supabase) return { ok: false as const }

  const { error } = await supabase.from('products').update({ is_active: parsed.data.active }).in('id', parsed.data.ids)
  if (error) return { ok: false as const }

  revalidatePath('/admin/imported-products')
  revalidatePath('/admin/products')
  return { ok: true as const }
}

const deleteSchema = z.object({ ids: z.array(z.uuid()).min(1) })

export async function deleteProducts(input: { ids: string[] }) {
  const parsed = deleteSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }

  const supabase = await requireAdmin()
  if (!supabase) return { ok: false as const }

  const { error } = await supabase.from('products').delete().in('id', parsed.data.ids)
  if (error) return { ok: false as const }

  revalidatePath('/admin/imported-products')
  revalidatePath('/admin/products')
  return { ok: true as const }
}
