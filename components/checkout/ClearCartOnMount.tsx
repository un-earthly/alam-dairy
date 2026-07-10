'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/store/cart'

export default function ClearCartOnMount() {
  const clearCart = useCart((s) => s.clearCart)

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return null
}
