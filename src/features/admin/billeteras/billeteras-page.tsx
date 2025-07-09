import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { IconBuilding, IconTruck } from '@tabler/icons-react'
import {
  BilleteraFiltersComponent,
  BilleterasTable,
  MovimientosBilleteraModal
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

  // Filtrar billeteras por rol excluyendo administradores
  const billeterasProveedores = billeteras.filter(b => b.usuario?.rol === 'provider')
  const billeterasVendedores = billeteras.filter(b => b.usuario?.rol === 'seller')
  
  // Aplicar filtros por sección
  const getFilteredBilleteras = (billeteras: Billetera[]) => {
    return billeterasFiltradas.length > 0 ? 
      billeterasFiltradas.filter(b => billeteras.some(original => original.id === b.id)) : 
      billeteras
  }

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

  const handleUpdateEstado = async (tipo: 'recarga' | 'retiro', id: number, estado: 'aprobado' | 'pendiente' | 'rechazado') => {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculateSaldoTotal = (billeteras: Billetera[]) => {
    return billeteras.reduce((total, billetera) => total + billetera.saldo, 0)
  }

  const getEstadisticasRol = (billeteras: Billetera[]) => {
    const saldoTotal = calculateSaldoTotal(billeteras)
    const saldoPromedio = billeteras.length > 0 ? saldoTotal / billeteras.length : 0
    const billeterasConSaldo = billeteras.filter(b => b.saldo > 0).length
    const saldoMaximo = billeteras.length > 0 ? Math.max(...billeteras.map(b => b.saldo)) : 0
    
    return {
      total: billeteras.length,
      saldoTotal,
      saldoPromedio,
      billeterasConSaldo,
      saldoMaximo,
      porcentajeConSaldo: billeteras.length > 0 ? (billeterasConSaldo / billeteras.length) * 100 : 0
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
      <Main className='space-y-4'>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Billeteras de Usuarios</h2>
            <p className='text-muted-foreground'>
              Administra las billeteras de proveedores y vendedores del sistema.
            </p>
          </div>
        </div>

        <BilleteraFiltersComponent
          billeteras={billeteras.filter(b => b.usuario?.rol !== 'admin')}
          onFilter={handleBilleteraFilter}
        />

        <Tabs defaultValue="proveedores" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proveedores" className="flex items-center gap-2">
              <IconBuilding className="h-4 w-4" />
              Proveedores
              <Badge variant="secondary" className="ml-1">
                {billeterasProveedores.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="flex items-center gap-2">
              <IconTruck className="h-4 w-4" />
              Vendedores
              <Badge variant="secondary" className="ml-1">
                {billeterasVendedores.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Sección de Proveedores */}
          <TabsContent value="proveedores" className="space-y-4">
            {(() => {
              const stats = getEstadisticasRol(billeterasProveedores)
              return (
                <>
                  {/* Estadísticas de Proveedores */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total Proveedores</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{formatCurrency(stats.saldoTotal)}</div>
                        <p className="text-xs text-muted-foreground">Saldo Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{formatCurrency(stats.saldoPromedio)}</div>
                        <p className="text-xs text-muted-foreground">Saldo Promedio</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.billeterasConSaldo}</div>
                        <p className="text-xs text-muted-foreground">Con Saldo ({stats.porcentajeConSaldo.toFixed(1)}%)</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconBuilding className="h-5 w-5" />
                          Billeteras de Proveedores
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">
                          Saldo máximo: {formatCurrency(stats.saldoMaximo)}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BilleterasTable
                        billeteras={getFilteredBilleteras(billeterasProveedores)}
                        onViewMovimientos={handleViewMovimientos}
                      />
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </TabsContent>

          {/* Sección de Vendedores */}
          <TabsContent value="vendedores" className="space-y-4">
            {(() => {
              const stats = getEstadisticasRol(billeterasVendedores)
              return (
                <>
                  {/* Estadísticas de Vendedores */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">Total Vendedores</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{formatCurrency(stats.saldoTotal)}</div>
                        <p className="text-xs text-muted-foreground">Saldo Total</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{formatCurrency(stats.saldoPromedio)}</div>
                        <p className="text-xs text-muted-foreground">Saldo Promedio</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{stats.billeterasConSaldo}</div>
                        <p className="text-xs text-muted-foreground">Con Saldo ({stats.porcentajeConSaldo.toFixed(1)}%)</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconTruck className="h-5 w-5" />
                          Billeteras de Vendedores
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">
                          Saldo máximo: {formatCurrency(stats.saldoMaximo)}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BilleterasTable
                        billeteras={getFilteredBilleteras(billeterasVendedores)}
                        onViewMovimientos={handleViewMovimientos}
                      />
                    </CardContent>
                  </Card>
                </>
              )
            })()}
          </TabsContent>
        </Tabs>

        {/* Modal de movimientos */}
        <MovimientosBilleteraModal
          billetera={billeteraSeleccionada}
          open={showMovimientosModal}
          onClose={handleCloseMovimientosModal}
          onUpdateEstado={handleUpdateEstado}
        />

      </Main>
    </>
  )
}
