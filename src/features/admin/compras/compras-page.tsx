import { Main } from '@/components/layout/main'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconRefresh
} from '@tabler/icons-react'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { CompraDetailsModal } from './components/compra-details-modal'
import { createComprasColumns } from './components/compras-columns'
import { ComprasTable } from './components/compras-table'
import type { EstadoCompra, MappedCompra } from './data/types'
import { useComprasTabla } from './hooks/use-compras-tabla'
import { useCambiarEstadoCompra, useCambiarEstadoMasivo } from './queries'

export function ComprasPage() {
  const [selectedStatus, setSelectedStatus] = useState<EstadoCompra | 'all'>('all')
  const [selectedCompra, setSelectedCompra] = useState<MappedCompra | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const {
    rows,
    total,
    totalSoporte,
    isLoading,
    error,
    refetch,
    pagination,
    globalFilter,
    onPaginationChange,
    onGlobalFilterChange,
  } = useComprasTabla(selectedStatus === 'all' ? null : selectedStatus)

  const cambiarEstado = useCambiarEstadoCompra()
  const cambiarEstadoMasivo = useCambiarEstadoMasivo()

  // Manejar acciones con useCallback para evitar re-renders
  const handleMarcarResuelto = useCallback(async (id: number) => {
    try {
      await cambiarEstado.mutateAsync({ id, estado: 'resuelto' })
      toast.success('Compra marcada como resuelta', {
        description: 'El estado de la compra ha sido actualizado correctamente.'
      })
    } catch {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }, [cambiarEstado])

  const handleMarcarVencido = useCallback(async (id: number) => {
    try {
      await cambiarEstado.mutateAsync({ id, estado: 'vencido' })
      toast.success('Compra marcada como vencida', {
        description: 'El estado de la compra ha sido actualizado correctamente.'
      })
    } catch {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }, [cambiarEstado])

  const handleEnviarASoporte = useCallback(async (id: number) => {
    try {
      await cambiarEstado.mutateAsync({ id, estado: 'soporte' })
      toast.success('Compra enviada a soporte', {
        description: 'El estado de la compra ha sido actualizado correctamente.'
      })
    } catch {
      toast.error('Error al actualizar el estado', {
        description: 'No se pudo actualizar el estado de la compra.'
      })
    }
  }, [cambiarEstado])

  const handleProcesarReembolso = useCallback(async (id: number) => {
    try {
      const result = await cambiarEstado.mutateAsync({ id, estado: 'reembolsado' })
      toast.success('Reembolso procesado', {
        description: result.reembolsoProcessed
          ? `Se ha reembolsado $. ${result.reembolsoAmount?.toFixed(2)} al usuario.`
          : 'El estado de la compra ha sido actualizado correctamente.'
      })
    } catch {
      toast.error('Error al procesar reembolso', {
        description: 'No se pudo procesar el reembolso.'
      })
    }
  }, [cambiarEstado])

  const handleVerDetalles = useCallback((compra: MappedCompra) => {
    setSelectedCompra(compra)
    setShowDetailsModal(true)
  }, [])

  const handleRefresh = useCallback(async () => {
    try {
      await refetch()
      toast.success('Datos actualizados', {
        description: 'La información de compras ha sido actualizada.'
      })
    } catch {
      toast.error('Error al actualizar', {
        description: 'No se pudieron actualizar los datos.'
      })
    }
  }, [refetch])

  // Crear columnas con las acciones usando useMemo
  const columns = useMemo(() => createComprasColumns(
    handleMarcarResuelto,
    handleMarcarVencido,
    handleEnviarASoporte,
    handleProcesarReembolso,
    handleVerDetalles
  ), [handleMarcarResuelto, handleMarcarVencido, handleEnviarASoporte, handleProcesarReembolso, handleVerDetalles])

  // Función para verificar si se puede cambiar a un estado específico
  const puedecambiarAEstado = useCallback((estadoActual: EstadoCompra, estadoNuevo: EstadoCompra): boolean => {
    switch (estadoActual) {
      case 'soporte':
        return ['reembolsado', 'resuelto'].includes(estadoNuevo)
      case 'reembolsado':
        return ['resuelto'].includes(estadoNuevo)
      case 'resuelto':
        return ['soporte'].includes(estadoNuevo)
      case 'vencido':
        return ['resuelto'].includes(estadoNuevo)
      case 'pedido_entregado':
        return ['soporte', 'resuelto'].includes(estadoNuevo)
      default:
        return false
    }
  }, [])

  // Función para cambiar estado masivo (la selección vive en la página actual)
  const handleCambiarEstadoMasivo = useCallback(async (ids: number[], estado: EstadoCompra) => {
    try {
      // Filtrar solo las compras que pueden cambiar al estado solicitado
      const comprasValidas = rows.filter(compra =>
        ids.includes(compra.id) && puedecambiarAEstado(compra.estado, estado)
      )

      if (comprasValidas.length === 0) {
        toast.error('Ninguna de las compras seleccionadas puede cambiar a este estado')
        return
      }

      if (comprasValidas.length < ids.length) {
        toast.warning(`Solo ${comprasValidas.length} de ${ids.length} compras pueden cambiar a este estado`)
      }

      const result = await cambiarEstadoMasivo.mutateAsync({
        ids: comprasValidas.map(c => c.id),
        estado,
      })

      if (result.success > 0) {
        toast.success(`${result.success} compras actualizadas exitosamente`)
      }
    } catch {
      toast.error('Error al actualizar las compras')
    }
  }, [rows, puedecambiarAEstado, cambiarEstadoMasivo])

  return (
               <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Compras</h2>
            <p className='text-muted-foreground'>
              Administra todas las compras, edita estados y procesa reembolsos
              {totalSoporte > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalSoporte} en soporte
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as EstadoCompra | 'all')}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pedido_entregado">Pedido entregado</SelectItem>
                <SelectItem value="soporte">Soporte</SelectItem>
                <SelectItem value="reembolsado">Reembolsado</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="space-y-6">


          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">Error: {error.message}</p>
              <Button onClick={handleRefresh} variant="outline">
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          ) : (
            <ComprasTable
              data={rows}
              columns={columns}
              total={total}
              loading={isLoading}
              pagination={pagination}
              onPaginationChange={onPaginationChange}
              globalFilter={globalFilter}
              onGlobalFilterChange={onGlobalFilterChange}
              onCambiarEstadoMasivo={handleCambiarEstadoMasivo}
            />
          )}



          {/* Modal de detalles */}
          <CompraDetailsModal
            compra={selectedCompra}
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
          />
        </div>
      </Main>
      )
}
