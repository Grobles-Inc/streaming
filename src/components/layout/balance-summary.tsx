import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

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



  return (

    <Card className=" group-data-[collapsible=icon]:hidden bg-lime-400 text-black m-2 rounded-md">

      <CardContent>
        {balanceData.loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div>

            <span className="text-sm">Contabilidad</span>
            <div className="text-2xl font-bold">{formatCurrency(balanceData.balanceTotal)}</div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs  ">Recargas</span>
                <div className="text-sm font-medium">{formatCurrency(balanceData.totalGanado)}</div>
              </div>
              <div>
                <span className="text-xs  ">Retiros</span>
                <div className="text-sm font-medium">{formatCurrency(balanceData.totalPerdido)}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

  )
}
