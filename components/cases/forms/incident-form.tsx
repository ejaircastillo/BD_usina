"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useArgentinaGeo } from "@/hooks/use-argentina-geo"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface InstanciaJudicial {
  id?: string
  numeroCausa: string
  fiscalFiscalia: string
  caratula: string
  ordenNivel: string
}

interface IncidentFormProps {
  data: {
    fechaHecho?: string
    fechaFallecimiento?: string
    provincia?: string
    municipio?: string
    localidadBarrio?: string
    tipoLugar?: string
    lugarOtro?: string
    resumenHecho?: string
    tipoCrimen?: string
    tipoArma?: string
    instanciasJudiciales?: InstanciaJudicial[]
  }
  onChange: (data: any) => void
}

const crimeTypes = ["Homicidio", "Femicidio", "Muerte dudosa"]

const weaponTypes = [
  "Arma de fuego",
  "Arma blanca",
  "Objeto contundente",
  "Golpes",
  "Ahorcamiento/Asfixia",
  "Quemaduras",
  "Arrollamiento por rodados o tren",
  "Precipitación al vacío",
  "Envenenamiento",
  "Varios medios combinados",
  "Violación seguida de muerte",
  "Otra arma o mecanismo",
  "Sin determinar",
]

const locationTypes = [
  "Vivienda de la Víctima",
  "Vivienda del Agresor",
  "Vivienda Compartida",
  "Vía Pública",
  "Comercio / Local",
  "Descampado / Rural",
  "Hotel / Alojamiento",
  "Unidad Penitenciaria",
  "Comisaría",
  "Hospital / Centro de Salud",
  "Otro",
]

const judicialLevels = ["Primera Instancia", "Cámara de Apelaciones", "Tribunal Superior / Casación", "Corte Suprema"]

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
      municipio: "",
    })
  }

  const instancias = data.instanciasJudiciales || []

  const addInstanciaJudicial = () => {
    onChange({
      ...data,
      instanciasJudiciales: [...instancias, { numeroCausa: "", fiscalFiscalia: "", caratula: "", ordenNivel: "" }],
    })
  }

  const updateInstanciaJudicial = (index: number, field: string, value: string) => {
    const updated = [...instancias]
    updated[index] = { ...updated[index], [field]: value }
    onChange({
      ...data,
      instanciasJudiciales: updated,
    })
  }

  const removeInstanciaJudicial = (index: number) => {
    onChange({
      ...data,
      instanciasJudiciales: instancias.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Clasificación del Hecho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Tipo de Crimen</Label>
            <Select value={data.tipoCrimen || ""} onValueChange={(value) => handleChange("tipoCrimen", value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue placeholder="Seleccionar tipo de crimen" />
              </SelectTrigger>
              <SelectContent>
                {crimeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Tipo de Arma / Medio</Label>
            <Select value={data.tipoArma || ""} onValueChange={(value) => handleChange("tipoArma", value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue placeholder="Seleccionar tipo de arma" />
              </SelectTrigger>
              <SelectContent>
                {weaponTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Fechas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incidentDate" className="text-sm font-medium text-slate-700">
              Fecha del Hecho
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
              Fecha de Fallecimiento
            </Label>
            <Input
              id="deathDate"
              type="date"
              value={data.fechaFallecimiento || ""}
              onChange={(e) => handleChange("fechaFallecimiento", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Ubicación del Hecho</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Provincia</Label>
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
            <Label className="text-sm font-medium text-slate-700">Municipio / Departamento</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidadBarrio" className="text-sm font-medium text-slate-700">
              Localidad / Barrio
            </Label>
            <Input
              id="localidadBarrio"
              placeholder="Ej: Barrio Norte, Villa 31, etc."
              value={data.localidadBarrio || ""}
              onChange={(e) => handleChange("localidadBarrio", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Tipo de Lugar</Label>
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
          </div>

          {data.tipoLugar === "Otro" && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lugarOtro" className="text-sm font-medium text-slate-700">
                Especificar Lugar
              </Label>
              <Input
                id="lugarOtro"
                placeholder="Describa el tipo de lugar"
                value={data.lugarOtro || ""}
                onChange={(e) => handleChange("lugarOtro", e.target.value)}
                className="border-slate-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="space-y-2">
        <Label htmlFor="incidentSummary" className="text-sm font-medium text-slate-700">
          Resumen del Hecho
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

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 font-heading">Instancias Judiciales</h3>
          <Button type="button" variant="outline" size="sm" onClick={addInstanciaJudicial}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Instancia
          </Button>
        </div>

        {instancias.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No hay instancias judiciales registradas. Haga clic en "Agregar Instancia" para añadir una.
          </p>
        ) : (
          <div className="space-y-4">
            {instancias.map((instancia, index) => (
              <Card key={index} className="border-slate-200">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-700">
                      Instancia {index + 1}
                      {instancia.ordenNivel && ` - ${instancia.ordenNivel}`}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstanciaJudicial(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 -mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Nivel / Orden</Label>
                      <Select
                        value={instancia.ordenNivel || ""}
                        onValueChange={(value) => updateInstanciaJudicial(index, "ordenNivel", value)}
                      >
                        <SelectTrigger className="border-slate-300">
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          {judicialLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Número de Causa</Label>
                      <Input
                        placeholder="IPP N° o número de causa"
                        value={instancia.numeroCausa || ""}
                        onChange={(e) => updateInstanciaJudicial(index, "numeroCausa", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Carátula</Label>
                      <Input
                        placeholder="Carátula de la causa"
                        value={instancia.caratula || ""}
                        onChange={(e) => updateInstanciaJudicial(index, "caratula", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Fiscal / Fiscalía</Label>
                      <Input
                        placeholder="Nombre del fiscal o fiscalía"
                        value={instancia.fiscalFiscalia || ""}
                        onChange={(e) => updateInstanciaJudicial(index, "fiscalFiscalia", e.target.value)}
                        className="border-slate-300"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
