import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MoreHorizontal, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Clipboard,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Search as SearchComponent } from '@/components/search'
import { Main } from '@/components/layout/main'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Tipos y esquemas para pedidos
interface Pedido {
  id: string
  estado: 'pendiente' | 'procesando' | 'entregado' | 'cancelado'
  fechaPedido: string
  producto: string
  cuentaEmail: string
  cuentaClave: string
  cuentaUrl: string
  perfil: string
  pin: string
  cliente?: string
  total?: number
  metodoPago?: string
}

// Tipo para productos más vendidos
interface ProductoMasVendido {
  producto: string
  ventas: number
  monto: number
}

// Datos de ejemplo para pedidos con la nueva estructura
const pedidosData: Pedido[] = [
  {
    id: 'PED-001',
    estado: 'entregado',
    fechaPedido: '2024-01-20',
    producto: 'Netflix Premium 4K',
    cuentaEmail: 'netflix.premium01@ejemplo.com',
    cuentaClave: 'NetflixPass123',
    cuentaUrl: 'https://netflix.com',
    perfil: 'Perfil Principal',
    pin: '1234',
    cliente: 'Juan Pérez',
    total: 15.99,
    metodoPago: 'Transferencia'
  },
  {
    id: 'PED-002',
    estado: 'procesando',
    fechaPedido: '2024-01-20',
    producto: 'Spotify Premium Individual',
    cuentaEmail: 'spotify.user02@ejemplo.com',
    cuentaClave: 'SpotifyMusic456',
    cuentaUrl: 'https://spotify.com',
    perfil: '',
    pin: '',
    cliente: 'María García',
    total: 9.99,
    metodoPago: 'Tarjeta'
  },
  {
    id: 'PED-003',
    estado: 'pendiente',
    fechaPedido: '2024-01-19',
    producto: 'Disney+ Bundle',
    cuentaEmail: 'disney.family03@ejemplo.com',
    cuentaClave: 'DisneyMagic789',
    cuentaUrl: 'https://disneyplus.com',
    perfil: 'Perfil Familiar',
    pin: '5678',
    cliente: 'Carlos López',
    total: 12.99,
    metodoPago: 'Pago móvil'
  },
  {
    id: 'PED-004',
    estado: 'entregado',
    fechaPedido: '2024-01-18',
    producto: 'HBO Max Premium',
    cuentaEmail: 'hbo.premium04@ejemplo.com',
    cuentaClave: 'HBOMaxSecure321',
    cuentaUrl: 'https://hbomax.com',
    perfil: 'Principal',
    pin: '9999',
    cliente: 'Ana Rodríguez',
    total: 14.99,
    metodoPago: 'Transferencia'
  },
  {
    id: 'PED-005',
    estado: 'entregado',
    fechaPedido: '2024-01-15',
    producto: 'YouTube Premium Familiar',
    cuentaEmail: 'youtube.family05@ejemplo.com',
    cuentaClave: 'YouTubePrem654',
    cuentaUrl: 'https://youtube.com/premium',
    perfil: 'Familiar',
    pin: '1111',
    cliente: 'Luis Martín',
    total: 17.99,
    metodoPago: 'Efectivo'
  },
  {
    id: 'PED-006',
    estado: 'entregado',
    fechaPedido: '2024-01-10',
    producto: 'Netflix Premium 4K',
    cuentaEmail: 'netflix.premium06@ejemplo.com',
    cuentaClave: 'NetflixUltra987',
    cuentaUrl: 'https://netflix.com',
    perfil: 'Perfil Personal',
    pin: '2222',
    cliente: 'Carmen Silva',
    total: 15.99,
    metodoPago: 'Tarjeta'
  },
  {
    id: 'PED-007',
    estado: 'entregado',
    fechaPedido: '2024-01-05',
    producto: 'Spotify Premium Individual',
    cuentaEmail: 'spotify.music07@ejemplo.com',
    cuentaClave: 'SpotifyPro333',
    cuentaUrl: 'https://spotify.com',
    perfil: '',
    pin: '',
    cliente: 'Roberto Díaz',
    total: 9.99,
    metodoPago: 'Transferencia'
  }
]

// Datos para productos más vendidos
const productosMasVendidos: ProductoMasVendido[] = [
  {
    producto: 'Netflix Premium 4K',
    ventas: 15,
    monto: 239.85
  },
  {
    producto: 'Spotify Premium Individual',
    ventas: 12,
    monto: 119.88
  },
  {
    producto: 'Disney+ Bundle',
    ventas: 8,
    monto: 103.92
  },
  {
    producto: 'YouTube Premium Familiar',
    ventas: 6,
    monto: 107.94
  },
  {
    producto: 'HBO Max Premium',
    ventas: 5,
    monto: 74.95
  }
]

// Mapeo de estados con colores
const estadosConfig = {
  pendiente: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  procesando: {
    label: 'Procesando',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: AlertCircle
  },
  entregado: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  cancelado: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  }
}

// Función para filtrar por fechas
const filtrarPorFecha = (pedidos: Pedido[], filtro: string) => {
  const hoy = new Date()
  const ayer = new Date(hoy)
  ayer.setDate(hoy.getDate() - 1)
  
  switch (filtro) {
    case 'hoy':
      return pedidos.filter(p => {
        const fechaPedido = new Date(p.fechaPedido)
        return fechaPedido.toDateString() === hoy.toDateString()
      })
    case 'ayer':
      return pedidos.filter(p => {
        const fechaPedido = new Date(p.fechaPedido)
        return fechaPedido.toDateString() === ayer.toDateString()
      })
    case '7dias': {
      const hace7Dias = new Date(hoy)
      hace7Dias.setDate(hoy.getDate() - 7)
      return pedidos.filter(p => new Date(p.fechaPedido) >= hace7Dias)
    }
    case '28dias': {
      const hace28Dias = new Date(hoy)
      hace28Dias.setDate(hoy.getDate() - 28)
      return pedidos.filter(p => new Date(p.fechaPedido) >= hace28Dias)
    }
    case 'año': {
      const inicioAño = new Date(hoy.getFullYear(), 0, 1)
      return pedidos.filter(p => new Date(p.fechaPedido) >= inicioAño)
    }
    default:
      return pedidos
  }
}

export function PedidosPage() {
  const [filtroFecha, setFiltroFecha] = useState('todos')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroMasVendidos, setFiltroMasVendidos] = useState('cantidad')

  // Aplicar filtros de fecha y estado
  const pedidosFiltrados = filtrarPorFecha(pedidosData, filtroFecha).filter(pedido => {
    if (filtroEstado === 'todos') return true
    return pedido.estado === filtroEstado
  })

  // Ordenar productos más vendidos según el filtro
  const productosMasVendidosOrdenados = [...productosMasVendidos].sort((a, b) => {
    if (filtroMasVendidos === 'cantidad') {
      return b.ventas - a.ventas
    } else {
      return b.monto - a.monto
    }
  })

  // Estadísticas
  const estadisticas = {
    totalPedidos: pedidosFiltrados.length,
    pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
    procesando: pedidosFiltrados.filter(p => p.estado === 'procesando').length,
    entregados: pedidosFiltrados.filter(p => p.estado === 'entregado').length,
    cancelados: pedidosFiltrados.filter(p => p.estado === 'cancelado').length,
    ventasTotal: pedidosFiltrados.reduce((total, pedido) => total + (pedido.total || 0), 0)
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-2 overflow-x-auto'>
          <div className='hidden sm:block'>
            <SearchComponent />
          </div>
          <Button variant="outline" size="sm" className='whitespace-nowrap'>
            <Filter className="h-4 w-4 mr-2" />
            <span className='hidden sm:inline'>Filtros</span>
          </Button>
          <Button variant="outline" size="sm" className='whitespace-nowrap'>
            <Download className="h-4 w-4 mr-2" />
            <span className='hidden sm:inline'>Exportar</span>
          </Button>
          <Button size="sm" className='whitespace-nowrap'>
            <Plus className="h-4 w-4 mr-2" />
            <span className='hidden sm:inline'>Nuevo Pedido</span>
            <span className='sm:hidden'>Nuevo</span>
          </Button>
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
                    <p className='text-xs sm:text-sm font-medium'>Procesando</p>
                    <p className='text-xl sm:text-2xl font-bold text-blue-600'>{estadisticas.procesando}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <div className='space-y-1'>
                    <p className='text-xs sm:text-sm font-medium'>Entregados</p>
                    <p className='text-xl sm:text-2xl font-bold text-green-600'>{estadisticas.entregados}</p>
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
                          <SelectItem value="procesando">⚡ Procesando</SelectItem>
                          <SelectItem value="entregado">✅ Entregados</SelectItem>
                          <SelectItem value="cancelado">❌ Cancelados</SelectItem>
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
                      />
                    </div>
                  </div>
                  
                  {/* Indicador de filtros activos */}
                  {(filtroFecha !== 'todos' || filtroEstado !== 'todos') && (
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
                           filtroEstado === 'procesando' ? '⚡ Procesando' :
                           filtroEstado === 'entregado' ? '✅ Entregados' :
                           filtroEstado === 'cancelado' ? '❌ Cancelados' : filtroEstado}
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
                      <TableHead className='min-w-[200px]'>Cuenta Email</TableHead>
                      <TableHead className='min-w-[120px]'>Cuenta Clave</TableHead>
                      <TableHead className='min-w-[150px]'>Cuenta URL</TableHead>
                      <TableHead className='min-w-[120px]'>Perfil</TableHead>
                      <TableHead className='min-w-[80px]'>PIN</TableHead>
                      <TableHead className='min-w-[80px]'>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.length > 0 ? (
                      pedidosFiltrados.map((pedido) => {
                        const estadoConfig = estadosConfig[pedido.estado]
                        const IconoEstado = estadoConfig.icon
                        return (
                          <TableRow key={pedido.id}>
                            <TableCell className='font-medium'>{pedido.id}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={estadoConfig.color}>
                                <IconoEstado className='h-3 w-3 mr-1' />
                                {estadoConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-1'>
                                <Calendar className='h-3 w-3 text-muted-foreground' />
                                <span className='text-sm'>{pedido.fechaPedido}</span>
                              </div>
                            </TableCell>
                            <TableCell className='font-medium'>{pedido.producto}</TableCell>
                            <TableCell className='font-mono text-sm'>{pedido.cuentaEmail}</TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-2'>
                                <span className='font-mono text-sm'>{'*'.repeat(8)}</span>
                                <EyeOff className='h-3 w-3 text-muted-foreground' />
                              </div>
                            </TableCell>
                            <TableCell>
                              {pedido.cuentaUrl ? (
                                <a 
                                  href={pedido.cuentaUrl} 
                                  target='_blank' 
                                  rel='noopener noreferrer' 
                                  className='text-blue-600 hover:underline text-sm'
                                >
                                  {pedido.cuentaUrl}
                                </a>
                              ) : (
                                <span className='text-muted-foreground text-sm'>—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {pedido.perfil || <span className='text-muted-foreground text-sm'>—</span>}
                            </TableCell>
                            <TableCell>
                              {pedido.pin ? (
                                <span className='font-mono text-sm'>{'*'.repeat(4)}</span>
                              ) : (
                                <span className='text-muted-foreground text-sm'>—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Clipboard className="mr-2 h-4 w-4" />
                                    Copiar datos
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Marcar como entregado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar pedido
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className='h-24 text-center'>
                          <div className='flex flex-col items-center space-y-2'>
                            <Package className='h-8 w-8 text-muted-foreground' />
                            <p className='text-muted-foreground'>No se encontraron pedidos con los filtros aplicados</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setFiltroFecha('todos')
                                setFiltroEstado('todos')
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
          <Card>
            <CardHeader>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <CardTitle className='text-lg sm:text-xl'>Productos Más Vendidos</CardTitle>
                <div className='flex gap-2'>
                  <Button 
                    size="sm" 
                    variant={filtroMasVendidos === 'cantidad' ? 'default' : 'outline'}
                    onClick={() => setFiltroMasVendidos('cantidad')}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Por Cantidad
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filtroMasVendidos === 'monto' ? 'default' : 'outline'}
                    onClick={() => setFiltroMasVendidos('monto')}
                  >
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Por Monto
                  </Button>
                </div>
              </div>
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
                    {productosMasVendidosOrdenados.map((producto, index) => (
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
        </div>
      </Main>
    </>
  )
}
