import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  IconCoin, 
  IconPackage, 
  IconWallet, 
  IconTrendingUp,
  IconCalculator,
  IconPercentage,
  IconRefresh,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { 
  EstadisticasComisiones,
  ComisionPublicacion,
  ComisionRetiro,
  ComisionGeneral
} from '@/features/admin/mi-billetera/data/types'

export function EstadisticasComisiones() {
  const [estadisticas, setEstadisticas] = useState<EstadisticasComisiones>({
    totalComisionesPublicacion: 0,
    totalComisionesRetiro: 0,
    totalComisiones: 0,
    cantidadPublicaciones: 0,
    cantidadRetiros: 0,
    promedioComisionPublicacion: 0,
    promedioComisionRetiro: 0
  })
  const [comisionesPublicacion, setComisionesPublicacion] = useState<ComisionPublicacion[]>([])
  const [comisionesRetiro, setComisionesRetiro] = useState<ComisionRetiro[]>([])
  const [conversion, setConversion] = useState<number>(3.75) // Valor por defecto
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComisionesGlobales()
  }, [])

  const fetchComisionesGlobales = async () => {
    try {
      setLoading(true)
      
      // Obtener tasa de conversión
      const { data: configData } = await supabase
        .from('configuracion')
        .select('conversion')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (configData?.conversion) {
        setConversion(configData.conversion)
      }

      // Obtener comisiones de publicación (todas)
      const { data: productos, error: productosError } = await supabase
        .from('productos')
        .select(`
          id,
          nombre,
          precio_publico,
          estado,
          proveedor_id,
          updated_at,
          usuarios:proveedor_id (
            nombres,
            apellidos,
            usuario
          )
        `)
        .eq('estado', 'publicado')
        .order('updated_at', { ascending: false })

      if (productosError) throw productosError

      // Obtener configuración de comisiones para calcular
      const { data: configuraciones, error: configError } = await supabase
        .from('configuracion')
        .select('comision_publicacion_producto, updated_at')
        .order('updated_at', { ascending: false })

      if (configError) throw configError

      // Calcular comisiones de publicación
      const comisionesPublicacionCalculadas: ComisionPublicacion[] = productos?.map((producto) => {
        const configVigente = configuraciones?.find(config => 
          new Date(config.updated_at) <= new Date(producto.updated_at)
        ) || configuraciones?.[configuraciones.length - 1]

        const comisionEnDolares = configVigente?.comision_publicacion_producto || 0
        const porcentajeComision = producto.precio_publico > 0 ? (comisionEnDolares / producto.precio_publico) * 100 : 0
        const usuarioData = Array.isArray(producto.usuarios) ? producto.usuarios[0] : producto.usuarios

        return {
          id: `pub_${producto.id}`,
          producto_id: producto.id,
          proveedor_id: producto.proveedor_id,
          admin_id: 'admin',
          monto_comision: comisionEnDolares,
          porcentaje_comision: porcentajeComision,
          fecha_publicacion: producto.updated_at,
          producto: {
            nombre: producto.nombre,
            precio_publico: producto.precio_publico,
            estado: producto.estado
          },
          proveedor: {
            nombres: usuarioData?.nombres || '',
            apellidos: usuarioData?.apellidos || '',
            usuario: usuarioData?.usuario || ''
          },
          created_at: producto.updated_at
        }
      }) || []

      setComisionesPublicacion(comisionesPublicacionCalculadas)

      // TODO: Obtener comisiones de retiro (cuando se implementen)
      setComisionesRetiro([])

      // Calcular estadísticas
      const totalComisionesPublicacion = comisionesPublicacionCalculadas.reduce((sum, c) => sum + c.monto_comision, 0)
      const totalComisionesRetiro = 0 // Por ahora
      const totalComisiones = totalComisionesPublicacion + totalComisionesRetiro
      const cantidadPublicaciones = comisionesPublicacionCalculadas.length
      const cantidadRetiros = 0 // Por ahora
      const promedioComisionPublicacion = cantidadPublicaciones > 0 ? totalComisionesPublicacion / cantidadPublicaciones : 0
      const promedioComisionRetiro = 0 // Por ahora

      setEstadisticas({
        totalComisionesPublicacion,
        totalComisionesRetiro,
        totalComisiones,
        cantidadPublicaciones,
        cantidadRetiros,
        promedioComisionPublicacion,
        promedioComisionRetiro
      })

      // Combinar para vista general (opcional, para uso futuro)
      const generales: ComisionGeneral[] = [
        ...comisionesPublicacionCalculadas.map(c => ({
          id: c.id,
          tipo: 'publicacion' as const,
          usuario_id: c.proveedor_id,
          monto_base: c.producto.precio_publico,
          monto_comision: c.monto_comision,
          porcentaje_comision: c.porcentaje_comision,
          fecha_transaccion: c.fecha_publicacion,
          descripcion: `Comisión por publicación de ${c.producto.nombre}`,
          usuario: {
            nombres: c.proveedor.nombres,
            apellidos: c.proveedor.apellidos,
            usuario: c.proveedor.usuario
          },
          producto: {
            nombre: c.producto.nombre
          },
          created_at: c.created_at
        }))
      ]

      // Solo para posible uso futuro
      console.log('Comisiones generales calculadas:', generales.length)

    } catch (error) {
      console.error('Error al cargar comisiones globales:', error)
      toast.error('Error al cargar las comisiones')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, showSoles: boolean = false) => {
    if (showSoles) {
      return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN'
      }).format(amount * conversion)
    }
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportarDatos = () => {
    // TODO: Implementar exportación
    toast.info('Función de exportación en desarrollo')
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <IconLoader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = [
    {
      title: 'Total Comisiones',
      value: formatCurrency(estadisticas.totalComisiones),
      valueInSoles: formatCurrency(estadisticas.totalComisiones, true),
      description: `${estadisticas.cantidadPublicaciones + estadisticas.cantidadRetiros} transacciones`,
      icon: IconCoin,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Comisiones Publicación',
      value: formatCurrency(estadisticas.totalComisionesPublicacion),
      valueInSoles: formatCurrency(estadisticas.totalComisionesPublicacion, true),
      description: `${estadisticas.cantidadPublicaciones} publicaciones`,
      icon: IconPackage,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Comisiones Retiro',
      value: formatCurrency(estadisticas.totalComisionesRetiro),
      valueInSoles: formatCurrency(estadisticas.totalComisionesRetiro, true),
      description: `${estadisticas.cantidadRetiros} retiros`,
      icon: IconWallet,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Promedio General',
      value: formatCurrency((estadisticas.promedioComisionPublicacion + estadisticas.promedioComisionRetiro) / 2),
      valueInSoles: formatCurrency((estadisticas.promedioComisionPublicacion + estadisticas.promedioComisionRetiro) / 2, true),
      description: 'Por transacción',
      icon: IconTrendingUp,
      color: 'text-purple-600 dark:text-purple-400'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Estadísticas de Comisiones</h2>
          <p className="text-muted-foreground">
            Vista global de todas las comisiones del sistema (TC: S/. {conversion.toFixed(2)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchComisionesGlobales}
            disabled={loading}
          >
            {loading ? (
              <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <IconRefresh className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={exportarDatos}
          >
            <IconDownload className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.valueInSoles}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Detalles de comisiones */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="publicaciones">
            Publicaciones ({comisionesPublicacion.length})
          </TabsTrigger>
          <TabsTrigger value="retiros">
            Retiros ({comisionesRetiro.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Promedios por tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconCalculator className="h-4 w-4" />
                  Promedios por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <IconPackage className="h-3 w-3 mr-1" />
                      Publicación
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(estadisticas.promedioComisionPublicacion)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(estadisticas.promedioComisionPublicacion, true)}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      <IconWallet className="h-3 w-3 mr-1" />
                      Retiro
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(estadisticas.promedioComisionRetiro)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(estadisticas.promedioComisionRetiro, true)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribución porcentual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <IconPercentage className="h-4 w-4" />
                  Distribución de Ingresos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Publicaciones</span>
                    <span className="font-medium">
                      {estadisticas.totalComisiones > 0 
                        ? ((estadisticas.totalComisionesPublicacion / estadisticas.totalComisiones) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: estadisticas.totalComisiones > 0 
                          ? `${(estadisticas.totalComisionesPublicacion / estadisticas.totalComisiones) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Retiros</span>
                    <span className="font-medium">
                      {estadisticas.totalComisiones > 0 
                        ? ((estadisticas.totalComisionesRetiro / estadisticas.totalComisiones) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full" 
                      style={{ 
                        width: estadisticas.totalComisiones > 0 
                          ? `${(estadisticas.totalComisionesRetiro / estadisticas.totalComisiones) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="publicaciones">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Comisiones por Publicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 font-medium">Producto</th>
                      <th className="px-4 py-3 font-medium">Proveedor</th>
                      <th className="px-4 py-3 font-medium">Precio</th>
                      <th className="px-4 py-3 font-medium">Comisión (USD)</th>
                      <th className="px-4 py-3 font-medium">Comisión (PEN)</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comisionesPublicacion.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No hay comisiones de publicación registradas
                        </td>
                      </tr>
                    ) : (
                      comisionesPublicacion.map(comision => (
                        <tr key={comision.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3 font-medium">{comision.producto.nombre}</td>
                          <td className="px-4 py-3">
                            {comision.proveedor.nombres} {comision.proveedor.apellidos}
                            <div className="text-xs text-muted-foreground">@{comision.proveedor.usuario}</div>
                          </td>
                          <td className="px-4 py-3">{formatCurrency(comision.producto.precio_publico)}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            {formatCurrency(comision.monto_comision)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            {formatCurrency(comision.monto_comision, true)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(comision.fecha_publicacion)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retiros">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWallet className="h-5 w-5" />
                Comisiones por Retiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Las comisiones por retiro aún no están implementadas
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
