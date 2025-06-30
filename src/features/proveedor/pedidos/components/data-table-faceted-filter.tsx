import * as React from 'react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
  const facets = column?.getFacetedUniqueValues()
  const selectedValue = column?.getFilterValue() as string

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-5 ">
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <Button
            key={option.value}
            variant="default"
            size="sm"
            className={cn(
              `h-8  ${option.color}`,
              isSelected && `${option.color}`
            )}
            onClick={() => {
              if (isSelected) {
                column?.setFilterValue(undefined)
              } else {
                column?.setFilterValue(option.value)
              }
            }}
          >
            {option.label}
            {facets?.get(option.value) && (
              <span className={cn('ml-2 rounded flex h-4 w-4 items-center justify-center font-mono text-xs')}>
                {facets.get(option.value)}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
} 