import { useState, useMemo, useCallback } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  IconCash,
  IconFilterX
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import type { MappedCompra, EstadoCompra } from '../data/types'

interface ComprasTableProps {
  data: MappedCompra[]
  columns: ColumnDef<MappedCompra>[]
  loading?: boolean
  onCambiarEstadoMasivo?: (ids: number[], estado: EstadoCompra) => Promise<void>
}

export function ComprasTable({ 
  data, 
  columns, 
  loading = false,
  onCambiarEstadoMasivo
}: ComprasTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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

  // Estados para filtros adicionales
  const [filtroId, setFiltroId] = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [filtroCuenta, setFiltroCuenta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  // Función para limpiar todos los filtros
  const limpiarFiltros = useCallback(() => {
    setFiltroId('')
    setFiltroProveedor('')
    setFiltroCuenta('')
    setFiltroEstado('todos')
  }, [])

  // Aplicar filtros adicionales con useMemo
  const filteredData = useMemo(() => {
    return data.filter(compra => {
      const matchesId = !filtroId || compra.id.toString().includes(filtroId)
      const matchesProveedor = !filtroProveedor || 
        compra.proveedorNombre.toLowerCase().includes(filtroProveedor.toLowerCase())
      const matchesCuenta = !filtroCuenta || 
        (compra.emailCuenta?.toLowerCase().includes(filtroCuenta.toLowerCase()) ?? false)
      const matchesEstado = !filtroEstado || filtroEstado === 'todos' || compra.estado === filtroEstado
      
      return matchesId && matchesProveedor && matchesCuenta && matchesEstado
    })
  }, [data, filtroId, filtroProveedor, filtroCuenta, filtroEstado])

  // Usar los datos filtrados en lugar de la tabla original
  const finalTable = useReactTable({
    data: filteredData,
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

  const selectedRows = finalTable.getFilteredSelectedRowModel().rows
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
      {/* Filtros avanzados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="filtro-id">ID de Compra</Label>
          <Input
            id="filtro-id"
            placeholder="Buscar por ID..."
            value={filtroId}
            onChange={(e) => setFiltroId(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-proveedor">Proveedor</Label>
          <Input
            id="filtro-proveedor"
            placeholder="Buscar por proveedor..."
            value={filtroProveedor}
            onChange={(e) => setFiltroProveedor(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-cuenta">Cuenta (Email)</Label>
          <Input
            id="filtro-cuenta"
            placeholder="Buscar por cuenta..."
            value={filtroCuenta}
            onChange={(e) => setFiltroCuenta(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="filtro-estado">Estado</Label>
          <Select value={filtroEstado} onValueChange={setFiltroEstado}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="procesando">Procesando</SelectItem>
              <SelectItem value="entregado">Entregado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="reembolsado">Reembolsado</SelectItem>
              <SelectItem value="en_soporte">En Soporte</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>&nbsp;</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                limpiarFiltros()
                finalTable.getColumn('nombreCliente')?.setFilterValue('')
              }}
              className="flex items-center gap-1"
            >
              <IconFilterX className="h-4 w-4" />
              Limpiar
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll horizontal superior */}
      <div className="relative mb-4">
        <div 
          className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          id="top-scroll"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            const table = document.querySelector('.table-container') as HTMLDivElement;
            if (table) {
              table.scrollLeft = target.scrollLeft;
            }
          }}
        >
          <div className="min-w-[1200px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg h-4 flex items-center justify-center">
            <div className="text-xs text-muted-foreground font-medium">
              ← Arrastra para hacer scroll horizontal →
            </div>
          </div>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={(finalTable.getColumn('nombreCliente')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                finalTable.getColumn('nombreCliente')?.setFilterValue(event.target.value)
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
              {finalTable
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

      {/* Tabla */}
      <div className="rounded-md border">
        <div 
          className="overflow-x-auto table-container scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            const topScroll = document.querySelector('#top-scroll') as HTMLDivElement;
            if (topScroll) {
              topScroll.scrollLeft = target.scrollLeft;
            }
          }}
        >
          <Table className="min-w-[1200px]">
            <TableHeader>
              {finalTable.getHeaderGroups().map((headerGroup) => (
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
              {finalTable.getRowModel().rows?.length ? (
                finalTable.getRowModel().rows.map((row) => (
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
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {finalTable.getFilteredSelectedRowModel().rows.length} de{' '}
          {finalTable.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <select
              value={finalTable.getState().pagination.pageSize}
              onChange={(e) => {
                finalTable.setPageSize(Number(e.target.value))
              }}
              className="h-8 w-[80px] rounded border border-input bg-background px-3 py-1 text-sm"
            >
              {[10, 20, 50, 100, 200].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {finalTable.getState().pagination.pageIndex + 1} de{' '}
            {finalTable.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => finalTable.setPageIndex(0)}
              disabled={!finalTable.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => finalTable.previousPage()}
              disabled={!finalTable.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => finalTable.nextPage()}
              disabled={!finalTable.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => finalTable.setPageIndex(finalTable.getPageCount() - 1)}
              disabled={!finalTable.getCanNextPage()}
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
