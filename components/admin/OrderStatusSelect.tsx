'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatus } from '@/app/admin/orders/actions'

const STATUSES = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled']

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-teal-100 text-teal-800',
  dispatched: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [pending, startTransition] = useTransition()

  function handleChange(newStatus: string) {
    const previous = status
    setStatus(newStatus)
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status: newStatus })
      if (!result.ok) setStatus(previous)
    })
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={pending}
      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400 ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-white text-gray-800">
          {s}
        </option>
      ))}
    </select>
  )
}
