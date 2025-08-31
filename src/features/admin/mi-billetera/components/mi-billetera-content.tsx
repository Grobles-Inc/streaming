import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/authStore'
import {
  IconCheck,
  IconCoin,
  IconLoader2,
  IconMenu2,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconWallet,
  IconX
} from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useMiBilletera } from '../hooks/use-mi-billetera'

interface MiBilleteraContentProps {
  className?: string
}

export function MiBilleteraContent({ className }: MiBilleteraContentProps) {
  const { user } = useAuthStore()

  // Usar el hook personalizado que replica el patrón de retiros
  const {
    billetera,
    retiros,
    comisionesPublicacion,
    comisionesRetiro,
    estadisticasComisiones,
    conversion,
    loading,
    createRetiro,
    updateRetiroEstado,
    refresh
  } = useMiBilletera(user?.id)

  // Estados para formularios
  const [retiroForm, setRetiroForm] = useState({ monto: '' })
  const [showRetiroModal, setShowRetiroModal] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreateRetiro = async () => {
    if (!user || !retiroForm.monto) return

    try {
      setCreating(true)
      await createRetiro(parseFloat(retiroForm.monto))
      setRetiroForm({ monto: '' })
      setShowRetiroModal(false)
      toast.success('Retiro creado exitosamente')
    } catch (error) {
      console.error('Error al crear retiro:', error)
      toast.error('Error al crear retiro')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateEstado = async (id: number, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      await updateRetiroEstado(id, estado)
      toast.success(`Retiro ${estado} exitosamente`)
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar estado del retiro')
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const refreshData = async () => {
    await refresh()
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

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">Cargando billetera...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs defaultValue="billetera" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="billetera">Mi Billetera</TabsTrigger>
          <TabsTrigger value="comisiones">Mis Comisiones</TabsTrigger>
          <TabsTrigger value="publicaciones">
            Publicaciones ({comisionesPublicacion.length})
          </TabsTrigger>
          <TabsTrigger value="retiros-comision">
            Retiros ({comisionesRetiro.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab de Mi Billetera */}
        <TabsContent value="billetera" className="space-y-6">
          {/* Resumen de la billetera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Mi Billetera de Administrador
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  {loading ? (
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <IconRefresh className="h-4 w-4 mr-2" />
                  )}
                  Actualizar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saldo actual</p>
                  <p className="text-3xl font-bold text-green-600">
                    {billetera ? formatCurrency(billetera.saldo) : formatCurrency(0)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog open={showRetiroModal} onOpenChange={setShowRetiroModal}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2" disabled={billetera?.saldo === 0 || user?.nombres !== 'Super Admin'}>
                        Retirar Fondos
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Solicitar Retiro</DialogTitle>
                        <DialogDescription>
                          Crea una nueva solicitud de retiro de tu billetera.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className='pb-5' htmlFor="monto-retiro">Monto a retirar</Label>
                          <Input
                            id="monto-retiro"
                            type="number"
                            step="0.01"
                            min="0"
                            max={billetera?.saldo || 0}
                            placeholder="0.00"
                            value={retiroForm.monto}
                            onChange={(e) => setRetiroForm({ monto: e.target.value })}
                          />
                          {billetera && (
                            <p className="text-xs text-gray-500 mt-1">
                              Saldo disponible: {formatCurrency(billetera.saldo)}
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRetiroModal(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateRetiro}
                          disabled={creating || !retiroForm.monto || parseFloat(retiroForm.monto) > (billetera?.saldo || 0)}
                        >
                          {creating ? (
                            <>
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            <>
                              <IconPlus className="mr-2 h-4 w-4" />
                              Solicitar Retiro
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial de movimientos */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Retiros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 font-medium">Monto</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                      <th className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retiros.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No hay retiros registrados
                        </td>
                      </tr>
                    ) : (
                      retiros.map(retiro => (
                        <tr key={retiro.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-red-600">
                              -{formatCurrency(retiro.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getEstadoBadge(retiro.estado)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(retiro.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {retiro.estado === 'pendiente' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <IconMenu2 className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado(retiro.id, 'aprobado')}
                                    className="text-green-600"
                                  >
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Aprobar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado(retiro.id, 'rechazado')}
                                    className="text-red-600"
                                  >
                                    <IconX className="mr-2 h-4 w-4" />
                                    Rechazar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
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

        {/* Tab de Mis Comisiones - Resumen */}
        <TabsContent value="comisiones" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
                <IconCoin className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(estadisticasComisiones.totalComisiones)}</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(estadisticasComisiones.totalComisiones, true)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {estadisticasComisiones.cantidadPublicaciones + estadisticasComisiones.cantidadRetiros} transacciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones Publicación</CardTitle>
                <IconPackage className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(estadisticasComisiones.totalComisionesPublicacion)}</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(estadisticasComisiones.totalComisionesPublicacion, true)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {estadisticasComisiones.cantidadPublicaciones} publicaciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comisiones Retiro</CardTitle>
                <IconWallet className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(estadisticasComisiones.totalComisionesRetiro)}</div>
                <div className="text-sm text-muted-foreground">{formatCurrency(estadisticasComisiones.totalComisionesRetiro, true)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {estadisticasComisiones.cantidadRetiros} retiros
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Comisiones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Tasa de conversión actual: S/. {conversion.toFixed(2)} por USD
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconPackage className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Promedio por Publicación</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(estadisticasComisiones.promedioComisionPublicacion)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(estadisticasComisiones.promedioComisionPublicacion, true)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconWallet className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Promedio por Retiro</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(estadisticasComisiones.promedioComisionRetiro)}</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(estadisticasComisiones.promedioComisionRetiro, true)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Publicaciones */}
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

                      <th className="px-4 py-3 font-medium">Total USD</th>
                      <th className="px-4 py-3 font-medium">Total PEN</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comisionesPublicacion.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
                            {new Date(comision.fecha_publicacion).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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

        {/* Tab de Retiros */}
        <TabsContent value="retiros-comision">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconWallet className="h-5 w-5" />
                Detalles de Retiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 font-medium">Usuario</th>
                      <th className="px-4 py-3 font-medium">Monto Retiro</th>
                      <th className="px-4 py-3 font-medium">% Comisión</th>
                      <th className="px-4 py-3 font-medium">Comisión (USD)</th>
                      <th className="px-4 py-3 font-medium">Total (USD)</th>
                      <th className="px-4 py-3 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comisionesRetiro.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No hay comisiones por retiro registradas
                        </td>
                      </tr>
                    ) : (
                      comisionesRetiro.map(comision => (
                        <tr key={comision.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            {comision.usuario.nombres} {comision.usuario.apellidos}
                            <div className="text-xs text-muted-foreground">@{comision.usuario.usuario}</div>
                          </td>
                          <td className="px-4 py-3">{formatCurrency(comision.monto_retiro)}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                              {comision.porcentaje_comision.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            {formatCurrency(comision.monto_comision)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-green-600">
                            {formatCurrency(comision.monto_comision, true)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(comision.fecha_retiro).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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
      </Tabs>
    </div>
  )
}
