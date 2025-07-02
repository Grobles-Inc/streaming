import { Button } from '@/components/ui/button'
import { Row } from '@tanstack/react-table'
import { IconHeadset } from '@tabler/icons-react'
import { useState } from 'react'
import { SoporteModal } from './soporte-modal'
import { Pedido } from '../data/schema'
import { SoporteCompra } from '../data/types'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [showSoporteModal, setShowSoporteModal] = useState(false)
  const pedido = row.original as Pedido

  // Convertir Pedido a SoporteCompra para el modal
  const soporteCompra: SoporteCompra = {
    id: pedido.id || '',
    proveedor_id: pedido.proveedor_id || '',
    producto_id: pedido.producto_id || '',
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
      id: pedido.stock_productos.id || 0,
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

  return (
    <>
      <Button
        variant='ghost'
        size='sm'
        className='h-8 w-8 p-0'
        onClick={handleSoporteClick}
        title="Gestionar soporte"
      >
        <IconHeadset className='h-4 w-4' />
        <span className='sr-only'>Gestionar soporte</span>
      </Button>

      {/* Modal de soporte */}
      <SoporteModal
        open={showSoporteModal}
        onOpenChange={setShowSoporteModal}
        compra={soporteCompra}
        onClose={handleCloseSoporteModal}
      />
    </>
  )
} 