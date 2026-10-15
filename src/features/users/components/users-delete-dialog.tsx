'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useUsersContext } from '../context/users-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MappedUser } from '../data/schema'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MappedUser
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteUser } = useUsersContext()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUser(currentRow.id)
      if (result) {
        toast.success(result.message)
        onOpenChange(false)
      } else {
        toast.error('Error al eliminar usuario')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Error al eliminar usuario')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={isDeleting}
      isLoading={isDeleting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Eliminar Usuario
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Estás seguro de que quieres eliminar a{' '}
            <span className='font-bold'>{currentRow.usuario}</span>?
            <br />
            Si no tiene historial ni saldo se eliminará permanentemente. Si
            tiene actividad, se deshabilitará en su lugar y podrá habilitarse
            nuevamente.
          </p>

          <Alert variant='destructive'>
            <AlertTitle>¡Advertencia!</AlertTitle>
            <AlertDescription>
              Sin actividad se elimina de forma permanente. Con actividad solo
              se deshabilita el acceso.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isDeleting ? 'Eliminando...' : 'Confirmar'}
      destructive
    />
  )
}
