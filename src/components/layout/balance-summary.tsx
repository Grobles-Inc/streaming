import { useEffect, useState } from 'react'
import { IconTrendingUp, IconTrendingDown, IconWallet } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

type BalanceData = {
  totalGanado: number
  totalPerdido: number
  balanceTotal: number
  loading: boolean
}

export function BalanceSummary() {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    totalGanado: 0,
    totalPerdido: 0,
    balanceTotal: 0,
    loading: true
  })

  useEffect(() => {
    loadBalanceData()
  }, [])

  const loadBalanceData = async () => {
    try {
      setBalanceData(prev => ({ ...prev, loading: true }))

      // Obtener configuración del sistema para comisiones
      const { data: configList, error: configError } = await supabase
        .from('configuracion')
        .select('comision_publicacion_producto, comision')

      if (configError) {
        console.error('❌ Error obteniendo configuración:', configError)
      }

      // Usar la primera configuración si hay múltiples, o valores por defecto si no hay ninguna
      const config = configList?.[0]
      const finalConfig = config || {
        comision_publicacion_producto: 0,
        comision: 0
      }

      console.log('🔧 Configuración final:', finalConfig)
      console.log('📊 Registros de configuración encontrados:', configList?.length || 0)
      console.log('📋 Todos los registros de configuración:', configList)

      // Obtener productos publicados (para calcular comisiones por publicación)
      const { data: productosPublicados, error: productError } = await supabase
        .from('productos')
        .select('id, nombre, estado')
        .eq('estado', 'publicado')

      if (productError) {
        console.error('❌ Error obteniendo productos:', productError)
        throw productError
      }

      console.log('📦 Productos publicados encontrados:', productosPublicados?.length, productosPublicados)

      // Obtener retiros aprobados (para calcular pérdidas)
      const { data: retirosAprobados, error: withdrawalError } = await supabase
        .from('retiros')
        .select('monto, usuario_id')
        .eq('estado', 'aprobado')

      if (withdrawalError) throw withdrawalError

      // Obtener usuarios admin para filtrar retiros
      const { data: usuariosAdmin, error: adminError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('rol', 'admin')

      if (adminError) throw adminError

      const adminIds = usuariosAdmin?.map(admin => admin.id) || []

      // Obtener recargas aprobadas (monto directo)
      const { data: recargasAprobadas, error: rechargeError } = await supabase
        .from('recargas')
        .select('monto')
        .eq('estado', 'aprobado')

      if (rechargeError) throw rechargeError

      // Calcular totales
      const productosPublicadosCount = productosPublicados?.length || 0
      const productCommissionTotal = productosPublicadosCount * (finalConfig.comision_publicacion_producto || 0)
      
      // Calcular comisiones de retiros (solo de usuarios NO admin)
      const retirosNoAdmin = retirosAprobados?.filter(retiro => !adminIds.includes(retiro.usuario_id)) || []
      const totalRetirosNoAdminAmount = retirosNoAdmin.reduce((sum, item) => sum + (item.monto || 0), 0) || 0
      const withdrawalCommissionTotal = totalRetirosNoAdminAmount * (finalConfig.comision / 100 || 0)
      
      // Calcular monto total de recargas (sin comisión adicional - solo el monto)
      const totalRecargasAmount = recargasAprobadas?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0

      // Calcular total perdido (todos los retiros aprobados)
      const totalRetirosAmount = retirosAprobados?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0

      const totalGanado = productCommissionTotal + withdrawalCommissionTotal + totalRecargasAmount
      const totalPerdido = totalRetirosAmount
      const balanceTotal = totalGanado - totalPerdido

      console.log('🔢 Cálculos detallados:')
      console.log(`📦 Productos publicados: ${productosPublicadosCount} × ${finalConfig.comision_publicacion_producto} = ${productCommissionTotal}`)
      console.log(`💰 Recargas aprobadas: ${totalRecargasAmount} (monto directo) = ${totalRecargasAmount}`)
      console.log(`📤 Retiros no-admin: ${totalRetirosNoAdminAmount} × ${finalConfig.comision}% = ${withdrawalCommissionTotal}`)
      console.log(`🟢 GANADO TOTAL: ${productCommissionTotal} + ${totalRecargasAmount} + ${withdrawalCommissionTotal} = ${totalGanado}`)
      console.log(`🔴 PERDIDO TOTAL: ${totalPerdido}`)
      console.log(`💰 BALANCE FINAL: ${totalGanado} - ${totalPerdido} = ${balanceTotal}`)

      setBalanceData({
        totalGanado,
        totalPerdido,
        balanceTotal,
        loading: false
      })

    } catch (error) {
      console.error('❌ Error loading balance data:', error)
      setBalanceData(prev => ({ ...prev, loading: false }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <>
      {/* Versión completa - se oculta cuando el sidebar está colapsado */}
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 group-data-[collapsible=icon]:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
            <IconWallet size={16} />
            <span>Resumen Financiero</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {balanceData.loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Total Ganado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconTrendingUp size={14} className="text-green-600" />
                  <span className="text-xs text-gray-700">Ganado</span>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                  {formatCurrency(balanceData.totalGanado)}
                </Badge>
              </div>

              {/* Total Perdido */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconTrendingDown size={14} className="text-red-600" />
                  <span className="text-xs text-gray-700">Retirado</span>
                </div>
                <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                  {formatCurrency(balanceData.totalPerdido)}
                </Badge>
              </div>

              {/* Separador */}
              <hr className="border-blue-200" />

              {/* Balance Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconWallet size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-gray-800">Balance</span>
                </div>
                <Badge 
                  variant={balanceData.balanceTotal >= 0 ? "default" : "destructive"}
                  className={
                    balanceData.balanceTotal >= 0 
                      ? "bg-blue-600 text-white" 
                      : "bg-red-600 text-white"
                  }
                >
                  {formatCurrency(balanceData.balanceTotal)}
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Versión compacta - se muestra cuando el sidebar está colapsado */}
      <div className="hidden group-data-[collapsible=icon]:flex justify-center">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <IconWallet size={16} className="text-blue-600" />
        </div>
      </div>
    </>
  )
}
