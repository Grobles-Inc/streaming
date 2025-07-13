import { useEffect, useState } from 'react'
import { IconTrendingUp, IconTrendingDown, IconWallet } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'

type BalanceData = {
  totalGanado: number
  totalPerdido: number
  balanceTotal: number
  totalGanadoUSD: number
  totalPerdidoUSD: number
  balanceTotalUSD: number
  loading: boolean
}

export function BalanceSummary() {
  const [balanceData, setBalanceData] = useState<BalanceData>({
    totalGanado: 0,
    totalPerdido: 0,
    balanceTotal: 0,
    totalGanadoUSD: 0,
    totalPerdidoUSD: 0,
    balanceTotalUSD: 0,
    loading: true
  })

  useEffect(() => {
    loadBalanceData()
  }, [])

  const loadBalanceData = async () => {
    try {
      setBalanceData(prev => ({ ...prev, loading: true }))

      // Obtener el último registro de configuración para la conversión (dólares a soles)
      const { data: configList, error: configError } = await supabase
        .from('configuracion')
        .select('conversion')
        .order('updated_at', { ascending: false })
        .limit(1)

      if (configError) {
        console.error('❌ Error obteniendo configuración:', configError)
      }

      const conversionRate = configList?.[0]?.conversion || 1

      // Obtener recargas aprobadas
      const { data: recargasAprobadas, error: rechargeError } = await supabase
        .from('recargas')
        .select('monto')
        .eq('estado', 'aprobado')

      if (rechargeError) throw rechargeError

      // Obtener retiros aprobados
      const { data: retirosAprobados, error: withdrawalError } = await supabase
        .from('retiros')
        .select('monto')
        .eq('estado', 'aprobado')

      if (withdrawalError) throw withdrawalError

      // Calcular totales en USD (montos originales están en dólares)
      const totalRecargasUSD = recargasAprobadas?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0
      const totalRetirosUSD = retirosAprobados?.reduce((sum, item) => sum + (item.monto || 0), 0) || 0
      const balanceTotalUSD = totalRecargasUSD - totalRetirosUSD

      // Convertir a soles usando la tasa de conversión (dólares * conversion = soles)
      const totalRecargasPEN = totalRecargasUSD * conversionRate
      const totalRetirosPEN = totalRetirosUSD * conversionRate
      const balanceTotalPEN = balanceTotalUSD * conversionRate

      setBalanceData({
        totalGanado: totalRecargasPEN,
        totalPerdido: totalRetirosPEN,
        balanceTotal: balanceTotalPEN,
        totalGanadoUSD: totalRecargasUSD,
        totalPerdidoUSD: totalRetirosUSD,
        balanceTotalUSD,
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

  const formatCurrencyUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <>
      {/* Versión completa - se oculta cuando el sidebar está colapsado */}
      <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 group-data-[collapsible=icon]:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
            
            <span>Contabilidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {balanceData.loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Total Recargas */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconTrendingUp size={14} className="text-green-600" />
                    <span className="text-xs text-gray-700">Recargas</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    {formatCurrencyUSD(balanceData.totalGanadoUSD)}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {formatCurrency(balanceData.totalGanado)}
                  </span>
                </div>
              </div>

              {/* Total Retiros */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconTrendingDown size={14} className="text-red-600" />
                    <span className="text-xs text-gray-700">Retiros</span>
                  </div>
                  <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                    {formatCurrencyUSD(balanceData.totalPerdidoUSD)}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {formatCurrency(balanceData.totalPerdido)}
                  </span>
                </div>
              </div>

              {/* Separador */}
              <hr className="border-blue-200" />

              {/* Balance Total */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconWallet size={14} className="text-blue-600" />
                    <span className="text-xs font-medium text-gray-800">Balance</span>
                  </div>
                  <Badge 
                    variant={balanceData.balanceTotalUSD >= 0 ? "default" : "destructive"}
                    className={
                      balanceData.balanceTotalUSD >= 0 
                        ? "bg-blue-600 text-white" 
                        : "bg-red-600 text-white"
                    }
                  >
                    {formatCurrencyUSD(balanceData.balanceTotalUSD)}
                  </Badge>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {formatCurrency(balanceData.balanceTotal)}
                  </span>
                </div>
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
