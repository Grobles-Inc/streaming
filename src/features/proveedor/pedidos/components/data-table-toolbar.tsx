import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Table } from '@tanstack/react-table'
import { IconSearch, IconTrash } from '@tabler/icons-react'
import { RefreshCcw } from 'lucide-react'
import { useAuth } from '@/stores/authStore'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { estados } from '../data/data'
import { useEliminarPedidosExpiradosEnBloque } from '../queries'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { mutate: eliminarPedidos, isPending } =
    useEliminarPedidosExpiradosEnBloque()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelectedRows = selectedRows.length > 0

  const handleRefresh = () => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: ['pedidos', 'proveedor', user.id],
      })
    }
  }

  const handleBulkDelete = () => {
    const selectedIds = selectedRows
      .map((row) => (row.original as any).id)
      .filter(Boolean)

    const selectedStockProductoIds = selectedRows
      .map((row) => (row.original as any).stock_producto_id)
      .filter(Boolean)

    if (selectedIds.length > 0) {
      eliminarPedidos({
        ids: selectedIds,
        stockProductoIds:
          selectedStockProductoIds.length > 0
            ? selectedStockProductoIds
            : undefined,
      })
      setShowDeleteDialog(false)
      table.resetRowSelection()
    }
  }

  return (
    <div className='space-y-4'>
      {/* Búsqueda global */}
      <div className='flex flex-col justify-between gap-2 md:flex-row md:items-center'>
        <div className='grid-cols-2 grid-rows-3 items-center gap-2 md:flex'>
          <div className='relative mb-4 max-w-sm flex-1 md:mb-0'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              placeholder='Búsqueda global...'
              value={table.getState().globalFilter ?? ''}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className='h-9 pl-9'
            />
          </div>
          {table.getColumn('estado') && (
            <DataTableFacetedFilter
              column={table.getColumn('estado')}
              options={estados}
            />
          )}
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
        </div>

        {/* Barra de herramientas principal */}
        <div className='flex items-center justify-end gap-2'>
          <Button variant='outline' size='icon' onClick={handleRefresh}>
            <RefreshCcw className='h-4 w-4' />
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar pedidos seleccionados?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedRows.length} pedido
              {selectedRows.length !== 1 ? 's' : ''} seleccionado
              {selectedRows.length !== 1 ? 's' : ''}. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isPending}
              className='bg-red-600 hover:bg-red-700'
            >
              {isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
