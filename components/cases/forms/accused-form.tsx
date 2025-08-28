"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ExternalLink } from "lucide-react"

interface AccusedFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function AccusedForm({ data = [], onChange }: AccusedFormProps) {
  const addAccused = () => {
    const newAccused = {
      id: Date.now(),
      name: "",
      alias: "",
      age: "",
      nationality: "", // Added nationality field
      isMinor: false, // Added minor checkbox
      court: "", // Added court field moved from incident tab
      processStatus: "", // Added process status moved from incident tab
      trialDate: "", // Added trial date
      verdictDate: "", // Added verdict date
      sentence: "", // Added sentence field
      abbreviatedTrial: false, // Added abbreviated trial checkbox
      charges: "",
      resources: [], // Added resources array for each accused
    }
    onChange([...data, newAccused])
  }

  const removeAccused = (id: number) => {
    onChange(data.filter((accused) => accused.id !== id))
  }

  const updateAccused = (id: number, field: string, value: string | boolean | any[]) => {
    onChange(data.map((accused) => (accused.id === id ? { ...accused, [field]: value } : accused)))
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
                      value={accused.name || ""}
                      onChange={(e) => updateAccused(accused.id, "name", e.target.value)}
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
                      value={accused.age || ""}
                      onChange={(e) => updateAccused(accused.id, "age", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Nacionalidad</Label>
                    <Input
                      placeholder="Nacionalidad del imputado"
                      value={accused.nationality || ""}
                      onChange={(e) => updateAccused(accused.id, "nationality", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Juzgado/UFI</Label>
                    <Input
                      placeholder="Juzgado o Unidad Fiscal de Instrucción"
                      value={accused.court || ""}
                      onChange={(e) => updateAccused(accused.id, "court", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Estado Procesal</Label>
                    <Select
                      value={accused.processStatus || ""}
                      onValueChange={(value) => updateAccused(accused.id, "processStatus", value)}
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
                    <Label className="text-sm font-medium text-slate-700">Fecha del Juicio</Label>
                    <Input
                      type="date"
                      value={accused.trialDate || ""}
                      onChange={(e) => updateAccused(accused.id, "trialDate", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Fecha del Veredicto</Label>
                    <Input
                      type="date"
                      value={accused.verdictDate || ""}
                      onChange={(e) => updateAccused(accused.id, "verdictDate", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Pena</Label>
                    <Input
                      placeholder="Pena impuesta (ej: 15 años de prisión)"
                      value={accused.sentence || ""}
                      onChange={(e) => updateAccused(accused.id, "sentence", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`minor-${accused.id}`}
                      checked={accused.isMinor || false}
                      onCheckedChange={(checked) => updateAccused(accused.id, "isMinor", checked)}
                    />
                    <Label htmlFor={`minor-${accused.id}`} className="text-sm font-medium text-slate-700">
                      Menor de Edad
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`abbreviated-${accused.id}`}
                      checked={accused.abbreviatedTrial || false}
                      onCheckedChange={(checked) => updateAccused(accused.id, "abbreviatedTrial", checked)}
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
                    value={accused.charges || ""}
                    onChange={(e) => updateAccused(accused.id, "charges", e.target.value)}
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
