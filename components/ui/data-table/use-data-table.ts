'use client'

import { useState, useCallback } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row,
} from '@tanstack/react-table'

interface UseDataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData>[]
  pageSize?: number
  enableRowSelection?: boolean
}

interface UseDataTableReturn<TData> {
  table: any
  pagination: {
    pageIndex: number
    pageSize: number
    canNextPage: boolean
    canPreviousPage: boolean
    pageCount: number
    goToPage: (page: number) => void
    nextPage: () => void
    previousPage: () => void
    setPageSize: (size: number) => void
  }
  search: {
    value: string
    setValue: (value: string) => void
  }
  selectedRows: Set<string>
  toggleRowSelection: (rowId: string) => void
  toggleAllRowsSelection: (rows: Row<TData>[]) => void
}

export function useDataTable<TData>({
  data,
  columns,
  pageSize = 20,
  enableRowSelection = false,
}: UseDataTableProps<TData>): UseDataTableReturn<TData> {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchValue, setSearchValue] = useState('')
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
  })

  const pagination = {
    pageIndex: paginationState.pageIndex,
    pageSize: paginationState.pageSize,
    canNextPage: table.getCanNextPage(),
    canPreviousPage: table.getCanPreviousPage(),
    pageCount: table.getPageCount(),
    goToPage: (page: number) =>
      setPaginationState((prev) => ({ ...prev, pageIndex: page })),
    nextPage: () => table.nextPage(),
    previousPage: () => table.previousPage(),
    setPageSize: (size: number) =>
      setPaginationState((prev) => ({ ...prev, pageSize: size, pageIndex: 0 })),
  }

  const selectedRows = new Set(Object.keys(rowSelection).filter((k) => rowSelection[k as any]))

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      setRowSelection((prev) => ({
        ...prev,
        [rowId]: !prev[rowId as any],
      }))
    },
    []
  )

  const toggleAllRowsSelection = useCallback(
    (rows: Row<TData>[]) => {
      const allSelected = rows.every((row) => rowSelection[row.id as any])
      const newSelection = rows.reduce((acc, row) => {
        acc[row.id as any] = !allSelected
        return acc
      }, {} as any)
      setRowSelection(newSelection)
    },
    [rowSelection]
  )

  return {
    table,
    pagination,
    search: {
      value: searchValue,
      setValue: setSearchValue,
    },
    selectedRows,
    toggleRowSelection,
    toggleAllRowsSelection,
  }
}
