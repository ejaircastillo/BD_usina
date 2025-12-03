"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useArgentinaGeo } from "@/hooks/use-argentina-geo"
import { Loader2 } from "lucide-react"

interface IncidentFormProps {
  data: any
  onChange: (data: any) => void
}

const locationTypes = ["Vía Pública", "Vivienda Particular", "Comercio", "Unidad Penitenciaria", "Comisaría", "Otro"]

export function IncidentForm({ data, onChange }: IncidentFormProps) {
  const { provincias, municipios, loadingProvincias, loadingMunicipios, errorProvincias } = useArgentinaGeo(
    data.provincia,
  )

  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handleProvinciaChange = (value: string) => {
    onChange({
      ...data,
      provincia: value,
      municipio: "", // Clear municipio when provincia changes
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
            <Label className="text-sm font-medium text-slate-700">Provincia *</Label>
            <Select value={data.provincia || ""} onValueChange={handleProvinciaChange} disabled={loadingProvincias}>
              <SelectTrigger className="border-slate-300">
                {loadingProvincias ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando provincias...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Seleccionar provincia" />
                )}
              </SelectTrigger>
              <SelectContent>
                {provincias.map((provincia) => (
                  <SelectItem key={provincia.id} value={provincia.nombre}>
                    {provincia.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorProvincias && <p className="text-xs text-amber-600">{errorProvincias} (usando lista local)</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Municipio</Label>
            <Select
              value={data.municipio || ""}
              onValueChange={(value) => handleChange("municipio", value)}
              disabled={!data.provincia || loadingMunicipios}
            >
              <SelectTrigger className="border-slate-300">
                {loadingMunicipios ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cargando municipios...</span>
                  </div>
                ) : !data.provincia ? (
                  <span className="text-muted-foreground">Primero seleccione provincia</span>
                ) : (
                  <SelectValue placeholder="Seleccionar municipio" />
                )}
              </SelectTrigger>
              <SelectContent>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.nombre}>
                    {municipio.nombre}
                  </SelectItem>
                ))}
                {municipios.length === 0 && data.provincia && !loadingMunicipios && (
                  <SelectItem value="_empty" disabled>
                    No se encontraron municipios
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {!data.provincia && (
              <p className="text-xs text-muted-foreground">Seleccione una provincia para ver municipios</p>
            )}
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
