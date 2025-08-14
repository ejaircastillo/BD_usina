"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ExternalLink } from "lucide-react"

interface ResourcesFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function ResourcesForm({ data = [], onChange }: ResourcesFormProps) {
  const addResource = () => {
    const newResource = {
      id: Date.now(),
      type: "",
      title: "",
      url: "",
      source: "",
      date: "",
      description: "",
    }
    onChange([...data, newResource])
  }

  const removeResource = (id: number) => {
    onChange(data.filter((resource) => resource.id !== id))
  }

  const updateResource = (id: number, field: string, value: string) => {
    onChange(data.map((resource) => (resource.id === id ? { ...resource, [field]: value } : resource)))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900 font-heading">Recursos Multimedia</h3>
        <Button onClick={addResource} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700">
          <Plus className="w-4 h-4" />
          Agregar Recurso
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <p>No hay recursos multimedia registrados.</p>
          <p className="text-sm">Haga clic en "Agregar Recurso" para añadir enlaces a noticias, videos, fotos, etc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((resource, index) => (
            <Card key={resource.id} className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-heading">Recurso #{index + 1}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Tipo de Recurso</Label>
                    <Select
                      value={resource.type || ""}
                      onValueChange={(value) => updateResource(resource.id, "type", value)}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="news">Noticia</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="photo">Fotografía</SelectItem>
                        <SelectItem value="document">Documento</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="social">Red Social</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`date-${resource.id}`} className="text-sm font-medium text-slate-700">
                      Fecha de Publicación
                    </Label>
                    <Input
                      id={`date-${resource.id}`}
                      type="date"
                      value={resource.date || ""}
                      onChange={(e) => updateResource(resource.id, "date", e.target.value)}
                      className="border-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`title-${resource.id}`} className="text-sm font-medium text-slate-700">
                    Título del Recurso
                  </Label>
                  <Input
                    id={`title-${resource.id}`}
                    placeholder="Título de la noticia, video, documento, etc."
                    value={resource.title || ""}
                    onChange={(e) => updateResource(resource.id, "title", e.target.value)}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`url-${resource.id}`} className="text-sm font-medium text-slate-700">
                    URL/Enlace
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`url-${resource.id}`}
                      placeholder="https://ejemplo.com/noticia"
                      value={resource.url || ""}
                      onChange={(e) => updateResource(resource.id, "url", e.target.value)}
                      className="border-slate-300 flex-1"
                    />
                    {resource.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.url, "_blank")}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`source-${resource.id}`} className="text-sm font-medium text-slate-700">
                    Fuente/Medio
                  </Label>
                  <Input
                    id={`source-${resource.id}`}
                    placeholder="Nombre del medio, canal, sitio web, etc."
                    value={resource.source || ""}
                    onChange={(e) => updateResource(resource.id, "source", e.target.value)}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${resource.id}`} className="text-sm font-medium text-slate-700">
                    Descripción
                  </Label>
                  <Textarea
                    id={`description-${resource.id}`}
                    placeholder="Descripción del contenido, relevancia para el caso"
                    value={resource.description || ""}
                    onChange={(e) => updateResource(resource.id, "description", e.target.value)}
                    className="border-slate-300"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
