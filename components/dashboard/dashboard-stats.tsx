"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, FileText, Calendar, Scale } from "lucide-react"

const stats = [
  {
    title: "Total de Casos",
    value: "1,247",
    change: "+12%",
    changeType: "increase" as const,
    icon: FileText,
    description: "Casos registrados en el sistema",
  },
  {
    title: "Casos Último Año",
    value: "156",
    change: "+8%",
    changeType: "increase" as const,
    icon: Calendar,
    description: "Nuevos casos en los últimos 12 meses",
  },
  {
    title: "Casos sin Condena",
    value: "892",
    change: "-3%",
    changeType: "decrease" as const,
    icon: Scale,
    description: "Casos pendientes de resolución judicial",
  },
  {
    title: "En Investigación",
    value: "234",
    change: "+15%",
    changeType: "increase" as const,
    icon: AlertTriangle,
    description: "Casos actualmente bajo investigación",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 font-heading">{stat.value}</div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                {stat.changeType === "increase" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                  {stat.change}
                </span>
                <span>vs mes anterior</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
