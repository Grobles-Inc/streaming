import { CheckIcon } from 'lucide-react'
import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='w-fit'>
          {title}
          {selectedValue && (
            <>
              <span className='mx-2 h-4 w-px bg-border' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal'>
                {options.find((o) => o.value === selectedValue)?.label ?? selectedValue}
              </Badge>
            </>
          )}
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
                    onSelect={() => {
                      column?.setFilterValue(isSelected ? undefined : option.value)
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
            {selectedValue && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className='justify-center text-center'
                  >
                    Limpiar filtro
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
