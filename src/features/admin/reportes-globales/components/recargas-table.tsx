import { CustomEmpty } from '@/components/custom-empty'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Inbox, Loader2 } from 'lucide-react'
import type { Recarga } from '../data/types'

interface RecargasTableProps {
  recargas: Recarga[]
  loading: boolean
  onUpdateRecarga: (id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => Promise<Recarga>
}

export function RecargasTable({ recargas, loading, onUpdateRecarga }: RecargasTableProps) {

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'aprobado': return { variant: 'default' as const, label: 'Aprobado' }
      case 'pendiente': return { variant: 'secondary' as const, label: 'Pendiente' }
      case 'rechazado': return { variant: 'destructive' as const, label: 'Rechazado' }
      default: return { variant: 'outline' as const, label: estado }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recargas y Validaciones</CardTitle>
        <CardDescription>Validar recargas y pagos de usuarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Monto</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='Cargando recargas...'
                        description='Estamos obteniendo el listado de recargas.'
                        icon={<Loader2 className='size-10 animate-spin' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : recargas.length === 0 ? (
                <tr>
                  <td colSpan={5} className='p-0'>
                    <div className='flex flex-col items-center gap-6 py-10'>
                      <CustomEmpty
                        title='No hay recargas disponibles'
                        description='No se encontraron recargas con los filtros actuales.'
                        icon={<Inbox className='size-10' />}
                      />
                    </div>
                  </td>
                </tr>
              ) : (
              recargas.map((recarga) => {
                const estado = getEstadoBadge(recarga.estado)
                return (
                  <tr key={recarga.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border-r">
                      {recarga.usuarios ? (
                        `${recarga.usuarios.nombres} ${recarga.usuarios.apellidos}`
                      ) : (
                        <span className="text-gray-500 font-mono text-xs">ID: {recarga.usuario_id}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 border-r font-medium">
                      ${(recarga.monto || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <Badge variant={estado.variant}>
                        {estado.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 border-r">
                      {recarga.created_at ? new Date(recarga.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2">
                      {recarga.estado === 'pendiente' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={async () => {
                              await onUpdateRecarga(recarga.id, 'aprobado')
                            }}
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await onUpdateRecarga(recarga.id, 'rechazado')
                            }}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                      {recarga.estado !== 'pendiente' && (
                        <span className="text-sm text-gray-500">
                          {estado.label}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
