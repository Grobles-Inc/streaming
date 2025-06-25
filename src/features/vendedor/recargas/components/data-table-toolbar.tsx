import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { estados } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { RecargarDialog } from './recargar-dialog'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>

        <div className='flex gap-x-2'>
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              title='Estado'
              options={estados}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='secondary'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Resetear
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <RecargarDialog />
      <DataTableViewOptions table={table} />
    </div>
  )
}
