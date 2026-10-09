import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { CustomEmpty } from '@/components/custom-empty'
import { Loader2, ShoppingBag } from 'lucide-react'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { useAuth } from '@/stores/authStore'
import { useComprasByVendedor } from '../queries'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const { user } = useAuth()
  const { isLoading } = useComprasByVendedor(user?.id as string)
  const [sorting, setSorting] = React.useState<SortingState>([])

  const globalFilterFn = (row: any, _columnId: string, value: string) => {
    const searchValue = value.toLowerCase()
    const compra = row.original

    // Search in ID
    const id = compra.id?.toString() || ''
    if (id.includes(searchValue)) return true

    // Search in product name
    const productName = compra.productos?.nombre?.toLowerCase() || ''
    if (productName.includes(searchValue)) return true

    // Search in email
    const email = compra.stock_productos?.email?.toLowerCase() || ''
    if (email.includes(searchValue)) return true

    // Search in provider name
    const providerName = compra.usuarios?.nombres?.toLowerCase() || ''
    if (providerName.includes(searchValue)) return true

    return false
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='rounded-md border'>
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
                        title='Cargando compras...'
                        description='Estamos obteniendo el listado de tus compras.'
                        icon={<Loader2 className='size-10 animate-spin' />}
                      />
                    ) : (
                      <CustomEmpty
                        title='No hay compras disponibles'
                        description='No se encontraron compras con los filtros actuales.'
                        icon={<ShoppingBag className='size-10' />}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
