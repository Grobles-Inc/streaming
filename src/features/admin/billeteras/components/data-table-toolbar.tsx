import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { IconRefresh } from '@tabler/icons-react'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

const rolOptions = [
  { label: 'Proveedor', value: 'provider', color: 'bg-blue-500 text-white' },
  { label: 'Vendedor', value: 'seller', color: 'bg-green-500 text-white' },
]

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const queryClient = useQueryClient()

  return (
    <>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Buscar billetera...'
            value={table.getState().globalFilter ?? ''}
            onChange={e => table.setGlobalFilter(e.target.value)}
            className='h-8 w-full lg:w-[250px]'
          />
          {table.getColumn('rol') && (
            <DataTableFacetedFilter
              column={table.getColumn('rol')}
              options={rolOptions}
            />
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            title='Recargar billeteras'
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ['billeteras'] })
            }
          >
            <IconRefresh className='h-4 w-4' />
            <span className='sr-only'>Recargar billeteras</span>
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
    </>
  )
}