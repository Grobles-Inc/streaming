import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-1)" },
  { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-2)" },
  { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-3)" },
  { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-4)" },
  { month: "May", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-5)" },
  { month: "Jun", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-6)" },
  { month: "Jul", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-7)" },
  { month: "Aug", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-8)" },
  { month: "Sep", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-9)" },
  { month: "Oct", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-10)" },
  { month: "Nov", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-11)" },
  { month: "Dec", total: Math.floor(Math.random() * 5000) + 1000, fill: "var(--chart-12)" },
]

const chartConfig = {
  total: {
    label: "Total",
  },
  Jan: {
    label: "January",
    color: "var(--chart-1)",
  },
  Feb: {
    label: "February",
    color: "var(--chart-2)",
  },
  Mar: {
    label: "March",
    color: "var(--chart-3)",
  },
  Apr: {
    label: "April",
    color: "var(--chart-4)",
  },
  May: {
    label: "May",
    color: "var(--chart-5)",
  },
  Jun: {
    label: "June",
    color: "var(--chart-6)",
  },
  Jul: {
    label: "July",
    color: "var(--chart-7)",
  },
  Aug: {
    label: "August",
    color: "var(--chart-8)",
  },
  Sep: {
    label: "September",
    color: "var(--chart-9)",
  },
  Oct: {
    label: "October",
    color: "var(--chart-10)",
  },
  Nov: {
    label: "November",
    color: "var(--chart-11)",
  },
  Dec: {
    label: "December",
    color: "var(--chart-12)",
  },
} satisfies ChartConfig

export function ResumenPieChart() {
  const totalSales = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.total, 0)
  }, [])

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
          nameKey="month"
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
                      className="fill-foreground text-3xl font-bold"
                    >
                      ${totalSales.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Total Ventas
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