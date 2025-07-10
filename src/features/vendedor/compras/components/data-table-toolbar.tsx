import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { estados } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Buscar compra...'
          value={table.getState().globalFilter ?? ''}
          onChange={e => table.setGlobalFilter(e.target.value)}
          className='h-8 w-full lg:w-[250px]'
        />
        {table.getColumn('estado') && (
          <DataTableFacetedFilter
            column={table.getColumn('estado')}
            options={estados}
          />
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  )
}
