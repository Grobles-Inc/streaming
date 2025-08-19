import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconCheck,
  IconSearch,
  IconTrash,
  IconX
} from '@tabler/icons-react'
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
import { useState } from 'react'
import type { MappedRecarga } from '../data/types'
import { DataTablePagination } from './data-table-pagination'

interface RecargasTableProps {
  data: MappedRecarga[]
  columns: ColumnDef<MappedRecarga>[]
  loading?: boolean
  onAprobarSeleccionadas?: (ids: string[]) => Promise<void>
  onRechazarSeleccionadas?: (ids: string[]) => Promise<void>
  onEliminarSeleccionadas?: (ids: string[]) => Promise<void>
}

export function RecargasTable({
  data,
  columns,
  loading = false,
  onAprobarSeleccionadas,
  onRechazarSeleccionadas,
  onEliminarSeleccionadas
}: RecargasTableProps) {
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
    initialState: {
      pagination: {
        pageSize: 200,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedRecargas = selectedRows.map(row => row.original)
  const selectedPendientes = selectedRecargas.filter(r => r.estado === 'pendiente')
  const selectedRechazadas = selectedRecargas.filter(r => r.estado === 'rechazado')

  const handleAprobarSeleccionadas = async () => {
    if (selectedPendientes.length > 0 && onAprobarSeleccionadas) {
      await onAprobarSeleccionadas(selectedPendientes.map(r => r.id.toString()))
      setRowSelection({})
    }
  }

  const handleRechazarSeleccionadas = async () => {
    if (selectedPendientes.length > 0 && onRechazarSeleccionadas) {
      await onRechazarSeleccionadas(selectedPendientes.map(r => r.id.toString()))
      setRowSelection({})
    }
  }

  const handleEliminarSeleccionadas = async () => {
    if (selectedRechazadas.length > 0 && onEliminarSeleccionadas) {
      await onEliminarSeleccionadas(selectedRechazadas.map(r => r.id.toString()))
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
              placeholder="Buscar por usuario..."
              value={(table.getColumn('usuarioNombre')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('usuarioNombre')?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-md"
            />
          </div>
        </div>

        {/* Acciones masivas */}
        {selectedPendientes.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {selectedPendientes.length} pendiente(s) seleccionada(s)
            </Badge>
            <Button
              size="sm"
              variant="default"
              onClick={handleAprobarSeleccionadas}
              className="bg-green-600 hover:bg-green-700"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRechazarSeleccionadas}
            >
              <IconX className="mr-2 h-4 w-4" />
              Rechazar
            </Button>
          </div>
        )}

        {/* Acciones masivas para recargas rechazadas */}
        {selectedRechazadas.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="destructive">
              {selectedRechazadas.length} rechazada(s) seleccionada(s)
            </Badge>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleEliminarSeleccionadas}
              className="bg-red-600 hover:bg-red-700"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
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
                  No se encontraron recargas.
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
