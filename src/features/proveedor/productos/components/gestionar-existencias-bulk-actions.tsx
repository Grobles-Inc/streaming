import { Button } from '@/components/ui/button'
import { IconEye, IconEyeOff, IconTrash } from '@tabler/icons-react'

interface GestionarExistenciasBulkActionsProps {
  selectedCount: number
  isPending?: boolean
  onPublicar: () => void
  onDespublicar: () => void
  onEliminar: () => void
}

/**
 * Barra de acciones en lote para las existencias de un producto.
 * Presentacional: recibe contadores y callbacks, no ejecuta lógica.
 */
export function GestionarExistenciasBulkActions({
  selectedCount,
  isPending = false,
  onPublicar,
  onDespublicar,
  onEliminar,
}: GestionarExistenciasBulkActionsProps) {
  return (
    <div className='flex items-center gap-2 p-3 bg-muted/50 border rounded-lg'>
      <span className='text-sm text-muted-foreground'>
        {selectedCount} fila(s) seleccionada(s)
      </span>
      <div className='flex items-center gap-2 ml-auto'>
        <Button
          variant='outline'
          size='sm'
          onClick={onPublicar}
          disabled={isPending}
          className='h-8'
        >
          <IconEye className='mr-2 h-4 w-4' />
          Publicar
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onDespublicar}
          disabled={isPending}
          className='h-8'
        >
          <IconEyeOff className='mr-2 h-4 w-4' />
          Despublicar
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={onEliminar}
          disabled={isPending}
          className='h-8 text-red-600 hover:text-red-700'
        >
          <IconTrash className='mr-2 h-4 w-4' />
          Eliminar
        </Button>
      </div>
    </div>
  )
}
