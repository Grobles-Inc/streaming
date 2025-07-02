import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {IconX, IconTrendingUp, IconTrendingDown, IconCalendar, IconFilter } from '@tabler/icons-react'
import { BilleterasService } from '../services'
import type { Billetera, Recarga, Retiro, MovimientoBilletera } from '../data/types'

interface MovimientosBilleteraModalProps {
  billetera: Billetera | null
  open: boolean
  onClose: () => void
  onUpdateEstado?: (tipo: 'recarga' | 'retiro', id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => void
}

export function MovimientosBilleteraModal({ billetera, open, onClose }: MovimientosBilleteraModalProps) {
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'recargas' | 'retiros'>('todos')
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos')
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
  const todosMovimientos: MovimientoBilletera[] = [
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

  // Aplicar filtros
  const movimientosFiltrados = todosMovimientos.filter(movimiento => {
    // Filtro por tipo
    if (tipoFiltro !== 'todos' && movimiento.tipo !== tipoFiltro.slice(0, -1)) {
      return false
    }

    // Filtro por estado
    if (estadoFiltro !== 'todos' && movimiento.estado !== estadoFiltro) {
      return false
    }

    // Filtro por fecha desde
    if (fechaDesde) {
      const fechaMovimiento = new Date(movimiento.fecha)
      const fechaFiltro = new Date(fechaDesde)
      if (fechaMovimiento < fechaFiltro) {
        return false
      }
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      const fechaMovimiento = new Date(movimiento.fecha)
      const fechaFiltro = new Date(fechaHasta)
      if (fechaMovimiento > fechaFiltro) {
        return false
      }
    }

    return true
  })

  const startIndex = currentPage * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMovimientos = movimientosFiltrados.slice(startIndex, endIndex)
  const totalPages = Math.ceil(movimientosFiltrados.length / itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [fechaDesde, fechaHasta, tipoFiltro, estadoFiltro])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
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


  const clearFilters = () => {
    setFechaDesde('')
    setFechaHasta('')
    setTipoFiltro('todos')
    setEstadoFiltro('todos')
    setCurrentPage(0)
  }

  const hasActiveFilters = fechaDesde || fechaHasta || tipoFiltro !== 'todos' || estadoFiltro !== 'todos'

  if (!billetera) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] !max-w-[98vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Movimientos de Billetera - {billetera.usuario?.nombres} {billetera.usuario?.apellidos}
            <Badge variant="outline" className="ml-2">
              Saldo: {formatCurrency(billetera.saldo)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFilter className="h-5 w-5" />
              Filtros de Movimientos
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Activos
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha-desde">Desde fecha</Label>
                <div className="relative">
                  <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="fecha-desde"
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha-hasta">Hasta fecha</Label>
                <div className="relative">
                  <IconCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="fecha-hasta"
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo-filtro">Tipo</Label>
                <select
                  id="tipo-filtro"
                  value={tipoFiltro}
                  onChange={(e) => setTipoFiltro(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="recargas">Solo Recargas</option>
                  <option value="retiros">Solo Retiros</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado-filtro">Estado</Label>
                <select
                  id="estado-filtro"
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4">
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <IconX className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Historial de Movimientos
              <Badge variant="outline" className="ml-2">
                {movimientosFiltrados.length} de {todosMovimientos.length} movimientos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Cargando movimientos...</div>
            ) : movimientosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters ? 'No hay movimientos que coincidan con los filtros' : 'No hay movimientos registrados'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="px-4 py-3 font-medium">Tipo</th>
                        <th className="px-4 py-3 font-medium">Monto</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMovimientos.map(movimiento => (
                        <tr key={`${movimiento.tipo}-${movimiento.id}`} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {getTipoIcon(movimiento.tipo)}
                              <span className="capitalize font-medium">
                                {movimiento.tipo}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`font-semibold text-lg ${movimiento.tipo === 'recarga' ? 'text-green-600' : 'text-red-600'}`}>
                              {movimiento.tipo === 'recarga' ? '+' : '-'}{formatCurrency(movimiento.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {getEstadoBadge(movimiento.estado)}
                          </td>
                          <td className="px-4 py-4 text-gray-500">
                            <div className="text-sm">
                              {formatDate(movimiento.fecha)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Página {currentPage + 1} de {totalPages}
                      </span>
                      <Badge variant="outline">
                        {startIndex + 1}-{Math.min(endIndex, movimientosFiltrados.length)} de {movimientosFiltrados.length}
                      </Badge>
                    </div>
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
