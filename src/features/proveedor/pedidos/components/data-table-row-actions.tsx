import { Button } from '@/components/ui/button'
import { Row } from '@tanstack/react-table'
import { IconHeadset, IconEdit, IconDots, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SoporteModal } from './soporte-modal'
import { EditAccountModal } from './edit-account-modal'
import { Pedido } from '../data/schema'
import { SoporteCompra } from '../data/types'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { eliminarPedidoExpirado } from '../services'
import { toast } from 'sonner'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [showSoporteModal, setShowSoporteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const pedido = row.original as Pedido

  // Convertir Pedido a SoporteCompra para el modal
  const soporteCompra: SoporteCompra = {
    id: String(pedido.id || ''),
    proveedor_id: pedido.proveedor_id || '',
    producto_id: Number(pedido.producto_id || 0),
    vendedor_id: pedido.vendedor_id || null,
    stock_producto_id: pedido.stock_producto_id || null,
    nombre_cliente: pedido.nombre_cliente || '',
    telefono_cliente: pedido.telefono_cliente || '',
    precio: pedido.precio || 0,
    estado: pedido.estado || 'pedido',
    soporte_mensaje: pedido.soporte_mensaje || null,
    soporte_asunto: pedido.soporte_asunto || null,
    soporte_respuesta: pedido.soporte_respuesta || null,
    monto_reembolso: pedido.monto_reembolso || 0,
    created_at: pedido.created_at || '',
    updated_at: new Date().toISOString(),
    stock_productos: pedido.stock_productos ? {
      id: Number(pedido.stock_productos.id || 0),
      email: pedido.stock_productos.email,
      clave: pedido.stock_productos.clave,
      pin: pedido.stock_productos.pin,
      perfil: pedido.stock_productos.perfil,
      url: pedido.stock_productos.url,
      soporte_stock_producto: pedido.stock_productos.soporte_stock_producto || 'activo'
    } : null,
    productos: pedido.productos ? {
      nombre: pedido.productos.nombre || '',
      tiempo_uso: pedido.productos.tiempo_uso || 0
    } : null
  }

  const handleSoporteClick = () => {
    setShowSoporteModal(true)
  }

  const handleCloseSoporteModal = () => {
    setShowSoporteModal(false)
  }

  const handleEditClick = () => {
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
  }

  // Verificar si el pedido está expirado usando fecha_expiracion
  const isExpired = () => {
    if (!pedido.fecha_expiracion) return false
    
    const fechaExpiracion = new Date(pedido.fecha_expiracion)
    const ahora = new Date()
    
    return fechaExpiracion < ahora
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      // Función para eliminar pedido y cuenta asociada
      await eliminarPedidoExpirado(pedido.id!, pedido.stock_producto_id)
      setShowDeleteDialog(false)
      window.location.reload()
    } catch (error) {
      toast.error('Error al eliminar pedido')
    }
  }

  return (
    <>
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
          <DropdownMenuItem onClick={handleSoporteClick}>
            <IconHeadset className="mr-2 h-4 w-4" />
            Gestionar soporte
          </DropdownMenuItem>
          
          {/* Solo mostrar opción de edición si tiene stock_producto_id */}
          {pedido.stock_producto_id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditClick}>
                <IconEdit className="mr-2 h-4 w-4" />
                Editar cuenta
              </DropdownMenuItem>
            </>
          )}

          {/* Solo mostrar opción de eliminar si está expirado */}
          {isExpired() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDeleteClick}
                className="text-red-600 focus:text-red-600"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de soporte */}
      <SoporteModal
        open={showSoporteModal}
        onOpenChange={setShowSoporteModal}
        compra={soporteCompra}
        onClose={handleCloseSoporteModal}
      />

      {/* Modal de edición de cuenta */}
      {pedido.stock_producto_id && (
        <EditAccountModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          stockProductoId={pedido.stock_producto_id}
          productoId={pedido.producto_id ?? null}
          pedidoId={pedido.id ?? null}
          currentData={{
            email: pedido.stock_productos?.email,
            clave: pedido.stock_productos?.clave,
            pin: pedido.stock_productos?.pin,
            perfil: pedido.stock_productos?.perfil,
            url: pedido.stock_productos?.url,
            precio_renovacion: pedido.productos?.precio_renovacion,
            fecha_inicio: pedido.fecha_inicio || pedido.created_at,
            fecha_expiracion: pedido.fecha_expiracion,
            tiempo_uso: pedido.productos?.tiempo_uso
          }}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar pedido expirado"
        desc="Esto eliminará tanto el pedido como la cuenta asociada a esta. ¿Estás seguro de que deseas continuar?"
        handleConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelBtnText="Cancelar"
        destructive={true}
      />
    </>
  )
} 