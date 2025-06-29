import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

const estados = [
  {
    value: 'completado',
    label: 'Completado',
  },
  {
    value: 'pendiente',
    label: 'Pendiente',
  },
  {
    value: 'fallido',
    label: 'Fallido',
  },
  {
    value: 'cancelado',
    label: 'Cancelado',
  },
]


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='space-y-4'>
      {/* Fila superior: Búsqueda */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Buscar recargas...'
            value={(table.getColumn('monto')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('monto')?.setFilterValue(event.target.value)
            }
            className='h-8 w-full sm:w-[150px] lg:w-[250px]'
          />
        </div>
        <div className='hidden sm:block'>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Fila inferior: Filtros */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              title='Estado'
              options={estados}
            />
          )}
        </div>
        
        <div className='flex items-center space-x-2'>
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3'
            >
              Limpiar
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
          <div className='sm:hidden'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>
    </div>
  )
} 