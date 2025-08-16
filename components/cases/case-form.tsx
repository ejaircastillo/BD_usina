"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import { VictimForm } from "./forms/victim-form"
import { IncidentForm } from "./forms/incident-form"
import { AccusedForm } from "./forms/accused-form"
import { FollowUpForm } from "./forms/follow-up-form"
import { ResourcesForm } from "./forms/resources-form"
import { useToast } from "@/hooks/use-toast"

interface CaseFormProps {
  mode: "create" | "edit"
  caseId?: string
}

export function CaseForm({ mode, caseId }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("victim")
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    victim: {},
    incident: {},
    accused: [],
    followUp: {},
    resources: [],
  })

    const handleSave = async () => {
    if (!formData) return

    setIsLoading(true)
    let createdVictimaId = null
    let createdHechoId = null

    try {
      // Validar campos requeridos
      if (!formData.victim?.name) {
        toast({
          title: 'Error de validación',
          description: 'El nombre de la víctima es requerido',
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      if (!formData.incident?.date) {
        toast({
          title: 'Error de validación',
          description: 'La fecha del hecho es requerida',
          variant: 'destructive'
        })
        setIsLoading(false)
        return
      }

      // Paso 1: Crear víctima
      console.log('Creating victim:', formData.victim)
      const victimResponse = await fetch('/api/victimas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.victim.name,
          apellido: formData.victim.surname || '',
          fecha_nacimiento: formData.victim.birthDate || null,
          telefono: formData.victim.phone || null,
          email: formData.victim.email || null,
          direccion: formData.victim.address || null,
          genero: formData.victim.gender || null,
          estado_civil: formData.victim.maritalStatus || null,
          ocupacion: formData.victim.profession || null,
          observaciones: formData.victim.notes || null
        })
      })

      if (!victimResponse.ok) {
        const error = await victimResponse.json()
        throw new Error(`Error al crear víctima: ${error.error}`)
      }

      const { victima } = await victimResponse.json()
      createdVictimaId = victima.id
      console.log('Created victim with ID:', createdVictimaId)

      // Paso 2: Crear hecho
      console.log('Creating hecho:', formData.incident)
      const hechoResponse = await fetch('/api/hechos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_hecho: formData.incident.date,
          hora_hecho: formData.incident.time || null,
          lugar_hecho: formData.incident.location || null,
          descripcion: formData.incident.summary || null,
          tipo_delito: formData.incident.type || null,
          modalidad: formData.incident.modality || null,
          circunstancias: formData.incident.circumstances || null,
          testigos: formData.incident.witnesses || null,
          evidencias: formData.incident.evidence || null,
          denuncia_previa: formData.incident.previousReport || null,
          observaciones: formData.incident.notes || null
        })
      })

      if (!hechoResponse.ok) {
        // Rollback: eliminar víctima creada
        if (createdVictimaId) {
          await fetch(`/api/victimas`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: createdVictimaId })
          })
        }

        const error = await hechoResponse.json()
        throw new Error(`Error al crear hecho: ${error.error}`)
      }

      const { hecho } = await hechoResponse.json()
      createdHechoId = hecho.id
      console.log('Created hecho with ID:', createdHechoId)

      // Paso 3: Crear caso vinculando víctima y hecho
      console.log('Creating caso with victim ID:', createdVictimaId, 'and hecho ID:', createdHechoId)
      const casoResponse = await fetch('/api/casos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_victima: createdVictimaId,
          id_hecho: createdHechoId,
          estado: formData.incident?.status || 'Iniciado',
          id_interno: formData.internalId || null,
          numero_expediente: formData.expedientNumber || null
        })
      })

      if (!casoResponse.ok) {
        // Rollback completo: eliminar hecho y víctima
        if (createdHechoId) {
          await fetch(`/api/hechos`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: createdHechoId })
          })
        }

        if (createdVictimaId) {
          await fetch(`/api/victimas`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: createdVictimaId })
          })
        }

        const error = await casoResponse.json()
        throw new Error(`Error al crear caso: ${error.error}`)
      }

      const { caso, message } = await casoResponse.json()
      console.log('Successfully created complete caso:', caso.id)

      toast({
        title: 'Caso creado exitosamente',
        description: message || `Caso ${caso.id} creado correctamente`,
      })

      // Redirigir al caso creado
      router.push(`/casos/${caso.id}`)

    } catch (error) {
      console.error('Error saving caso:', error)
      
      toast({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (section: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data,
    }))
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href={mode === "edit" ? `/casos/${caseId}` : "/"}>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              {mode === "edit" ? "Volver al Caso" : "Volver a Casos"}
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              {mode === "create" ? "Nuevo Caso" : `Editar Caso #${caseId}`}
            </h1>
            <p className="text-slate-600">
              {mode === "create" ? "Complete la información del nuevo caso" : "Modifique los datos del caso existente"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-800 hover:bg-slate-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar Caso"}
          </Button>
          <Link href={mode === "edit" ? `/casos/${caseId}` : "/"}>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>

      {/* Form Tabs */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="font-heading">Información del Caso</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="victim" className="text-sm">
                Víctima
              </TabsTrigger>
              <TabsTrigger value="incident" className="text-sm">
                Hecho
              </TabsTrigger>
              <TabsTrigger value="accused" className="text-sm">
                Imputados
              </TabsTrigger>
              <TabsTrigger value="followup" className="text-sm">
                Seguimiento
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-sm">
                Recursos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="victim" className="space-y-6">
              <VictimForm data={formData.victim} onChange={(data) => updateFormData("victim", data)} />
            </TabsContent>

            <TabsContent value="incident" className="space-y-6">
              <IncidentForm data={formData.incident} onChange={(data) => updateFormData("incident", data)} />
            </TabsContent>

            <TabsContent value="accused" className="space-y-6">
              <AccusedForm data={formData.accused} onChange={(data) => updateFormData("accused", data)} />
            </TabsContent>

            <TabsContent value="followup" className="space-y-6">
              <FollowUpForm data={formData.followUp} onChange={(data) => updateFormData("followUp", data)} />
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <ResourcesForm data={formData.resources} onChange={(data) => updateFormData("resources", data)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  )
}
