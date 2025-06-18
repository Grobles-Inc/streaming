import { useAuthStore } from '@/stores/authStore'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts'
import { useRecargasByVendedor } from '../../recargas/queries'
import { useComprasByVendedor } from '../../compras/queries'



export function ResumenBarChart() {
  const { auth } = useAuthStore()
  if (!auth.user?.id) {
    return null
  }
  const { data: recargas } = useRecargasByVendedor(auth.user.id)
  const { data: compras } = useComprasByVendedor(auth.user.id)
  const totalRecargas = recargas?.reduce((acc, recarga) => acc + recarga.monto, 0) || 0
  const totalCompras = compras?.reduce((acc, compra) => acc + compra.precio, 0) || 0
  const data = [
    {
      name: 'Resumen',
      recargas: totalRecargas,
      compras: totalCompras,
    },
  ]
  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Legend />
        <Bar
          dataKey='recargas'
          fill='#10b981'
          radius={[4, 4, 0, 0]}
          name='Income'
        />
        <Bar
          dataKey='compras'
          fill='#ef4444'
          radius={[4, 4, 0, 0]}
          name='Expense'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}