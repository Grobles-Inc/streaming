import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuthStore } from "@/stores/authStore"
import { useComprasByVendedor } from "../../compras/queries"

type TimeFilter = 'day' | 'week' | 'month'

interface ResumenComprasPieChartProps {
  timeFilter: TimeFilter
}

const chartConfig = {
  total: {
    label: "Total",
  },
  Resueltos: {
    label: "Resueltos",
    color: "var(--chart-1)",
  },
  Soporte: {
    label: "Soporte",
    color: "var(--chart-2)",
  },
  Vencidos: {
    label: "Vencidos",
    color: "var(--chart-3)",
  },
  Pedidos: {
    label: "Pedidos",
    color: "var(--chart-4)",
  },
  Entregados: {
    label: "Entregados",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ResumenComprasPieChart({ timeFilter }: ResumenComprasPieChartProps) {
  const { user } = useAuthStore()
  if (!user?.id) {
    return null
  }

  const { data: compras } = useComprasByVendedor(user.id)

  // Filter recargas based on time filter
  const filterComprasByTime = (compras: any[], filter: TimeFilter) => {
    if (!compras) return []

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    let filterDate: Date
    switch (filter) {
      case 'day':
        filterDate = startOfDay
        break
      case 'week':
        filterDate = startOfWeek
        break
      case 'month':
        filterDate = startOfMonth
        break
      default:
        filterDate = startOfDay
    }

    return compras.filter(compra => {
      const compraDate = new Date(compra.created_at)
      return compraDate >= filterDate
    })
  }

  const filteredCompras = filterComprasByTime(compras || [], timeFilter)

  // Group recargas by status
  const comprasByStatus = filteredCompras.reduce((acc, recarga) => {
    const status = recarga.estado || 'resuelto'
    if (!acc[status]) {
      acc[status] = 0
    }
    acc[status] += recarga.precio
    return acc
  }, {} as Record<string, number>)

  // Prepare chart data
  const chartData = Object.entries(comprasByStatus).map(([status, total]) => ({
    name: status,
    total,
    fill: (chartConfig[status as keyof typeof chartConfig] as any)?.color || "var(--chart-1)"
  }))

  // Calculate totals
  const totalCompras = filteredCompras.reduce((acc, recarga) => acc + recarga.precio, 0)
  const totalCount = filteredCompras.length

  // Get filter label
  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'day':
        return 'Hoy'
      case 'week':
        return 'Esta Semana'
      case 'month':
        return 'Este Mes'
      default:
        return 'Hoy'
    }
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[350px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="name"
          innerRadius={75}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-bold"
                    >
                      ${totalCompras.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-sm"
                    >
                      {getFilterLabel(timeFilter)}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 35}
                      className="fill-muted-foreground text-xs"
                    >
                      {totalCount} recargas
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}