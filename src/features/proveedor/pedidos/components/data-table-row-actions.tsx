import { useState } from 'react'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconHeadset, IconTrash } from '@tabler/icons-react'
import { EllipsisVertical } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Pedido } from '../data/schema'
import { SoporteCompra } from '../data/types'
import { useEliminarPedidoExpirado } from '../queries'
import {
  calcularDiasRestantes,
  calcularFechaExpiracion,
} from '../utils/fecha-utils'
import { EditAccountModal } from './edit-account-modal'
import { SoporteModal } from './soporte-modal'

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
  const eliminarPedidoExpirado = useEliminarPedidoExpirado()

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
    stock_productos: pedido.stock_productos
      ? {
          id: Number(pedido.stock_productos.id || 0),
          email: pedido.stock_productos.email,
          clave: pedido.stock_productos.clave,
          pin: pedido.stock_productos.pin,
          perfil: pedido.stock_productos.perfil,
          url: pedido.stock_productos.url,
          soporte_stock_producto:
            pedido.stock_productos.soporte_stock_producto || 'activo',
        }
      : null,
    productos: pedido.productos
      ? {
          nombre: pedido.productos.nombre || '',
          tiempo_uso: pedido.productos.tiempo_uso || 0,
        }
      : null,
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

  // Verificar si el pedido está expirado usando la misma lógica que DiasRestantesCell
  const isExpired = () => {
    // Calcular fecha fin y días restantes usando las mismas utilidades
    let fechaFin: Date | null = null
    let diasRestantes = 0

    if (pedido.fecha_expiracion) {
      // Si tiene fecha_expiracion explícita, usar esa
      diasRestantes = calcularDiasRestantes(pedido.fecha_expiracion)
      fechaFin = new Date(pedido.fecha_expiracion)
    } else {
      // Calcular usando fecha inicio + tiempo_uso
      let fechaInicioCalcular = pedido.created_at
      if (pedido.fecha_inicio) {
        fechaInicioCalcular = pedido.fecha_inicio
      }

      if (fechaInicioCalcular && pedido.productos?.tiempo_uso) {
        fechaFin = calcularFechaExpiracion(
          fechaInicioCalcular,
          pedido.productos.tiempo_uso
        )
        diasRestantes = calcularDiasRestantes(fechaFin)
      }
    }

    // Un pedido está expirado si tiene días restantes < 0
    return diasRestantes < 0
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await eliminarPedidoExpirado.mutateAsync({
        compraId: pedido.id!,
        stockProductoId: pedido.stock_producto_id,
      })
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error?.error || error?.message || 'Error al eliminar pedido')
      console.error('Error crítico en eliminación:', error)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='data-[state=open]:bg-muted'
          >
            <EllipsisVertical className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem onClick={handleSoporteClick}>
            <IconHeadset className='size-4' />
            Soporte
          </DropdownMenuItem>

          {/* Solo mostrar opción de edición si tiene stock_producto_id */}
          {pedido.stock_producto_id && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEditClick}>
                <IconEdit className='size-4' />
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
                className='text-red-600 focus:text-red-600'
              >
                <IconTrash className='size-4' />
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
            tiempo_uso: pedido.productos?.tiempo_uso,
          }}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title='Eliminar pedido expirado'
        desc='Esto eliminará tanto el pedido como la cuenta asociada a esta. ¿Estás seguro de que deseas continuar?'
        handleConfirm={handleConfirmDelete}
        confirmText='Eliminar'
        cancelBtnText='Cancelar'
        destructive={true}
      />
    </>
  )
}
