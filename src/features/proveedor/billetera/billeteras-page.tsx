import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { DataTable } from './components/billetera-table'
import { columns } from './components/billetera-columns'
import { AgregarFondosModal } from './components/agregar-fondos-modal'
import { RetirarFondosModal } from './components/retirar-fondos-modal'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useAuth } from '@/stores/authStore'
import { useBilleteraByUsuario, useHistorialTransacciones, useBilleteraStats } from './queries'
import { useQueryClient } from '@tanstack/react-query'
import { IconRefresh } from '@tabler/icons-react'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'

export default function BilleterasPage() {
  const [agregarModalOpen, setAgregarModalOpen] = useState(false)
  const [retirarModalOpen, setRetirarModalOpen] = useState(false)

  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Obtener datos reales de la base de datos
  const { data: billetera } = useBilleteraByUsuario(user?.id || '')
  const { data: transacciones = [] } = useHistorialTransacciones(user?.id || '')
  const { data: _stats } = useBilleteraStats(user?.id || '')

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Debe iniciar sesión para acceder a su billetera</p>
        </div>
      </Main>
    )
  }

  // Formatear datos
  const saldoFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(billetera?.saldo || 0)

  // Calcular estadísticas de las recargas completadas
  const recargasCompletadas = transacciones.filter(t => t.estado === 'completado')
  const totalRecargas = recargasCompletadas.reduce((acc, t) => acc + t.monto, 0)
  const recargasPendientes = transacciones.filter(t => t.estado === 'pendiente').length

  const totalRecargasFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(totalRecargas)

  const handleAgregarFondos = async () => {
    // Refrescar los datos después de agregar fondos
    await queryClient.invalidateQueries({ queryKey: ['billetera'] })
    await queryClient.invalidateQueries({ queryKey: ['recargas'] })
  }

  const handleRetirarFondos = async () => {
    // Refrescar los datos después de retirar fondos
    await queryClient.invalidateQueries({ queryKey: ['billetera'] })
    await queryClient.invalidateQueries({ queryKey: ['recargas'] })
  }



  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Button className=' rounded-full mx-2' size="icon" variant='ghost' title='Recargar ventana' onClick={() => window.location.reload()} >
            <IconRefresh />
          </Button>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="space-y-6">
          {/* Header de Billetera */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Billetera</h1>
              <p className="text-muted-foreground">
                Gestiona tus fondos y transacciones
              </p>
            </div>
          </div>

          {/* Información del Usuario y Saldo */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuario</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.nombres} {user.apellidos}</div>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Actual</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{saldoFormateado}</div>
                <p className="text-xs text-muted-foreground">
                  {recargasPendientes} transacciones pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recargas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalRecargasFormateado}</div>
                <p className="text-xs text-muted-foreground">
                  {recargasCompletadas.length} recargas completadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{transacciones.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total de transacciones
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <Button
              onClick={() => setAgregarModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Fondos
            </Button>

            <Button
              variant="outline"
              onClick={() => setRetirarModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Minus className="h-4 w-4" />
              Retirar Fondos
            </Button>
          </div>

          {/* Tabla de Transacciones */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Recargas</CardTitle>
              <CardDescription>
                Lista completa de todas tus recargas de billetera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={transacciones} />
            </CardContent>
          </Card>

          {/* Modales */}
          <AgregarFondosModal
            open={agregarModalOpen}
            onOpenChange={setAgregarModalOpen}
            onSubmit={handleAgregarFondos}
          />

          <RetirarFondosModal
            open={retirarModalOpen}
            onOpenChange={setRetirarModalOpen}
            onSubmit={handleRetirarFondos}
            saldoDisponible={billetera?.saldo || 0}
          />
        </div>
      </Main>
    </>
  )
}
