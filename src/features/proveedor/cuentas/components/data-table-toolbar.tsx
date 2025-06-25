import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { IconPlus, IconUpload, IconEyeOff, IconCheck, IconShoppingCart, IconTrash } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { tipos, estados } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onAddCuenta?: () => void
}

export function DataTableToolbar<TData>({
  table,
  onAddCuenta,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const hasSelectedRows = table.getFilteredSelectedRowModel().rows.length > 0

  return (
    <div className='space-y-4'>
      {/* Fila superior: Búsqueda y botones principales */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div className='flex flex-1 items-center space-x-2'>
          <Input
            placeholder='Buscar cuentas...'
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('email')?.setFilterValue(event.target.value)
            }
            className='h-8 w-full sm:w-[150px] lg:w-[250px]'
          />
        </div>
        <div className='flex flex-col sm:flex-row items-center gap-2 sm:space-x-2 w-full sm:w-auto'>
          <Button 
            size='sm' 
            className='h-8 w-full sm:w-auto'
            onClick={onAddCuenta}
          >
            <IconPlus className='mr-2 h-4 w-4' />
            <span className='hidden sm:inline'>Nueva Cuenta</span>
            <span className='sm:hidden'>Nueva</span>
          </Button>
          <Button size='sm' variant='outline' className='h-8 w-full sm:w-auto'>
            <IconUpload className='mr-2 h-4 w-4' />
            <span className='hidden sm:inline'>Importar Cuentas</span>
            <span className='sm:hidden'>Importar</span>
          </Button>
          <div className='hidden sm:block'>
            <DataTableViewOptions table={table} />
          </div>
        </div>
      </div>

      {/* Fila de acciones para elementos seleccionados */}
      {hasSelectedRows && (
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted/50 rounded-lg'>
          <span className='text-sm text-muted-foreground'>
            {table.getFilteredSelectedRowModel().rows.length} elemento(s) seleccionado(s)
          </span>
          <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto'>
            <Button size='sm' variant='outline' className='flex-1 sm:flex-initial'>
              <IconCheck className='mr-2 h-4 w-4' />
              <span className='hidden xs:inline'>Publicar</span>
              <span className='xs:hidden'>Pub</span>
            </Button>
            <Button size='sm' variant='outline' className='flex-1 sm:flex-initial'>
              <IconEyeOff className='mr-2 h-4 w-4' />
              <span className='hidden xs:inline'>Despublicar</span>
              <span className='xs:hidden'>Des</span>
            </Button>
            <Button size='sm' variant='outline' className='flex-1 sm:flex-initial'>
              <IconShoppingCart className='mr-2 h-4 w-4' />
              <span className='hidden xs:inline'>Vender</span>
              <span className='xs:hidden'>Ven</span>
            </Button>
            <Button size='sm' variant='destructive' className='flex-1 sm:flex-initial'>
              <IconTrash className='mr-2 h-4 w-4' />
              <span className='hidden xs:inline'>Eliminar</span>
              <span className='xs:hidden'>Del</span>
            </Button>
          </div>
        </div>
      )}

      {/* Fila inferior: Filtros */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
        <div className='flex flex-wrap items-center gap-2'>
          {table.getColumn('tipo') && (
            <DataTableFacetedFilter
              column={table.getColumn('tipo')}
              title='Tipo'
              options={tipos}
            />
          )}
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              title='Estado'
              options={estados}
            />
          )}
          {table.getColumn('publicado') && (
            <DataTableFacetedFilter
              column={table.getColumn('publicado')}
              title='Publicación'
              options={[
                { label: 'Publicado', value: 'true', icon: IconCheck },
                { label: 'No Publicado', value: 'false', icon: IconEyeOff },
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