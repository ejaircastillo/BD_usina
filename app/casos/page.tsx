"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, User, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { CasesFilters } from "@/components/cases/cases-filters"

interface CaseData {
  id: string
  victimName: string
  incidentDate: string
  location: string
  province: string
  status: string
  familyContactName: string
  familyRelationship: string
  familyContactPhone: string
}

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
    case "Prescripción":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

interface CaseCardProps {
  case: CaseData
}

function CaseCard({ case: caseData }: CaseCardProps) {
  return (
    <Link href={`/casos/${caseData.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300 cursor-pointer hover:scale-105">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 font-heading mb-2 line-clamp-2">
                {caseData.victimName}
              </h3>
              <Badge className={`text-xs ${getStatusColor(caseData.status)}`}>{caseData.status}</Badge>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="line-clamp-1">{caseData.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="line-clamp-1">
                  {caseData.familyContactName} - {caseData.familyRelationship}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 text-blue-600 text-center">📞</span>
                <span className="line-clamp-1 font-mono text-xs">{caseData.familyContactPhone}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CasosPage() {
  const [cases, setCases] = useState<CaseData[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    province: "",
    location: "",
    status: "",
    assignedMember: "",
    searchTerm: "",
  })

  const casesPerPage = 12
  const supabase = createClient()

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [cases, filters])

  const fetchCases = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: victimData, error: victimError } = await supabase.from("victimas").select(`
          id,
          nombre_completo,
          telefono_contacto_familiar,
          hechos (
            id,
            fecha_hecho,
            lugar_especifico,
            provincia,
            seguimiento (
              contacto_familia
            ),
            imputados (
              estado_procesal
            )
          )
        `)

      if (victimError) throw victimError

      // Transform data to match component interface
      const transformedCases: CaseData[] = victimData.map((victim: any) => {
        const incident = victim.hechos?.[0] || {}
        const followUp = incident.seguimiento?.[0] || {}
        const imputado = incident.imputados?.[0] || {}

        // Parse family contact to extract name and relationship
        const familyContactParts = followUp.contacto_familia?.split(" - ") || ["", ""]

        return {
          id: victim.id,
          victimName: victim.nombre_completo,
          incidentDate: incident.fecha_hecho || new Date().toISOString(),
          location: incident.lugar_especifico || "No especificado",
          province: incident.provincia || "No especificado",
          status: imputado.estado_procesal || "En investigación",
          familyContactName: familyContactParts[0] || "No especificado",
          familyRelationship: familyContactParts[1] || "Familiar",
          familyContactPhone: victim.telefono_contacto_familiar || "No especificado",
        }
      })

      setCases(transformedCases)
    } catch (err) {
      console.error("Error fetching cases:", err)
      setError("Error al cargar los casos")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...cases]

    // Apply search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (caseData) =>
          caseData.victimName.toLowerCase().includes(searchLower) ||
          caseData.location.toLowerCase().includes(searchLower) ||
          caseData.province.toLowerCase().includes(searchLower),
      )
    }

    // Apply date filters
    if (filters.dateFrom) {
      filtered = filtered.filter((caseData) => caseData.incidentDate >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter((caseData) => caseData.incidentDate <= filters.dateTo)
    }

    // Apply province filter
    if (filters.province) {
      filtered = filtered.filter((caseData) => caseData.province === filters.province)
    }

    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filtered = filtered.filter((caseData) => caseData.location.toLowerCase().includes(locationLower))
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((caseData) => caseData.status === filters.status)
    }

    setFilteredCases(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredCases.length / casesPerPage)
  const startIndex = (currentPage - 1) * casesPerPage
  const endIndex = startIndex + casesPerPage
  const currentCases = filteredCases.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Cargando casos...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-slate-900 font-heading mb-4">Error</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">{error}</p>
          <Button onClick={fetchCases} className="bg-blue-600 hover:bg-blue-700">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 font-heading mb-2">Todos los Casos</h1>
        <p className="text-lg text-slate-600">
          Base de datos completa de víctimas - {filteredCases.length} casos encontrados
        </p>
      </div>

      <CasesFilters onFiltersChange={handleFiltersChange} />

      {filteredCases.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No se encontraron casos</h2>
          <p className="text-slate-600 mb-4">
            {filters.searchTerm || Object.values(filters).some(Boolean)
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay casos disponibles para mostrar"}
          </p>
          {(filters.searchTerm || Object.values(filters).some(Boolean)) && (
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  dateFrom: "",
                  dateTo: "",
                  province: "",
                  location: "",
                  status: "",
                  assignedMember: "",
                  searchTerm: "",
                })
              }}
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {currentCases.map((caseData) => (
              <CaseCard key={caseData.id} case={caseData} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
