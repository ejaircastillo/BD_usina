"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Search } from "lucide-react"

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

interface CasesGridProps {
  cases?: any[]
  filters?: {
    dateFrom?: string
    dateTo?: string
    status?: string
    searchTerm?: string
  }
}

export function CasesGrid({ cases = [], filters = {} }: CasesGridProps) {
  // Usar los casos pasados como props en lugar de mockCases
  const filteredCases = cases.filter((case_) => {
    // Date range filter
    if (filters.dateFrom) {
      const caseDate = new Date(case_.created_at)
      const fromDate = new Date(filters.dateFrom)
      if (caseDate < fromDate) return false
    }

    if (filters.dateTo) {
      const caseDate = new Date(case_.created_at)
      const toDate = new Date(filters.dateTo)
      if (caseDate > toDate) return false
    }

    // Status filter
    if (filters.status && case_.estado !== filters.status) {
      return false
    }

    // Search term filter (searches in id_interno and numero_expediente)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesIdInterno = case_.id_interno?.toLowerCase().includes(searchLower)
      const matchesExpediente = case_.numero_expediente?.toLowerCase().includes(searchLower)
      if (!matchesIdInterno && !matchesExpediente) {
        return false
      }
    }

    return true
  })

  if (filteredCases.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron casos</h3>
        <p className="text-slate-600 mb-4">
          {Object.keys(filters).some((key) => filters[key as keyof typeof filters])
            ? "Intente ajustar los filtros para ver más resultados."
            : "No hay casos registrados en el sistema."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-slate-600">
          Mostrando {filteredCases.length} de {cases.length} casos
          {Object.keys(filters).some((key) => filters[key as keyof typeof filters]) && (
            <span className="ml-2 text-slate-500">(filtrados)</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCases.map((case_) => (
          <Link key={case_.id} href={`/casos/${case_.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-slate-200 hover:border-slate-300 cursor-pointer">
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
