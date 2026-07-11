import { z } from 'zod'

export const orderItemSchema = z.object({
  id: z.uuid(),
  variant_id: z.uuid().optional(),
  quantity: z.number().int().positive().max(999),
})

export const placeOrderSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^01[3-9]\d{8}$/),
  email: z.union([z.email(), z.literal('')]).optional(),
  address: z.string().trim().min(5).max(300),
  area: z.string().trim().min(2).max(100),
  payment_method: z.literal('cod'),
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1).max(50),
})

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>
export type PlaceOrderField = Exclude<keyof PlaceOrderInput, 'items' | 'payment_method'>
