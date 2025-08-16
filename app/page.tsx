"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { CasesGrid } from "@/components/cases/cases-grid"
import { CasesFilters } from "@/components/cases/cases-filters"
import { AnimatedCasesGrid } from "@/components/cases/animated-cases-grid"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "",
    searchTerm: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"animated" | "grid">("animated")
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Función para construir la URL con parámetros de consulta
  const buildApiUrl = (currentFilters: {
    dateFrom: string
    dateTo: string
    status: string
    searchTerm: string
  }) => {
    const params = new URLSearchParams()
    
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim() !== '') {
        params.append(key, value)
      }
    })
    
    const queryString = params.toString()
    return `/api/casos${queryString ? `?${queryString}` : ''}`
  }

  // Función para obtener los casos de la API
  const fetchCases = async (currentFilters: {
    dateFrom: string
    dateTo: string
    status: string
    searchTerm: string
  } = filters) => {
    try {
      setLoading(true)
      setError(null)
      
      const url = buildApiUrl(currentFilters)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCases(data.casos || [])
    } catch (err) {
      console.error('Error fetching cases:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar los casos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar casos al montar el componente
  useEffect(() => {
    fetchCases()
  }, [])

  // Actualizar casos cuando cambien los filtros
  useEffect(() => {
    fetchCases(filters)
  }, [filters])

  // Manejar cambios en los filtros
  const handleFiltersChange = (newFilters: {
    dateFrom: string
    dateTo: string
    status: string
    searchTerm: string
  }) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 font-heading mb-4">Observatorio de Víctimas</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Sistema integral de seguimiento y registro de casos de violencia institucional
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/casos/nuevo">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-lg">
                <Plus className="w-5 h-5 mr-2" />
                Añadir Nuevo Caso
              </Button>
            </Link>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "animated" ? "default" : "outline"}
                onClick={() => setViewMode("animated")}
                className={
                  viewMode === "animated"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-blue-200 text-blue-700 hover:bg-blue-50"
                }
              >
                Vista Animada
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "border-blue-200 text-blue-700 hover:bg-blue-50"
                }
              >
                Vista de Grilla
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Button>
          </div>
        </div>

        {/* Mostrar estado de carga */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando casos...</p>
          </div>
        )}

        {/* Mostrar error si existe */}
        {error && (
          <div className="text-center py-8 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800 font-medium">Error al cargar los casos</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchCases()} 
                className="mt-3"
              >
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Mostrar contenido solo si no hay error ni carga */}
        {!loading && !error && (
          <>
            {viewMode === "animated" ? (
              <div className="scrolling-container">
                <AnimatedCasesGrid cases={cases} />
              </div>
            ) : (
              <>
                {showFilters && (
                  <div className="mb-8">
                    <CasesFilters onFiltersChange={handleFiltersChange} />
                  </div>
                )}
                <CasesGrid cases={cases} filters={filters} />
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
