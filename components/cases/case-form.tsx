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
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: mode === "create" ? "Caso creado" : "Caso actualizado",
        description: "Los datos se han guardado correctamente.",
      })

      // Redirect to cases list or case detail
      if (mode === "create") {
        router.push("/")
      } else {
        router.push(`/casos/${caseId}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el caso. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
