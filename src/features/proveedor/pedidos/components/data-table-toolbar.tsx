import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { estados } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { IconSearch, IconUser, IconMail, IconPackage, IconHash } from '@tabler/icons-react'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  return (
    <div className='space-y-4'>
      {/* Filtros de búsqueda */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Búsqueda por ID */}
        <div className='relative'>
          <IconHash className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por ID...'
            value={(table.getColumn('numero')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('numero')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[140px] pl-8'
          />
        </div>

        {/* Búsqueda por producto */}
        <div className='relative'>
          <IconPackage className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar producto...'
            value={(table.getColumn('producto_nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('producto_nombre')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[180px] pl-8'
          />
        </div>

        {/* Búsqueda por vendedor/cliente */}
        <div className='relative'>
          <IconUser className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar cliente...'
            value={(table.getColumn('cliente_nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('cliente_nombre')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[160px] pl-8'
          />
        </div>

        {/* Búsqueda por email */}
        <div className='relative'>
          <IconMail className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar email...'
            value={(table.getColumn('cuenta_email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('cuenta_email')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[160px] pl-8'
          />
        </div>
      </div>

      {/* Barra de herramientas principal */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          {/* Filtro por estado */}
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              options={estados}
            />
          )}
          
          {/* Información de resultados */}
          <div className='text-sm text-muted-foreground'>
            {table.getFilteredRowModel().rows.length} de {table.getCoreRowModel().rows.length} pedido(s)
          </div>
        </div>

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
} 