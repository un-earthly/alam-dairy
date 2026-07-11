import { z } from 'zod'

export const submitReviewSchema = z.object({
  product_id: z.uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
})

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>
