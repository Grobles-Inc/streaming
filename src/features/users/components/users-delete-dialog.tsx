'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useUsersContext } from '../context/users-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { MappedUser } from '../data/schema'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: MappedUser
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { deleteUser } = useUsersContext()

  const handleDelete = async () => {
    if (value.trim() !== `${currentRow.nombres} ${currentRow.apellidos}`) return

    try {
      const success = await deleteUser(currentRow.id)
      if (success) {
        toast.success('Usuario deshabilitado exitosamente')
        onOpenChange(false)
        setValue('')
      } else {
        toast.error('Error al deshabilitar usuario')
      }
    } catch (error) {
      console.error('Error disabling user:', error)
      toast.error('Error al deshabilitar usuario')
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== `${currentRow.nombres} ${currentRow.apellidos}`}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Deshabilitar Usuario
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            ¿Estás seguro de que quieres deshabilitar a{' '}
            <span className='font-bold'>{currentRow.nombres} {currentRow.apellidos}</span>?
            <br />
            Esta acción deshabilitará la cuenta del usuario con el rol de{' '}
            <span className='font-bold'>
              {currentRow.rol.toUpperCase()}
            </span>{' '}
            del sistema. El usuario no podrá acceder hasta que sea habilitado nuevamente.
          </p>

          <Label className='my-2'>
            Nombre completo:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Ingresa el nombre completo para confirmar deshabilitación.'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>¡Advertencia!</AlertTitle>
            <AlertDescription>
              El usuario será deshabilitado y no podrá acceder a la plataforma.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='Deshabilitar'
      destructive
    />
  )
}
