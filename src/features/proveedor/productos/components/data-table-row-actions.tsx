import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash, IconEye, IconPackage, IconRefresh, IconCoins, IconWallet } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ProductoFormDialog } from './producto-form'
import { GestionarExistenciasModal } from './gestionar-existencias-modal'

import type { Producto } from '../data/schema'
import { useDeleteProducto, usePublicarProductoWithCommission, useVerificarProductoTieneCuentas, useRenovarProducto, useConfiguracionSistema, useVerificarSaldoSuficiente } from '../queries'
import { useAuth } from '@/stores/authStore'
import { calcularEstadoExpiracion } from '../utils/expiracion'

interface DataTableRowActionsProps {
  row: Row<Producto>
}

// Componente para mostrar información de comisión y saldo
const InfoComisionCards = ({ 
  comisionFormateada, 
  saldoFormateado,
  tienesSaldoSuficiente,
  saldoActual,
  comisionMonto
}: { 
  comisionFormateada: string
  saldoFormateado: string
  tienesSaldoSuficiente: boolean
  saldoActual: number
  comisionMonto: number
}) => {
  // Calcular saldo después de comisión (sin negativos)
  const saldoDespuesComision = Math.max(0, saldoActual - comisionMonto)
  const saldoDespuesFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(saldoDespuesComision)

  return (
    <div className="flex gap-3 mt-4">
      <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <IconCoins className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Comisión a cobrar</span>
        </div>
        <div className="text-lg font-bold text-orange-900">{comisionFormateada}</div>
      </div>
      
      <div className={`flex-1 ${tienesSaldoSuficiente ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <IconWallet className={`h-4 w-4 ${tienesSaldoSuficiente ? 'text-green-600' : 'text-red-600'}`} />
          <span className={`text-sm font-medium ${tienesSaldoSuficiente ? 'text-green-800' : 'text-red-800'}`}>
            Tu saldo actual
          </span>
        </div>
        <div className={`text-lg font-bold ${tienesSaldoSuficiente ? 'text-green-900' : 'text-red-900'}`}>
          {saldoFormateado}
        </div>
        <div className={`text-xs mt-1 ${tienesSaldoSuficiente ? 'text-green-700' : 'text-red-700'}`}>
          Restante: {saldoDespuesFormateado}
        </div>
      </div>
    </div>
  )
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [showRenovarDialog, setShowRenovarDialog] = useState(false)
  const [showExistenciasDialog, setShowExistenciasDialog] = useState(false)
  
  const deleteProducto = useDeleteProducto()
  const publicarProducto = usePublicarProductoWithCommission()
  const renovarProducto = useRenovarProducto()
  const { user } = useAuth()
  
  // Obtener configuración del sistema para la comisión
  const { data: configuracion } = useConfiguracionSistema()
  
  // Obtener información del saldo del proveedor
  const { data: saldoInfo } = useVerificarSaldoSuficiente(user?.id ?? '')
  
  const producto = row.original
  const esBorrador = producto.estado === 'borrador'
  const esPublicado = producto.estado === 'publicado'
  const infoExpiracion = calcularEstadoExpiracion(producto.estado, producto.fecha_expiracion || null)
  const puedeRenovar = esPublicado && (infoExpiracion.estado === 'vencido' || infoExpiracion.estado === 'por_vencer')
  
  // Verificar si es un producto despublicado por vencimiento
  const esDespublicadoPorVencimiento = esBorrador && producto.fecha_expiracion && (() => {
    const ahora = new Date()
    const fechaExp = new Date(producto.fecha_expiracion)
    return fechaExp < ahora
  })()
  
  // Determinar texto del botón de publicación/renovación
  const textoBotonPublicar = esDespublicadoPorVencimiento ? 'Renovar producto' : 'Publicar producto'
  
  // Verificar si el producto tiene cuentas asociadas
  const { data: tieneCuentas, isLoading: verificandoCuentas } = useVerificarProductoTieneCuentas(producto.id)

  // Formatear valores monetarios
  const comisionPublicacion = configuracion?.comision_publicacion_producto || 1.35
  const saldoActual = saldoInfo?.saldoActual || 0
  const tienesSaldoSuficiente = saldoInfo?.suficiente || false
  
  const comisionFormateada = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(comisionPublicacion)
  
  const saldoFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(saldoActual)

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const handlePublish = () => {
    setShowPublishDialog(true)
  }

  const handleGestionarExistencias = () => {
    setShowExistenciasDialog(true)
  }

  const handleRenovar = () => {
    setShowRenovarDialog(true)
  }

  const confirmDelete = () => {
    deleteProducto.mutate(producto.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      }
    })
  }

  const confirmPublish = () => {
    if (!user?.id) return
    
    publicarProducto.mutate(
      { productoId: producto.id, proveedorId: user.id },
      {
        onSuccess: () => {
          setShowPublishDialog(false)
        }
      }
    )
  }

  const confirmRenovar = () => {
    if (!user?.id) return
    
    renovarProducto.mutate(
      { productoId: producto.id, proveedorId: user.id },
      {
        onSuccess: () => {
          setShowRenovarDialog(false)
        }
      }
    )
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          {esBorrador && (
            <>
              <DropdownMenuItem onClick={handlePublish}>
                <IconEye className='mr-2 h-4 w-4' />
                {textoBotonPublicar}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {puedeRenovar && (
            <>
              <DropdownMenuItem onClick={handleRenovar}>
                <IconRefresh className='mr-2 h-4 w-4' />
                Renovar producto
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleGestionarExistencias}>
            <IconPackage className='mr-2 h-4 w-4' />
            Gestionar Existencias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <IconEdit className='mr-2 h-4 w-4' />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className='text-red-600'
            onClick={handleDelete}
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de edición */}
      <ProductoFormDialog
        trigger={<div />} // Trigger vacío ya que manejamos la apertura manualmente
        defaultValues={{
          nombre: producto.nombre,
          precio_publico: producto.precio_publico,
          precio_vendedor: producto.precio_vendedor,
          precio_renovacion: producto.precio_renovacion ?? 0,
          categoria_id: producto.categoria_id,
          tiempo_uso: producto.tiempo_uso,
          nuevo: producto.nuevo,
          disponibilidad: producto.disponibilidad,
          renovable: producto.renovable,
          descripcion: producto.descripcion ?? '',
          informacion: producto.informacion ?? '',
          condiciones: producto.condiciones ?? '',
          imagen_url: producto.imagen_url ?? '',
          descripcion_completa: producto.descripcion_completa ?? '',
          solicitud: producto.solicitud ?? '',
          muestra_disponibilidad_stock: producto.muestra_disponibilidad_stock,
          deshabilitar_boton_comprar: producto.deshabilitar_boton_comprar,
        }}
        title='Editar Producto'
        description='Modifica la información del producto.'
        productId={producto.id.toString()}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Modal de confirmación de publicación */}
      <ConfirmDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title={esDespublicadoPorVencimiento ? "¿Renovar producto?" : "¿Publicar producto?"}
        desc={
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {esDespublicadoPorVencimiento 
                ? "El producto será renovado por 30 días más y estará disponible para la venta."
                : "Al publicar el producto, estará disponible para la venta por 30 días."
              }
            </p>
            <InfoComisionCards
              comisionFormateada={comisionFormateada}
              saldoFormateado={saldoFormateado}
              tienesSaldoSuficiente={tienesSaldoSuficiente}
              saldoActual={saldoActual}
              comisionMonto={comisionPublicacion}
            />
          </div>
        }
        confirmText={esDespublicadoPorVencimiento ? "Renovar y cobrar comisión" : "Publicar y cobrar comisión"}
        handleConfirm={confirmPublish}
        isLoading={publicarProducto.isPending}
      />

      {/* Modal de confirmación de renovación */}
      <ConfirmDialog
        open={showRenovarDialog}
        onOpenChange={setShowRenovarDialog}
        title="¿Renovar producto?"
        desc={
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              El producto será renovado por 30 días más y estará disponible para la venta.
            </p>
            <div className="text-sm text-muted-foreground mb-2">
              Estado actual: {infoExpiracion.mensaje}
            </div>
            <InfoComisionCards
              comisionFormateada={comisionFormateada}
              saldoFormateado={saldoFormateado}
              tienesSaldoSuficiente={tienesSaldoSuficiente}
              saldoActual={saldoActual}
              comisionMonto={comisionPublicacion}
            />
          </div>
        }
        confirmText="Renovar y cobrar comisión"
        handleConfirm={confirmRenovar}
        isLoading={renovarProducto.isPending}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title={tieneCuentas ? "No se puede eliminar" : "¿Estás seguro?"}
        desc={
          tieneCuentas 
            ? "No se puede eliminar este producto porque tiene cuentas de stock asociadas. Para eliminarlo, primero debes eliminar todas las cuentas desde 'Gestionar Existencias'."
            : "Esta acción eliminará permanentemente el producto. Esta acción no se puede deshacer."
        }
        confirmText={tieneCuentas ? "Entendido" : "Eliminar"}
        destructive={!tieneCuentas}
        handleConfirm={tieneCuentas ? () => setShowDeleteDialog(false) : confirmDelete}
        isLoading={verificandoCuentas || deleteProducto.isPending}
      />

      {/* Modal de gestión de existencias */}
      <GestionarExistenciasModal
        open={showExistenciasDialog}
        onOpenChange={setShowExistenciasDialog}
        producto={producto}
      />
    </>
  )
} 