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
import { toast } from 'sonner'
import { useUsersContext } from '../context/users-context'
import { MappedUser } from '../data/schema'
import { IconUserCheck } from '@tabler/icons-react'

interface UsersEnableDialogProps {
  open: boolean
  onOpenChange: () => void
  currentRow: MappedUser
}

export function UsersEnableDialog({ open, onOpenChange, currentRow }: UsersEnableDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { enableUser } = useUsersContext()

  const handleEnable = async () => {
    setIsLoading(true)
    try {
      const success = await enableUser(currentRow.id)
      if (success) {
        toast.success('Usuario habilitado', {
          description: `${currentRow.nombres} ${currentRow.apellidos} ha sido habilitado exitosamente.`
        })
        onOpenChange()
      } else {
        toast.error('Error al habilitar usuario')
      }
    } catch (error) {
      console.error('Error enabling user:', error)
      toast.error('Error al habilitar usuario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconUserCheck className="h-5 w-5 text-green-600" />
            Habilitar Usuario
          </AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que quieres habilitar la cuenta de{' '}
            <span className="font-semibold">{currentRow.nombres} {currentRow.apellidos}</span>?
            <br />
            <br />
            El usuario podrá volver a acceder a la plataforma y realizar todas las acciones normalmente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleEnable}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Habilitando...' : 'Habilitar Usuario'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
