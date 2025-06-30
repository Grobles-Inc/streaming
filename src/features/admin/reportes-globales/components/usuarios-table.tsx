import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Usuario } from '../data/types'

interface UsuariosTableProps {
  usuarios: Usuario[]
  loading: boolean
  onUpdateUsuario: (id: string, updates: Partial<Usuario>) => Promise<Usuario>
  onDeleteUsuario: (id: string) => Promise<void>
}

export function UsuariosTable({ usuarios, loading, onUpdateUsuario, onDeleteUsuario }: UsuariosTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Lista de usuarios registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRolBadgeVariant = (rol: string) => {
    switch (rol) {
      case 'admin': return 'destructive'
      case 'provider': return 'default'
      case 'seller': return 'secondary'
      default: return 'outline'
    }
  }

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador'
      case 'provider': return 'Proveedor'
      case 'seller': return 'Vendedor'
      default: return rol
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios</CardTitle>
        <CardDescription>Lista de usuarios registrados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-left">Rol</th>
                <th className="px-4 py-2 text-left">Balance</th>
                <th className="px-4 py-2 text-left">Fecha Registro</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 border-r">
                    {usuario.nombres} {usuario.apellidos}
                  </td>
                  <td className="px-4 py-2 border-r">{usuario.email}</td>
                  <td className="px-4 py-2 border-r">{usuario.telefono || 'N/A'}</td>
                  <td className="px-4 py-2 border-r">
                    <Badge variant={getRolBadgeVariant(usuario.rol)}>
                      {getRolLabel(usuario.rol)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 border-r">${(usuario.balance || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 border-r">
                    {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Implementar modal de edición
                          console.log('Editar usuario:', usuario.id)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
                            await onDeleteUsuario(usuario.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
