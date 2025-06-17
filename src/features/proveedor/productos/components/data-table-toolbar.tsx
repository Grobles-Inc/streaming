import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconPlus } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { categorias } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='space-y-4'>
      {/* Fila superior: Búsqueda y botón principal */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Buscar productos...'
            value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('nombre')?.setFilterValue(event.target.value)
            }
            className='h-8 w-full sm:w-[150px] lg:w-[250px]'
          />
        </div>
        <div className='flex items-center space-x-2'>
          <Button size='sm' className='h-8 w-full sm:w-auto'>
            <IconPlus className='mr-2 h-4 w-4' />
            <span className='hidden sm:inline'>Nuevo Producto</span>
            <span className='sm:hidden'>Nuevo</span>
          </Button>
          <div className='hidden sm:block'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      {/* Fila inferior: Filtros */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          {table.getColumn('categorias') && (
            <DataTableFacetedFilter
              column={table.getColumn('categorias')}
              title='Categorías'
              options={categorias}
            />
          )}
          {table.getColumn('publicado') && (
            <DataTableFacetedFilter
              column={table.getColumn('publicado')}
              title='Estado'
              options={[
                { label: 'Publicado', value: true },
                { label: 'No Publicado', value: false },
              ]}
            />
          )}
          {table.getColumn('renovable') && (
            <DataTableFacetedFilter
              column={table.getColumn('renovable')}
              title='Renovable'
              options={[
                { label: 'Renovable', value: true },
                { label: 'No Renovable', value: false },
              ]}
            />
          )}
          {table.getColumn('aPedido') && (
            <DataTableFacetedFilter
              column={table.getColumn('aPedido')}
              title='A Pedido'
              options={[
                { label: 'A Pedido', value: true },
                { label: 'En Stock', value: false },
              ]}
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