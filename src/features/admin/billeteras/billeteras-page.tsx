import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { IconWallet, IconUsers, IconCreditCard } from '@tabler/icons-react'
import { 
  BilleteraFiltersComponent, 
  BilleterasTable, 
  MovimientosBilleteraModal, 
  AdminBilletera 
} from './components'
import { useBilleteras, useRecargas, useRetiros } from './queries'
import type { Billetera } from './data/types'

export default function BilleterasPage() {
  const [billeterasFiltradas, setBilleterasFiltradas] = useState<Billetera[]>([])
  const [billeteraSeleccionada, setBilleteraSeleccionada] = useState<Billetera | null>(null)
  const [showMovimientosModal, setShowMovimientosModal] = useState(false)

  const { billeteras, loading: loadingBilleteras, error: errorBilleteras, refetch: refetchBilleteras } = useBilleteras()
  const { updateRecargaEstado } = useRecargas()
  const { updateRetiroEstado } = useRetiros()

  // Billeteras a mostrar (filtradas o todas)
  const billeterasAMostrar = billeterasFiltradas.length > 0 || billeteras.length === 0 ? billeterasFiltradas : billeteras

  const handleBilleteraFilter = (filteredBilleteras: Billetera[]) => {
    setBilleterasFiltradas(filteredBilleteras)
  }

  const handleViewMovimientos = (billetera: Billetera) => {
    setBilleteraSeleccionada(billetera)
    setShowMovimientosModal(true)
  }

  const handleCloseMovimientosModal = () => {
    setShowMovimientosModal(false)
    setBilleteraSeleccionada(null)
  }

  const handleUpdateEstado = async (tipo: 'recarga' | 'retiro', id: string, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
    try {
      if (tipo === 'recarga') {
        await updateRecargaEstado(id, estado)
      } else {
        await updateRetiroEstado(id, estado)
      }
      // Refrescar billeteras para mostrar cambios actualizados
      await refetchBilleteras()
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    }
  }

  if (loadingBilleteras) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando billeteras...</div>
        </CardContent>
      </Card>
    )
  }

  if (errorBilleteras) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error: {errorBilleteras}</div>
        </CardContent>
      </Card>
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Billeteras</h2>
            <p className='text-muted-foreground'>
              Administra las billeteras de todos los usuarios y tu propia billetera de administrador.
            </p>
          </div>
        </div>
        <Card>
          <CardContent>
            <Tabs defaultValue="usuarios" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="usuarios" className="flex items-center gap-2">
                  <IconUsers className="h-4 w-4" />
                  Billeteras de Usuarios
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <IconWallet className="h-4 w-4" />
                  Mi Billetera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="usuarios" className="mt-6 space-y-6">
                {/* Filtros */}
                <BilleteraFiltersComponent
                  billeteras={billeteras}
                  onFilter={handleBilleteraFilter}
                />

                {/* Tabla de billeteras */}
                <BilleterasTable
                  billeteras={billeterasAMostrar}
                  onViewMovimientos={handleViewMovimientos}
                />
              </TabsContent>

              <TabsContent value="admin" className="mt-6">
                <AdminBilletera />
              </TabsContent>
            </Tabs>

            {/* Modal de movimientos */}
            <MovimientosBilleteraModal
              billetera={billeteraSeleccionada}
              open={showMovimientosModal}
              onClose={handleCloseMovimientosModal}
              onUpdateEstado={handleUpdateEstado}
            />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}
