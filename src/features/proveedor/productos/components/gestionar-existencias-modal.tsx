import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconPlus, IconEdit, IconTrash, IconPackage, IconEye, IconEyeOff } from '@tabler/icons-react'
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
  const [showAgregarStockDialog, setShowAgregarStockDialog] = useState(false)
  const [showEditarStockDialog, setShowEditarStockDialog] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockProducto | null>(null)

  const { data: stockItems, isLoading, error } = useStockProductosByProductoId(producto.id)
  const deleteStockMutation = useDeleteStockProducto()
  const updateStockMutation = useUpdateStockProducto()

  const handleDelete = (stock: StockProducto) => {
    setSelectedStock(stock)
    setShowDeleteDialog(true)
  }

  const handleEdit = (stock: StockProducto) => {
    setSelectedStock(stock)
    setShowEditarStockDialog(true)
  }

  const confirmDelete = () => {
    if (!selectedStock) return

    deleteStockMutation.mutate(
      { id: selectedStock.id, productoId: producto.id },
      {
        onSuccess: () => {
          setShowDeleteDialog(false)
          setSelectedStock(null)
        }
      }
    )
  }

  const togglePublicado = (stock: StockProducto) => {
    updateStockMutation.mutate({
      id: stock.id,
      updates: { publicado: !stock.publicado }
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-[90vw] !max-h-[150vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Stock de Cuentas
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Botón para agregar nuevo stock */}
            <div className="mb-4">
              <Button onClick={() => setShowAgregarStockDialog(true)}>
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
                      <TableHead>PIN</TableHead>
                      <TableHead>Perfil</TableHead>
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
                        <TableCell className="font-mono text-sm">
                          {stock.pin || 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-24">
                          <div className="truncate" title={stock.perfil || 'N/A'}>
                            {stock.perfil || 'N/A'}
                          </div>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePublicado(stock)}
                            disabled={updateStockMutation.isPending}
                          >
                            {stock.publicado ? (
                              <IconEye size={16} className="text-green-600" />
                            ) : (
                              <IconEyeOff size={16} className="text-gray-400" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(stock.created_at).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(stock)}
                            >
                              <IconEdit size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(stock)}
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>
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
      <AgregarStockModal
        open={showAgregarStockDialog}
        onOpenChange={setShowAgregarStockDialog}
        productoId={producto.id}
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
    </>
  )
} 