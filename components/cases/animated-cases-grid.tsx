"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User } from "lucide-react"
import { useEffect, useState } from "react"

const getStatusColor = (status: string) => {
  switch (status) {
    case "En investigación":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Procesado":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Resuelto":
      return "bg-green-100 text-green-800 border-green-200"
    case "Archivado":
      return "bg-red-100 text-red-800 border-red-200"
    case "Iniciado":
      return "bg-orange-100 text-orange-800 border-orange-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function ScrollingRow({ cases, direction, speed }: { cases: any[], direction: "left" | "right", speed: number }) {
  return (
    <div className="overflow-hidden relative">
      <div
        className={`flex gap-6 whitespace-nowrap ${
          direction === "left" ? "animate-scroll-left" : "animate-scroll-right"
        }`}
        style={{
          animationDuration: `${speed}s`,
          width: "fit-content"
        }}
      >
        {/* Duplicate the items for seamless scrolling */}
        {[...cases, ...cases].map((case_, index) => (
          <Link key={`${case_.id}-${index}`} href={`/casos/${case_.id}`}>
            <Card className="w-80 flex-none hover:shadow-lg transition-shadow duration-200 border-slate-200 hover:border-slate-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 font-heading mb-2 line-clamp-2">
                      {case_.id_interno || `Caso ${case_.id.slice(0, 8)}`}
                    </h3>
                    <Badge className={`text-xs ${getStatusColor(case_.estado)}`}>
                      {case_.estado || 'Sin estado'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {case_.created_at 
                          ? new Date(case_.created_at).toLocaleDateString("es-AR") 
                          : 'Sin fecha'
                        }
                      </span>
                    </div>

                    {case_.numero_expediente && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="line-clamp-1">Exp. {case_.numero_expediente}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">
                        ID: {case_.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

interface AnimatedCasesGridProps {
  cases?: any[]
}

export function AnimatedCasesGrid({ cases = [] }: AnimatedCasesGridProps) {
  const [rows, setRows] = useState<any[][]>([])

  useEffect(() => {
    if (cases.length > 0) {
      // Split cases into multiple rows
      const chunkSize = 4
      const caseRows = []
      for (let i = 0; i < cases.length; i += chunkSize) {
        caseRows.push(cases.slice(i, i + chunkSize))
      }
      setRows(caseRows)
    }
  }, [cases])

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay casos para mostrar</h3>
        <p className="text-slate-600">Los casos aparecerán aquí una vez que sean cargados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">Casos Recientes</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Observatorio de víctimas - Seguimiento continuo de casos de violencia institucional
        </p>
      </div>

      <div className="space-y-8">
        {rows.map((rowCases, index) => (
          <ScrollingRow
            key={index}
            cases={rowCases}
            direction={index % 2 === 0 ? "left" : "right"}
            speed={30 + index * 5}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/casos"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Todos los Casos
        </Link>
      </div>
    </div>
  )
}
