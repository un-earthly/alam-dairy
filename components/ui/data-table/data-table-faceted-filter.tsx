'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FacetOption {
  label: string
  value: string
  icon?: React.ReactNode
}

interface DataTableFacetedFilterProps {
  title?: string
  options: FacetOption[]
  selectedValues: Set<string>
  onSelectedChange: (value: string) => void
  onReset?: () => void
}

export function DataTableFacetedFilter({
  title,
  options,
  selectedValues,
  onSelectedChange,
  onReset,
}: DataTableFacetedFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed gap-1.5">
          {title}
          {selectedValues.size > 0 && (
            <>
              <X className="ml-1 h-3 w-3" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="max-h-[300px] overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={selectedValues.has(option.value)}
                onChange={() => onSelectedChange(option.value)}
              />
              {option.icon && <span>{option.icon}</span>}
              <span className="flex-1">{option.label}</span>
              {selectedValues.has(option.value) && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </label>
          ))}
        </div>
        {selectedValues.size > 0 && onReset && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={onReset}
            >
              Reset
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
