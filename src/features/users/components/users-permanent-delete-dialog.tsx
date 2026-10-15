import { useState } from 'react'
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useUsersContext } from '../context/users-context'

export function UsersPermanentDeleteDialog() {
  const { open, setOpen, currentRow, permanentDeleteUser } = useUsersContext()
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePermanentDelete = async () => {
    if (!currentRow) return

    setIsDeleting(true)
    try {
      const success = await permanentDeleteUser(currentRow.id)
      if (success) {
        setOpen(null)
      }
    } catch (error) {
      console.error('Error permanently deleting user:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen ? 'permanentDelete' : null)
  }

  return (
    <AlertDialog open={open === 'permanentDelete'} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
            <IconAlertTriangle size={24} />
            <span>Eliminar Usuario Permanentemente</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              Esta acción eliminará permanentemente al usuario y <strong>NO SE PUEDE DESHACER</strong>.
              {currentRow && (
                <div className="mt-4 space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <IconAlertTriangle className="text-red-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">Usuario a eliminar:</h4>
                        <div className="text-sm text-red-700 space-y-1">
                          <p><strong>Usuario:</strong> {currentRow.usuario}</p>
                          <p><strong>Email:</strong> {currentRow.email}</p>
                          <p><strong>Usuario:</strong> @{currentRow.usuario}</p>
                          <p><strong>Saldo:</strong> S/ {currentRow.saldo.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Se eliminarán también:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Todas las transacciones del usuario</li>
                      <li>• Todas las recargas realizadas</li>
                      <li>• Todos los retiros efectuados</li>
                      <li>• Todas las compras registradas</li>
                      <li>• La billetera del usuario</li>
                      <li>• Referencias de otros usuarios a este usuario</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handlePermanentDelete}
            disabled={!currentRow || isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <IconTrash size={16} className="mr-2" />
                Eliminar Permanentemente
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
