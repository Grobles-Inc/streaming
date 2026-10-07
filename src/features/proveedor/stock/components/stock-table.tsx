import { useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Package } from 'lucide-react'
import { CustomEmpty } from '@/components/custom-empty'
import { DataTablePagination } from './data-table-pagination'
import { StockToolbar } from './stock-toolbar'
import type { StockRow } from '../data/types'

interface StockTableProps {
  columns: ColumnDef<StockRow>[]
  data: StockRow[]
  total: number
  isLoading?: boolean
  emptyAction?: React.ReactNode
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  sorting: SortingState
  onSortingChange: OnChangeFn<SortingState>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  onDeleteSelected?: (selectedIds: number[]) => void
  onTogglePublishedSelected?: (selectedIds: number[], published: boolean) => void
}

export function StockTable({
  columns,
  data,
  total,
  isLoading = false,
  emptyAction,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  onDeleteSelected,
  onTogglePublishedSelected,
}: StockTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    // Búsqueda, filtrado, orden y paginación se resuelven en el servidor vía
    // RPC; la tabla solo refleja el estado y lo propaga hacia arriba.
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    // Id estable para que la selección sobreviva al cambio de página
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    enableGlobalFilter: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onPaginationChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className='space-y-4'>
      <StockToolbar
        table={table}
        onDeleteSelected={onDeleteSelected}
        onTogglePublishedSelected={onTogglePublishedSelected}
      />
      <div className='border rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow className='hover:bg-transparent'>
                  <TableCell colSpan={columns.length} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      {isLoading ? (
                        <CustomEmpty
                          title='Cargando stock...'
                          description='Estamos obteniendo las existencias de tus productos.'
                          icon={<Loader2 className='size-10 animate-spin' />}
                        />
                      ) : (
                        <>
                          <CustomEmpty
                            title='No hay stock disponible'
                            description='Aún no has agregado ningún stock a tus productos.'
                            icon={<Package className='size-10' />}
                          />
                          {emptyAction}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} total={total} />
    </div>
  )
}
