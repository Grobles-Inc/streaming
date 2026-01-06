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
  const selectedValue = column?.getFilterValue() as string

  return (
    <div className='grid grid-cols-3 gap-2 md:grid-cols-6'>
      {options.map((option) => {
        const isSelected = selectedValue === option.value
        return (
          <Button
            key={option.value}
            size='sm'
            className={cn(
              `focus-visible:ring-ring ring-offset-background rounded-md px-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50`,
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
            <div className='flex items-center gap-2'>
              {option.icon && <option.icon className='h-4 w-4' />}
              {option.label}
            </div>
          </Button>
        )
      })}
    </div>
  )
}
