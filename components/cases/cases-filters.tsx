"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, X, Search } from "lucide-react"

interface CasesFiltersProps {
  onFiltersChange?: (filters: {
    dateFrom: string
    dateTo: string
    status: string
    searchTerm: string
  }) => void
}

export function CasesFilters({ onFiltersChange }: CasesFiltersProps) {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "",
    searchTerm: "",
  })

  const statusOptions = [
    "Iniciado",
    "En investigación", 
    "Procesado",
    "Resuelto",
    "Archivado",
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
      status: "",
      searchTerm: "",
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== "")

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-lg text-slate-900">Filtros de Búsqueda</h3>
          </div>
          
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearFilters}
              className="text-slate-600 hover:text-slate-800"
            >
              <X className="w-4 h-4 mr-2" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Term */}
          <div className="space-y-2">
            <Label htmlFor="searchTerm" className="text-sm font-medium text-slate-700">
              Búsqueda General
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="searchTerm"
                placeholder="ID interno, expediente..."
                className="pl-9"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Estado</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700">
              Fecha Desde
            </Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700">
              Fecha Hasta
            </Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* Filter Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  Búsqueda: {filters.searchTerm}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  Estado: {filters.status}
                </span>
              )}
              {filters.dateFrom && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                  Desde: {new Date(filters.dateFrom).toLocaleDateString("es-AR")}
                </span>
              )}
              {filters.dateTo && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                  Hasta: {new Date(filters.dateTo).toLocaleDateString("es-AR")}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
