import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconPlus, IconWallet, IconTrendingUp, IconTrendingDown, IconMenu2, IconCheck, IconX, IconLoader2, IconCoin } from '@tabler/icons-react'
import { BilleterasService } from '@/features/admin/billeteras/services'
import { useAuthStore } from '@/stores/authStore'
import { ComisionesContent } from './comisiones-content'
import type { Billetera, Recarga, Retiro } from '@/features/admin/billeteras/data/types'

interface MiBilleteraContentProps {
  className?: string
}

export function MiBilleteraContent({ className }: MiBilleteraContentProps) {
  const { user } = useAuthStore()
  const [billetera, setBilletera] = useState<Billetera | null>(null)
  const [recargas, setRecargas] = useState<Recarga[]>([])
  const [retiros, setRetiros] = useState<Retiro[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Estados para formularios
  const [recargaForm, setRecargaForm] = useState({ monto: '' })
  const [retiroForm, setRetiroForm] = useState({ monto: '' })
  const [showRecargaModal, setShowRecargaModal] = useState(false)
  const [showRetiroModal, setShowRetiroModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBilleteraData()
    }
  }, [user])

  const fetchBilleteraData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [billeteraData, recargasData, retirosData] = await Promise.all([
        BilleterasService.getBilleteraByUsuario(user.id),
        BilleterasService.getRecargasByUsuario(user.id),
        BilleterasService.getRetirosByUsuario(user.id)
      ])
      
      setBilletera(billeteraData)
      setRecargas(recargasData)
      setRetiros(retirosData)
    } catch (error) {
      console.error('Error al cargar datos de billetera:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRecarga = async () => {
    if (!user || !recargaForm.monto) return

    try {
      setCreating(true)
      await BilleterasService.createRecarga({
        usuario_id: user.id,
        monto: parseFloat(recargaForm.monto)
      })
      
      setRecargaForm({ monto: '' })
      setShowRecargaModal(false)
      await fetchBilleteraData()
    } catch (error) {
      console.error('Error al crear recarga:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateRetiro = async () => {
    if (!user || !retiroForm.monto) return

    try {
      setCreating(true)
      await BilleterasService.createRetiro({
        usuario_id: user.id,
        monto: parseFloat(retiroForm.monto)
      })
      
      setRetiroForm({ monto: '' })
      setShowRetiroModal(false)
      await fetchBilleteraData()
    } catch (error) {
      console.error('Error al crear retiro:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateEstado = async (tipo: 'recarga' | 'retiro', id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      if (tipo === 'recarga') {
        await BilleterasService.updateRecargaEstado(id, estado)
      } else {
        await BilleterasService.updateRetiroEstado(id, estado)
      }
      await fetchBilleteraData()
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    }
  }

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
      {/* Resumen de la billetera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWallet className="h-5 w-5" />
            Mi Billetera de Administrador
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
              <Dialog open={showRecargaModal} onOpenChange={setShowRecargaModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <IconTrendingUp className="h-4 w-4" />
                    Nueva Recarga
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Solicitar Recarga</DialogTitle>
                    <DialogDescription>
                      Crea una nueva solicitud de recarga para tu billetera.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className='pb-5' htmlFor="monto-recarga">Monto a recargar</Label>
                      <Input
                        id="monto-recarga"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={recargaForm.monto}
                        onChange={(e) => setRecargaForm({ monto: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowRecargaModal(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateRecarga}
                      disabled={creating || !recargaForm.monto}
                    >
                      {creating ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <IconPlus className="mr-2 h-4 w-4" />
                          Solicitar Recarga
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={showRetiroModal} onOpenChange={setShowRetiroModal}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <IconTrendingDown className="h-4 w-4" />
                    Nuevo Retiro
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
          <CardTitle>Mis Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recargas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recargas" className="flex items-center gap-2">
                <IconTrendingUp className="h-4 w-4" />
                Recargas ({recargas.length})
              </TabsTrigger>
              <TabsTrigger value="retiros" className="flex items-center gap-2">
                <IconTrendingDown className="h-4 w-4" />
                Retiros ({retiros.length})
              </TabsTrigger>
              <TabsTrigger value="comisiones" className="flex items-center gap-2">
                <IconCoin className="h-4 w-4" />
                Comisiones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recargas" className="mt-4">
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
                    {recargas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No hay recargas registradas
                        </td>
                      </tr>
                    ) : (
                      recargas.map(recarga => (
                        <tr key={recarga.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-green-600">
                              +{formatCurrency(recarga.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {getEstadoBadge(recarga.estado)}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {formatDate(recarga.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            {recarga.estado === 'pendiente' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <IconMenu2 className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado('recarga', recarga.id, 'aprobado')}
                                    className="text-green-600"
                                  >
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Aprobar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado('recarga', recarga.id, 'rechazado')}
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
            </TabsContent>

            <TabsContent value="retiros" className="mt-4">
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
                                    onClick={() => handleUpdateEstado('retiro', retiro.id, 'aprobado')}
                                    className="text-green-600"
                                  >
                                    <IconCheck className="mr-2 h-4 w-4" />
                                    Aprobar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateEstado('retiro', retiro.id, 'rechazado')}
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
            </TabsContent>

            <TabsContent value="comisiones" className="mt-4">
              <ComisionesContent />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
