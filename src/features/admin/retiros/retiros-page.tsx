import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  IconRefresh, 
  IconDownload,
  IconCash 
} from '@tabler/icons-react'
import { toast } from 'sonner'

import { useRetiros } from './hooks/use-retiros'
import { createRetirosColumns } from './components/retiros-columns'
import { RetirosTable } from './components/retiros-table'
import { EstadisticasRetirosCard } from './components/estadisticas-retiros'
import { RetiroDetailsModal } from './components/retiro-details-modal'
import type { MappedRetiro, EstadoRetiro } from './data/types'

// Import test function
import { testSupabaseConnection } from './test-connection'

export default function RetirosPage() {
  const [filtroEstado, setFiltroEstado] = useState<EstadoRetiro | 'todos'>('todos')
  const [selectedRetiro, setSelectedRetiro] = useState<MappedRetiro | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  
  const {
    retiros,
    loading,
    error,
    estadisticas,
    aprobarRetiro,
    rechazarRetiro,
    updateEstadoRetiro,
    aprobarRetiros,
    rechazarRetiros,
    aplicarFiltros,
    refreshRetiros,
    clearError,
    cantidadPendientes
  } = useRetiros()

  // Manejar aprobación individual
  const handleAprobar = async (id: string) => {
    const success = await aprobarRetiro(id)
    if (success) {
      toast.success('Retiro aprobado exitosamente')
    } else {
      toast.error('Error al aprobar el retiro')
    }
  }

  // Manejar rechazo individual
  const handleRechazar = async (id: string) => {
    const success = await rechazarRetiro(id)
    if (success) {
      toast.success('Retiro rechazado exitosamente')
    } else {
      toast.error('Error al rechazar el retiro')
    }
  }

  // Manejar aprobación masiva
  const handleAprobarSeleccionados = async (ids: string[]) => {
    const success = await aprobarRetiros(ids)
    if (success) {
      toast.success(`${ids.length} retiro(s) aprobado(s) exitosamente`)
    } else {
      toast.error('Error al aprobar los retiros seleccionados')
    }
  }

  // Manejar rechazo masivo
  const handleRechazarSeleccionados = async (ids: string[]) => {
    const success = await rechazarRetiros(ids)
    if (success) {
      toast.success(`${ids.length} retiro(s) rechazado(s) exitosamente`)
    } else {
      toast.error('Error al rechazar los retiros seleccionados')
    }
  }

  // Ver detalles de retiro
  const handleVerRetiro = (retiro: MappedRetiro) => {
    setSelectedRetiro(retiro)
    setModalOpen(true)
  }

  // Actualizar estado desde el modal
  const handleUpdateEstado = async (id: string, nuevoEstado: EstadoRetiro): Promise<boolean> => {
    return await updateEstadoRetiro(id, nuevoEstado)
  }

  // Aplicar filtro por estado
  const handleFiltroEstado = async (estado: EstadoRetiro | 'todos') => {
    setFiltroEstado(estado)
    if (estado === 'todos') {
      await aplicarFiltros({})
    } else {
      await aplicarFiltros({ estado })
    }
  }

  // Crear columnas con callbacks
  const columns = createRetirosColumns(
    handleAprobar,
    handleRechazar,
    handleVerRetiro
  )

  // Filtrar retiros según el estado seleccionado
  const retirosFiltrados = filtroEstado === 'todos' 
    ? retiros 
    : retiros.filter(r => r.estado === filtroEstado)

  if (error) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Error al cargar retiros</h3>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={() => {
                clearError()
                refreshRetiros()
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
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Retiros</h2>
            <p className='text-muted-foreground'>
              Administra las solicitudes de retiro de usuarios.
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
                <SelectItem value="aprobado">Aprobados</SelectItem>
                <SelectItem value="rechazado">Rechazados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={refreshRetiros} disabled={loading}>
              <IconRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button variant="outline" onClick={testSupabaseConnection}>
              🔍 Test DB
            </Button>
            
            <Button variant="outline" disabled>
              <IconDownload className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-6">
          <EstadisticasRetirosCard 
            estadisticas={estadisticas} 
            loading={loading} 
          />
        </div>

        {/* Tabla de retiros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCash className="h-5 w-5" />
              Solicitudes de Retiro
            </CardTitle>
            <CardDescription>
              Lista completa de todas las solicitudes de retiro con opciones de gestión.
              {filtroEstado !== 'todos' && (
                <span className="ml-2 font-medium">
                  Mostrando: {filtroEstado}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RetirosTable
              data={retirosFiltrados}
              columns={columns}
              loading={loading}
              onAprobarSeleccionados={handleAprobarSeleccionados}
              onRechazarSeleccionados={handleRechazarSeleccionados}
            />
          </CardContent>
        </Card>
      </Main>

      {/* Modal de detalles */}
      <RetiroDetailsModal
        retiro={selectedRetiro}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onUpdateEstado={handleUpdateEstado}
      />
    </>
  )
}
