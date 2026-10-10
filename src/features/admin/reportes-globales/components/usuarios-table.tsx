import { CustomEmpty } from '@/components/custom-empty'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Users } from 'lucide-react'
import type { Usuario } from '../data/types'

interface UsuariosTableProps {
  usuarios: Usuario[]
  loading: boolean
  onUpdateUsuario: (id: string, updates: Partial<Usuario>) => Promise<Usuario>
}

export function UsuariosTable({ usuarios, loading }: UsuariosTableProps) {

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
                {/* <th className="px-4 py-2 text-left">Acciones</th> */}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='Cargando usuarios...'
                        description='Estamos obteniendo el listado de usuarios.'
                        icon={<Loader2 className='size-10 animate-spin' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='No hay usuarios disponibles'
                        description='No se encontraron usuarios con los filtros actuales.'
                        icon={<Users className='size-10' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
              usuarios.map((usuario) => (
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
                  {/* <td className="px-4 py-2">
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
                  </td> */}
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
