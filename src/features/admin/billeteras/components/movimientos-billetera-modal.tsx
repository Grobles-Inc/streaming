import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconMenu2, IconCheck, IconX, IconClock, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { BilleterasService } from '../services'
import type { Billetera, Recarga, Retiro, MovimientoBilletera } from '../data/types'

interface MovimientosBilleteraModalProps {
  billetera: Billetera | null
  open: boolean
  onClose: () => void
  onUpdateEstado?: (tipo: 'recarga' | 'retiro', id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => void
}

export function MovimientosBilleteraModal({ billetera, open, onClose, onUpdateEstado }: MovimientosBilleteraModalProps) {
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    if (billetera && open) {
      fetchMovimientos()
    }
  }, [billetera, open])

  const fetchMovimientos = async () => {
    if (!billetera) return

    try {
      setLoading(true)
      const [recargasData, retirosData] = await Promise.all([
        BilleterasService.getRecargasByUsuario(billetera.usuario_id),
        BilleterasService.getRetirosByUsuario(billetera.usuario_id)
      ])
      setRecargas(recargasData)
      setRetiros(retirosData)
    } catch (error) {
      console.error('Error al cargar movimientos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Combinar y ordenar movimientos
  const movimientos: MovimientoBilletera[] = [
    ...recargas.map(r => ({
      id: r.id,
      tipo: 'recarga' as const,
      monto: r.monto,
      estado: r.estado,
      fecha: r.created_at,
      usuario: r.usuario
    })),
    ...retiros.map(r => ({
      id: r.id,
      tipo: 'retiro' as const,
      monto: r.monto,
      estado: r.estado,
      fecha: r.created_at,
      usuario: r.usuario
    }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMovimientos = movimientos.slice(startIndex, endIndex)
  const totalPages = Math.ceil(movimientos.length / itemsPerPage)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      aprobado: 'default',
      pendiente: 'secondary',
      rechazado: 'destructive'
    } as const

    const labels = {
      aprobado: 'Aprobado',
      pendiente: 'Pendiente',
      rechazado: 'Rechazado'
    }

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'outline'}>
        {labels[estado as keyof typeof labels] || estado}
      </Badge>
    )
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'recarga' ? (
      <IconTrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <IconTrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const handleUpdateEstado = async (movimiento: MovimientoBilletera, nuevoEstado: 'aprobado' | 'pendiente' | 'rechazado') => {
    if (onUpdateEstado) {
      onUpdateEstado(movimiento.tipo, movimiento.id, nuevoEstado)
    }
    await fetchMovimientos() // Refrescar los datos
  }

  if (!billetera) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Movimientos de Billetera - {billetera.usuario?.nombres} {billetera.usuario?.apellidos}
            <Badge variant="outline" className="ml-2">
              Saldo: {formatCurrency(billetera.saldo)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Historial de Movimientos
              <Badge variant="outline" className="ml-2">
                {movimientos.length} movimientos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando movimientos...</div>
            ) : movimientos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay movimientos registrados
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 font-medium">Tipo</th>
                        <th className="px-4 py-3 font-medium">Monto</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                        <th className="px-4 py-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMovimientos.map(movimiento => (
                        <tr key={`${movimiento.tipo}-${movimiento.id}`} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(movimiento.tipo)}
                              <span className="capitalize font-medium">
                                {movimiento.tipo}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${movimiento.tipo === 'recarga' ? 'text-green-600' : 'text-red-600'}`}>
                              {movimiento.tipo === 'recarga' ? '+' : '-'}{formatCurrency(movimiento.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getEstadoBadge(movimiento.estado)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(movimiento.fecha)}
                          </td>
                          <td className="px-4 py-3">
                            {movimiento.estado === 'pendiente' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <IconMenu2 className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado(movimiento, 'aprobado')}
                                    className="text-green-600"
                                  >
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Aprobar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado(movimiento, 'rechazado')}
                                    className="text-red-600"
                                  >
                                    <IconX className="mr-2 h-4 w-4" />
                                    Rechazar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado(movimiento, 'pendiente')}
                                  >
                                    <IconClock className="mr-2 h-4 w-4" />
                                    Marcar pendiente
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {currentPage + 1} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
