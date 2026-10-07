import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
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
import { useRecargasTabla } from './hooks/use-recargas-tabla'
import {
  useAprobarRecarga,
  useAprobarRecargas,
  useEliminarRecarga,
  useEliminarRecargas,
  useRechazarRecarga,
  useRechazarRecargas,
} from './queries'

export default function RecargasPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoRecarga | 'todos'>('todos')
  const [selectedRecarga, setSelectedRecarga] = useState<MappedRecarga | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const {
    rows,
    total,
    totalPendientes,
    isLoading,
    error,
    refetch,
    pagination,
    globalFilter,
    onPaginationChange,
    onGlobalFilterChange,
  } = useRecargasTabla(filtroEstado === 'todos' ? null : filtroEstado)

  const aprobarRecarga = useAprobarRecarga()
  const rechazarRecarga = useRechazarRecarga()
  const eliminarRecarga = useEliminarRecarga()
  const aprobarRecargas = useAprobarRecargas()
  const rechazarRecargas = useRechazarRecargas()
  const eliminarRecargas = useEliminarRecargas()

  // Manejar aprobación individual
  const handleAprobar = async (id: string) => {
    try {
      await aprobarRecarga.mutateAsync(parseInt(id))
      toast.success('Recarga aprobada exitosamente')
    } catch {
      toast.error('Error al aprobar la recarga')
    }
  }

  // Manejar rechazo individual
  const handleRechazar = async (id: string) => {
    try {
      await rechazarRecarga.mutateAsync(parseInt(id))
      toast.success('Recarga rechazada exitosamente')
    } catch {
      toast.error('Error al rechazar la recarga')
    }
  }

  // Manejar aprobación masiva
  const handleAprobarSeleccionadas = async (ids: string[]) => {
    try {
      await aprobarRecargas.mutateAsync(ids.map(id => parseInt(id)))
      toast.success(`${ids.length} recarga(s) aprobada(s) exitosamente`)
    } catch {
      toast.error('Error al aprobar las recargas seleccionadas')
    }
  }

  // Manejar rechazo masivo
  const handleRechazarSeleccionadas = async (ids: string[]) => {
    try {
      await rechazarRecargas.mutateAsync(ids.map(id => parseInt(id)))
      toast.success(`${ids.length} recarga(s) rechazada(s) exitosamente`)
    } catch {
      toast.error('Error al rechazar las recargas seleccionadas')
    }
  }

  // Manejar eliminación individual
  const handleEliminar = async (id: string) => {
    try {
      await eliminarRecarga.mutateAsync(parseInt(id))
      toast.success('Recarga eliminada exitosamente')
    } catch {
      toast.error('Error al eliminar la recarga')
    }
  }

  // Manejar eliminación masiva
  const handleEliminarSeleccionadas = async (ids: string[]) => {
    try {
      await eliminarRecargas.mutateAsync(ids.map(id => parseInt(id)))
      toast.success(`${ids.length} recarga(s) eliminada(s) exitosamente`)
    } catch {
      toast.error('Error al eliminar las recargas seleccionadas')
    }
  }

  // Ver detalles de recarga
  const handleVerRecarga = (recarga: MappedRecarga) => {
    setSelectedRecarga(recarga)
    setModalOpen(true)
  }

  // Crear columnas con callbacks
  const columns = createRecargasColumns(
    handleAprobar,
    handleRechazar,
    handleEliminar,
    handleVerRecarga
  )

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar recargas</h3>
            <p className="text-sm text-gray-600 mt-2">{error.message}</p>
            <Button
              onClick={() => refetch()}
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
              {totalPendientes > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {totalPendientes} pendiente(s)
                </Badge>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={filtroEstado}
              onValueChange={(value) => setFiltroEstado(value as EstadoRecarga | 'todos')}
            >
              <SelectTrigger >
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Ver Todos</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobado">Aprobadas</SelectItem>
                <SelectItem value="rechazado">Rechazadas</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* <Button variant="outline" disabled>
              <IconDownload className="mr-2 h-4 w-4" />
              Exportar
            </Button> */}
          </div>
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <RecargasTable
            data={rows}
            columns={columns}
            total={total}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={onGlobalFilterChange}
            onAprobarSeleccionadas={handleAprobarSeleccionadas}
            onRechazarSeleccionadas={handleRechazarSeleccionadas}
            onEliminarSeleccionadas={handleEliminarSeleccionadas}
          />
        </div>

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
