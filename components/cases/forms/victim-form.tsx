"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface VictimFormProps {
  data: any
  onChange: (data: any) => void
}

export function VictimForm({ data, onChange }: VictimFormProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      ...data,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">Datos Personales de la Víctima</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="victimName" className="text-sm font-medium text-slate-700">
              Nombre Completo *
            </Label>
            <Input
              id="victimName"
              placeholder="Nombre y apellido completo"
              value={data.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimBirthDate" className="text-sm font-medium text-slate-700">
              Fecha de Nacimiento
            </Label>
            <Input
              id="victimBirthDate"
              type="date"
              value={data.birthDate || ""}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimAge" className="text-sm font-medium text-slate-700">
              Edad
            </Label>
            <Input
              id="victimAge"
              type="number"
              placeholder="Edad en años"
              value={data.age || ""}
              onChange={(e) => handleChange("age", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimProfession" className="text-sm font-medium text-slate-700">
              Profesión/Ocupación
            </Label>
            <Input
              id="victimProfession"
              placeholder="Profesión u ocupación"
              value={data.profession || ""}
              onChange={(e) => handleChange("profession", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimPhone" className="text-sm font-medium text-slate-700">
              Teléfono
            </Label>
            <Input
              id="victimPhone"
              placeholder="+54 11 1234-5678"
              value={data.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimEmail" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              id="victimEmail"
              type="email"
              placeholder="email@ejemplo.com"
              value={data.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="victimAddress" className="text-sm font-medium text-slate-700">
            Dirección Completa
          </Label>
          <Textarea
            id="victimAddress"
            placeholder="Calle, número, barrio, ciudad, provincia"
            value={data.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="victimNotes" className="text-sm font-medium text-slate-700">
            Notas Adicionales
          </Label>
          <Textarea
            id="victimNotes"
            placeholder="Información adicional sobre la víctima"
            value={data.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
