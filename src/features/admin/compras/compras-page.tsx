import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import {
  IconRefresh
} from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CompraDetailsModal } from './components/compra-details-modal'
import { createComprasColumns } from './components/compras-columns'
import { ComprasTable } from './components/compras-table'
import type { EstadoCompra, MappedCompra } from './data/types'
import { useCompras } from './hooks/use-compras'

export function ComprasPage() {
  const [searchTerm, _setSearchTerm] = useState('')
  const [selectedStatus, _setSelectedStatus] = useState<EstadoCompra | 'all'>('all')
  const [selectedCompra, setSelectedCompra] = useState<MappedCompra | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const {
    compras,
    loading,
    error,
    marcarComoResuelto,
    marcarComoVencido,
    enviarASoporte,
    procesarReembolso,
    marcarComoPedidoEntregado,
    refreshCompras,
  } = useCompras()

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const matchesSearch = searchTerm === '' ||
      compra.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.productoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (compra.vendedorNombre && compra.vendedorNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      compra.telefonoCliente.includes(searchTerm)

    const matchesStatus = selectedStatus === 'all' || compra.estado === selectedStatus

    return matchesSearch && matchesStatus
  })

  // Manejar acciones
  const handleMarcarResuelto = async (id: number) => {
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

  const handleMarcarVencido = async (id: number) => {
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

  const handleEnviarASoporte = async (id: number) => {
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

  const handleProcesarReembolso = async (id: number) => {
    try {
      const result = await procesarReembolso(id)
      if (result.success) {
        toast.success('Reembolso procesado', {
          description: result.reembolsoProcessed
            ? `Se ha reembolsado $. ${result.reembolsoAmount?.toFixed(2)} al usuario.`
            : 'El estado de la compra ha sido actualizado correctamente.'
        })
      }
    } catch (error) {
      toast.error('Error al procesar reembolso', {
        description: 'No se pudo procesar el reembolso.'
      })
    }
  }

  const handleMarcarComoPedidoEntregado = async (id: number) => {
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
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-6">


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
