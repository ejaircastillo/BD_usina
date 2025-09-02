"use client"

import { useState } from "react"
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
    province: "",
    location: "",
    status: "",
    assignedMember: "",
    searchTerm: "",
  })

  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"animated" | "grid">("animated")

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-slate-900 font-heading mb-4">Base de Datos de Víctimas</h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">Historias de los casos que acompañamos</p>

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

        {viewMode === "animated" ? (
          <div className="scrolling-container">
            <AnimatedCasesGrid />
          </div>
        ) : (
          <>
            {showFilters && (
              <div className="mb-8">
                <CasesFilters onFiltersChange={setFilters} />
              </div>
            )}
            <CasesGrid filters={filters} />
          </>
        )}
      </main>
    </div>
  )
}
