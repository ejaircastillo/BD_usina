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
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="incidentLocation" className="text-sm font-medium text-slate-700">
            Lugar Específico del Hecho
          </Label>
          <Input
            id="incidentLocation"
            placeholder="Dirección, intersección, punto de referencia"
            value={data.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            className="border-slate-300"
          />
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
              <Label htmlFor="legalCase" className="text-sm font-medium text-slate-700">
                Causa Judicial
              </Label>
              <Input
                id="legalCase"
                placeholder="IPP N° o número de causa"
                value={data.legalCase || ""}
                onChange={(e) => handleChange("legalCase", e.target.value)}
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
              <Label htmlFor="court" className="text-sm font-medium text-slate-700">
                Juzgado/UFI
              </Label>
              <Input
                id="court"
                placeholder="Juzgado o UFI"
                value={data.court || ""}
                onChange={(e) => handleChange("court", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                Estado Procesal
              </Label>
              <Select value={data.status || ""} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investigation">En investigación</SelectItem>
                  <SelectItem value="identified">Imputado identificado</SelectItem>
                  <SelectItem value="processed">Procesado</SelectItem>
                  <SelectItem value="trial">Juicio oral</SelectItem>
                  <SelectItem value="convicted">Condenado</SelectItem>
                  <SelectItem value="acquitted">Absuelto</SelectItem>
                  <SelectItem value="dismissed">Sobreseído</SelectItem>
                  <SelectItem value="archived">Archivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
