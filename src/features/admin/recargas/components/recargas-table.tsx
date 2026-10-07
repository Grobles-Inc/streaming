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
  IconTrash,
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
import type { MappedRecarga } from '../data/types'
import { DataTablePagination } from './data-table-pagination'

interface RecargasTableProps {
  data: MappedRecarga[]
  columns: ColumnDef<MappedRecarga>[]
  /** Total de filas que devuelve el servidor para los filtros activos. */
  total: number
  loading?: boolean
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  onAprobarSeleccionadas?: (ids: string[]) => Promise<void>
  onRechazarSeleccionadas?: (ids: string[]) => Promise<void>
  onEliminarSeleccionadas?: (ids: string[]) => Promise<void>
}

export function RecargasTable({
  data,
  columns,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  onAprobarSeleccionadas,
  onRechazarSeleccionadas,
  onEliminarSeleccionadas
}: RecargasTableProps) {
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
  const selectedRecargas = table
    .getRowModel()
    .rows.filter((row) => row.getIsSelected())
    .map((row) => row.original)
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="flex flex-col items-center gap-6 py-10">
                    {loading ? (
                      <CustomEmpty
                        title="Cargando recargas..."
                        description="Estamos obteniendo las solicitudes de recarga."
                        icon={<IconLoader2 className="size-10 animate-spin" />}
                      />
                    ) : (
                      <CustomEmpty
                        title="No hay recargas disponibles"
                        description="No se encontraron recargas con los filtros actuales."
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
