import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { userTypes } from '../data/data'
import { MappedUser, UserRole } from '../data/schema'
import { useUsersContext } from '../context/users-context-new'

interface UsersChangeRoleDialogProps {
  open: boolean
  onOpenChange: () => void
  currentRow: MappedUser
}

export function UsersChangeRoleDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersChangeRoleDialogProps) {
  const { updateUser, refreshUsers } = useUsersContext()
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRow.rol)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleSaveRole = async () => {
    if (!selectedRole || selectedRole === currentRow.rol) {
      toast.warning('Selecciona un rol diferente al actual')
      return
    }

    setIsUpdating(true)
    try {
      const success = await updateUser(currentRow.id, { rol: selectedRole })
      
      if (success) {
        toast.success('Rol actualizado correctamente')
        refreshUsers()
        onOpenChange()
      } else {
        toast.error('Error al actualizar el rol del usuario')
      }
    } catch (error) {
      console.error('Error al cambiar rol:', error)
      toast.error('Error al actualizar el rol del usuario')
    } finally {
      setIsUpdating(false)
    }
  }

  const currentUserType = userTypes.find(type => type.value === currentRow.rol)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
          <DialogDescription>
            Cambia el rol del usuario <strong>{currentRow.nombres} {currentRow.apellidos}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="current-role">Rol Actual</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              {currentUserType?.icon && (
                <currentUserType.icon size={16} className="text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{currentUserType?.label}</span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="new-role">Nuevo Rol</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {userTypes.map((userType) => (
                  <SelectItem 
                    key={userType.value} 
                    value={userType.value}
                    disabled={userType.value === currentRow.rol}
                  >
                    <div className="flex items-center gap-2">
                      {userType.icon && (
                        <userType.icon size={16} className="text-muted-foreground" />
                      )}
                      <span>{userType.label}</span>
                      {userType.value === currentRow.rol && (
                        <span className="text-xs text-muted-foreground">(actual)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onOpenChange} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveRole} 
            disabled={isUpdating || selectedRole === currentRow.rol}
          >
            {isUpdating ? 'Actualizando...' : 'Cambiar Rol'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
