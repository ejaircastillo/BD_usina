"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

interface YearlyData {
  year: string
  cases: number
}

const chartConfig = {
  cases: {
    label: "Casos",
    color: "hsl(var(--chart-1))",
  },
}

export function CasesByYearChart() {
  const [data, setData] = useState<YearlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchYearlyData = async () => {
      try {
        const supabase = createClient()

        const { data: hechos, error } = await supabase.from("hechos").select("fecha_hecho")

        if (error) {
          console.error("Error fetching yearly data:", error)
          return
        }

        const yearCounts: { [key: string]: number } = {}

        hechos?.forEach((hecho) => {
          if (hecho.fecha_hecho) {
            const year = new Date(hecho.fecha_hecho).getFullYear().toString()
            yearCounts[year] = (yearCounts[year] || 0) + 1
          }
        })

        const chartData = Object.entries(yearCounts)
          .map(([year, cases]) => ({ year, cases }))
          .sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))

        setData(chartData)
      } catch (error) {
        console.error("Error fetching yearly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchYearlyData()
  }, [])

  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="font-heading">Casos por Año</CardTitle>
          <CardDescription>Evolución del número de casos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-slate-500">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="font-heading">Casos por Año</CardTitle>
          <CardDescription>Evolución del número de casos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-slate-500">No hay casos registrados aún</p>
          </div>
        </CardContent>
      </Card>
    )
  }

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
              <Bar dataKey="cases" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
