'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MappedUser } from '../data/schema'
import { userTypes } from '../data/data'

interface Props {
  currentRow?: MappedUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersDetailsDialog({ currentRow, open, onOpenChange }: Props) {
  if (!currentRow) return null

  const userType = userTypes.find(({ value }) => value === currentRow.rol)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-left'>
          <DialogTitle>Detalles del Usuario</DialogTitle>
          <DialogDescription>
            Información completa del usuario seleccionado.
          </DialogDescription>
        </DialogHeader>
        
        <div className='grid gap-6 py-4'>
          {/* Información básica */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <h4 className='font-medium text-sm text-muted-foreground'>INFORMACIÓN PERSONAL</h4>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium'>Nombres:</label>
                  <p className='text-sm text-muted-foreground'>{currentRow.nombres}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Apellidos:</label>
                  <p className='text-sm text-muted-foreground'>{currentRow.apellidos}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Email:</label>
                  <p className='text-sm text-muted-foreground font-mono'>{currentRow.email}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Usuario:</label>
                  <p className='text-sm text-muted-foreground font-mono'>{currentRow.usuario}</p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Contraseña:</label>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {currentRow.password ? '••••••••' : 'No establecida'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Teléfono:</label>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {currentRow.telefono || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <h4 className='font-medium text-sm text-muted-foreground'>INFORMACIÓN DEL SISTEMA</h4>
              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium'>Rol:</label>
                  <div className='flex items-center gap-2 mt-1'>
                    {userType?.icon && <userType.icon size={16} />}
                    <Badge variant='secondary' className='capitalize'>
                      {userType?.label || currentRow.rol}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium'>Saldo:</label>
                  <p className={`text-sm font-mono ${
                    currentRow.saldo > 0 ? 'text-green-600' : 
                    currentRow.saldo < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {formatCurrency(currentRow.saldo)}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Código de Referido:</label>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {currentRow.codigo_referido || 'No asignado'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>ID de Billetera:</label>
                  <p className='text-xs text-muted-foreground font-mono'>
                    {currentRow.billetera_id || 'No asignada'}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Fecha de Creación:</label>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(currentRow.fechaCreacion)}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium'>Última Actualización:</label>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(currentRow.fechaActualizacion)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
