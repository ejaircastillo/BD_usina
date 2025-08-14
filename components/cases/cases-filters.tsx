"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Filter, X, Search } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"

interface CasesFiltersProps {
  onFiltersChange?: (filters: {
    dateFrom: string
    dateTo: string
    province: string
    location: string
    status: string
    assignedMember: string
    searchTerm: string
  }) => void
}

export function CasesFilters({ onFiltersChange }: CasesFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    province: "",
    location: "",
    status: "",
    assignedMember: "",
    searchTerm: "", // Added search term
  })

  const provinces = [
    "Buenos Aires",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán",
    "CABA",
  ]

  const statusOptions = [
    "En investigación",
    "Imputado identificado",
    "Procesado",
    "Juicio oral",
    "Condenado",
    "Absuelto",
    "Sobreseído",
    "Archivo",
  ]

  const members = [
    "Dr. María González",
    "Dr. Carlos Rodríguez",
    "Dra. Ana Martínez",
    "Dr. Luis Fernández",
    "Dra. Carmen López",
  ]

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      dateFrom: "",
      dateTo: "",
      province: "",
      location: "",
      status: "",
      assignedMember: "",
      searchTerm: "",
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const applyFilters = () => {
    onFiltersChange?.(filters)
    setIsOpen(false)
  }

  return (
    <div className="mb-8">
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nombre de víctima o ubicación..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="pl-10 border-slate-300"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="w-4 h-4" />
              Filtros Avanzados
              {Object.values(filters).filter(Boolean).length > 0 && (
                <span className="bg-slate-800 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
              {isOpen ? <X className="w-4 h-4" /> : null}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>

        <Link href="/casos/nuevo">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Añadir Nuevo Caso
          </Button>
        </Link>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">
                    Fecha desde
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700">
                    Fecha hasta
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilters({ dateTo: e.target.value })}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Provincia</Label>
                  <Select value={filters.province} onValueChange={(value) => updateFilters({ province: value })}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Seleccionar provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                    Lugar del Hecho
                  </Label>
                  <Input
                    id="location"
                    placeholder="Ciudad, barrio, dirección..."
                    value={filters.location}
                    onChange={(e) => updateFilters({ location: e.target.value })}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Estado Procesal</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Miembro Asignado</Label>
                  <Select
                    value={filters.assignedMember}
                    onValueChange={(value) => updateFilters({ assignedMember: value })}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Seleccionar miembro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
                <Button className="bg-slate-800 hover:bg-slate-700" onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
