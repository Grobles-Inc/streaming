import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  IconSearch, 
  IconFilter, 
  IconRefresh,
  IconTable,
  IconCards
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useCompras } from './hooks/use-compras'
import { ComprasTable } from './components/compras-table'
import { CompraDetailsModal } from './components/compra-details-modal'
import { ComprasStatusCards } from './components/compras-status-cards'
import { createComprasColumns } from './components/compras-columns'
import type { MappedCompra, EstadoCompra } from './data/types'

export function ComprasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<EstadoCompra | 'all'>('all')
  const [selectedCompra, setSelectedCompra] = useState<MappedCompra | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const {
    compras,
    loading,
    error,
    estadisticas,
    marcarComoResuelto,
    marcarComoVencido,
    enviarASoporte,
    procesarReembolso,
    marcarComoPedidoEntregado,
    cambiarEstadoCompra,
    refreshCompras,
    hayCompras
  } = useCompras()

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const matchesSearch = searchTerm === '' || 
      compra.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.vendedorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.telefonoCliente.includes(searchTerm)

    const matchesStatus = selectedStatus === 'all' || compra.estado === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Manejar acciones
  const handleMarcarResuelto = async (id: string) => {
    try {
      const result = await marcarComoResuelto(id)
      if (result.success) {
        toast.success('Compra marcada como resuelta', {
          description: 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }

  const handleMarcarVencido = async (id: string) => {
    try {
      const result = await marcarComoVencido(id)
      if (result.success) {
        toast.success('Compra marcada como vencida', {
          description: 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }

  const handleEnviarASoporte = async (id: string) => {
    try {
      const result = await enviarASoporte(id)
      if (result.success) {
        toast.success('Compra enviada a soporte', {
          description: 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }

  const handleProcesarReembolso = async (id: string) => {
    try {
      const result = await procesarReembolso(id)
      if (result.success) {
        toast.success('Reembolso procesado', {
          description: result.reembolsoProcessed 
            ? `Se ha reembolsado S/. ${result.reembolsoAmount?.toFixed(2)} al usuario.`
            : 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al procesar reembolso', {
        description: 'No se pudo procesar el reembolso.'
      })
    }
  }

  const handleMarcarComoPedidoEntregado = async (id: string) => {
    try {
      const result = await marcarComoPedidoEntregado(id)
      if (result.success) {
        toast.success('Pedido marcado como entregado', {
          description: 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }

  const handleCambiarEstadoCard = async (id: string, nuevoEstado: EstadoCompra) => {
    try {
      const result = await cambiarEstadoCompra(id, nuevoEstado)
      return { success: result.success }
    } catch (error) {
      return { success: false }
    }
  }

  const handleVerDetalles = (compra: MappedCompra) => {
    setSelectedCompra(compra)
    setShowDetailsModal(true)
  }

  const handleRefresh = async () => {
    try {
      await refreshCompras()
      toast.success('Datos actualizados', {
        description: 'La información de compras ha sido actualizada.'
      })
    } catch (error) {
      toast.error('Error al actualizar', {
        description: 'No se pudieron actualizar los datos.'
      })
    }
  }

  // Crear columnas con las acciones
  const columns = createComprasColumns(
    handleMarcarResuelto,
    handleMarcarVencido,
    handleEnviarASoporte,
    handleProcesarReembolso,
    handleMarcarComoPedidoEntregado,
    handleVerDetalles
  )

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Compras</h2>
            <p className='text-muted-foreground'>
              Administra todas las compras, edita estados y procesa reembolsos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
        <div className="space-y-6">

      {/* Contenido con tabs */}
      <Tabs defaultValue="table" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <IconTable className="h-4 w-4" />
              Vista de Tabla
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <IconCards className="h-4 w-4" />
              Vista de Cards
            </TabsTrigger>
          </TabsList>
          
          {/* Filtros generales */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EstadoCompra | 'all')}>
              <SelectTrigger className="w-[200px]">
                <IconFilter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="soporte">Soporte</SelectItem>
                <SelectItem value="reembolsado">Reembolsado</SelectItem>
                <SelectItem value="pedido_entregado">Pedido Entregado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Vista de tabla */}
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTable className="h-5 w-5" />
                Tabla de Compras
                {hayCompras && (
                  <Badge variant="secondary">
                    {comprasFiltradas.length} de {compras.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Vista detallada en formato de tabla con acciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              ) : (
                <ComprasTable
                  data={comprasFiltradas}
                  columns={columns}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vista de cards */}
        <TabsContent value="cards">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCards className="h-5 w-5" />
                Cards por Estado
                {hayCompras && (
                  <Badge variant="secondary">
                    {comprasFiltradas.length} compras
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Vista organizada por estados con opciones de cambio directo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Error: {error}</p>
                  <Button onClick={handleRefresh} variant="outline">
                    <IconRefresh className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                </div>
              ) : (
                <ComprasStatusCards
                  compras={comprasFiltradas}
                  onCambiarEstado={handleCambiarEstadoCard}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalles */}
      <CompraDetailsModal
        compra={selectedCompra}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
        </div>
      </Main>
    </>
  )
}
