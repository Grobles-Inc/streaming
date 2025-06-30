import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Phone
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Search as SearchComponent } from '@/components/search'
import { Main } from '@/components/layout/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/stores/authStore'
import { usePedidosByProveedor } from './queries'
import type { Compra } from './services'
import { IconRefresh } from '@tabler/icons-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
// import type { Database } from '@/types/supabase'

// type CompraUpdate = Database['public']['Tables']['compras']['Update']

// Tipo para compras con información expandida (que viene de las queries con joins)
type CompraConRelaciones = Compra & {
  productos?: {
    nombre: string
    precio_publico: number
    stock: number
  } | null
  usuarios?: {
    nombres: string
    apellidos: string
    telefono: string | null
  } | null
}

// Mapeo de estados con colores
const estadosConfig = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  confirmado: {
    label: 'Confirmado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle
  },
  completado: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  rechazado: {
    label: 'Rechazado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
} as const

// Función para filtrar por fechas
const filtrarPorFecha = (pedidos: CompraConRelaciones[], filtro: string) => {
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)

  switch (filtro) {
    case 'hoy':
      return pedidos.filter(p => {
        const fechaPedido = new Date(p.created_at)
        return fechaPedido.toDateString() === hoy.toDateString()
      })
    case 'ayer':
      return pedidos.filter(p => {
        const fechaPedido = new Date(p.created_at)
        return fechaPedido.toDateString() === ayer.toDateString()
      })
    case '7dias': {
      const hace7Dias = new Date(hoy)
      hace7Dias.setDate(hoy.getDate() - 7)
      return pedidos.filter(p => new Date(p.created_at) >= hace7Dias)
    }
    case '28dias': {
      const hace28Dias = new Date(hoy)
      hace28Dias.setDate(hoy.getDate() - 28)
      return pedidos.filter(p => new Date(p.created_at) >= hace28Dias)
    }
    case 'año': {
      const inicioAño = new Date(hoy.getFullYear(), 0, 1)
      return pedidos.filter(p => new Date(p.created_at) >= inicioAño)
    }
    default:
      return pedidos
  }
}

// Función para formatear fecha
const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Función para abrir WhatsApp
const abrirWhatsApp = (telefono: string) => {
  // Limpiar el número de teléfono (remover espacios, guiones, paréntesis, etc.)
  const numeroLimpio = telefono.replace(/[^\d+]/g, '')
  // Abrir WhatsApp en una nueva pestaña
  window.open(`https://wa.me/${numeroLimpio}`, '_blank')
}

export function PedidosPage() {
  const { user } = useAuth()
  const [filtroFecha, setFiltroFecha] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')

  // Queries para obtener datos del proveedor
  const {
    data: pedidos = [],
    error: errorPedidos
  } = usePedidosByProveedor(user?.id || '')

  // const updateStatusMutation = useUpdatePedidoStatus()

  // Castear pedidos al tipo con relaciones (se asume que las queries traen las relaciones expandidas)
  const pedidosConRelaciones: CompraConRelaciones[] = pedidos as CompraConRelaciones[]

  // Aplicar filtros
  const pedidosFiltrados = filtrarPorFecha(pedidosConRelaciones, filtroFecha)
    .filter(pedido => {
      if (filtroEstado === 'todos') return true
      return pedido.estado === filtroEstado
    })
    .filter(pedido => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      const pedidoId = pedido.id || ''
      const productoNombre = pedido.productos?.nombre || ''
      const clienteNombre = pedido.nombre_cliente || ''
      const clienteTelefono = pedido.telefono_cliente || ''

      return (
        pedidoId.toLowerCase().includes(searchLower) ||
        productoNombre.toLowerCase().includes(searchLower) ||
        clienteNombre.toLowerCase().includes(searchLower) ||
        clienteTelefono.toLowerCase().includes(searchLower)
      )
    })

  // Calcular productos más vendidos de los pedidos completados
  const productosMasVendidos = pedidosConRelaciones
    .filter(p => p.estado === 'completado')
    .reduce((acc, pedido) => {
      const producto = pedido.productos?.nombre || 'Producto desconocido'
      if (!acc[producto]) {
        acc[producto] = { producto, ventas: 0, monto: 0 }
      }
      acc[producto].ventas += 1
      acc[producto].monto += pedido.precio
      return acc
    }, {} as Record<string, { producto: string; ventas: number; monto: number }>)

  const productosMasVendidosArray = Object.values(productosMasVendidos)
    .sort((a, b) => b.ventas - a.ventas)
    .slice(0, 5)

  // Estadísticas calculadas
  const estadisticas = {
    totalPedidos: pedidosFiltrados.length,
    pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
    confirmados: pedidosFiltrados.filter(p => p.estado === 'confirmado').length,
    completados: pedidosFiltrados.filter(p => p.estado === 'completado').length,
    rechazados: pedidosFiltrados.filter(p => p.estado === 'rechazado').length,
    ventasTotal: pedidosFiltrados
      .filter(p => p.estado === 'completado')
      .reduce((total, pedido) => total + pedido.precio, 0)
  }

  // const handleUpdateStatus = (id: string | undefined, estado: string) => {
  //   if (!id) return
  //   updateStatusMutation.mutate({ 
  //     id, 
  //     updates: { estado } as CompraUpdate
  //   })
  // }



  if (errorPedidos) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Button className=' rounded-full mx-2' size="icon" variant='ghost' title='Recargar ventana' onClick={() => window.location.reload()} >
              <IconRefresh />
            </Button>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Gestión de Pedidos</h1>
                <p className='text-muted-foreground'>
                  Administra todos los pedidos y ventas de tus productos de streaming
                </p>
              </div>
            </div>
            <Card>
              <CardContent className='p-6'>
                <div className='text-center'>
                  <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error al cargar pedidos</h3>
                  <p className="text-muted-foreground">No se pudieron cargar los pedidos. Intenta recargar la página.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button className=' rounded-full mx-2' size="icon" variant='ghost' title='Recargar ventana' onClick={() => window.location.reload()} >
            <IconRefresh />
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Gestión de Pedidos</h1>
              <p className='text-muted-foreground'>
                Administra todos los pedidos y ventas de tus productos de streaming
              </p>
            </div>
          </div>

          {/* Estadísticas de resumen */}
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Package className='h-4 w-4 text-muted-foreground' />
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Total Pedidos</p>
                    <p className='text-xl sm:text-2xl font-bold'>{estadisticas.totalPedidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-yellow-600' />
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Pendientes</p>
                    <p className='text-xl sm:text-2xl font-bold text-yellow-600'>{estadisticas.pendientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <AlertCircle className='h-4 w-4 text-blue-600' />
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Confirmados</p>
                    <p className='text-xl sm:text-2xl font-bold text-blue-600'>{estadisticas.confirmados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Completados</p>
                    <p className='text-xl sm:text-2xl font-bold text-green-600'>{estadisticas.completados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className='col-span-2 sm:col-span-1'>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-lg'>💰</span>
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Ventas Total</p>
                    <p className='text-xl sm:text-2xl font-bold'>${estadisticas.ventasTotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabla principal de pedidos */}
          <Card>
            <CardHeader>
              <div className='space-y-4'>
                <CardTitle className='text-lg sm:text-xl'>Lista de Pedidos</CardTitle>

                {/* Búsqueda móvil */}
                <div className='sm:hidden'>
                  <SearchComponent />
                </div>

                {/* Filtros */}
                <div className='flex flex-col gap-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex flex-col sm:flex-row gap-2'>
                      <Select value={filtroFecha} onValueChange={setFiltroFecha}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Filtrar por fecha" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">📅 Todos los períodos</SelectItem>
                          <SelectItem value="hoy">🕐 Hoy</SelectItem>
                          <SelectItem value="ayer">📆 Ayer</SelectItem>
                          <SelectItem value="7dias">📊 Últimos 7 días</SelectItem>
                          <SelectItem value="28dias">📈 Últimos 28 días</SelectItem>
                          <SelectItem value="año">🗓️ Este año</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">🔍 Todos los estados</SelectItem>
                          <SelectItem value="pendiente">🕒 Pendientes</SelectItem>
                          <SelectItem value="confirmado">⚡ Confirmados</SelectItem>
                          <SelectItem value="completado">✅ Completados</SelectItem>
                          <SelectItem value="rechazado">❌ Rechazados</SelectItem>
                        </SelectContent>
                      </Select>

                      {(filtroFecha !== 'todos' || filtroEstado !== 'todos') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFiltroFecha('todos')
                            setFiltroEstado('todos')
                          }}
                          className="whitespace-nowrap"
                        >
                          🗑️ Limpiar filtros
                        </Button>
                      )}
                    </div>

                    <div className='relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input
                        placeholder='Buscar pedidos...'
                        className='pl-8 w-full sm:w-[200px] lg:w-[250px]'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Indicador de filtros activos */}
                  {(filtroFecha !== 'todos' || filtroEstado !== 'todos' || searchTerm) && (
                    <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                      <span>Filtros activos:</span>
                      {filtroFecha !== 'todos' && (
                        <Badge variant="secondary" className="text-xs">
                          📅 {filtroFecha === 'hoy' ? 'Hoy' :
                            filtroFecha === 'ayer' ? 'Ayer' :
                              filtroFecha === '7dias' ? 'Últimos 7 días' :
                                filtroFecha === '28dias' ? 'Últimos 28 días' :
                                  filtroFecha === 'año' ? 'Este año' : filtroFecha}
                        </Badge>
                      )}
                      {filtroEstado !== 'todos' && (
                        <Badge variant="secondary" className="text-xs">
                          {filtroEstado === 'pendiente' ? '🕒 Pendientes' :
                            filtroEstado === 'confirmado' ? '⚡ Confirmados' :
                              filtroEstado === 'completado' ? '✅ Completados' :
                                filtroEstado === 'rechazado' ? '❌ Rechazados' : filtroEstado}
                        </Badge>
                      )}
                      {searchTerm && (
                        <Badge variant="secondary" className="text-xs">
                          🔍 "{searchTerm}"
                        </Badge>
                      )}
                      <span className="text-primary font-medium">
                        ({pedidosFiltrados.length} resultados)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='min-w-[100px]'>ID</TableHead>
                      <TableHead className='min-w-[100px]'>Estado</TableHead>
                      <TableHead className='min-w-[120px]'>Fecha Pedido</TableHead>
                      <TableHead className='min-w-[150px]'>Producto</TableHead>
                      <TableHead className='min-w-[150px]'>Cliente</TableHead>
                      <TableHead className='min-w-[100px]'>Precio</TableHead>
                      <TableHead className='min-w-[120px]'>Teléfono Cliente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.length > 0 ? (
                      pedidosFiltrados.map((pedido) => {
                        const estadoConfig = estadosConfig[pedido.estado as keyof typeof estadosConfig]
                        const IconoEstado = estadoConfig?.icon || AlertCircle
                        const pedidoId = pedido.id || 'Sin ID'

                        return (
                          <TableRow key={pedido.id || Math.random()}>
                            <TableCell className='font-medium'>
                              {pedidoId.length > 8 ? `${pedidoId.slice(0, 8)}...` : pedidoId}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={estadoConfig?.color || 'bg-gray-100 text-gray-800'}>
                                <IconoEstado className='h-3 w-3 mr-1' />
                                {estadoConfig?.label || pedido.estado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-1'>
                                <Calendar className='h-3 w-3 text-muted-foreground' />
                                <span className='text-sm'>{formatearFecha(pedido.created_at)}</span>
                              </div>
                            </TableCell>
                            <TableCell className='font-medium'>
                              {pedido.productos?.nombre || 'Producto no disponible'}
                            </TableCell>
                            <TableCell>
                              <div className='text-sm'>
                                <div className='font-medium'>
                                  {pedido.nombre_cliente || 'Cliente no disponible'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className='font-medium'>
                              ${pedido.precio.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {pedido.telefono_cliente ? (
                                <div
                                  className='flex items-center space-x-2 cursor-pointer hover:bg-green-50 p-2 rounded-md transition-colors'
                                  onClick={() => abrirWhatsApp(pedido.telefono_cliente)}
                                  title="Abrir en WhatsApp"
                                >
                                  <Phone className='h-4 w-4 text-green-600' />
                                  <span className='text-sm font-medium text-green-600 hover:underline'>
                                    {pedido.telefono_cliente}
                                  </span>
                                </div>
                              ) : (
                                <span className='text-muted-foreground text-sm'>Sin teléfono</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className='h-24 text-center'>
                          <div className='flex flex-col items-center space-y-2'>
                            <Package className='h-8 w-8 text-muted-foreground' />
                            <p className='text-muted-foreground'>No se encontraron pedidos con los filtros aplicados</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFiltroFecha('todos')
                                setFiltroEstado('todos')
                                setSearchTerm('')
                              }}
                            >
                              Limpiar filtros
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de productos más vendidos */}
          {productosMasVendidosArray.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg sm:text-xl'>Productos Más Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='min-w-[200px]'>Producto</TableHead>
                        <TableHead className='min-w-[100px]'>Ventas</TableHead>
                        <TableHead className='min-w-[100px]'>Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosMasVendidosArray.map((producto, index) => (
                        <TableRow key={producto.producto}>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              <span className='flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium'>
                                {index + 1}
                              </span>
                              <span className='font-medium'>{producto.producto}</span>
                            </div>
                          </TableCell>
                          <TableCell className='font-medium'>{producto.ventas}</TableCell>
                          <TableCell className='font-medium'>${producto.monto.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </>
  )
}
