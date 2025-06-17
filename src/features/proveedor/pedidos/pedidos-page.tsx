import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
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
  User,
  Eye,
  Edit
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
  producto: string
  cliente: string
  email: string
  telefono: string
  cantidad: number
  precio: number
  total: number
  fechaPedido: string
  fechaEntrega: string
  estado: 'pendiente' | 'procesando' | 'entregado' | 'cancelado'
  metodoPago: string
  notas?: string
}

// Datos de ejemplo para pedidos
const pedidosData: Pedido[] = [
  {
    id: 'PED-001',
    producto: 'Netflix Premium 4K',
    cliente: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '+51 987 654 321',
    cantidad: 1,
    precio: 15.99,
    total: 15.99,
    fechaPedido: '2024-01-15',
    fechaEntrega: '2024-01-16',
    estado: 'entregado',
    metodoPago: 'Transferencia',
    notas: 'Entrega inmediata solicitada'
  },
  {
    id: 'PED-002',
    producto: 'Spotify Family',
    cliente: 'María García',
    email: 'maria.garcia@email.com',
    telefono: '+51 987 654 322',
    cantidad: 2,
    precio: 9.99,
    total: 19.98,
    fechaPedido: '2024-01-14',
    fechaEntrega: '2024-01-15',
    estado: 'procesando',
    metodoPago: 'Tarjeta de crédito'
  },
  {
    id: 'PED-003',
    producto: 'Disney+ Bundle',
    cliente: 'Carlos López',
    email: 'carlos.lopez@email.com',
    telefono: '+51 987 654 323',
    cantidad: 1,
    precio: 12.99,
    total: 12.99,
    fechaPedido: '2024-01-13',
    fechaEntrega: '2024-01-14',
    estado: 'pendiente',
    metodoPago: 'Pago móvil'
  },
  {
    id: 'PED-004',
    producto: 'HBO Max',
    cliente: 'Ana Rodríguez',
    email: 'ana.rodriguez@email.com',
    telefono: '+51 987 654 324',
    cantidad: 1,
    precio: 14.99,
    total: 14.99,
    fechaPedido: '2024-01-12',
    fechaEntrega: '2024-01-13',
    estado: 'cancelado',
    metodoPago: 'Transferencia',
    notas: 'Cliente solicitó cancelación'
  },
  {
    id: 'PED-005',
    producto: 'YouTube Premium',
    cliente: 'Luis Martín',
    email: 'luis.martin@email.com',
    telefono: '+51 987 654 325',
    cantidad: 3,
    precio: 17.99,
    total: 53.97,
    fechaPedido: '2024-01-11',
    fechaEntrega: '2024-01-12',
    estado: 'entregado',
    metodoPago: 'Efectivo'
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

// Estadísticas de resumen
const estadisticas = {
  totalPedidos: pedidosData.length,
  pendientes: pedidosData.filter(p => p.estado === 'pendiente').length,
  procesando: pedidosData.filter(p => p.estado === 'procesando').length,
  entregados: pedidosData.filter(p => p.estado === 'entregado').length,
  cancelados: pedidosData.filter(p => p.estado === 'cancelado').length,
  ventasTotal: pedidosData.reduce((total, pedido) => total + pedido.total, 0)
}

export function PedidosPage() {
  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <SearchComponent />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pedido
          </Button>
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Gestión de Pedidos</h1>
              <p className='text-muted-foreground'>
                Administra todos los pedidos de tus productos de streaming
              </p>
            </div>
          </div>

          {/* Estadísticas de resumen */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Package className='h-4 w-4 text-muted-foreground' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Total Pedidos</p>
                    <p className='text-2xl font-bold'>{estadisticas.totalPedidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-yellow-600' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Pendientes</p>
                    <p className='text-2xl font-bold text-yellow-600'>{estadisticas.pendientes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <AlertCircle className='h-4 w-4 text-blue-600' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Procesando</p>
                    <p className='text-2xl font-bold text-blue-600'>{estadisticas.procesando}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Entregados</p>
                    <p className='text-2xl font-bold text-green-600'>{estadisticas.entregados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <span className='text-lg'>💰</span>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Ventas Total</p>
                    <p className='text-2xl font-bold'>${estadisticas.ventasTotal.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pestañas de navegación */}
          <Tabs defaultValue="todos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="todos">Todos los Pedidos</TabsTrigger>
              <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
              <TabsTrigger value="procesando">Procesando</TabsTrigger>
              <TabsTrigger value="entregados">Entregados</TabsTrigger>
            </TabsList>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>Lista de Pedidos</CardTitle>
                  <div className='flex items-center space-x-2'>
                    <div className='relative'>
                      <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                      <Input placeholder='Buscar pedidos...' className='pl-8 w-[250px]' />
                    </div>
                    <Select>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="procesando">Procesando</SelectItem>
                        <SelectItem value="entregado">Entregados</SelectItem>
                        <SelectItem value="cancelado">Cancelados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TabsContent value="todos" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pedido</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Fecha Pedido</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosData.map((pedido) => {
                        const estadoConfig = estadosConfig[pedido.estado]
                        const IconoEstado = estadoConfig.icon
                        return (
                          <TableRow key={pedido.id}>
                            <TableCell className='font-medium'>{pedido.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className='font-medium'>{pedido.producto}</p>
                                <p className='text-sm text-muted-foreground'>${pedido.precio}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className='font-medium'>{pedido.cliente}</p>
                                <p className='text-sm text-muted-foreground'>{pedido.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{pedido.cantidad}</TableCell>
                            <TableCell className='font-medium'>${pedido.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className='flex items-center space-x-1'>
                                <Calendar className='h-3 w-3 text-muted-foreground' />
                                <span className='text-sm'>{pedido.fechaPedido}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={estadoConfig.color}>
                                <IconoEstado className='h-3 w-3 mr-1' />
                                {estadoConfig.label}
                              </Badge>
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
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar pedido
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
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="pendientes" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pedido</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Fecha Pedido</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosData.filter(p => p.estado === 'pendiente').map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell className='font-medium'>{pedido.id}</TableCell>
                          <TableCell>{pedido.producto}</TableCell>
                          <TableCell>{pedido.cliente}</TableCell>
                          <TableCell>${pedido.total.toFixed(2)}</TableCell>
                          <TableCell>{pedido.fechaPedido}</TableCell>
                          <TableCell>
                            <div className='flex space-x-2'>
                              <Button size="sm" variant="outline">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Procesar
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="procesando" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pedido</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosData.filter(p => p.estado === 'procesando').map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell className='font-medium'>{pedido.id}</TableCell>
                          <TableCell>{pedido.producto}</TableCell>
                          <TableCell>{pedido.cliente}</TableCell>
                          <TableCell>${pedido.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className='flex items-center space-x-2'>
                              <div className='w-20 bg-gray-200 rounded-full h-2'>
                                <div className='bg-blue-600 h-2 rounded-full w-3/4'></div>
                              </div>
                              <span className='text-sm text-muted-foreground'>75%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button size="sm">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="entregados" className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pedido</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Fecha Entrega</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pedidosData.filter(p => p.estado === 'entregado').map((pedido) => (
                        <TableRow key={pedido.id}>
                          <TableCell className='font-medium'>{pedido.id}</TableCell>
                          <TableCell>{pedido.producto}</TableCell>
                          <TableCell>{pedido.cliente}</TableCell>
                          <TableCell>${pedido.total.toFixed(2)}</TableCell>
                          <TableCell>{pedido.fechaEntrega}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Ver detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
