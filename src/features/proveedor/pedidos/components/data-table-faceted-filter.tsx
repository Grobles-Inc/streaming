import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
    color: string
  }[]
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValue = column?.getFilterValue() as string

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6 ">
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <button
            key={option.value}
            className={cn(
              `h-8 px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background`,
              option.color,
              isSelected && option.color
            )}
            onClick={() => {
              if (isSelected) {
                column?.setFilterValue(undefined)
              } else {
                column?.setFilterValue(option.value)
              }
            }}
          >
            <div className="flex items-center gap-2">
              {option.icon && <option.icon className="h-4 w-4" />}
              {option.label}
            </div>
          </button>
        )
      })}
    </div>
  )
} 