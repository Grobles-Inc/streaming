import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Recarga } from '../data/types'

interface RecargasTableProps {
  recargas: Recarga[]
  loading: boolean
  onUpdateRecarga: (id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => Promise<Recarga>
}

export function RecargasTable({ recargas, loading, onUpdateRecarga }: RecargasTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recargas y Validaciones</CardTitle>
          <CardDescription>Validar recargas y pagos de usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

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
              {recargas.map((recarga) => {
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
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
