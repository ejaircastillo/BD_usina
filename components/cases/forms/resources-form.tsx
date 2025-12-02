"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, ExternalLink, Upload, LinkIcon } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"

interface ResourcesFormProps {
  data: any[]
  onChange: (data: any[]) => void
}

export function ResourcesForm({ data = [], onChange }: ResourcesFormProps) {
  const addResource = () => {
    const newResource = {
      id: Date.now(),
      tipo: "",
      titulo: "",
      url: "",
      fuente: "",
      fecha: "",
      descripcion: "",
      archivo_path: null,
      archivo_nombre: null,
      archivo_tipo: null,
      archivo_size: null,
      input_mode: "url", // "url" or "file"
    }
    onChange([...data, newResource])
  }

  const removeResource = (id: number) => {
    onChange(data.filter((resource) => resource.id !== id))
  }

  const updateResource = (id: number, field: string, value: any) => {
    onChange(data.map((resource) => (resource.id === id ? { ...resource, [field]: value } : resource)))
  }

  const handleFileUpload = (
    id: number,
    file: { path: string; url: string; name: string; type: string; size: number },
  ) => {
    onChange(
      data.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              archivo_path: file.path,
              archivo_nombre: file.name,
              archivo_tipo: file.type,
              archivo_size: file.size,
              url: file.url, // Also set URL for display
            }
          : resource,
      ),
    )
  }

  const handleFileRemove = (id: number) => {
    onChange(
      data.map((resource) =>
        resource.id === id
          ? {
              ...resource,
              archivo_path: null,
              archivo_nombre: null,
              archivo_tipo: null,
              archivo_size: null,
              url: "",
            }
          : resource,
      ),
    )
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
          <p className="text-sm">
            Haga clic en "Agregar Recurso" para añadir archivos, enlaces a noticias, videos, fotos, etc.
          </p>
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
                      value={resource.tipo || ""}
                      onValueChange={(value) => updateResource(resource.id, "tipo", value)}
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
                      value={resource.fecha || ""}
                      onChange={(e) => updateResource(resource.id, "fecha", e.target.value)}
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
                    value={resource.titulo || ""}
                    onChange={(e) => updateResource(resource.id, "titulo", e.target.value)}
                    className="border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Archivo o Enlace</Label>
                  <Tabs
                    value={resource.input_mode || "url"}
                    onValueChange={(value) => updateResource(resource.id, "input_mode", value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Enlace URL
                      </TabsTrigger>
                      <TabsTrigger value="file" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Subir Archivo
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-3">
                      <div className="flex gap-2">
                        <Input
                          id={`url-${resource.id}`}
                          placeholder="https://ejemplo.com/noticia"
                          value={resource.archivo_path ? "" : resource.url || ""}
                          onChange={(e) => updateResource(resource.id, "url", e.target.value)}
                          className="border-slate-300 flex-1"
                          disabled={!!resource.archivo_path}
                        />
                        {resource.url && !resource.archivo_path && (
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
                    </TabsContent>
                    <TabsContent value="file" className="mt-3">
                      <FileUpload
                        folder={`casos/${resource.id}`}
                        onUpload={(file) => handleFileUpload(resource.id, file)}
                        onRemove={() => handleFileRemove(resource.id)}
                        currentFile={
                          resource.archivo_path
                            ? {
                                path: resource.archivo_path,
                                url: resource.url,
                                name: resource.archivo_nombre || "Archivo",
                                type: resource.archivo_tipo || "application/octet-stream",
                                size: resource.archivo_size || 0,
                              }
                            : null
                        }
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`source-${resource.id}`} className="text-sm font-medium text-slate-700">
                    Fuente/Medio
                  </Label>
                  <Input
                    id={`source-${resource.id}`}
                    placeholder="Nombre del medio, canal, sitio web, etc."
                    value={resource.fuente || ""}
                    onChange={(e) => updateResource(resource.id, "fuente", e.target.value)}
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
                    value={resource.descripcion || ""}
                    onChange={(e) => updateResource(resource.id, "descripcion", e.target.value)}
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
