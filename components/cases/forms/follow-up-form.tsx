"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

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
  const handleChange = (field: string, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    const currentValues = data[field] || []
    if (checked) {
      onChange({
        ...data,
        [field]: [...currentValues, value],
      })
    } else {
      onChange({
        ...data,
        [field]: currentValues.filter((item: string) => item !== value),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Seguimiento de la ONG</h3>

        <div className="mb-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Tipo de Acompañamiento</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Asesoramiento Legal",
              "Patrocinio Letrado",
              "Difusión en Redes",
              "Contención Emocional",
              "Ayuda Psicológica Profesional",
              "Derivación a otros Organismos",
            ].map((tipo) => (
              <div key={tipo} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipo-${tipo}`}
                  checked={(data.tipoAcompanamiento || []).includes(tipo)}
                  onCheckedChange={(checked) => handleCheckboxChange("tipoAcompanamiento", tipo, checked as boolean)}
                />
                <Label htmlFor={`tipo-${tipo}`} className="text-sm text-slate-700">
                  {tipo}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="abogadoQuerellante" className="text-sm font-medium text-slate-700">
              Abogado Querellante
            </Label>
            <Input
              id="abogadoQuerellante"
              placeholder="Nombre del abogado querellante"
              value={data.abogadoQuerellante || ""}
              onChange={(e) => handleChange("abogadoQuerellante", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="amicusCuriae"
              checked={data.amicusCuriae || false}
              onCheckedChange={(checked) => handleChange("amicusCuriae", checked as boolean)}
            />
            <Label htmlFor="amicusCuriae" className="text-sm text-slate-700">
              Amicus Curiae
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="comoLlegoCaso" className="text-sm font-medium text-slate-700">
              Cómo llegó el caso
            </Label>
            <Input
              id="comoLlegoCaso"
              placeholder="Descripción de cómo llegó el caso a la organización"
              value={data.comoLlegoCaso || ""}
              onChange={(e) => handleChange("comoLlegoCaso", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="flex items-center space-x-2 mt-6">
            <Checkbox
              id="primerContacto"
              checked={data.primerContacto || false}
              onCheckedChange={(checked) => handleChange("primerContacto", checked as boolean)}
            />
            <Label htmlFor="primerContacto" className="text-sm text-slate-700">
              Primer Contacto (orientación inicial sin seguimiento completo)
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Miembro Asignado</Label>
            <Input
              placeholder="Escribir nombre del miembro de Usina de Justicia"
              value={data.miembroAsignado || ""}
              onChange={(e) => handleChange("miembroAsignado", e.target.value)}
              className="border-slate-300"
              list="members-list"
            />
            <datalist id="members-list">
              {members.map((member) => (
                <option key={member} value={member} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedPhone" className="text-sm font-medium text-slate-700">
              Teléfono del Miembro
            </Label>
            <Input
              id="assignedPhone"
              placeholder="+54 11 1234-5678"
              value={data.telefonoMiembro || ""}
              onChange={(e) => handleChange("telefonoMiembro", e.target.value)}
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
              value={data.emailMiembro || ""}
              onChange={(e) => handleChange("emailMiembro", e.target.value)}
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
              value={data.fechaAsignacion || ""}
              onChange={(e) => handleChange("fechaAsignacion", e.target.value)}
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
                value={data.contactoFamiliar || ""}
                onChange={(e) => handleChange("contactoFamiliar", e.target.value)}
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
                value={data.telefonoContacto || ""}
                onChange={(e) => handleChange("telefonoContacto", e.target.value)}
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
                value={data.emailContacto || ""}
                onChange={(e) => handleChange("emailContacto", e.target.value)}
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
                value={data.direccionContacto || ""}
                onChange={(e) => handleChange("direccionContacto", e.target.value)}
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
            value={data.notasSeguimiento || ""}
            onChange={(e) => handleChange("notasSeguimiento", e.target.value)}
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
            value={data.proximasAcciones || ""}
            onChange={(e) => handleChange("proximasAcciones", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
