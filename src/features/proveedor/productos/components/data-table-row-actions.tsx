import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconEdit, IconTrash } from '@tabler/icons-react'

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

import type { Producto } from '../data/schema'
import { useDeleteProducto } from '../queries'

interface DataTableRowActionsProps {
  row: Row<Producto>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const deleteProducto = useDeleteProducto()
  const producto = row.original

  const handleEdit = () => {
    setShowEditDialog(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    deleteProducto.mutate(producto.id, {
      onSuccess: () => {
        setShowDeleteDialog(false)
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
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
          stock: producto.stock,
          categoria_id: producto.categoria_id,
          tiempo_uso: producto.tiempo_uso,
          a_pedido: producto.a_pedido,
          nuevo: producto.nuevo,
          disponibilidad: producto.disponibilidad,
          renovable: producto.renovable,
          descripcion: producto.descripcion ?? '',
          informacion: producto.informacion ?? '',
          condiciones: producto.condiciones ?? '',
          imagen_url: producto.imagen_url ?? '',
          destacado: producto.destacado,
          mas_vendido: producto.mas_vendido,
          descripcion_completa: producto.descripcion_completa ?? '',
          solicitud: producto.solicitud ?? '',
          muestra_disponibilidad_stock: producto.muestra_disponibilidad_stock,
          deshabilitar_boton_comprar: producto.deshabilitar_boton_comprar,
        }}
        title='Editar Producto'
        description='Modifica la información del producto.'
        productId={producto.id}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="¿Estás seguro?"
        desc="Esta acción eliminará permanentemente el producto. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        destructive
        handleConfirm={confirmDelete}
        isLoading={deleteProducto.isPending}
      />
    </>
  )
} 