import { Input } from '@/components/ui/input'
import { Table } from '@tanstack/react-table'
import { estados } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { IconUser, IconMail, IconPackage, IconHash, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useEliminarPedidosExpiradosEnBloque } from '../queries'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutate: eliminarPedidos, isPending } = useEliminarPedidosExpiradosEnBloque()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleBulkDelete = () => {
    const selectedIds = selectedRows.map(row => (row.original as any).id).filter(Boolean)
    if (selectedIds.length > 0) {
      eliminarPedidos(selectedIds, {
        onSuccess: () => {
          table.resetRowSelection()
          setShowDeleteDialog(false)
        }
      })
    }
  }

  return (
    <div className='space-y-4'>
      {/* Filtros de búsqueda */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Búsqueda por ID */}
        <div className='relative'>
          <IconHash className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por ID...'
            value={(table.getColumn('id')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('id')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[140px] pl-8'
          />
        </div>

        {/* Búsqueda por producto */}
        <div className='relative'>
          <IconPackage className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar producto...'
            value={(table.getColumn('producto_nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('producto_nombre')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[180px] pl-8'
          />
        </div>

        {/* Búsqueda por vendedor/cliente */}
        <div className='relative'>
          <IconUser className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar cliente...'
            value={(table.getColumn('cliente_nombre')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('cliente_nombre')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[160px] pl-8'
          />
        </div>

        {/* Búsqueda por email */}
        <div className='relative'>
          <IconMail className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar email...'
            value={(table.getColumn('cuenta_email')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('cuenta_email')?.setFilterValue(event.target.value)
            }
            className='h-9 w-[160px] pl-8'
          />
        </div>
      </div>

      {/* Barra de herramientas principal */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center space-x-2'>
          {/* Filtro por estado */}
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              options={estados}
            />
          )}
        </div>
        <div className='flex items-center gap-2'>

          {hasSelectedRows && (
            <Button
              variant='destructive'
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
            >
              <IconTrash size={16} />
              Eliminar ({selectedRows.length}) seleccionados
            </Button>
          )}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pedidos seleccionados?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedRows.length} pedido{selectedRows.length !== 1 ? 's' : ''} seleccionado{selectedRows.length !== 1 ? 's' : ''}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 