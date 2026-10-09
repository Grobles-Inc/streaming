import { CustomEmpty } from '@/components/custom-empty'
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
  IconInbox,
  IconLoader2,
  IconSearch,
  IconX
} from '@tabler/icons-react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'
import type { MappedRetiro } from '../data/types'
import { DataTablePagination } from './data-table-pagination'

interface RetirosTableProps {
  data: MappedRetiro[]
  columns: ColumnDef<MappedRetiro>[]
  /** Total de filas que devuelve el servidor para los filtros activos. */
  total: number
  loading?: boolean
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  onAprobarSeleccionados?: (ids: number[]) => Promise<void>
  onRechazarSeleccionados?: (ids: number[]) => Promise<void>
}

export function RetirosTable({
  data,
  columns,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  onAprobarSeleccionados,
  onRechazarSeleccionados,
}: RetirosTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,
    // Búsqueda y paginación se resuelven en el servidor vía RPC; la tabla solo
    // refleja el estado y lo propaga hacia arriba.
    manualPagination: true,
    manualFiltering: true,
    rowCount: total,
    // Id estable para que la selección sobreviva al cambio de página
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    enableGlobalFilter: true,
    onPaginationChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      pagination,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
  })

  // Paginación manual: no hay `getFilteredRowModel`; la selección es de la página actual.
  const selectedRetiros = table
    .getRowModel()
    .rows.filter((row) => row.getIsSelected())
    .map((row) => row.original)
  const selectedPendientes = selectedRetiros.filter(r => r.estado === 'pendiente')
  const selectedAprobables = selectedPendientes.filter(r => r.puedeAprobar)
  const selectedNoAprobables = selectedPendientes.filter(r => !r.puedeAprobar)

  const handleAprobarSeleccionados = async () => {
    if (selectedAprobables.length > 0 && onAprobarSeleccionados) {
      await onAprobarSeleccionados(selectedAprobables.map(r => r.id))
      setRowSelection({})
    }
  }

  const handleRechazarSeleccionados = async () => {
    if (selectedPendientes.length > 0 && onRechazarSeleccionados) {
      await onRechazarSeleccionados(selectedPendientes.map(r => r.id))
      setRowSelection({})
    }
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
              value={globalFilter}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              className="pl-8 max-w-md"
            />
          </div>
        </div>

        {/* Acciones masivas */}
        {selectedPendientes.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col space-y-1">
              <Badge variant="secondary">
                {selectedPendientes.length} pendiente(s) seleccionado(s)
              </Badge>
              {selectedNoAprobables.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {selectedNoAprobables.length} con saldo insuficiente
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={handleAprobarSeleccionados}
              disabled={selectedAprobables.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
              title={selectedAprobables.length === 0 ? "Ningún retiro seleccionado tiene saldo suficiente" : `Aprobar ${selectedAprobables.length} retiro(s)`}
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Aprobar ({selectedAprobables.length})
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRechazarSeleccionados}
            >
              <IconX className="mr-2 h-4 w-4" />
              Rechazar ({selectedPendientes.length})
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="flex flex-col items-center gap-6 py-10">
                    {loading ? (
                      <CustomEmpty
                        title="Cargando retiros..."
                        description="Estamos obteniendo las solicitudes de retiro."
                        icon={<IconLoader2 className="size-10 animate-spin" />}
                      />
                    ) : (
                      <CustomEmpty
                        title="No hay retiros disponibles"
                        description="No se encontraron retiros con los filtros actuales."
                        icon={<IconInbox className="size-10" />}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} total={total} />

    </div>
  )
}
