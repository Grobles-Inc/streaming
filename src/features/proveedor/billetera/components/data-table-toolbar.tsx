import { Cross2Icon } from '@radix-ui/react-icons'
import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconHash } from '@tabler/icons-react'

import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

const tiposTransaccion = [
  {
    value: 'recarga',
    label: 'Recarga',
  },
  {
    value: 'retiro',
    label: 'Retiro',
  },
  {
    value: 'compra',
    label: 'Venta',
  },
  {
    value: 'gasto_publicacion',
    label: 'Publicación',
  },
  {
    value: 'renovacion',
    label: 'Renovación',
  },
  {
    value: 'renovacion_pedido',
    label: 'Renovación Vendedor',
  },
  {
    value: 'reembolso',
    label: 'Reembolso',
  }
]


interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex flex-col gap-4'>
      {/* Filtros de búsqueda */}
      <div className='flex flex-col sm:flex-row gap-2'>
        {/* Búsqueda por ID */}
        <div className='relative'>
          <IconHash className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por ID...'
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('id')?.setFilterValue(event.target.value)
            }
            className='h-9 w-full sm:w-[140px] pl-8'
          />
        </div>
        
        {/* Filtros */}
        <div className='flex flex-wrap items-center gap-2'>
          {table.getColumn('tipo') && (
            <DataTableFacetedFilter
              column={table.getColumn('tipo')}
              title='Tipo'
              options={tiposTransaccion}
            />
          )}
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
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
        </div>
        
        <div className='flex items-center gap-2'>
          <div className='sm:hidden'>
            <DataTableViewOptions table={table} />
          </div>
          <div className='hidden sm:block'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>
    </div>
  )
} 