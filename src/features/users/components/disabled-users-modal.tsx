import React from 'react'
import { IconTrash, IconUserCheck, IconEye } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUsersContext } from '../context/users-context'
import { MappedUser } from '../data/schema'

export function DisabledUsersModal() {
  const { 
    open, 
    setOpen, 
    disabledUsers, 
    disabledUsersLoading, 
    setCurrentRow,
    loadDisabledUsers 
  } = useUsersContext()

  React.useEffect(() => {
    if (open === 'disabledUsers' && disabledUsers.length === 0) {
      loadDisabledUsers()
    }
  }, [open, disabledUsers.length, loadDisabledUsers])

  const handleEnableUser = (user: MappedUser) => {
    setCurrentRow(user)
    setOpen('enable')
  }

  const handlePermanentDelete = (user: MappedUser) => {
    setCurrentRow(user)
    setOpen('permanentDelete')
  }

  const handleViewUser = (user: MappedUser) => {
    setCurrentRow(user)
    setOpen('view')
  }

  return (
    <Dialog open={open === 'disabledUsers'} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[80vh] overflow-hidden flex flex-col" style={{ maxWidth: '95vw', width: '95vw' }}>
        <DialogHeader>
          <DialogTitle>Usuarios Deshabilitados</DialogTitle>
          <DialogDescription>
            Lista de usuarios que han sido deshabilitados del sistema. Puedes habilitarlos nuevamente o eliminarlos permanentemente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {disabledUsersLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-sm text-gray-600">Cargando usuarios deshabilitados...</p>
              </div>
            </div>
          ) : disabledUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <IconUserCheck size={64} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay usuarios deshabilitados</h3>
              <p className="text-sm text-gray-500">
                Todos los usuarios están activos en el sistema.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disabledUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.nombres} {user.apellidos}</div>
                        <div className="text-sm text-gray-500">@{user.usuario}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          user.rol === 'admin' ? 'destructive' :
                          user.rol === 'provider' ? 'default' :
                          user.rol === 'seller' ? 'secondary' : 'outline'
                        }
                      >
                        {user.rol === 'admin' ? 'Administrador' :
                         user.rol === 'provider' ? 'Proveedor' :
                         user.rol === 'seller' ? 'Vendedor' : 'Registrado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.telefono || 'N/A'}</TableCell>
                    <TableCell>S/ {user.saldo.toFixed(2)}</TableCell>
                    <TableCell>{user.fechaCreacion.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          title="Ver detalles"
                        >
                          <IconEye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleEnableUser(user)}
                          title="Habilitar usuario"
                        >
                          <IconUserCheck size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handlePermanentDelete(user)}
                          title="Eliminar permanentemente"
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
