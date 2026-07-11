import { z } from 'zod'

export const startSubscriptionSchema = z.object({
  product_id: z.uuid(),
  variant_id: z.uuid().optional(),
  quantity: z.number().int().positive().max(50),
  frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
  email: z.union([z.email(), z.literal('')]).optional(),
  address: z.string().trim().min(5).max(300),
  area: z.string().trim().min(2).max(100),
  payment_method: z.literal('cod'),
})

export type StartSubscriptionInput = z.infer<typeof startSubscriptionSchema>
