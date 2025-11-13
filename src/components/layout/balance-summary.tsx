import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useCallback, useEffect, useState } from 'react'

type BalanceData = {
  totalGanado: number
  totalPerdido: number
  balanceTotal: number
  totalGanadoUSD: number
  totalPerdidoUSD: number
  balanceTotalUSD: number
  loading: boolean
}

const normalizeMonto = (monto: number | string | null | undefined) => {
  if (monto === null || monto === undefined) return 0
  if (typeof monto === 'number') return monto
  const parsed = Number(monto)
  return Number.isNaN(parsed) ? 0 : parsed
}

const PAGE_SIZE = 1000

type TotalsResult = {
  total: number
  count: number
}

const fetchAprobadosTotals = async (table: 'recargas' | 'retiros'): Promise<TotalsResult> => {
  let from = 0
  let total = 0
  let count = 0

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('monto')
      .eq('estado', 'aprobado')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw error
    }

    const chunk = data ?? []
    total += chunk.reduce((sum, item) => sum + normalizeMonto(item.monto), 0)
    count += chunk.length

    if (chunk.length < PAGE_SIZE) {
      break
    }

    from += PAGE_SIZE
  }

  return { total, count }
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

  const loadBalanceData = useCallback(async () => {
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

      const [{ total: totalRecargasUSD, count: recargasCount }, { total: totalRetirosUSD, count: retirosCount }] =
        await Promise.all([
          fetchAprobadosTotals('recargas'),
          fetchAprobadosTotals('retiros')
        ])
      const balanceTotalUSD = totalRecargasUSD - totalRetirosUSD

      // Convertir a soles usando la tasa de conversión (dólares * conversion = soles)
      const totalRecargasPEN = totalRecargasUSD * conversionRate
      const totalRetirosPEN = totalRetirosUSD * conversionRate
      const balanceTotalPEN = balanceTotalUSD * conversionRate

      console.info('[BalanceSummary] Datos cargados', {
        conversionRate,
        totalRecargasUSD,
        totalRetirosUSD,
        balanceTotalUSD,
        totalRecargasPEN,
        totalRetirosPEN,
        balanceTotalPEN,
        recargasCount,
        retirosCount,
      })

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
  }, [])

  useEffect(() => {
    void loadBalanceData()
  }, [loadBalanceData])

  useEffect(() => {
    const channel = supabase
      .channel('balance-summary-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recargas' },
        (payload) => {
          const newEstado = (payload.new as { estado?: string } | null)?.estado
          const oldEstado = (payload.old as { estado?: string } | null)?.estado
          if (newEstado === 'aprobado' || oldEstado === 'aprobado') {
            void loadBalanceData()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'retiros' },
        (payload) => {
          const newEstado = (payload.new as { estado?: string } | null)?.estado
          const oldEstado = (payload.old as { estado?: string } | null)?.estado
          if (newEstado === 'aprobado' || oldEstado === 'aprobado') {
            void loadBalanceData()
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'configuracion' },
        () => {
          void loadBalanceData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadBalanceData])

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
