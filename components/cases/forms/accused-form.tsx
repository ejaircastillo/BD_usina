"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ExternalLink } from "lucide-react"
import React from "react"

interface AccusedFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function AccusedForm({ data = [], onChange }: AccusedFormProps) {
  const [totalInvolved, setTotalInvolved] = React.useState(data.length || 0)

  const addAccused = () => {
    const newAccused = {
      id: Date.now(),
      apellidoNombre: "",
      alias: "",
      edad: "",
      nacionalidad: "",
      menorEdad: false,
      juzgadoUfi: "",
      estadoProcesal: "",
      trialDates: [], // Changed from single trialDate to array of dates
      fechaVeredicto: "",
      pena: "",
      juicioAbreviado: false,
      cargos: "",
      resources: [],
    }
    onChange([...data, newAccused])
  }

  const removeAccused = (id: number) => {
    onChange(data.filter((accused) => accused.id !== id))
  }

  const updateAccused = (id: number, field: string, value: string | boolean | any[]) => {
    onChange(data.map((accused) => (accused.id === id ? { ...accused, [field]: value } : accused)))
  }

  const addTrialDate = (accusedId: number) => {
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedDates = [...(accused.trialDates || []), ""]
      updateAccused(accusedId, "trialDates", updatedDates)
    }
  }

  const removeTrialDate = (accusedId: number, dateIndex: number) => {
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedDates = (accused.trialDates || []).filter((_: any, index: number) => index !== dateIndex)
      updateAccused(accusedId, "trialDates", updatedDates)
    }
  }

  const updateTrialDate = (accusedId: number, dateIndex: number, value: string) => {
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedDates = [...(accused.trialDates || [])]
      updatedDates[dateIndex] = value
      updateAccused(accusedId, "trialDates", updatedDates)
    }
  }

  const addResource = (accusedId: number) => {
    const newResource = {
      id: Date.now(),
      type: "",
      title: "",
      url: "",
      source: "",
      date: "",
      description: "",
    }
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedResources = [...(accused.resources || []), newResource]
      updateAccused(accusedId, "resources", updatedResources)
    }
  }

  const removeResource = (accusedId: number, resourceId: number) => {
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedResources = (accused.resources || []).filter((r: any) => r.id !== resourceId)
      updateAccused(accusedId, "resources", updatedResources)
    }
  }

  const updateResource = (accusedId: number, resourceId: number, field: string, value: string) => {
    const accused = data.find((a) => a.id === accusedId)
    if (accused) {
      const updatedResources = (accused.resources || []).map((resource: any) =>
        resource.id === resourceId ? { ...resource, [field]: value } : resource,
      )
      updateAccused(accusedId, "resources", updatedResources)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium text-slate-700">Cantidad Total de Involucrados:</Label>
          <Input
            type="number"
            min="0"
            value={totalInvolved}
            onChange={(e) => setTotalInvolved(Number.parseInt(e.target.value) || 0)}
            className="w-20 border-slate-300"
            placeholder="0"
          />
          <span className="text-xs text-slate-500">(Puede ser mayor al número de imputados identificados)</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 font-heading">Imputados</h3>
        <Button onClick={addAccused} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700">
          <Plus className="w-4 h-4" />
          Agregar Imputado
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No hay imputados registrados.</p>
          <p className="text-sm">Haga clic en "Agregar Imputado" para añadir información.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((accused, index) => (
            <Card key={accused.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-heading">Imputado #{index + 1}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAccused(accused.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Apellido y Nombre</Label>
                    <Input
                      placeholder="Apellido y nombre (o 'Sin identificar')"
                      value={accused.apellidoNombre || ""}
                      onChange={(e) => updateAccused(accused.id, "apellidoNombre", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Alias/Apodo</Label>
                    <Input
                      placeholder="Alias o apodo conocido"
                      value={accused.alias || ""}
                      onChange={(e) => updateAccused(accused.id, "alias", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Edad</Label>
                    <Input
                      placeholder="Edad o edad aproximada"
                      value={accused.edad || ""}
                      onChange={(e) => updateAccused(accused.id, "edad", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Nacionalidad</Label>
                    <Input
                      placeholder="Nacionalidad del imputado"
                      value={accused.nacionalidad || ""}
                      onChange={(e) => updateAccused(accused.id, "nacionalidad", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Juzgado/UFI</Label>
                    <Input
                      placeholder="Juzgado o Unidad Fiscal de Instrucción"
                      value={accused.juzgadoUfi || ""}
                      onChange={(e) => updateAccused(accused.id, "juzgadoUfi", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Estado Procesal</Label>
                    <Select
                      value={accused.estadoProcesal || ""}
                      onValueChange={(value) => updateAccused(accused.id, "estadoProcesal", value)}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Seleccionar estado procesal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigation">En investigación</SelectItem>
                        <SelectItem value="prosecution">En proceso</SelectItem>
                        <SelectItem value="trial">En juicio</SelectItem>
                        <SelectItem value="convicted">Condenado</SelectItem>
                        <SelectItem value="acquitted">Absuelto</SelectItem>
                        <SelectItem value="dismissed">Sobreseído</SelectItem>
                        <SelectItem value="prescription">Prescripción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Fecha del Veredicto</Label>
                    <Input
                      type="date"
                      value={accused.fechaVeredicto || ""}
                      onChange={(e) => updateAccused(accused.id, "fechaVeredicto", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Pena</Label>
                    <Input
                      placeholder="Pena impuesta (ej: 15 años de prisión)"
                      value={accused.pena || ""}
                      onChange={(e) => updateAccused(accused.id, "pena", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-slate-700">Fechas del Juicio</Label>
                    <Button
                      onClick={() => addTrialDate(accused.id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar Fecha
                    </Button>
                  </div>

                  {!accused.trialDates || accused.trialDates.length === 0 ? (
                    <div className="text-center py-2 text-slate-500 text-sm border border-dashed border-slate-300 rounded">
                      <p>No hay fechas de juicio registradas.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {accused.trialDates.map((date: string, dateIndex: number) => (
                        <div key={dateIndex} className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => updateTrialDate(accused.id, dateIndex, e.target.value)}
                            className="border-slate-300 flex-1"
                          />
                          <Button
                            onClick={() => removeTrialDate(accused.id, dateIndex)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`minor-${accused.id}`}
                      checked={accused.menorEdad || false}
                      onCheckedChange={(checked) => updateAccused(accused.id, "menorEdad", checked)}
                    />
                    <Label htmlFor={`minor-${accused.id}`} className="text-sm font-medium text-slate-700">
                      Menor de Edad
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`abbreviated-${accused.id}`}
                      checked={accused.juicioAbreviado || false}
                      onCheckedChange={(checked) => updateAccused(accused.id, "juicioAbreviado", checked)}
                    />
                    <Label htmlFor={`abbreviated-${accused.id}`} className="text-sm font-medium text-slate-700">
                      Juicio Abreviado
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Cargos/Delitos</Label>
                  <Textarea
                    placeholder="Cargos imputados o delitos cometidos"
                    value={accused.cargos || ""}
                    onChange={(e) => updateAccused(accused.id, "cargos", e.target.value)}
                    className="border-slate-300"
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-slate-900 font-heading">Recursos del Imputado</h4>
                    <Button
                      onClick={() => addResource(accused.id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      Agregar Recurso
                    </Button>
                  </div>

                  {!accused.resources || accused.resources.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      <p>No hay recursos registrados para este imputado.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accused.resources.map((resource: any, resourceIndex: number) => (
                        <Card key={resource.id} className="border-slate-100 bg-slate-50">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-heading">Recurso #{resourceIndex + 1}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeResource(accused.id, resource.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Tipo</Label>
                                <Select
                                  value={resource.type || ""}
                                  onValueChange={(value) => updateResource(accused.id, resource.id, "type", value)}
                                >
                                  <SelectTrigger className="border-slate-300 h-8 text-sm">
                                    <SelectValue placeholder="Tipo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="news">Noticia</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="photo">Fotografía</SelectItem>
                                    <SelectItem value="document">Documento</SelectItem>
                                    <SelectItem value="social">Red Social</SelectItem>
                                    <SelectItem value="other">Otro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-slate-600">Fecha</Label>
                                <Input
                                  type="date"
                                  value={resource.date || ""}
                                  onChange={(e) => updateResource(accused.id, resource.id, "date", e.target.value)}
                                  className="border-slate-300 h-8 text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-slate-600">Título</Label>
                              <Input
                                placeholder="Título del recurso"
                                value={resource.title || ""}
                                onChange={(e) => updateResource(accused.id, resource.id, "title", e.target.value)}
                                className="border-slate-300 h-8 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-slate-600">URL/Enlace</Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="https://ejemplo.com"
                                  value={resource.url || ""}
                                  onChange={(e) => updateResource(accused.id, resource.id, "url", e.target.value)}
                                  className="border-slate-300 h-8 text-sm flex-1"
                                />
                                {resource.url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(resource.url, "_blank")}
                                    className="h-8 w-8 p-0"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-slate-600">Fuente</Label>
                              <Input
                                placeholder="Medio o fuente"
                                value={resource.source || ""}
                                onChange={(e) => updateResource(accused.id, resource.id, "source", e.target.value)}
                                className="border-slate-300 h-8 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs font-medium text-slate-600">Descripción</Label>
                              <Textarea
                                placeholder="Descripción del recurso"
                                value={resource.description || ""}
                                onChange={(e) => updateResource(accused.id, resource.id, "description", e.target.value)}
                                className="border-slate-300 text-sm"
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
