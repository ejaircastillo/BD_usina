"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User, Search } from "lucide-react"

const mockCases = [
  {
    id: "1",
    victimName: "María Elena Rodríguez",
    incidentDate: "2024-03-15",
    location: "La Plata, Buenos Aires",
    province: "Buenos Aires",
    status: "En investigación",
    assignedMember: "Dr. María González",
  },
  {
    id: "2",
    victimName: "Carlos Alberto Fernández",
    incidentDate: "2024-02-28",
    location: "Rosario, Santa Fe",
    province: "Santa Fe",
    status: "Procesado",
    assignedMember: "Dr. Carlos Rodríguez",
  },
  {
    id: "3",
    victimName: "Ana Sofía Martínez",
    incidentDate: "2024-01-20",
    location: "Córdoba Capital",
    province: "Córdoba",
    status: "Juicio oral",
    assignedMember: "Dra. Ana Martínez",
  },
  {
    id: "4",
    victimName: "Roberto Luis García",
    incidentDate: "2023-12-10",
    location: "Mendoza Capital",
    province: "Mendoza",
    status: "Condenado",
    assignedMember: "Dr. Luis Fernández",
  },
  {
    id: "5",
    victimName: "Laura Patricia López",
    incidentDate: "2023-11-05",
    location: "Tucumán Capital",
    province: "Tucumán",
    status: "En investigación",
    assignedMember: "Dra. Carmen López",
  },
  {
    id: "6",
    victimName: "Diego Alejandro Morales",
    incidentDate: "2023-10-18",
    location: "Salta Capital",
    province: "Salta",
    status: "Imputado identificado",
    assignedMember: "Dr. María González",
  },
  {
    id: "7",
    victimName: "Carmen Rosa Jiménez",
    incidentDate: "2024-04-02",
    location: "Mar del Plata, Buenos Aires",
    province: "Buenos Aires",
    status: "Procesado",
    assignedMember: "Dr. Carlos Rodríguez",
  },
  {
    id: "8",
    victimName: "José Miguel Torres",
    incidentDate: "2024-01-15",
    location: "Santa Fe Capital",
    province: "Santa Fe",
    status: "Archivo",
    assignedMember: "Dra. Ana Martínez",
  },
  {
    id: "9",
    victimName: "Silvia Beatriz Herrera",
    incidentDate: "2023-09-22",
    location: "Villa Carlos Paz, Córdoba",
    province: "Córdoba",
    status: "Sobreseído",
    assignedMember: "Dr. Luis Fernández",
  },
  {
    id: "10",
    victimName: "Fernando Daniel Castro",
    incidentDate: "2024-05-10",
    location: "San Miguel de Tucumán",
    province: "Tucumán",
    status: "En investigación",
    assignedMember: "Dra. Carmen López",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "En investigación":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Imputado identificado":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Procesado":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "Juicio oral":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "Condenado":
      return "bg-green-100 text-green-800 border-green-200"
    case "Absuelto":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "Sobreseído":
      return "bg-slate-100 text-slate-800 border-slate-200"
    case "Archivo":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface CasesGridProps {
  filters?: {
    dateFrom?: string
    dateTo?: string
    province?: string
    location?: string
    status?: string
    assignedMember?: string
    searchTerm?: string
  }
}

export function CasesGrid({ filters = {} }: CasesGridProps) {
  const filteredCases = mockCases.filter((case_) => {
    // Date range filter
    if (filters.dateFrom) {
      const caseDate = new Date(case_.incidentDate)
      const fromDate = new Date(filters.dateFrom)
      if (caseDate < fromDate) return false
    }

    if (filters.dateTo) {
      const caseDate = new Date(case_.incidentDate)
      const toDate = new Date(filters.dateTo)
      if (caseDate > toDate) return false
    }

    // Province filter
    if (filters.province && case_.province !== filters.province) {
      return false
    }

    // Location filter (partial match)
    if (filters.location && !case_.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false
    }

    // Status filter
    if (filters.status && case_.status !== filters.status) {
      return false
    }

    // Assigned member filter
    if (filters.assignedMember && case_.assignedMember !== filters.assignedMember) {
      return false
    }

    // Search term filter (searches in victim name and location)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesName = case_.victimName.toLowerCase().includes(searchLower)
      const matchesLocation = case_.location.toLowerCase().includes(searchLower)
      if (!matchesName && !matchesLocation) {
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
          Mostrando {filteredCases.length} de {mockCases.length} casos
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
                      {case_.victimName}
                    </h3>
                    <Badge className={`text-xs ${getStatusColor(case_.status)}`}>{case_.status}</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(case_.incidentDate).toLocaleDateString("es-AR")}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">{case_.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="line-clamp-1">{case_.assignedMember}</span>
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
