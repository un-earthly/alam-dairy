// Centralized status -> CSS class mapping for admin tables
// Using theme tokens: primary, success, destructive, accent, muted

export const statusColorMap = {
  // Order statuses
  pending: 'bg-accent/10 text-accent',
  confirmed: 'bg-primary/10 text-primary',
  processing: 'bg-primary/10 text-primary',
  dispatched: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',

  // Payment statuses
  paid: 'bg-success/10 text-success',
  failed: 'bg-destructive/10 text-destructive',
  refunded: 'bg-muted text-muted-foreground',

  // Subscription statuses
  active: 'bg-success/10 text-success',
  paused: 'bg-accent/10 text-accent',

  // Generic statuses
  enabled: 'bg-success/10 text-success',
  disabled: 'bg-muted text-muted-foreground',
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  published: 'bg-success/10 text-success',
  draft: 'bg-muted text-muted-foreground',
  archived: 'bg-destructive/10 text-destructive',
} as const

export const productTypeColorMap = {
  dairy: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  cattle: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  feed: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-400',
  equipment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  vet_supply: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
} as const

export const stockLevelColorMap = {
  outOfStock: 'bg-destructive/10 text-destructive',
  lowStock: 'bg-accent/10 text-accent',
  inStock: 'bg-success/10 text-success',
} as const

export function getStatusColor(status: string): string {
  return statusColorMap[status as keyof typeof statusColorMap] || 'bg-muted text-muted-foreground'
}

export function getProductTypeColor(type: string): string {
  return productTypeColorMap[type as keyof typeof productTypeColorMap] || ''
}

export function getStockLevelColor(stock: number, threshold = 10): string {
  if (stock === 0) return stockLevelColorMap.outOfStock
  if (stock <= threshold) return stockLevelColorMap.lowStock
  return stockLevelColorMap.inStock
}
