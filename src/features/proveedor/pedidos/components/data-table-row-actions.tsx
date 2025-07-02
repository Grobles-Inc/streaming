import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Row } from '@tanstack/react-table'
import { IconDots, IconMessages, IconCheck, IconX } from '@tabler/icons-react'
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
      perfil: pedido.stock_productos.perfil,
      soporte_stock_producto: pedido.stock_productos.soporte_stock_producto || 'activo'
    } : null,
    productos: pedido.productos ? {
      nombre: pedido.productos.nombre || ''
    } : null
  }

  const handleSoporteClick = () => {
    setShowSoporteModal(true)
  }

  const handleCloseSoporteModal = () => {
    setShowSoporteModal(false)
  }

  const tieneProblemasDeSuporte = pedido.estado === 'soporte'
  const estaVencido = pedido.estado === 'vencido'
  const estaResuelto = pedido.estado === 'resuelto'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <IconDots className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          
          {tieneProblemasDeSuporte && (
            <DropdownMenuItem onClick={handleSoporteClick}>
              <IconMessages className='mr-2 h-4 w-4 text-amber-500' />
              Gestionar soporte
            </DropdownMenuItem>
          )}
          
          {estaVencido && (
            <DropdownMenuItem onClick={handleSoporteClick}>
              <IconMessages className='mr-2 h-4 w-4 text-red-500' />
              Revisar problema
            </DropdownMenuItem>
          )}
          
          {!estaResuelto && !tieneProblemasDeSuporte && !estaVencido && (
            <>
              <DropdownMenuItem onClick={() => console.log('Confirmar pedido', pedido.id)}>
                <IconCheck className='mr-2 h-4 w-4 text-green-500' />
                Confirmar pedido
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Rechazar pedido', pedido.id)}>
                <IconX className='mr-2 h-4 w-4 text-red-500' />
                Rechazar pedido
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
    </>
  )
} 