"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const data = [
  {
    status: "En investigación",
    cases: 234,
    fill: "hsl(var(--chart-1))",
  },
  {
    status: "Imputado identificado",
    cases: 189,
    fill: "hsl(var(--chart-2))",
  },
  {
    status: "Procesado",
    cases: 156,
    fill: "hsl(var(--chart-3))",
  },
  {
    status: "Juicio oral",
    cases: 98,
    fill: "hsl(var(--chart-4))",
  },
  {
    status: "Condenado",
    cases: 355,
    fill: "hsl(var(--chart-5))",
  },
  {
    status: "Otros",
    cases: 215,
    fill: "hsl(var(--muted))",
  },
]

const chartConfig = {
  cases: {
    label: "Casos",
  },
  "En investigación": {
    label: "En investigación",
    color: "hsl(var(--chart-1))",
  },
  "Imputado identificado": {
    label: "Imputado identificado",
    color: "hsl(var(--chart-2))",
  },
  Procesado: {
    label: "Procesado",
    color: "hsl(var(--chart-3))",
  },
  "Juicio oral": {
    label: "Juicio oral",
    color: "hsl(var(--chart-4))",
  },
  Condenado: {
    label: "Condenado",
    color: "hsl(var(--chart-5))",
  },
  Otros: {
    label: "Otros",
    color: "hsl(var(--muted))",
  },
}

export function StatusDistributionChart() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="font-heading">Distribución por Estado Procesal</CardTitle>
        <CardDescription>Casos según su estado en el proceso judicial</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie data={data} dataKey="cases" nameKey="status" cx="50%" cy="50%" outerRadius={100} innerRadius={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-slate-600 truncate">{item.status}</span>
              <span className="font-medium text-slate-900 ml-auto">{item.cases}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
