import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Download, TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Activity } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip
} from 'recharts'

// Datos de ejemplo para reportes
const ventasData = [
  { mes: 'Ene', ventas: 12500, productos: 87 },
  { mes: 'Feb', ventas: 15800, productos: 102 },
  { mes: 'Mar', ventas: 18300, productos: 125 },
  { mes: 'Abr', ventas: 16700, productos: 113 },
  { mes: 'May', ventas: 21400, productos: 143 },
  { mes: 'Jun', ventas: 24600, productos: 168 },
]

const productosPopulares = [
  { name: 'Netflix Premium', value: 35, color: '#0088FE' },
  { name: 'Spotify Family', value: 28, color: '#00C49F' },
  { name: 'Disney+', value: 20, color: '#FFBB28' },
  { name: 'Amazon Prime', value: 17, color: '#FF8042' },
]

const ventasRecientes = [
  { id: 1, producto: 'Netflix Premium', cliente: 'Juan Pérez', monto: 15.99, fecha: '2024-01-15', estado: 'Completada' },
  { id: 2, producto: 'Spotify Family', cliente: 'María García', monto: 9.99, fecha: '2024-01-15', estado: 'Completada' },
  { id: 3, producto: 'Disney+', cliente: 'Carlos López', monto: 8.99, fecha: '2024-01-14', estado: 'Pendiente' },
  { id: 4, producto: 'Amazon Prime', cliente: 'Ana Rodríguez', monto: 12.99, fecha: '2024-01-14', estado: 'Completada' },
  { id: 5, producto: 'HBO Max', cliente: 'Luis Martín', monto: 14.99, fecha: '2024-01-13', estado: 'Completada' },
]

const metricas = [
  {
    titulo: 'Ventas Totales',
    valor: '$24,600',
    cambio: '+12.3%',
    tendencia: 'up',
    icono: DollarSign,
    descripcion: 'vs mes anterior'
  },
  {
    titulo: 'Productos Vendidos',
    valor: '168',
    cambio: '+8.1%',
    tendencia: 'up',
    icono: Package,
    descripcion: 'este mes'
  },
  {
    titulo: 'Clientes Activos',
    valor: '342',
    cambio: '+5.4%',
    tendencia: 'up',
    icono: Users,
    descripcion: 'usuarios únicos'
  },
  {
    titulo: 'Conversión',
    valor: '68.2%',
    cambio: '-2.1%',
    tendencia: 'down',
    icono: Activity,
    descripcion: 'tasa de éxito'
  },
]

export function ReportesPage() {
  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Header>
      <Main>
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>Reportes</h1>
              <p className='text-muted-foreground'>
                Analiza el rendimiento de tus productos y ventas
              </p>
            </div>
            <div className='flex items-center space-x-2'>
              <Button variant="outline" size="sm">
                <CalendarDays className="h-4 w-4 mr-2" />
                Últimos 30 días
              </Button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {metricas.map((metrica, index) => {
              const Icon = metrica.icono
              return (
                <Card key={index}>
                  <CardContent className='p-6'>
                    <div className='flex items-center justify-between space-y-0 pb-2'>
                      <p className='text-sm font-medium'>{metrica.titulo}</p>
                      <Icon className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-2xl font-bold'>{metrica.valor}</p>
                      <div className='flex items-center text-xs'>
                        {metrica.tendencia === 'up' ? (
                          <TrendingUp className='h-3 w-3 text-green-500 mr-1' />
                        ) : (
                          <TrendingDown className='h-3 w-3 text-red-500 mr-1' />
                        )}
                        <span className={metrica.tendencia === 'up' ? 'text-green-500' : 'text-red-500'}>
                          {metrica.cambio}
                        </span>
                        <span className='text-muted-foreground ml-1'>{metrica.descripcion}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Gráficos y análisis */}
          <Tabs defaultValue="ventas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="ventas">Ventas</TabsTrigger>
              <TabsTrigger value="productos">Productos</TabsTrigger>
              <TabsTrigger value="clientes">Clientes</TabsTrigger>
            </TabsList>

            <TabsContent value="ventas" className="space-y-4">
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución de Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <LineChart data={ventasData}>
                        <XAxis dataKey='mes' />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type='monotone' 
                          dataKey='ventas' 
                          stroke='#10b981' 
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Productos Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <BarChart data={ventasData}>
                        <XAxis dataKey='mes' />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey='productos' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="productos" className="space-y-4">
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Populares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width='100%' height={300}>
                      <PieChart>
                        <Pie
                          data={productosPopulares}
                          cx='50%'
                          cy='50%'
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {productosPopulares.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ventas Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {ventasRecientes.slice(0, 5).map((venta) => (
                        <div key={venta.id} className='flex items-center justify-between p-3 border rounded-lg'>
                          <div className='space-y-1'>
                            <p className='text-sm font-medium'>{venta.producto}</p>
                            <p className='text-xs text-muted-foreground'>{venta.cliente}</p>
                          </div>
                          <div className='text-right space-y-1'>
                            <p className='text-sm font-medium'>${venta.monto}</p>
                            <Badge variant={venta.estado === 'Completada' ? 'default' : 'secondary'}>
                              {venta.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="clientes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='text-center p-4 border rounded-lg'>
                      <p className='text-2xl font-bold text-blue-600'>342</p>
                      <p className='text-sm text-muted-foreground'>Clientes Totales</p>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <p className='text-2xl font-bold text-green-600'>89</p>
                      <p className='text-sm text-muted-foreground'>Nuevos este mes</p>
                    </div>
                    <div className='text-center p-4 border rounded-lg'>
                      <p className='text-2xl font-bold text-purple-600'>78%</p>
                      <p className='text-sm text-muted-foreground'>Retención</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
