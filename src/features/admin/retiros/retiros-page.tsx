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

import { RetiroDetailsModal } from './components/retiro-details-modal'
import { createRetirosColumns } from './components/retiros-columns'
import { RetirosTable } from './components/retiros-table'
import type { EstadoRetiro, MappedRetiro } from './data/types'
import { useRetirosTabla } from './hooks/use-retiros-tabla'
import {
  useAprobarRetiro,
  useAprobarRetiros,
  useRechazarRetiro,
  useRechazarRetiros,
} from './queries'

export default function RetirosPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoRetiro | 'todos'>('todos')
  const [selectedRetiro, setSelectedRetiro] = useState<MappedRetiro | null>(null)
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
  } = useRetirosTabla(filtroEstado === 'todos' ? null : filtroEstado)

  const aprobarRetiro = useAprobarRetiro()
  const rechazarRetiro = useRechazarRetiro()
  const aprobarRetiros = useAprobarRetiros()
  const rechazarRetiros = useRechazarRetiros()

  // Manejar aprobación individual
  const handleAprobar = async (id: number) => {
    try {
      await aprobarRetiro.mutateAsync(id)
      toast.success('Retiro aprobado exitosamente')
    } catch {
      toast.error('Error al aprobar el retiro')
    }
  }

  // Manejar rechazo individual
  const handleRechazar = async (id: number) => {
    try {
      await rechazarRetiro.mutateAsync(id)
      toast.success('Retiro rechazado exitosamente')
    } catch {
      toast.error('Error al rechazar el retiro')
    }
  }

  // Manejar aprobación masiva
  const handleAprobarSeleccionados = async (ids: number[]) => {
    try {
      await aprobarRetiros.mutateAsync(ids)
      toast.success(`${ids.length} retiro(s) aprobado(s) exitosamente`)
    } catch {
      toast.error('Error al aprobar los retiros seleccionados')
    }
  }

  // Manejar rechazo masivo
  const handleRechazarSeleccionados = async (ids: number[]) => {
    try {
      await rechazarRetiros.mutateAsync(ids)
      toast.success(`${ids.length} retiro(s) rechazado(s) exitosamente`)
    } catch {
      toast.error('Error al rechazar los retiros seleccionados')
    }
  }

  // Ver detalles de retiro
  const handleVerRetiro = (retiro: MappedRetiro) => {
    setSelectedRetiro(retiro)
    setModalOpen(true)
  }

  // Crear columnas con callbacks
  const columns = createRetirosColumns(
    handleAprobar,
    handleRechazar,
    handleVerRetiro
  )

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar retiros</h3>
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
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Retiros</h2>
            <p className='text-muted-foreground'>
              Administra las solicitudes de retiro de usuarios.
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
              onValueChange={(value) => setFiltroEstado(value as EstadoRetiro | 'todos')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendientes</SelectItem>
                <SelectItem value="aprobado">Aprobados</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <IconRefresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>


        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <RetirosTable
            data={rows}
            columns={columns}
            total={total}
            loading={isLoading}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            globalFilter={globalFilter}
            onGlobalFilterChange={onGlobalFilterChange}
            onAprobarSeleccionados={handleAprobarSeleccionados}
            onRechazarSeleccionados={handleRechazarSeleccionados}
          />
        </div>

      </Main>

      {/* Modal de detalles */}
      <RetiroDetailsModal
        retiro={selectedRetiro}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}
