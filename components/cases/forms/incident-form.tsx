"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface IncidentFormProps {
  data: any
  onChange: (data: any) => void
}

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

const locationTypes = ["Vía Pública", "Vivienda Particular", "Comercio", "Unidad Penitenciaria", "Comisaría", "Otro"]

export function IncidentForm({ data, onChange }: IncidentFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Información del Hecho</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incidentDate" className="text-sm font-medium text-slate-700">
              Fecha del Hecho *
            </Label>
            <Input
              id="incidentDate"
              type="date"
              value={data.date || ""}
              onChange={(e) => handleChange("date", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deathDate" className="text-sm font-medium text-slate-700">
              Fecha de Fallecimiento *
            </Label>
            <Input
              id="deathDate"
              type="date"
              value={data.deathDate || ""}
              onChange={(e) => handleChange("deathDate", e.target.value)}
              className="border-slate-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="incidentTime" className="text-sm font-medium text-slate-700">
              Hora Aproximada
            </Label>
            <Input
              id="incidentTime"
              type="time"
              value={data.time || ""}
              onChange={(e) => handleChange("time", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Provincia</Label>
            <Select value={data.province || ""} onValueChange={(value) => handleChange("province", value)}>
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
            <Label htmlFor="incidentCity" className="text-sm font-medium text-slate-700">
              Ciudad/Localidad
            </Label>
            <Input
              id="incidentCity"
              placeholder="Ciudad o localidad"
              value={data.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="municipality" className="text-sm font-medium text-slate-700">
              Municipio
            </Label>
            <Input
              id="municipality"
              placeholder="Municipio donde sucedieron los hechos"
              value={data.municipality || ""}
              onChange={(e) => handleChange("municipality", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label className="text-sm font-medium text-slate-700">Lugar Específico del Hecho</Label>
          <Select value={data.locationType || ""} onValueChange={(value) => handleChange("locationType", value)}>
            <SelectTrigger className="border-slate-300">
              <SelectValue placeholder="Seleccionar tipo de lugar" />
            </SelectTrigger>
            <SelectContent>
              {locationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.locationType === "Otro" && (
            <Input
              placeholder="Especificar otro lugar"
              value={data.locationOther || ""}
              onChange={(e) => handleChange("locationOther", e.target.value)}
              className="border-slate-300 mt-2"
            />
          )}
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="incidentSummary" className="text-sm font-medium text-slate-700">
            Resumen del Hecho *
          </Label>
          <Textarea
            id="incidentSummary"
            placeholder="Descripción detallada de lo ocurrido"
            value={data.summary || ""}
            onChange={(e) => handleChange("summary", e.target.value)}
            className="border-slate-300"
            rows={4}
          />
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Información Judicial</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber" className="text-sm font-medium text-slate-700">
                Número de Causa
              </Label>
              <Input
                id="caseNumber"
                placeholder="IPP N° o número de causa"
                value={data.caseNumber || ""}
                onChange={(e) => handleChange("caseNumber", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caseTitle" className="text-sm font-medium text-slate-700">
                Carátula
              </Label>
              <Input
                id="caseTitle"
                placeholder="Carátula de la causa"
                value={data.caseTitle || ""}
                onChange={(e) => handleChange("caseTitle", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prosecutor" className="text-sm font-medium text-slate-700">
                Fiscal a Cargo
              </Label>
              <Input
                id="prosecutor"
                placeholder="Nombre del fiscal"
                value={data.prosecutor || ""}
                onChange={(e) => handleChange("prosecutor", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prosecutorEmail" className="text-sm font-medium text-slate-700">
                Email de la Fiscalía
              </Label>
              <Input
                id="prosecutorEmail"
                type="email"
                placeholder="email@fiscalia.gov.ar"
                value={data.prosecutorEmail || ""}
                onChange={(e) => handleChange("prosecutorEmail", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prosecutorPhone" className="text-sm font-medium text-slate-700">
                Teléfono de la Fiscalía
              </Label>
              <Input
                id="prosecutorPhone"
                placeholder="+54 11 1234-5678"
                value={data.prosecutorPhone || ""}
                onChange={(e) => handleChange("prosecutorPhone", e.target.value)}
                className="border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
