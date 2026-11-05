import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CustomEmpty } from '@/components/custom-empty'
import {
  IconCalendar,
  IconFilter,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from '@tabler/icons-react'
import { History, Loader2 } from 'lucide-react'
import { useMovimientosBilleteraAdmin } from '../queries'
import type {
  Billetera,
  GetMovimientosBilleteraAdminParams,
  MovimientoBilleteraRow,
  MovimientoTipo,
} from '../data/types'

interface MovimientosBilleteraModalProps {
  billetera: Billetera | null
  open: boolean
  onClose: () => void
  onUpdateEstado?: (
    tipo: 'recarga' | 'retiro',
    id: number,
    estado: 'aprobado' | 'pendiente' | 'rechazado'
  ) => void
}

const ITEMS_PER_PAGE = 50

const TIPO_LABELS: Record<MovimientoTipo, string> = {
  recarga: 'Recarga',
  retiro: 'Retiro',
  compra: 'Compra',
  renovacion: 'Renovación',
}

const ESTADOS_POR_TIPO: Record<
  MovimientoTipo,
  { value: string; label: string }[]
> = {
  recarga: [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
  ],
  retiro: [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'aprobado', label: 'Aprobado' },
    { value: 'rechazado', label: 'Rechazado' },
  ],
  compra: [
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'soporte', label: 'Soporte' },
    { value: 'vencido', label: 'Vencido' },
    { value: 'pedido', label: 'Pedido' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'reembolsado', label: 'Reembolsado' },
    { value: 'completado', label: 'Completado' },
  ],
  renovacion: [{ value: 'completado', label: 'Completado' }],
}

const ESTADO_LABELS: Record<string, string> = {
  aprobado: 'Aprobado',
  pendiente: 'Pendiente',
  rechazado: 'Rechazado',
  resuelto: 'Resuelto',
  soporte: 'Soporte',
  vencido: 'Vencido',
  pedido: 'Pedido',
  entregado: 'Entregado',
  reembolsado: 'Reembolsado',
  completado: 'Completado',
  renovado: 'Renovado',
}

const ESTADO_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  aprobado: 'default',
  resuelto: 'default',
  entregado: 'default',
  completado: 'default',
  renovado: 'default',
  pendiente: 'secondary',
  pedido: 'secondary',
  soporte: 'outline',
  rechazado: 'destructive',
  vencido: 'destructive',
  reembolsado: 'destructive',
}

const CONTRAPARTE_LABELS: Record<'seller' | 'provider', string> = {
  seller: 'Vendedor',
  provider: 'Proveedor',
}

export function MovimientosBilleteraModal({
  billetera,
  open,
  onClose,
}: MovimientosBilleteraModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<'todos' | MovimientoTipo>('todos')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')

  useEffect(() => {
    setFechaDesde('')
    setFechaHasta('')
    setTipoFiltro('todos')
    setEstadoFiltro('todos')
    setCurrentPage(1)
  }, [billetera?.id])

  useEffect(() => {
    setCurrentPage(1)
  }, [open])

  const params = useMemo<GetMovimientosBilleteraAdminParams | null>(() => {
    if (!billetera) return null

    return {
      usuarioId: billetera.usuario_id,
      tipo: tipoFiltro === 'todos' ? null : tipoFiltro,
      subtipo: null,
      estado: estadoFiltro === 'todos' ? null : estadoFiltro,
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }
  }, [billetera, tipoFiltro, estadoFiltro, fechaDesde, fechaHasta, currentPage])

  const { data, loading, error } = useMovimientosBilleteraAdmin(params)

  const movimientos = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 0

  const estadosDisponibles =
    tipoFiltro === 'todos' ? [] : ESTADOS_POR_TIPO[tipoFiltro]

  const hasActiveFilters =
    Boolean(fechaDesde) ||
    Boolean(fechaHasta) ||
    tipoFiltro !== 'todos' ||
    estadoFiltro !== 'todos'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTipoLabel = (movimiento: MovimientoBilleteraRow) => {
    if (movimiento.tipo !== 'renovacion') {
      return TIPO_LABELS[movimiento.tipo]
    }

    return movimiento.subtipo === 'producto'
      ? 'Renovación producto'
      : 'Renovación pedido'
  }

  const getEstadoBadge = (estado: string) => {
    return (
      <Badge variant={ESTADO_VARIANTS[estado] ?? 'outline'}>
        {ESTADO_LABELS[estado] ?? estado}
      </Badge>
    )
  }

  const getTipoIcon = (movimiento: MovimientoBilleteraRow) => {
    return movimiento.direccion === 'entrada' ? (
      <IconTrendingUp className='h-4 w-4 text-green-600' />
    ) : (
      <IconTrendingDown className='h-4 w-4 text-red-600' />
    )
  }

  const handleTipoChange = (value: 'todos' | MovimientoTipo) => {
    setTipoFiltro(value)
    setEstadoFiltro('todos')
    setCurrentPage(1)
  }

  const handleEstadoChange = (value: string) => {
    setEstadoFiltro(value)
    setCurrentPage(1)
  }

  const handleFechaDesdeChange = (value: string) => {
    setFechaDesde(value)
    setCurrentPage(1)
  }

  const handleFechaHastaChange = (value: string) => {
    setFechaHasta(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFechaDesde('')
    setFechaHasta('')
    setTipoFiltro('todos')
    setEstadoFiltro('todos')
    setCurrentPage(1)
  }

  if (!billetera) return null

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, total)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='!w-[98vw] !max-w-[98vw] max-h-[95vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Movimientos de Billetera - {billetera.usuario?.usuario}
            <Badge variant='outline' className='ml-2'>
              Saldo: {formatCurrency(billetera.saldo)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconFilter className='h-5 w-5' />
              Filtros de Movimientos
              {hasActiveFilters && (
                <Badge variant='secondary' className='ml-2'>
                  Activos
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fecha-desde'>Desde fecha</Label>
                <div className='relative'>
                  <IconCalendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    id='fecha-desde'
                    type='date'
                    value={fechaDesde}
                    onChange={(e) => handleFechaDesdeChange(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='fecha-hasta'>Hasta fecha</Label>
                <div className='relative'>
                  <IconCalendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    id='fecha-hasta'
                    type='date'
                    value={fechaHasta}
                    onChange={(e) => handleFechaHastaChange(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='tipo-filtro'>Tipo</Label>
                <select
                  id='tipo-filtro'
                  value={tipoFiltro}
                  onChange={(e) =>
                    handleTipoChange(
                      e.target.value as 'todos' | MovimientoTipo
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='todos'>Todos</option>
                  <option value='recarga'>Recargas</option>
                  <option value='retiro'>Retiros</option>
                  <option value='compra'>Compras</option>
                  <option value='renovacion'>Renovaciones</option>
                </select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='estado-filtro'>Estado</Label>
                <select
                  id='estado-filtro'
                  value={estadoFiltro}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  disabled={tipoFiltro === 'todos'}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value='todos'>Todos</option>
                  {estadosDisponibles.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className='mt-4'>
                <Button
                  variant='outline'
                  onClick={clearFilters}
                  className='flex items-center gap-2'
                >
                  <IconX className='h-4 w-4' />
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              Historial de Movimientos
              <Badge variant='outline' className='ml-2'>
                {total} movimientos
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-left'>
                <thead>
                  <tr className='border-b bg-gray-50 dark:bg-gray-800'>
                    <th className='px-4 py-3 font-medium'>Tipo</th>
                    <th className='px-4 py-3 font-medium'>Monto</th>
                    <th className='px-4 py-3 font-medium'>Estado</th>
                    <th className='px-4 py-3 font-medium'>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className='p-0'>
                        <div className='flex flex-col items-center gap-6 py-10'>
                          <CustomEmpty
                            title='Cargando movimientos...'
                            description='Estamos obteniendo el historial de movimientos.'
                            icon={<Loader2 className='size-10 animate-spin' />}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className='p-0'>
                        <div className='flex flex-col items-center gap-6 py-10'>
                          <CustomEmpty
                            title='Error al cargar movimientos'
                            description={error}
                            icon={<History className='size-10' />}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='p-0'>
                        <div className='flex flex-col items-center gap-6 py-10'>
                          <CustomEmpty
                            title={
                              hasActiveFilters
                                ? 'Sin resultados'
                                : 'No hay movimientos registrados'
                            }
                            description={
                              hasActiveFilters
                                ? 'No hay movimientos que coincidan con los filtros.'
                                : 'Aún no se han registrado movimientos para esta billetera.'
                            }
                            icon={<History className='size-10' />}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((movimiento) => (
                      <tr
                        key={movimiento.id}
                        className='border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                      >
                        <td className='px-4 py-4'>
                          <div className='flex items-start gap-2'>
                            {getTipoIcon(movimiento)}
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {getTipoLabel(movimiento)}
                              </span>
                              {movimiento.descripcion && (
                                <span className='text-xs text-muted-foreground'>
                                  {movimiento.descripcion}
                                </span>
                              )}
                              {movimiento.contraparteUsuario &&
                                movimiento.contraparteRol && (
                                  <span className='text-xs text-muted-foreground'>
                                    {
                                      CONTRAPARTE_LABELS[
                                        movimiento.contraparteRol
                                      ]
                                    }
                                    : {movimiento.contraparteUsuario}
                                  </span>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-4'>
                          <span
                            className={`font-semibold text-lg ${
                              movimiento.direccion === 'entrada'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {movimiento.direccion === 'entrada' ? '+' : '-'}
                            {formatCurrency(movimiento.monto)}
                          </span>
                        </td>
                        <td className='px-4 py-4'>
                          {getEstadoBadge(movimiento.estado)}
                        </td>
                        <td className='px-4 py-4 text-gray-500'>
                          <div className='text-sm'>
                            {formatDate(movimiento.fecha)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && totalPages > 1 && (
              <div className='flex justify-between items-center mt-6 pt-4 border-t'>
                <Button
                  variant='outline'
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Anterior
                </Button>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>
                    Página {currentPage} de {totalPages}
                  </span>
                  <Badge variant='outline'>
                    {startIndex + 1}-{endIndex} de {total}
                  </Badge>
                </div>
                <Button
                  variant='outline'
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
