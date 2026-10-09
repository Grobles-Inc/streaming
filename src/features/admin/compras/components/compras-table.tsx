import { useState, useCallback, useRef, useEffect } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
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
  IconCheck,
  IconX,
  IconClock,
  IconCash,
  IconSearch,
} from '@tabler/icons-react'
import { CustomEmpty } from '@/components/custom-empty'
import { Badge } from '@/components/ui/badge'
import { IconInbox, IconLoader2 } from '@tabler/icons-react'
import type { MappedCompra, EstadoCompra } from '../data/types'
import { DataTablePagination } from './data-table-pagination'

interface ComprasTableProps {
  data: MappedCompra[]
  columns: ColumnDef<MappedCompra>[]
  /** Total de filas que devuelve el servidor para los filtros activos. */
  total: number
  loading?: boolean
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  globalFilter: string
  onGlobalFilterChange: OnChangeFn<string>
  onCambiarEstadoMasivo?: (ids: number[], estado: EstadoCompra) => Promise<void>
}

export function ComprasTable({
  data,
  columns,
  total,
  loading = false,
  pagination,
  onPaginationChange,
  globalFilter,
  onGlobalFilterChange,
  onCambiarEstadoMasivo
}: ComprasTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Ocultar por defecto las columnas especificadas por el usuario
    nombreCliente: false,       // Cliente
    stockProductoId: false,     // Stock ID
    emailCuenta: false,         // Email Cuenta
    fechaActualizacion: false,  // Última Actualización
    // Mantener otras columnas menos importantes ocultas por defecto
    fechaExpiracion: false,
    fechaCreacion: false,
  })
  const [rowSelection, setRowSelection] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Referencias para el scroll sincronizado
  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

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
  const selectedRows = table.getRowModel().rows.filter((row) => row.getIsSelected())
  const selectedCompras = selectedRows.map(row => row.original)
  const selectedModificables = selectedCompras.filter(c => c.puedeModificar)
  const selectedParaReembolso = selectedCompras.filter(c => c.estado === 'soporte' && c.montoReembolso > 0)

  const handleCambiarEstadoMasivo = useCallback(async (estado: EstadoCompra) => {
    if (selectedModificables.length > 0 && onCambiarEstadoMasivo && !isProcessing) {
      setIsProcessing(true)
      try {
        await onCambiarEstadoMasivo(selectedModificables.map(c => c.id), estado)
        setRowSelection({})
      } catch (error) {
        console.error('Error al cambiar estado masivo:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [selectedModificables, onCambiarEstadoMasivo, isProcessing])

  const handleReembolsoMasivo = useCallback(async () => {
    if (selectedParaReembolso.length > 0 && onCambiarEstadoMasivo && !isProcessing) {
      setIsProcessing(true)
      try {
        await onCambiarEstadoMasivo(selectedParaReembolso.map(c => c.id), 'reembolsado')
        setRowSelection({})
      } catch (error) {
        console.error('Error al procesar reembolso masivo:', error)
      } finally {
        setIsProcessing(false)
      }
    }
  }, [selectedParaReembolso, onCambiarEstadoMasivo, isProcessing])

  // Efecto para sincronizar el ancho del scroll superior con el contenido de la tabla
  useEffect(() => {
    const updateScrollWidth = () => {
      if (topScrollRef.current && tableContainerRef.current) {
        const tableScrollWidth = tableContainerRef.current.scrollWidth
        const tableClientWidth = tableContainerRef.current.clientWidth

        if (tableScrollWidth > tableClientWidth) {
          // Crear un div interno con el mismo ancho que el scroll de la tabla
          const scrollContent = topScrollRef.current.querySelector('.scroll-content') as HTMLDivElement
          if (scrollContent) {
            scrollContent.style.width = `${tableScrollWidth}px`
          }
        }
      }
    }

    // Actualizar cuando cambie el tamaño o los datos
    updateScrollWidth()
    window.addEventListener('resize', updateScrollWidth)

    return () => {
      window.removeEventListener('resize', updateScrollWidth)
    }
  }, [data, columnVisibility])

  // Función para manejar scroll desde la barra superior
  const handleTopScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = target.scrollLeft
    }
  }, [])

  // Función para manejar scroll desde la tabla
  const handleTableScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = target.scrollLeft
    }
  }, [])

  return (
    <div className="w-full space-y-4">
      {/* Scroll horizontal superior mejorado */}
      <div className="relative mb-4">

        <div
          ref={topScrollRef}
          className="overflow-x-auto border rounded-md bg-muted/30 h-4 hover:bg-muted/50 transition-colors cursor-pointer"
          onScroll={handleTopScroll}
        >
          <div className="scroll-content h-full min-w-[1200px] bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 rounded">
            {/* Contenido invisible para generar el scroll */}
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, producto, proveedor..."
              value={globalFilter}
              onChange={(event) => onGlobalFilterChange(event.target.value)}
              className="pl-8 max-w-md"
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
                  <Button size="sm" variant="outline" disabled={isProcessing}>
                    {isProcessing ? 'Procesando...' : 'Cambiar Estado'} <IconChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstadoMasivo('reembolsado')}
                    className="text-purple-600"
                    disabled={isProcessing}
                  >
                    <IconCash className="mr-2 h-4 w-4" />
                    Procesar reembolso
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstadoMasivo('resuelto')}
                    className="text-green-600"
                    disabled={isProcessing}
                  >
                    <IconCheck className="mr-2 h-4 w-4" />
                    Marcar como resuelto
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstadoMasivo('vencido')}
                    className="text-red-600"
                    disabled={isProcessing}
                  >
                    <IconX className="mr-2 h-4 w-4" />
                    Marcar como vencido
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCambiarEstadoMasivo('soporte')}
                    className="text-orange-600"
                    disabled={isProcessing}
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
                disabled={isProcessing}
              >
                <IconCash className="mr-2 h-4 w-4" />
                {isProcessing ? 'Procesando...' : `Procesar Reembolsos (${selectedParaReembolso.length})`}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabla con scroll sincronizado */}
      <div className="rounded-md border">
        <div
          ref={tableContainerRef}
          className="overflow-x-auto"
          onScroll={handleTableScroll}
        >
          <Table className="min-w-[1200px]">
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
                          title="Cargando compras..."
                          description="Estamos obteniendo las compras."
                          icon={<IconLoader2 className="size-10 animate-spin" />}
                        />
                      ) : (
                        <CustomEmpty
                          title="No hay compras disponibles"
                          description="No se encontraron compras con los filtros actuales."
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
      </div>

      <DataTablePagination table={table} total={total} />
    </div>
  )
}
