import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuthStore } from "@/stores/authStore"
import { useRecargasByVendedor } from "../../recargas/queries"

type TimeFilter = 'day' | 'week' | 'month'

interface ResumenRecargasPieChartProps {
  timeFilter: TimeFilter
}

const chartConfig = {
  total: {
    label: "Total",
  },
  Recargas: {
    label: "Recargas",
    color: "var(--chart-1)",
  },
  Pendientes: {
    label: "Pendientes",
    color: "var(--chart-2)",
  },
  Completadas: {
    label: "Completadas",
    color: "var(--chart-3)",
  },
  Rechazadas: {
    label: "Rechazadas",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ResumenRecargasPieChart({ timeFilter }: ResumenRecargasPieChartProps) {
  const { auth } = useAuthStore()
  if (!auth.user?.id) {
    return null
  }

  const { data: recargas } = useRecargasByVendedor(auth.user.id)

  // Filter recargas based on time filter
  const filterRecargasByTime = (recargas: any[], filter: TimeFilter) => {
    if (!recargas) return []

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

    return recargas.filter(recarga => {
      const recargaDate = new Date(recarga.created_at)
      return recargaDate >= filterDate
    })
  }

  const filteredRecargas = filterRecargasByTime(recargas || [], timeFilter)

  // Group recargas by status
  const recargasByStatus = filteredRecargas.reduce((acc, recarga) => {
    const status = recarga.estado || 'Pendientes'
    if (!acc[status]) {
      acc[status] = 0
    }
    acc[status] += recarga.monto
    return acc
  }, {} as Record<string, number>)

  // Prepare chart data
  const chartData = Object.entries(recargasByStatus).map(([status, total]) => ({
    name: status,
    total,
    fill: (chartConfig[status as keyof typeof chartConfig] as any)?.color || "var(--chart-1)"
  }))

  // Calculate totals
  const totalRecargas = filteredRecargas.reduce((acc, recarga) => acc + recarga.monto, 0)
  const totalCount = filteredRecargas.length

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
                      ${totalRecargas.toLocaleString()}
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