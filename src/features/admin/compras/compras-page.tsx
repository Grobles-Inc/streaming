import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  IconShoppingCart, 
  IconSearch, 
  IconFilter, 
  IconRefresh
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useCompras } from './hooks/use-compras'
import { ComprasStats } from './components/compras-stats'
import { ComprasTable } from './components/compras-table'
import { CompraDetailsModal } from './components/compra-details-modal'
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
    handleVerDetalles
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <IconShoppingCart className="h-8 w-8 text-primary" />
            Gestión de Compras
          </h1>
          <p className="text-muted-foreground mt-2">
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

      {/* Estadísticas */}
      <ComprasStats estadisticas={estadisticas} loading={loading} />

      {/* Filtros y tabla */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <IconShoppingCart className="h-5 w-5" />
                Compras
                {hayCompras && (
                  <Badge variant="secondary">
                    {comprasFiltradas.length} de {compras.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Lista completa de compras con opciones de gestión
              </CardDescription>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, producto, proveedor, vendedor o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
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
              </SelectContent>
            </Select>
          </div>
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

      {/* Modal de detalles */}
      <CompraDetailsModal
        compra={selectedCompra}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  )
}
