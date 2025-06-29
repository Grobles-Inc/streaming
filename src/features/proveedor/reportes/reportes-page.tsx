import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Download, TrendingUp, TrendingDown, DollarSign, Package, Users, Activity, AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { Main } from '@/components/layout/main'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Tooltip
} from 'recharts'
import { useReportesData } from './hooks/useReportesData'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

export function ReportesPage() {
  const {
    ventasPorMes,
    productosPopulares,
    ventasRecientes,
    inventario,
    gananciasProductos,
    metricas,
    error,
    refreshData
  } = useReportesData()



  if (error) {
    return (
      <>
        <Header>
          <div className='ml-auto flex items-center space-x-4'>
            <Search />
            <Button variant="outline" size="sm" onClick={refreshData}>
              Reintentar
            </Button>
          </div>
        </Header>
        <Main>
          <Alert variant="destructive" className="max-w-md mx-auto mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Main>
      </>
    )
  }

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
              <Button variant="outline" size="sm" onClick={refreshData}>
                Actualizar
              </Button>
            </div>
          </div>

          {/* Métricas principales */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {metricas.map((metrica, index) => {
              const iconMap = {
                'Ventas Totales': DollarSign,
                'Productos Vendidos': Package,
                'Clientes Únicos': Users,
                'Tasa Conversión': Activity
              }
              const Icon = iconMap[metrica.titulo as keyof typeof iconMap] || Activity
              
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
              <TabsTrigger value="inventario">Inventario</TabsTrigger>
              <TabsTrigger value="ganancias">Ganancias</TabsTrigger>
            </TabsList>

            <TabsContent value="ventas" className="space-y-4">
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución de Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ventasPorMes.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={ventasPorMes}>
                          <XAxis dataKey='mes' />
                          <YAxis />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'ingresos' ? `$${Number(value).toLocaleString('es-ES')}` : value,
                              name === 'ingresos' ? 'Ingresos' : 'Ventas'
                            ]}
                          />
                          <Line 
                            type='monotone' 
                            dataKey='ingresos' 
                            stroke='#10b981' 
                            strokeWidth={2}
                            dot={{ fill: '#10b981' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
                        No hay datos de ventas disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Productos Vendidos por Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ventasPorMes.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={ventasPorMes}>
                          <XAxis dataKey='mes' />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey='productos_vendidos' fill='#3b82f6' radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
                        No hay datos de productos vendidos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Ventas Recientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Ventas Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  {ventasRecientes.length > 0 ? (
                    <div className='space-y-3'>
                      {ventasRecientes.slice(0, 8).map((venta) => (
                        <div key={venta.id} className='flex items-center justify-between p-3 border rounded-lg'>
                          <div className='space-y-1'>
                            <p className='text-sm font-medium'>{venta.producto_nombre}</p>
                            <p className='text-xs text-muted-foreground'>
                              Cliente: {venta.cliente_nombre}
                            </p>
                            <p className='text-xs text-muted-foreground'>{venta.fecha}</p>
                          </div>
                          <div className='text-right space-y-1'>
                            <p className='text-sm font-medium'>${venta.precio.toFixed(2)}</p>
                            <Badge variant={venta.estado === 'completada' ? 'default' : 'secondary'}>
                              {venta.estado}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      No hay ventas recientes
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productos" className="space-y-4">
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Populares</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productosPopulares.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <PieChart>
                          <Pie
                            data={productosPopulares}
                            cx='50%'
                            cy='50%'
                            outerRadius={80}
                            fill='#8884d8'
                            dataKey='ventas'
                            label={({ nombre, ventas }) => `${nombre}: ${ventas}`}
                          >
                            {productosPopulares.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} ventas`, 'Cantidad']} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='flex items-center justify-center h-[300px] text-muted-foreground'>
                        No hay datos de productos disponibles
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Productos por Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productosPopulares.length > 0 ? (
                      <div className='space-y-3'>
                        {productosPopulares.slice(0, 6).map((producto, index) => (
                          <div key={producto.id} className='flex items-center justify-between p-3 border rounded-lg'>
                            <div className='flex items-center space-x-3'>
                              <div 
                                className='w-4 h-4 rounded-full' 
                                style={{ backgroundColor: producto.color || COLORS[index % COLORS.length] }}
                              />
                              <div>
                                <p className='text-sm font-medium'>{producto.nombre}</p>
                                <p className='text-xs text-muted-foreground'>{producto.ventas} ventas</p>
                              </div>
                            </div>
                            <p className='text-sm font-medium'>${producto.ingresos.toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-8 text-muted-foreground'>
                        No hay productos para mostrar
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="inventario" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Estado del Inventario</CardTitle>
                </CardHeader>
                <CardContent>
                  {inventario.length > 0 ? (
                    <div className='space-y-4'>
                      {inventario.map((item) => (
                        <div key={item.producto_id} className='p-4 border rounded-lg'>
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-medium'>{item.producto_nombre}</h4>
                            <Badge variant="outline">{item.categoria}</Badge>
                          </div>
                          <div className='grid grid-cols-3 gap-4 text-sm'>
                            <div className='text-center'>
                              <p className='text-2xl font-bold text-green-600'>{item.stock_disponible}</p>
                              <p className='text-muted-foreground'>Disponible</p>
                            </div>
                            <div className='text-center'>
                              <p className='text-2xl font-bold text-red-600'>{item.stock_vendido}</p>
                              <p className='text-muted-foreground'>Vendido</p>
                            </div>
                            <div className='text-center'>
                              <p className='text-2xl font-bold text-blue-600'>{item.total_stock}</p>
                              <p className='text-muted-foreground'>Total</p>
                            </div>
                          </div>
                          {item.total_stock > 0 && (
                            <div className='mt-3'>
                              <div className='flex justify-between text-xs mb-1'>
                                <span>Stock vendido</span>
                                <span>{((item.stock_vendido / item.total_stock) * 100).toFixed(1)}%</span>
                              </div>
                              <div className='w-full bg-gray-200 rounded-full h-2'>
                                <div 
                                  className='bg-blue-600 h-2 rounded-full' 
                                  style={{ width: `${(item.stock_vendido / item.total_stock) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      No hay productos en inventario
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ganancias" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análisis de Ganancias por Producto</CardTitle>
                </CardHeader>
                <CardContent>
                  {gananciasProductos.length > 0 ? (
                    <div className='space-y-4'>
                      {gananciasProductos.slice(0, 10).map((producto) => (
                        <div key={producto.producto_id} className='p-4 border rounded-lg'>
                          <div className='flex items-center justify-between mb-3'>
                            <h4 className='font-medium'>{producto.producto_nombre}</h4>
                            <div className='text-right'>
                              <p className='text-lg font-bold text-green-600'>
                                ${producto.ganancias_totales.toFixed(2)}
                              </p>
                              <p className='text-xs text-muted-foreground'>Ganancias totales</p>
                            </div>
                          </div>
                          <div className='grid grid-cols-4 gap-4 text-sm'>
                            <div>
                              <p className='text-muted-foreground'>Precio Público</p>
                              <p className='font-medium'>${producto.precio_publico.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>Precio Vendedor</p>
                              <p className='font-medium'>${producto.precio_vendedor.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>Margen</p>
                              <p className='font-medium text-green-600'>${producto.margen.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className='text-muted-foreground'>Ventas</p>
                              <p className='font-medium'>{producto.ventas_cantidad}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8 text-muted-foreground'>
                      No hay datos de ganancias disponibles
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Main>
    </>
  )
}
