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
              value={data.fechaHecho || ""}
              onChange={(e) => handleChange("fechaHecho", e.target.value)}
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
              value={data.fechaFallecimiento || ""}
              onChange={(e) => handleChange("fechaFallecimiento", e.target.value)}
              className="border-slate-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Provincia</Label>
            <Select value={data.provincia || ""} onValueChange={(value) => handleChange("provincia", value)}>
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
              value={data.ciudad || ""}
              onChange={(e) => handleChange("ciudad", e.target.value)}
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
              value={data.municipio || ""}
              onChange={(e) => handleChange("municipio", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label className="text-sm font-medium text-slate-700">Lugar Específico del Hecho</Label>
          <Select value={data.tipoLugar || ""} onValueChange={(value) => handleChange("tipoLugar", value)}>
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
          {data.tipoLugar === "Otro" && (
            <Input
              placeholder="Especificar otro lugar"
              value={data.lugarOtro || ""}
              onChange={(e) => handleChange("lugarOtro", e.target.value)}
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
            value={data.resumenHecho || ""}
            onChange={(e) => handleChange("resumenHecho", e.target.value)}
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
                value={data.numeroCausa || ""}
                onChange={(e) => handleChange("numeroCausa", e.target.value)}
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
                value={data.caratula || ""}
                onChange={(e) => handleChange("caratula", e.target.value)}
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
                value={data.fiscalCargo || ""}
                onChange={(e) => handleChange("fiscalCargo", e.target.value)}
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
                value={data.emailFiscalia || ""}
                onChange={(e) => handleChange("emailFiscalia", e.target.value)}
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
                value={data.telefonoFiscalia || ""}
                onChange={(e) => handleChange("telefonoFiscalia", e.target.value)}
                className="border-slate-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
