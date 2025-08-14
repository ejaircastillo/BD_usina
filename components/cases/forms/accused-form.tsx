"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

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
      description: "",
      status: "",
      charges: "",
    }
    onChange([...data, newAccused])
  }

  const removeAccused = (id: number) => {
    onChange(data.filter((accused) => accused.id !== id))
  }

  const updateAccused = (id: number, field: string, value: string) => {
    onChange(data.map((accused) => (accused.id === id ? { ...accused, [field]: value } : accused)))
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
                    <Label className="text-sm font-medium text-slate-700">Nombre Completo</Label>
                    <Input
                      placeholder="Nombre y apellido (o 'Sin identificar')"
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
                    <Label className="text-sm font-medium text-slate-700">Estado</Label>
                    <Select
                      value={accused.status || ""}
                      onValueChange={(value) => updateAccused(accused.id, "status", value)}
                    >
                      <SelectTrigger className="border-slate-300">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fugitive">Prófugo</SelectItem>
                        <SelectItem value="detained">Detenido</SelectItem>
                        <SelectItem value="processed">Procesado</SelectItem>
                        <SelectItem value="convicted">Condenado</SelectItem>
                        <SelectItem value="acquitted">Absuelto</SelectItem>
                        <SelectItem value="unknown">Desconocido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Descripción Física</Label>
                  <Textarea
                    placeholder="Descripción física, vestimenta, características distintivas"
                    value={accused.description || ""}
                    onChange={(e) => updateAccused(accused.id, "description", e.target.value)}
                    className="border-slate-300"
                    rows={2}
                  />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
