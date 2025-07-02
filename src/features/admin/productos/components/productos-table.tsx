import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Columns, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  ToggleRight,
  ToggleLeft,
  Trash,
  Search
} from 'lucide-react'
import { useProductos } from '../hooks/use-productos'
import { ProductoFormModal } from './producto-form-modal'
import { ProductoDetailsModal } from './producto-details-modal'
import { createProductosColumns } from './productos-columns'
import type { MappedProducto, SupabaseProducto } from '../data/types'

interface ProductosTableProps {
  onProductoCreated?: () => void
}

export function ProductosTable({ onProductoCreated }: ProductosTableProps) {
  const { 
    productos, 
    loading, 
    refreshProductos, 
    eliminarProducto, 
    duplicarProducto,
    cambiarEstadoProducto 
  } = useProductos()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  
  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<SupabaseProducto | null>(null)

  // Crear columnas con acciones
  const columns = createProductosColumns(
    (producto: MappedProducto) => {
      setSelectedProducto(producto as any)
      setIsDetailsModalOpen(true)
    },
    (producto: MappedProducto) => {
      setSelectedProducto(producto as any)
      setIsEditModalOpen(true)
    },
    async (id: string) => {
      if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        await eliminarProducto(id)
        await refreshProductos()
      }
    },
    async (id: string) => {
      await duplicarProducto(id)
      await refreshProductos()
    },
    async (id: string, estado: 'publicado' | 'borrador') => {
      await cambiarEstadoProducto(id, estado)
      await refreshProductos()
    }
  )

  const table = useReactTable({
    data: productos,
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
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map(row => row.original.id)

  const handleCreateSuccess = () => {
    refreshProductos()
    onProductoCreated?.()
  }

  const handleEditSuccess = () => {
    refreshProductos()
    setSelectedProducto(null)
  }

  const handlePublicarSeleccionados = async () => {
    if (selectedIds.length > 0) {
      for (const id of selectedIds) {
        await cambiarEstadoProducto(id, 'publicado')
      }
      await refreshProductos()
      setRowSelection({})
    }
  }

  const handleDeshabilitarSeleccionados = async () => {
    if (selectedIds.length > 0) {
      for (const id of selectedIds) {
        await cambiarEstadoProducto(id, 'borrador')
      }
      await refreshProductos()
      setRowSelection({})
    }
  }

  const handleEliminarSeleccionados = async () => {
    if (selectedIds.length > 0 && confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.length} productos?`)) {
      for (const id of selectedIds) {
        await eliminarProducto(id)
      }
      await refreshProductos()
      setRowSelection({})
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn('nombre')?.setFilterValue(event.target.value)
              }
              className="pl-8 max-w-sm"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns className="mr-2 h-4 w-4" />
                Columnas
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
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar producto
        </Button>
      </div>

      {/* Acciones en lote */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} producto(s) seleccionado(s)
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePublicarSeleccionados}
          >
            <ToggleRight className="mr-2 h-4 w-4" />
            Publicar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDeshabilitarSeleccionados}
          >
            <ToggleLeft className="mr-2 h-4 w-4" />
            Deshabilitar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEliminarSeleccionados}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron productos.
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
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ProductoFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ProductoFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedProducto(null)
        }}
        producto={selectedProducto || undefined}
        onSuccess={handleEditSuccess}
      />

      <ProductoDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={(open) => {
          setIsDetailsModalOpen(open)
          if (!open) setSelectedProducto(null)
        }}
        producto={selectedProducto as any}
      />
    </div>
  )
}
