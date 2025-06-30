import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { 
  IconChevronDown, 
  IconChevronLeft, 
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconCheck,
  IconX,
  IconClock,
  IconCash
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import type { MappedCompra, EstadoCompra } from '../data/types'

interface ComprasTableProps {
  data: MappedCompra[]
  columns: ColumnDef<MappedCompra>[]
  loading?: boolean
  onCambiarEstadoMasivo?: (ids: string[], estado: EstadoCompra) => Promise<void>
}

export function ComprasTable({ 
  data, 
  columns, 
  loading = false,
  onCambiarEstadoMasivo
}: ComprasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCompras = selectedRows.map(row => row.original)
  const selectedModificables = selectedCompras.filter(c => c.puedeModificar)
  const selectedParaReembolso = selectedCompras.filter(c => c.estado === 'soporte' && c.montoReembolso > 0)

  const handleCambiarEstadoMasivo = async (estado: EstadoCompra) => {
    if (selectedModificables.length > 0 && onCambiarEstadoMasivo) {
      await onCambiarEstadoMasivo(selectedModificables.map(c => c.id), estado)
      setRowSelection({})
    }
  }

  const handleReembolsoMasivo = async () => {
    if (selectedParaReembolso.length > 0 && onCambiarEstadoMasivo) {
      await onCambiarEstadoMasivo(selectedParaReembolso.map(c => c.id), 'reembolsado')
      setRowSelection({})
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Barra de herramientas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={(table.getColumn('nombreCliente')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('nombreCliente')?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columnas <IconChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Acciones masivas */}
        {selectedCompras.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedCompras.length} seleccionada(s)
            </Badge>
            
            {selectedModificables.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Cambiar Estado <IconChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem 
                    onClick={() => handleCambiarEstadoMasivo('resuelto')}
                    className="text-green-600"
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Marcar como resuelto
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCambiarEstadoMasivo('vencido')}
                    className="text-red-600"
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Marcar como vencido
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleCambiarEstadoMasivo('soporte')}
                    className="text-orange-600"
                  >
                    <IconClock className="mr-2 h-4 w-4" />
                    Enviar a soporte
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {selectedParaReembolso.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleReembolsoMasivo}
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <IconCash className="mr-2 h-4 w-4" />
                Procesar Reembolsos ({selectedParaReembolso.length})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={header.column.columnDef.meta?.className}>
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
                  className="group/row"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron compras.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{' '}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
