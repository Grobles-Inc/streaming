import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
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
import { useState } from 'react'
import { toast } from 'sonner'

import { RecargaDetailsModal } from './components/recarga-details-modal'
import { createRecargasColumns } from './components/recargas-columns'
import { RecargasTable } from './components/recargas-table'
import type { EstadoRecarga, MappedRecarga } from './data/types'
import { useRecargas } from './hooks/use-recargas'

export default function RecargasPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoRecarga | 'todos'>('todos')
  const [selectedRecarga, setSelectedRecarga] = useState<MappedRecarga | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    recargas,
    loading,
    error,
    aprobarRecarga,
    rechazarRecarga,
    aprobarRecargas,
    rechazarRecargas,
    aplicarFiltros,
    refreshRecargas,
    clearError,
    cantidadPendientes
  } = useRecargas()

  // Manejar aprobación individual
  const handleAprobar = async (id: string) => {
    const success = await aprobarRecarga(parseInt(id))
    if (success) {
      toast.success('Recarga aprobada exitosamente')
    } else {
      toast.error('Error al aprobar la recarga')
    }
  }

  // Manejar rechazo individual
  const handleRechazar = async (id: string) => {
    const success = await rechazarRecarga(parseInt(id))
    if (success) {
      toast.success('Recarga rechazada exitosamente')
    } else {
      toast.error('Error al rechazar la recarga')
    }
  }

  // Manejar aprobación masiva
  const handleAprobarSeleccionadas = async (ids: string[]) => {
    const success = await aprobarRecargas(ids.map(id => parseInt(id)))
    if (success) {
      toast.success(`${ids.length} recarga(s) aprobada(s) exitosamente`)
    } else {
      toast.error('Error al aprobar las recargas seleccionadas')
    }
  }

  // Manejar rechazo masivo
  const handleRechazarSeleccionadas = async (ids: string[]) => {
    const success = await rechazarRecargas(ids.map(id => parseInt(id)))
    if (success) {
      toast.success(`${ids.length} recarga(s) rechazada(s) exitosamente`)
    } else {
      toast.error('Error al rechazar las recargas seleccionadas')
    }
  }

  // Ver detalles de recarga
  const handleVerRecarga = (recarga: MappedRecarga) => {
    setSelectedRecarga(recarga)
    setModalOpen(true)
  }


  // Aplicar filtro por estado
  const handleFiltroEstado = async (estado: EstadoRecarga | 'todos') => {
    setFiltroEstado(estado)
    if (estado === 'todos') {
      await aplicarFiltros({})
    } else {
      await aplicarFiltros({ estado })
    }
  }

  // Crear columnas con callbacks
  const columns = createRecargasColumns(
    handleAprobar,
    handleRechazar,
    handleVerRecarga
  )

  // Filtrar recargas según el estado seleccionado
  const recargasFiltradas = filtroEstado === 'todos'
    ? recargas
    : recargas.filter(r => r.estado === filtroEstado)

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar recargas</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
            <Button
              onClick={() => {
                clearError()
                refreshRecargas()
              }}
              className="mt-4"
            >
              Intentar nuevamente
            </Button>
          </div>
        </div>
      </Main>
    )
  }

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
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Recargas</h2>
            <p className='text-muted-foreground'>
              Administra las solicitudes de recarga de usuarios.
              {cantidadPendientes > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cantidadPendientes} pendiente(s)
                </Badge>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select value={filtroEstado} onValueChange={handleFiltroEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobado">Aprobadas</SelectItem>
                <SelectItem value="rechazado">Rechazadas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={refreshRecargas} disabled={loading}>
              <IconRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            {/* <Button variant="outline" disabled>
              <IconDownload className="mr-2 h-4 w-4" />
              Exportar
            </Button> */}
          </div>
        </div>


        <RecargasTable
          data={recargasFiltradas}
          columns={columns}
          loading={loading}
          onAprobarSeleccionadas={handleAprobarSeleccionadas}
          onRechazarSeleccionadas={handleRechazarSeleccionadas}
        />

      </Main>

      {/* Modal de detalles */}
      <RecargaDetailsModal
        recarga={selectedRecarga}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
