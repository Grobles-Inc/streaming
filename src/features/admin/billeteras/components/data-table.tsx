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
import { Wallet } from 'lucide-react'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { formatCurrency } from '../utils/currency'
import { Billetera } from '../data/types'
import { Card, CardContent } from '@/components/ui/card'

interface DataTableProps {
  columns: ColumnDef<Billetera>[]
  data: Billetera[]
}

export function DataTable({
  columns,
  data,
}: DataTableProps) {
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({ actions: true })
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 50,
      },
      columnVisibility: {
        actions: true,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Calculate stats from filtered rows
  const filteredRows = table.getFilteredRowModel().rows
  
  const totalSaldo = React.useMemo(() => {
    return filteredRows.reduce((sum, row) => {
      const saldo = row.original.saldo
      return sum + (typeof saldo === 'number' ? saldo : 0)
    }, 0)
  }, [filteredRows])

  const billeterasConSaldo = React.useMemo(() => {
    return filteredRows.filter(row => (row.original.saldo as number) > 0).length
  }, [filteredRows])

  const totalBilleteras = filteredRows.length

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      
      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Total Saldo</p>
            <p className='text-2xl font-bold text-green-600'>{formatCurrency(totalSaldo)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Billeteras con Saldo</p>
            <p className='text-2xl font-bold'>{billeterasConSaldo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <p className='text-sm text-muted-foreground'>Total Billeteras</p>
            <p className='text-2xl font-bold'>{totalBilleteras}</p>
          </CardContent>
        </Card>
      </div>

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
                <TableRow key={row.id}>
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
                    <CustomEmpty
                      title='No hay billeteras disponibles'
                      description='No se encontraron billeteras con los filtros actuales.'
                      icon={<Wallet className='size-10' />}
                    />
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