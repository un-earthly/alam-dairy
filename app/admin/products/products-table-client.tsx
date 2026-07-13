'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DataTable,
  DataTableToolbar,
  DataTableFacetedFilter,
  useDataTable,
  useInfiniteQuery,
} from '@/components/ui/data-table'
import { productColumns } from './columns'
import { fetchProductsPage } from './actions'
import type { Database, ProductType } from '@/lib/supabase/types'

type Product = Database['public']['Tables']['products']['Row']

const TYPE_OPTIONS = [
  { label: 'Dairy', value: 'dairy' },
  { label: 'Cattle', value: 'cattle' },
  { label: 'Feed', value: 'feed' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Vet Supply', value: 'vet_supply' },
]

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Hidden', value: 'hidden' },
  { label: 'Featured', value: 'featured' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
]

interface ProductsTableClientProps {
  initialProducts: Product[]
}

export default function ProductsTableClient({
  initialProducts,
}: ProductsTableClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set())
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set())
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [busyAction, setBusyAction] = useState(false)

  const isFiltered = typeFilters.size > 0 || statusFilters.size > 0 || search.trim().length > 0

  const queryKey = JSON.stringify({
    search,
    types: Array.from(typeFilters),
    statuses: Array.from(statusFilters),
  })

  const { data, hasMore, loadingMore, loadMore, reset, total } = useInfiniteQuery({
    initialData: initialProducts,
    fetchPage: async (params: any) => {
      return fetchProductsPage({
        cursor: params.cursor,
        pageSize: params.pageSize,
        search: params.search,
        type: typeFilters.size > 0 ? Array.from(typeFilters)[0] : undefined,
        status: statusFilters.size > 0 ? Array.from(statusFilters)[0] : undefined,
      })
    },
    pageSize: 20,
    queryKey,
    params: { search, types: Array.from(typeFilters), statuses: Array.from(statusFilters) },
  })

  const { table } = useDataTable({
    data,
    columns: productColumns,
    pageSize: 20,
    enableRowSelection: true,
  })

  // Sync selected rows from table
  const rows = table.getRowModel().rows
  const selectedRowIds = new Set(
    rows.filter((r) => r.getIsSelected()).map((r) => r.original.id)
  )

  const handleTypeFilterChange = useCallback((value: string) => {
    setTypeFilters((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilters((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    setSearch('')
    setTypeFilters(new Set())
    setStatusFilters(new Set())
    reset()
  }, [reset])

  const handleExport = useCallback(() => {
    const csv = [
      ['ID', 'Name', 'Type', 'Price', 'Stock', 'Active'].join(','),
      ...data.map((p) =>
        [p.id, p.name_en, p.type, p.price, p.stock, p.is_active ? 'Yes' : 'No'].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data])

  async function bulkSetFeatured(featured: boolean) {
    if (selectedRowIds.size === 0) return
    setBusyAction(true)
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedRowIds),
          updates: { is_featured: featured },
        }),
      })
      if (response.ok) {
        router.refresh()
        reset()
        table.toggleAllRowsSelected(false)
      }
    } finally {
      setBusyAction(false)
    }
  }

  async function bulkSetActive(active: boolean) {
    if (selectedRowIds.size === 0) return
    setBusyAction(true)
    try {
      const response = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedRowIds),
          updates: { is_active: active },
        }),
      })
      if (response.ok) {
        router.refresh()
        reset()
        table.toggleAllRowsSelected(false)
      }
    } finally {
      setBusyAction(false)
    }
  }

  async function bulkDelete() {
    if (selectedRowIds.size === 0) return
    if (
      !confirm(
        `Delete ${selectedRowIds.size} product${selectedRowIds.size > 1 ? 's' : ''}? This cannot be undone.`
      )
    )
      return

    setBusyAction(true)
    try {
      const response = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedRowIds) }),
      })
      if (response.ok) {
        router.refresh()
        reset()
        table.toggleAllRowsSelected(false)
      }
    } finally {
      setBusyAction(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {selectedRowIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium text-foreground">
            {selectedRowIds.size} selected
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={busyAction}
            onClick={() => bulkSetFeatured(true)}
            className="gap-1.5"
          >
            <Star className="h-3.5 w-3.5" />
            Promote to Shop
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busyAction}
            onClick={() => bulkSetFeatured(false)}
          >
            Remove from Featured
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busyAction}
            onClick={() => bulkSetActive(true)}
          >
            Activate
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={busyAction}
            onClick={() => bulkSetActive(false)}
          >
            Deactivate
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={busyAction}
            onClick={bulkDelete}
            className="gap-1.5"
          >
            {busyAction ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        searchPlaceholder="Search products..."
        searchValue={search}
        onSearchChange={setSearch}
        onReset={handleReset}
        onExport={handleExport}
        isFiltered={isFiltered}
      >
        <DataTableFacetedFilter
          title="Type"
          options={TYPE_OPTIONS}
          selectedValues={typeFilters}
          onSelectedChange={handleTypeFilterChange}
          onReset={() => setTypeFilters(new Set())}
        />
        <DataTableFacetedFilter
          title="Status"
          options={STATUS_OPTIONS}
          selectedValues={statusFilters}
          onSelectedChange={handleStatusFilterChange}
          onReset={() => setStatusFilters(new Set())}
        />
      </DataTableToolbar>

      {/* Table */}
      <DataTable
        table={table}
        columns={productColumns}
        emptyState="No products found. Adjust your filters and try again."
        onLoadMore={loadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />

      {/* Info footer */}
      {data.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing {data.length} of {total} products
        </div>
      )}
    </div>
  )
}
