import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts'

const data = [
  {
    name: 'Jan',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Feb',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Mar',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Apr',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'May',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Jun',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Jul',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Aug',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Sep',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Oct',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Nov',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
  {
    name: 'Dec',
    income: Math.floor(Math.random() * 5000) + 1000,
    expense: Math.floor(Math.random() * 3000) + 500,
  },
]

export function ResumenBarChart() {
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
          dataKey='income'
          fill='#10b981'
          radius={[4, 4, 0, 0]}
          name='Income'
        />
        <Bar
          dataKey='expense'
          fill='#ef4444'
          radius={[4, 4, 0, 0]}
          name='Expense'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}