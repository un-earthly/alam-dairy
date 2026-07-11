'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  variant_id?: string
  name_bn: string
  name_en: string
  price: number
  unit: string
  quantity: number
  image: string | null
  type: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, variantId?: string) => void
  updateQty: (id: string, qty: number, variantId?: string) => void
  clearCart: () => void
  total: () => number
  count: () => number
}

function sameLine(a: { id: string; variant_id?: string }, id: string, variantId?: string) {
  return a.id === id && (a.variant_id ?? null) === (variantId ?? null)
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item.id, item.variant_id))
          if (existing) {
            return {
              items: state.items.map((i) =>
                sameLine(i, item.id, item.variant_id) ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (id, variantId) => {
        set((state) => ({ items: state.items.filter((i) => !sameLine(i, id, variantId)) }))
      },

      updateQty: (id, qty, variantId) => {
        if (qty <= 0) {
          get().removeItem(id, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (sameLine(i, id, variantId) ? { ...i, quantity: qty } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      count: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'alam-cart',
      version: 2,
      migrate: (persisted) => persisted as CartStore,
    }
  )
)
