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
              value={data.nombreCompleto || ""}
              onChange={(e) => handleChange("nombreCompleto", e.target.value)}
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
              value={data.fechaNacimiento || ""}
              onChange={(e) => handleChange("fechaNacimiento", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimAge" className="text-sm font-medium text-slate-700">
              Edad *
            </Label>
            <Input
              id="victimAge"
              type="number"
              placeholder="Edad en años"
              value={data.edad || ""}
              onChange={(e) => handleChange("edad", e.target.value)}
              className="border-slate-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimProfession" className="text-sm font-medium text-slate-700">
              Profesión/Ocupación
            </Label>
            <Input
              id="victimProfession"
              placeholder="Profesión u ocupación"
              value={data.profesion || ""}
              onChange={(e) => handleChange("profesion", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimPhone" className="text-sm font-medium text-slate-700">
              Teléfono de Contacto Familiar
            </Label>
            <Input
              id="victimPhone"
              placeholder="+54 11 1234-5678"
              value={data.telefonoContactoFamiliar || ""}
              onChange={(e) => handleChange("telefonoContactoFamiliar", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimSocialMedia" className="text-sm font-medium text-slate-700">
              Redes Sociales
            </Label>
            <Input
              id="victimSocialMedia"
              placeholder="Instagram, Facebook, Twitter, etc."
              value={data.redesSociales || ""}
              onChange={(e) => handleChange("redesSociales", e.target.value)}
              className="border-slate-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="victimNationality" className="text-sm font-medium text-slate-700">
              Nacionalidad
            </Label>
            <Input
              id="victimNationality"
              placeholder="Nacionalidad"
              value={data.nacionalidad || ""}
              onChange={(e) => handleChange("nacionalidad", e.target.value)}
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="victimAddress" className="text-sm font-medium text-slate-700">
            Dirección de Residencia de la Víctima
          </Label>
          <Textarea
            id="victimAddress"
            placeholder="Calle, número, barrio, ciudad, provincia"
            value={data.direccionCompleta || ""}
            onChange={(e) => handleChange("direccionCompleta", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="victimNotes" className="text-sm font-medium text-slate-700">
            Notas Adicionales u Observaciones
          </Label>
          <Textarea
            id="victimNotes"
            placeholder="Información adicional sobre la víctima"
            value={data.notasAdicionales || ""}
            onChange={(e) => handleChange("notasAdicionales", e.target.value)}
            className="border-slate-300"
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
