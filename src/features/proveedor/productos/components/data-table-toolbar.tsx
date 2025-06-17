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
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Buscar productos...'
          value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nombre')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
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
      <div className='flex items-center space-x-2'>
        <Button size='sm' className='h-8'>
          <IconPlus className='mr-2 h-4 w-4' />
          Nuevo Producto
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
} 