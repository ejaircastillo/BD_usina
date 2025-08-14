"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    year: "2019",
    cases: 89,
  },
  {
    year: "2020",
    cases: 112,
  },
  {
    year: "2021",
    cases: 134,
  },
  {
    year: "2022",
    cases: 167,
  },
  {
    year: "2023",
    cases: 198,
  },
  {
    year: "2024",
    cases: 156,
  },
]

const chartConfig = {
  cases: {
    label: "Casos",
    color: "hsl(var(--chart-1))",
  },
}

export function CasesByYearChart() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="font-heading">Casos por Año</CardTitle>
        <CardDescription>Evolución del número de casos registrados</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis
                dataKey="year"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}`} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="cases" fill="var(--color-cases)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
