import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, Wallet, TrendingUp, TrendingDown, DollarSign, Download, Search } from 'lucide-react'
import { DataTable } from './components/billetera-table'
import { columns } from './components/billetera-columns'
import { transaccionesData, usuarioData } from './data/data'
import { AgregarFondosModal } from './components/agregar-fondos-modal'
import { RetirarFondosModal } from './components/retirar-fondos-modal'
// import type { AgregarFondos, RetirarFondos } from './data/schema'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

export default function BilleterasPage() {
  const [agregarModalOpen, setAgregarModalOpen] = useState(false)
  const [retirarModalOpen, setRetirarModalOpen] = useState(false)

  const saldoFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(usuarioData.saldo_actual)

  // Calcular estadísticas
  const transaccionesCompletadas = transaccionesData.filter(t => t.estado === 'completado')
  const totalIngresos = transaccionesCompletadas
    .filter(t => t.cambio > 0)
    .reduce((acc, t) => acc + t.cambio, 0)
  const totalEgresos = transaccionesCompletadas
    .filter(t => t.cambio < 0)
    .reduce((acc, t) => acc + Math.abs(t.cambio), 0)
  const transaccionesPendientes = transaccionesData.filter(t => t.estado === 'pendiente').length

  const ingresosFormateados = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(totalIngresos)

  const egresosFormateados = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(totalEgresos)

  const handleAgregarFondos = async () => {
    // Aquí implementarías la lógica para agregar fondos
    // Por ejemplo, hacer una llamada a la API
    // Simular éxito por ahora
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleRetirarFondos = async () => {
    // Aquí implementarías la lógica para retirar fondos
    // Por ejemplo, hacer una llamada a la API
    // Simular éxito por ahora
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <>
      <Header>
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </Header>
      <Main>
        <div className="space-y-6">
          {/* Header de Billetera */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">💼 Billetera</h1>
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
                <div className="text-2xl font-bold">{usuarioData.nombre}</div>
                <p className="text-xs text-muted-foreground">
                  ID: {usuarioData.id}
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
                  {transaccionesPendientes} transacciones pendientes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{ingresosFormateados}</div>
                <p className="text-xs text-muted-foreground">
                  Total recibido este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Egresos</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{egresosFormateados}</div>
                <p className="text-xs text-muted-foreground">
                  Total retirado este mes
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
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>
                Lista completa de todas tus transacciones de billetera
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={transaccionesData} />
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
            saldoDisponible={usuarioData.saldo_actual}
          />
        </div>
      </Main>
    </>
  )
}
