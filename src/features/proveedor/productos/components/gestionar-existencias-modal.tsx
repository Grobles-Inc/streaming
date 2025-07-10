import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconPlus, IconEdit, IconTrash, IconPackage, IconEye, IconEyeOff, IconDots } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AgregarStockModal } from './agregar-stock-modal'
import { EditarStockModal } from './editar-stock-modal'
import { 
  useStockProductosByProductoId, 
  useDeleteStockProducto,
  useUpdateStockProducto 
} from '../queries'
import type { Producto } from '../data/schema'
import type { Database } from '@/types/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type StockProducto = Database['public']['Tables']['stock_productos']['Row']

interface GestionarExistenciasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: Producto
}

export function GestionarExistenciasModal({ 
  open, 
  onOpenChange, 
  producto 
}: GestionarExistenciasModalProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPublicarDialog, setShowPublicarDialog] = useState(false)
  const [showDespublicarDialog, setShowDespublicarDialog] = useState(false)
  const [showAgregarStockDialog, setShowAgregarStockDialog] = useState(false)
  const [showEditarStockDialog, setShowEditarStockDialog] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockProducto | null>(null)
  const [modalPrincipalCerrado, setModalPrincipalCerrado] = useState(false)

  const { data: stockItems, isLoading, error } = useStockProductosByProductoId(producto.id)
  const deleteStockMutation = useDeleteStockProducto()
  const updateStockMutation = useUpdateStockProducto()

  const handleDelete = (stock: StockProducto) => {
    setSelectedStock(stock)
    setModalPrincipalCerrado(true)
    onOpenChange(false) // Cerrar modal principal
    setShowDeleteDialog(true)
  }

  const handleEdit = (stock: StockProducto) => {
    setSelectedStock(stock)
    setModalPrincipalCerrado(true)
    onOpenChange(false) // Cerrar modal principal
    setShowEditarStockDialog(true)
  }

  const handleAgregarStock = () => {
    setModalPrincipalCerrado(true)
    onOpenChange(false) // Cerrar modal principal
    setShowAgregarStockDialog(true)
  }

  const confirmDelete = () => {
    if (!selectedStock) return

    deleteStockMutation.mutate(
      { id: selectedStock.id, productoId: producto.id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setSelectedStock(null)
          // Reabrir modal principal
          setModalPrincipalCerrado(false)
          onOpenChange(true)
        }
      }
    )
  }

  const handleCloseSubModals = () => {
    setShowDeleteDialog(false)
    setShowAgregarStockDialog(false)
    setShowEditarStockDialog(false)
    setSelectedStock(null)
    // Reabrir modal principal
    setModalPrincipalCerrado(false)
    onOpenChange(true)
  }

  const handlePublicar = (stock: StockProducto) => {
    setSelectedStock(stock)
    setShowPublicarDialog(true)
  }

  const handleDespublicar = (stock: StockProducto) => {
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

  // Verificar si el stock seleccionado está vendido
  const stockEstaVendido = selectedStock?.estado === 'vendido'

  const getEstadoBadge = (estado: string) => {
    const colors = {
      'disponible': 'bg-green-50 text-green-700 border-green-200',
      'vendido': 'bg-red-50 text-red-700 border-red-200',
    }

    return (
      <Badge variant="outline" className={cn('text-xs', colors[estado as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
        {estado === 'disponible' ? 'Disponible' : 'Vendido'}
      </Badge>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const colors = {
      'cuenta': 'bg-blue-50 text-blue-700 border-blue-200',
      'perfiles': 'bg-purple-50 text-purple-700 border-purple-200',
      'combo': 'bg-orange-50 text-orange-700 border-orange-200',
    }

    return (
      <Badge variant="outline" className={cn('text-xs', colors[tipo as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
        {tipo === 'cuenta' ? 'Cuenta' : tipo === 'perfiles' ? 'Perfiles' : 'Combo'}
      </Badge>
    )
  }

  const getSoporteBadge = (soporte: string) => {
    const colors = {
      'activo': 'bg-green-50 text-green-700 border-green-200',
      'vencido': 'bg-red-50 text-red-700 border-red-200',
      'soporte': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    }

    return (
      <Badge variant="outline" className={cn('text-xs', colors[soporte as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200')}>
        {soporte === 'activo' ? 'Activo' : soporte === 'vencido' ? 'Vencido' : 'Soporte'}
      </Badge>
    )
  }

  return (
    <>
      <Dialog open={open && !modalPrincipalCerrado} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-[90vw] !max-h-[150vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Stock de Cuentas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Botón para agregar nuevo stock */}
            <div className="mb-4">
              <Button onClick={handleAgregarStock}>
                <IconPlus size={16} className="mr-2" />
                Agregar Stock
              </Button>
            </div>

            {/* Tabla de stock */}
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>
                  Error al cargar las existencias. Por favor, intenta nuevamente.
                </AlertDescription>
              </Alert>
            ) : stockItems && stockItems.length > 0 ? (
              <div className="overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Clave</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>PIN</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Soporte</TableHead>
                      <TableHead>Publicado</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockItems.map((stock) => (
                      <TableRow key={stock.id}>
                        <TableCell className="font-mono text-sm">
                          #{stock.id}
                        </TableCell>
                        <TableCell>
                          {getTipoBadge(stock.tipo)}
                        </TableCell>
                        <TableCell className="max-w-32">
                          <div className="truncate" title={stock.email || 'N/A'}>
                            {stock.email || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-24">
                          <div className="truncate font-mono text-sm" title={stock.clave || 'N/A'}>
                            {stock.clave || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-24">
                          <div className="truncate" title={stock.perfil || 'N/A'}>
                            {stock.perfil || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {stock.pin || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-32">
                          {stock.url ? (
                            <a
                              href={stock.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm truncate block"
                              title={stock.url}
                            >
                              {stock.url}
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {getEstadoBadge(stock.estado)}
                        </TableCell>
                        <TableCell>
                          {getSoporteBadge(stock.soporte_stock_producto)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              stock.publicado 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-red-50 text-red-700 border-red-200'
                            )}
                          >
                            {stock.publicado ? 'Publicado' : 'Sin Publicar'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(stock.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                              >
                                <IconDots className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              {stock.publicado ? (
                                <DropdownMenuItem onClick={() => handleDespublicar(stock)} disabled={updateStockMutation.isPending}>
                                  <IconEyeOff className="mr-2 h-4 w-4" />
                                  Despublicar
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handlePublicar(stock)} disabled={updateStockMutation.isPending}>
                                  <IconEye className="mr-2 h-4 w-4" />
                                  Publicar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(stock)}>
                                <IconEdit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(stock)}
                              >
                                <IconTrash className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <IconPackage size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay existencias</h3>
                <p className="text-muted-foreground mb-4">
                  Este producto no tiene stock agregado aún
                </p>
                <Button onClick={() => setShowAgregarStockDialog(true)}>
                  <IconPlus size={16} className="mr-2" />
                  Agregar Primera Existencia
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseSubModals()
        }}
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
      <AgregarStockModal
        open={showAgregarStockDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseSubModals()
        }}
        productoId={producto.id}
      />

      {/* Modal para editar stock */}
      <EditarStockModal
        open={showEditarStockDialog}
        onOpenChange={(open) => {
          if (!open) handleCloseSubModals()
        }}
        stock={selectedStock}
      />

      {/* Modal de confirmación para publicar */}
      <ConfirmDialog
        open={showPublicarDialog}
        onOpenChange={(open) => {
          setShowPublicarDialog(open)
          if (!open) setSelectedStock(null)
        }}
        title="¿Publicar existencia?"
        desc={`¿Estás seguro de que deseas publicar esta existencia? Aparecerá en el conteo de stock disponible para los clientes.`}
        confirmText="Publicar"
        handleConfirm={confirmPublicar}
        isLoading={updateStockMutation.isPending}
      />

      {/* Modal de confirmación para despublicar */}
      <ConfirmDialog
        open={showDespublicarDialog}
        onOpenChange={(open) => {
          setShowDespublicarDialog(open)
          if (!open) setSelectedStock(null)
        }}
        title="¿Despublicar existencia?"
        desc={`¿Estás seguro de que deseas despublicar esta existencia? Se ocultará del conteo de stock disponible para los clientes.`}
        confirmText="Despublicar"
        handleConfirm={confirmDespublicar}
        isLoading={updateStockMutation.isPending}
      />
    </>
  )
} 