import { useState, useMemo } from 'react'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconPlus } from '@tabler/icons-react'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AgregarStockStockModal } from './components/agregar-stock-stock-modal'
import { EditarStockModal } from '../productos/components/editar-stock-modal'
import {
  useDeleteStockProducto,
  useUpdateStockProducto,
} from './queries/index'
import { useStockTabla } from './hooks/use-stock-tabla'
import { useAuth } from '@/stores/authStore'
import { StockTable } from './components/stock-table'
import { createStockColumns } from './components/stock-columns'
import type { StockRow } from './data/types'
import { toast } from 'sonner'


export function StockPage() {
  const { user } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublicarDialog, setShowPublicarDialog] = useState(false)
  const [showDespublicarDialog, setShowDespublicarDialog] = useState(false)
  const [showAgregarStockDialog, setShowAgregarStockDialog] = useState(false)
  const [showEditarStockDialog, setShowEditarStockDialog] = useState(false)
  const [showAdvertenciaDialog, setShowAdvertenciaDialog] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockRow | null>(null)
  // Estado de la tabla + datos paginados desde el RPC
  const {
    rows,
    total,
    isLoading,
    error,
    pagination,
    sorting,
    columnFilters,
    globalFilter,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
  } = useStockTabla(user?.id)
  const deleteStockMutation = useDeleteStockProducto()
  const updateStockMutation = useUpdateStockProducto()

  const handleDelete = (stock: StockRow) => {
    setSelectedStock(stock)
    setShowDeleteDialog(true)
  }

  const handleEdit = (stock: StockRow) => {
    setSelectedStock(stock)
    setShowEditarStockDialog(true)
  }

  const confirmDelete = () => {
    if (!selectedStock) return

    deleteStockMutation.mutate(
      { id: selectedStock.id, productoId: selectedStock.producto_id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setSelectedStock(null)
        }
      }
    )
  }

  const handlePublicar = (stock: StockRow) => {
    // Verificar si el producto está publicado
    const productoEstaPublicado = stock.producto?.estado === 'publicado'

    if (!productoEstaPublicado) {
      setSelectedStock(stock)
      setShowAdvertenciaDialog(true)
      return
    }

    setSelectedStock(stock)
    setShowPublicarDialog(true)
  }

  const handleDespublicar = (stock: StockRow) => {
    setSelectedStock(stock)
    setShowDespublicarDialog(true)
  }

  const confirmPublicar = () => {
    if (!selectedStock) return

    updateStockMutation.mutate({
      id: selectedStock.id,
      updates: { publicado: true }
    }, {
      onSuccess: () => {
        setShowPublicarDialog(false)
        setSelectedStock(null)
      }
    })
  }

  const confirmDespublicar = () => {
    if (!selectedStock) return

    updateStockMutation.mutate({
      id: selectedStock.id,
      updates: { publicado: false }
    }, {
      onSuccess: () => {
        setShowDespublicarDialog(false)
        setSelectedStock(null)
      }
    })
  }

  const handleDeleteSelected = (selectedIds: number[]) => {
    // Verificar si algún stock está vendido
    const selectedStockItems = rows.filter(item => selectedIds.includes(item.id))
    const hasVendidoItems = selectedStockItems?.some(item => item.estado === 'vendido')

    if (hasVendidoItems) {
      toast.error('No se pueden eliminar elementos vendidos', {
        description: 'Algunos de los elementos seleccionados ya están vendidos y no se pueden eliminar.'
      })
      return
    }

    // Confirmar eliminación
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${selectedIds.length} elemento(s)?`)) {
      Promise.all(
        selectedIds.map(id =>
          deleteStockMutation.mutateAsync({
            id,
            productoId: parseInt(String(selectedStockItems?.find(item => item.id === id)?.producto_id || '0'), 10)
          })
        )
      ).then(() => {
        toast.success('Elementos eliminados correctamente')
      }).catch(() => {
        toast.error('Error al eliminar algunos elementos')
      })
    }
  }

  const handleTogglePublishedSelected = (selectedIds: number[], published: boolean) => {
    const action = published ? 'publicar' : 'despublicar'

    if (window.confirm(`¿Estás seguro de que deseas ${action} ${selectedIds.length} elemento(s)?`)) {
      Promise.all(
        selectedIds.map(id =>
          updateStockMutation.mutateAsync({
            id,
            updates: { publicado: published }
          })
        )
      ).then(() => {
        toast.success(`Elementos ${published ? 'publicados' : 'despublicados'} correctamente`)
      }).catch(() => {
        toast.error(`Error al ${action} algunos elementos`)
      })
    }
  }

  // Verificar si el stock seleccionado está vendido
  const stockEstaVendido = selectedStock?.estado === 'vendido'

  // Crear las columnas con las acciones
  const columns = useMemo(() => createStockColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onPublicar: handlePublicar,
    onDespublicar: handleDespublicar,
    isUpdating: updateStockMutation.isPending
  }), [updateStockMutation.isPending])

  if (error) {
    return (
      <Main>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar el stock. Por favor, intenta nuevamente.
          </AlertDescription>
        </Alert>
      </Main>
    )
  }

  return (
    <>
      <Main>
        <div className='space-y-6'>
          {/* Header de la página */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Gestión de Stock</h1>
              <p className='text-muted-foreground'>
                Administra todas las existencias de tus productos desde un solo lugar.
              </p>
            </div>
            <Button onClick={() => setShowAgregarStockDialog(true)}>
              <IconPlus size={16} className="mr-2" />
              Agregar Stock
            </Button>
          </div>

          {/* Tabla de stock con paginación */}
          <StockTable
            columns={columns}
            data={rows}
            total={total}
            isLoading={isLoading && rows.length === 0}
            emptyAction={
              <Button onClick={() => setShowAgregarStockDialog(true)}>
                <IconPlus size={16} className="mr-2" />
                Agregar Primer Stock
              </Button>
            }
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            sorting={sorting}
            onSortingChange={onSortingChange}
            columnFilters={columnFilters}
            onColumnFiltersChange={onColumnFiltersChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={onGlobalFilterChange}
            onDeleteSelected={handleDeleteSelected}
            onTogglePublishedSelected={handleTogglePublishedSelected}
          />
        </div>
      </Main>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={stockEstaVendido ? "No se puede eliminar" : "¿Eliminar existencia?"}
        desc={
          stockEstaVendido
            ? "No se puede eliminar esta cuenta porque ya está vendida y tiene referencias en el sistema. Las cuentas vendidas deben permanecer en el historial."
            : "Esta acción eliminará permanentemente esta existencia del stock. Esta acción no se puede deshacer."
        }
        confirmText={stockEstaVendido ? "Entendido" : "Eliminar"}
        destructive={!stockEstaVendido}
        handleConfirm={stockEstaVendido ? () => setShowDeleteDialog(false) : confirmDelete}
        isLoading={deleteStockMutation.isPending}
      />

      {/* Modal para agregar nuevo stock */}
      <AgregarStockStockModal
        open={showAgregarStockDialog}
        onOpenChange={setShowAgregarStockDialog}
      />

      {/* Modal para editar stock */}
      <EditarStockModal
        open={showEditarStockDialog}
        onOpenChange={(open) => {
          setShowEditarStockDialog(open)
          if (!open) setSelectedStock(null)
        }}
        stock={selectedStock}
      />

      {/* Modal de confirmación para publicar */}
      <ConfirmDialog
        open={showPublicarDialog}
        onOpenChange={setShowPublicarDialog}
        title="¿Publicar existencia?"
        desc={`¿Estás seguro de que deseas publicar esta existencia? Aparecerá en el conteo de stock disponible para los clientes.`}
        confirmText="Publicar"
        handleConfirm={confirmPublicar}
        isLoading={updateStockMutation.isPending}
      />

      {/* Modal de confirmación para despublicar */}
      <ConfirmDialog
        open={showDespublicarDialog}
        onOpenChange={setShowDespublicarDialog}
        title="¿Despublicar existencia?"
        desc={`¿Estás seguro de que deseas despublicar esta existencia? Se ocultará del conteo de stock disponible para los clientes.`}
        confirmText="Despublicar"
        handleConfirm={confirmDespublicar}
        isLoading={updateStockMutation.isPending}
      />

      {/* Modal de advertencia para productos en borrador */}
      <ConfirmDialog
        open={showAdvertenciaDialog}
        onOpenChange={(open) => {
          setShowAdvertenciaDialog(open)
          if (!open) setSelectedStock(null)
        }}
        title="No se puede publicar stock"
        desc={
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              No puedes publicar cuentas de stock porque el producto <span className="font-semibold text-orange-600">"{selectedStock?.producto?.nombre}"</span> está en estado <span className="font-semibold text-orange-600">BORRADOR</span>.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-orange-800">Para publicar stock necesitas:</span>
              </div>
              <ol className="text-sm text-orange-700 space-y-1 ml-4 list-decimal">
                <li>Ir a la sección de productos</li>
                <li>Publicar el producto "{selectedStock?.producto?.nombre}"</li>
                <li>Luego podrás publicar las cuentas de stock individuales</li>
              </ol>
            </div>
          </div>
        }
        confirmText="Entendido"
        handleConfirm={() => setShowAdvertenciaDialog(false)}
        isLoading={false}
      />
    </>
  )
}
