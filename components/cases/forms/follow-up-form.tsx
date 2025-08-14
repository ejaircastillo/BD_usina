"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FollowUpFormProps {
  data: any
  onChange: (data: any) => void
}

const members = [
  "Dr. María González",
  "Dr. Carlos Rodríguez",
  "Dra. Ana Martínez",
  "Dr. Luis Fernández",
  "Dra. Carmen López",
]

export function FollowUpForm({ data, onChange }: FollowUpFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Seguimiento de la ONG</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Miembro Asignado</Label>
            <Select value={data.assignedMember || ""} onValueChange={(value) => handleChange("assignedMember", value)}>
              <SelectTrigger className="border-slate-300">
                <SelectValue placeholder="Seleccionar miembro" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member} value={member}>
                    {member}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedPhone" className="text-sm font-medium text-slate-700">
              Teléfono del Miembro
            </Label>
            <Input
              id="assignedPhone"
              placeholder="+54 11 1234-5678"
              value={data.assignedPhone || ""}
              onChange={(e) => handleChange("assignedPhone", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedEmail" className="text-sm font-medium text-slate-700">
              Email del Miembro
            </Label>
            <Input
              id="assignedEmail"
              type="email"
              placeholder="email@usinajusticia.org"
              value={data.assignedEmail || ""}
              onChange={(e) => handleChange("assignedEmail", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignmentDate" className="text-sm font-medium text-slate-700">
              Fecha de Asignación
            </Label>
            <Input
              id="assignmentDate"
              type="date"
              value={data.assignmentDate || ""}
              onChange={(e) => handleChange("assignmentDate", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Contacto Familiar</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="familyContact" className="text-sm font-medium text-slate-700">
                Nombre del Contacto
              </Label>
              <Input
                id="familyContact"
                placeholder="Nombre y relación (ej: Roberto Rodríguez - hermano)"
                value={data.familyContact || ""}
                onChange={(e) => handleChange("familyContact", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyPhone" className="text-sm font-medium text-slate-700">
                Teléfono del Contacto
              </Label>
              <Input
                id="familyPhone"
                placeholder="+54 11 1234-5678"
                value={data.familyPhone || ""}
                onChange={(e) => handleChange("familyPhone", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyEmail" className="text-sm font-medium text-slate-700">
                Email del Contacto
              </Label>
              <Input
                id="familyEmail"
                type="email"
                placeholder="email@ejemplo.com"
                value={data.familyEmail || ""}
                onChange={(e) => handleChange("familyEmail", e.target.value)}
                className="border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyAddress" className="text-sm font-medium text-slate-700">
                Dirección del Contacto
              </Label>
              <Input
                id="familyAddress"
                placeholder="Dirección completa"
                value={data.familyAddress || ""}
                onChange={(e) => handleChange("familyAddress", e.target.value)}
                className="border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Label htmlFor="followUpNotes" className="text-sm font-medium text-slate-700">
            Notas de Seguimiento
          </Label>
          <Textarea
            id="followUpNotes"
            placeholder="Notas sobre el seguimiento del caso, necesidades de la familia, derivaciones realizadas, etc."
            value={data.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="border-slate-300"
            rows={4}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="nextActions" className="text-sm font-medium text-slate-700">
            Próximas Acciones
          </Label>
          <Textarea
            id="nextActions"
            placeholder="Acciones planificadas, citas programadas, gestiones pendientes"
            value={data.nextActions || ""}
            onChange={(e) => handleChange("nextActions", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
