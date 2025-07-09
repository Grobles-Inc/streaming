import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { 
  IconCoin, 
  IconPackage, 
  IconWallet, 
  IconEye,
  IconRefresh,
  IconDownload,
  IconLoader2
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { ComisionesService } from '../services'
import { ComisionesStats } from './comisiones-stats'
import { ComisionesFiltros } from './comisiones-filtros'
import { ComisionesPublicacionTable } from './comisiones-publicacion-table'
import { ComisionesRetiroTable } from './comisiones-retiro-table'
import { ComisionesGeneralesTable } from './comisiones-generales-table'
import type { 
  ComisionPublicacion, 
  ComisionRetiro, 
  ComisionGeneral, 
  FiltrosComisiones,
  EstadisticasComisiones 
} from '../data/types'

export function ComisionesContent() {
  const { user } = useAuthStore()
  const [comisionesPublicacion, setComisionesPublicacion] = useState<ComisionPublicacion[]>([])
  const [comisionesRetiro, setComisionesRetiro] = useState<ComisionRetiro[]>([])
  const [comisionesGenerales, setComisionesGenerales] = useState<ComisionGeneral[]>([])
  const [conversion, setConversion] = useState<number>(3.75) // Valor por defecto
  const [estadisticas, setEstadisticas] = useState<EstadisticasComisiones>({
    totalComisionesPublicacion: 0,
    totalComisionesRetiro: 0,
    totalComisiones: 0,
    cantidadPublicaciones: 0,
    cantidadRetiros: 0,
    promedioComisionPublicacion: 0,
    promedioComisionRetiro: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosComisiones>({})
  
  // Estados para modales de detalles
  const [detalleComisionPub, setDetalleComisionPub] = useState<ComisionPublicacion | null>(null)
  const [detalleComisionRet, setDetalleComisionRet] = useState<ComisionRetiro | null>(null)
  const [detalleComisionGen, setDetalleComisionGen] = useState<ComisionGeneral | null>(null)

  const fetchComisiones = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Obtener tasa de conversión de la configuración
      const { data: configData } = await supabase
        .from('configuracion')
        .select('conversion')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (configData?.conversion) {
        setConversion(configData.conversion)
      }
      
      const [publicacion, retiro, general, stats] = await Promise.all([
        ComisionesService.getComisionesPublicacion(user.id, filtros),
        ComisionesService.getComisionesRetiro(user.id, filtros),
        ComisionesService.getComisionesGenerales(user.id, filtros),
        ComisionesService.getEstadisticasComisiones(user.id, filtros)
      ])
      
      setComisionesPublicacion(publicacion)
      setComisionesRetiro(retiro)
      setComisionesGenerales(general)
      setEstadisticas(stats)
    } catch (error) {
      console.error('Error al cargar comisiones:', error)
      toast.error('Error al cargar las comisiones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchComisiones()
    }
  }, [user, filtros])

  const handleFiltrosChange = (nuevosFiltros: FiltrosComisiones) => {
    setFiltros(nuevosFiltros)
  }

  const handleLimpiarFiltros = () => {
    setFiltros({})
  }

  const exportarDatos = () => {
    // TODO: Implementar exportación a CSV/Excel
    toast.info('Función de exportación en desarrollo')
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">Debes estar autenticado para ver las comisiones.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Comisiones</h1>
          <p className="text-muted-foreground">
            Gestiona y visualiza tus comisiones por publicaciones y retiros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchComisiones}
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

      {/* Estadísticas */}
      <ComisionesStats estadisticas={estadisticas} loading={loading} />

      {/* Filtros */}
      <ComisionesFiltros
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        loading={loading}
      />

      {/* Tabs con las diferentes tablas */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <IconCoin className="h-4 w-4" />
            General
            <Badge variant="secondary" className="ml-1">
              {comisionesGenerales.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="publicacion" className="flex items-center gap-2">
            <IconPackage className="h-4 w-4" />
            Publicaciones
            <Badge variant="secondary" className="ml-1">
              {comisionesPublicacion.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="retiro" className="flex items-center gap-2">
            <IconWallet className="h-4 w-4" />
            Retiros
            <Badge variant="secondary" className="ml-1">
              {comisionesRetiro.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCoin className="h-5 w-5" />
                Todas las Comisiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <IconLoader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ComisionesGeneralesTable
                  data={comisionesGenerales}
                  onVer={setDetalleComisionGen}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publicacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Comisiones por Publicación de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <IconLoader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ComisionesPublicacionTable
                  data={comisionesPublicacion}
                  onVer={setDetalleComisionPub}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWallet className="h-5 w-5" />
                Comisiones por Retiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <IconLoader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <ComisionesRetiroTable
                  data={comisionesRetiro}
                  onVer={setDetalleComisionRet}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalle para comisión de publicación */}
      <Dialog open={!!detalleComisionPub} onOpenChange={() => setDetalleComisionPub(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconPackage className="h-5 w-5" />
              Detalle de Comisión por Publicación
            </DialogTitle>
            <DialogDescription>
              Información detallada de la comisión generada por la publicación del producto
            </DialogDescription>
          </DialogHeader>
          {detalleComisionPub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Producto</h4>
                  <p className="font-medium">{detalleComisionPub.producto.nombre}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Precio Público</h4>
                  <p className="font-medium">${detalleComisionPub.producto.precio_publico.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Proveedor</h4>
                  <p className="font-medium">
                    {detalleComisionPub.proveedor.nombres} {detalleComisionPub.proveedor.apellidos}
                  </p>
                  <p className="text-sm text-muted-foreground">@{detalleComisionPub.proveedor.usuario}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Fecha de Publicación</h4>
                  <p className="font-medium">
                    {new Date(detalleComisionPub.fecha_publicacion).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Porcentaje de Comisión</h4>
                  <p className="font-medium">{detalleComisionPub.porcentaje_comision.toFixed(2)}%</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Monto de Comisión</h4>
                  <p className="font-bold text-green-600">${detalleComisionPub.monto_comision.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">S/. {(detalleComisionPub.monto_comision * conversion).toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de detalle para comisión de retiro */}
      <Dialog open={!!detalleComisionRet} onOpenChange={() => setDetalleComisionRet(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconWallet className="h-5 w-5" />
              Detalle de Comisión por Retiro
            </DialogTitle>
            <DialogDescription>
              Información detallada de la comisión generada por el retiro de fondos
            </DialogDescription>
          </DialogHeader>
          {detalleComisionRet && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Usuario</h4>
                  <p className="font-medium">
                    {detalleComisionRet.usuario.nombres} {detalleComisionRet.usuario.apellidos}
                  </p>
                  <p className="text-sm text-muted-foreground">@{detalleComisionRet.usuario.usuario}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Fecha de Retiro</h4>
                  <p className="font-medium">
                    {new Date(detalleComisionRet.fecha_retiro).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Monto del Retiro</h4>
                  <p className="font-medium">${detalleComisionRet.monto_retiro.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Porcentaje de Comisión</h4>
                  <p className="font-medium">{detalleComisionRet.porcentaje_comision}%</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Monto de Comisión</h4>
                  <p className="font-bold text-green-600">${detalleComisionRet.monto_comision.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">S/. {(detalleComisionRet.monto_comision * conversion).toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">ID del Retiro</h4>
                  <p className="font-mono text-sm">{detalleComisionRet.retiro_id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de detalle para comisión general */}
      <Dialog open={!!detalleComisionGen} onOpenChange={() => setDetalleComisionGen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconEye className="h-5 w-5" />
              Detalle de Comisión
            </DialogTitle>
            <DialogDescription>
              Información detallada de la comisión
            </DialogDescription>
          </DialogHeader>
          {detalleComisionGen && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Tipo</h4>
                  <Badge variant={detalleComisionGen.tipo === 'publicacion' ? 'default' : 'secondary'}>
                    {detalleComisionGen.tipo === 'publicacion' ? 'Publicación' : 'Retiro'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Usuario</h4>
                  <p className="font-medium">
                    {detalleComisionGen.usuario.nombres} {detalleComisionGen.usuario.apellidos}
                  </p>
                  <p className="text-sm text-muted-foreground">@{detalleComisionGen.usuario.usuario}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Descripción</h4>
                  <p className="font-medium">{detalleComisionGen.descripcion}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Fecha</h4>
                  <p className="font-medium">
                    {new Date(detalleComisionGen.fecha_transaccion).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Monto Base</h4>
                  <p className="font-medium">${detalleComisionGen.monto_base.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Comisión ({detalleComisionGen.porcentaje_comision.toFixed(2)}%)</h4>
                  <p className="font-bold text-green-600">${detalleComisionGen.monto_comision.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">S/. {(detalleComisionGen.monto_comision * conversion).toFixed(2)}</p>
                </div>
                {detalleComisionGen.producto && (
                  <div className="col-span-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Producto</h4>
                    <p className="font-medium">{detalleComisionGen.producto.nombre}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
