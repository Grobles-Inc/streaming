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

interface MantenimientoConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activar: boolean
  onConfirm: () => void
}

export function MantenimientoConfirmDialog({ 
  open, 
  onOpenChange, 
  activar, 
  onConfirm 
}: MantenimientoConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {activar ? 'Activar' : 'Desactivar'} Modo Mantenimiento
          </AlertDialogTitle>
          <AlertDialogDescription>
            {activar ? (
              <>
                Al activar el modo mantenimiento, todos los usuarios del sistema verán un mensaje 
                de mantenimiento y no podrán acceder a las funcionalidades normales de la aplicación.
                <br /><br />
                ¿Estás seguro de que quieres activar el modo mantenimiento?
              </>
            ) : (
              <>
                Al desactivar el modo mantenimiento, todos los usuarios podrán acceder 
                normalmente a todas las funcionalidades del sistema.
                <br /><br />
                ¿Estás seguro de que quieres desactivar el modo mantenimiento?
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={activar ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            {activar ? 'Activar Mantenimiento' : 'Desactivar Mantenimiento'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
