import { CheckIcon, Eraser } from 'lucide-react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DataTableProductoFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: { label: string; value: string }[]
}

export function DataTableProductoFacetedFilter<TData, TValue>({
  column,
  title = 'Producto',
  options,
}: DataTableProductoFacetedFilterProps<TData, TValue>) {
  const selectedValue = (column?.getFilterValue() as string) ?? ''

  return (
    <div className='flex items-center gap-1'>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant='outline' size='sm' className='w-fit'>
            {title}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[260px] p-0' align='start'>
          <Command>
            <CommandInput placeholder={`Buscar ${title.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValue === option.value
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      keywords={[option.label]}
                      onSelect={() => {
                        column?.setFilterValue(
                          isSelected ? undefined : option.value
                        )
                      }}
                    >
                      <div
                        className={cn(
                          'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'opacity-50 [&_svg]:invisible'
                        )}
                      >
                        <CheckIcon className='h-4 w-4' />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedValue && (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => column?.setFilterValue(undefined)}
          title='Limpiar selección de producto'
          aria-label='Limpiar selección de producto'
          className='text-red-600'
        >
          <Eraser className='size-4' />
        </Button>
      )}
    </div>
  )
}
