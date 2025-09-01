"use client"

import { useState, useEffect } from "react"
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
import { createClient } from "@/lib/supabase/client"

interface CaseFormProps {
  mode: "create" | "edit"
  caseId?: string
}

export function CaseForm({ mode, caseId }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("victim")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === "edit")
  const [formData, setFormData] = useState({
    victim: {},
    incident: {},
    accused: [],
    followUp: {},
    resources: [],
  })

  useEffect(() => {
    if (mode === "edit" && caseId) {
      loadExistingCaseData()
    }
  }, [mode, caseId])

  const loadExistingCaseData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: victimData, error: victimError } = await supabase
        .from("victimas")
        .select(`
          *,
          hechos (
            *,
            imputados (*,
              fechas_juicio (*)
            ),
            seguimiento (*),
            recursos (*)
          )
        `)
        .eq("hechos.id", caseId)
        .single()

      if (victimError) throw victimError

      const hecho = victimData.hechos[0]

      setFormData({
        victim: {
          nombreCompleto: victimData.nombre_completo || "",
          fechaNacimiento: victimData.fecha_nacimiento || "",
          edad: victimData.edad || "",
          profesion: victimData.profesion || "",
          redesSociales: victimData.redes_sociales || "",
          telefonoContactoFamiliar: victimData.telefono_contacto_familiar || "",
          direccionCompleta: victimData.direccion_completa || "",
          nacionalidad: victimData.nacionalidad || "",
          notasAdicionales: victimData.notas_adicionales || "",
        },
        incident: {
          fechaHecho: hecho?.fecha_hecho || "",
          fechaFallecimiento: hecho?.fecha_fallecimiento || "",
          provincia: hecho?.provincia || "",
          municipio: hecho?.municipio || "",
          lugarEspecifico: hecho?.lugar_especifico || "",
          resumenHecho: hecho?.resumen_hecho || "",
          numeroCausa: hecho?.numero_causa || "",
          caratula: hecho?.caratula || "",
          emailFiscalia: hecho?.email_fiscalia || "",
          telefonoFiscalia: hecho?.telefono_fiscalia || "",
        },
        accused:
          hecho?.imputados?.map((imputado: any) => ({
            id: imputado.id,
            apellidoNombre: imputado.apellido_nombre || "",
            menorEdad: imputado.menor_edad || false,
            nacionalidad: imputado.nacionalidad || "",
            juzgadoUfi: imputado.juzgado_ufi || "",
            estadoProcesal: imputado.estado_procesal || "",
            pena: imputado.pena || "",
            juicioAbreviado: imputado.juicio_abreviado || false,
            fechasJuicio:
              imputado.fechas_juicio?.map((fecha: any) => ({
                fecha: fecha.fecha || "",
                descripcion: fecha.descripcion || "",
              })) || [],
          })) || [],
        followUp: {
          miembroAsignado: hecho?.seguimiento?.[0]?.miembro_asignado || "",
          contactoFamilia: hecho?.seguimiento?.[0]?.contacto_familia || "",
          parentesco: hecho?.seguimiento?.[0]?.parentesco || "",
          telefonoContacto: hecho?.seguimiento?.[0]?.telefono_contacto || "",
          tipoAcompanamiento: hecho?.seguimiento?.[0]?.tipo_acompanamiento || [],
          abogadoQuerellante: hecho?.seguimiento?.[0]?.abogado_querellante || "",
          amicusCuriae: hecho?.seguimiento?.[0]?.amicus_curiae || false,
          comoLlegoCaso: hecho?.seguimiento?.[0]?.como_llego_caso || "",
          primerContacto: hecho?.seguimiento?.[0]?.primer_contacto || false,
          notas: hecho?.seguimiento?.[0]?.notas || "",
        },
        resources:
          hecho?.recursos?.map((recurso: any) => ({
            id: recurso.id,
            tipo: recurso.tipo || "",
            titulo: recurso.titulo || "",
            url: recurso.url || "",
            fuente: recurso.fuente || "",
            descripcion: recurso.descripcion || "",
          })) || [],
      })
    } catch (error) {
      console.error("Error loading case data:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del caso.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.victim?.nombreCompleto) {
      toast({
        title: "Error de validación",
        description: "El nombre completo de la víctima es obligatorio.",
        variant: "destructive",
      })
      setActiveTab("victim")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      if (mode === "edit" && caseId) {
        const { error: victimError } = await supabase
          .from("victimas")
          .update({
            nombre_completo: formData.victim.nombreCompleto,
            fecha_nacimiento: formData.victim.fechaNacimiento || null,
            edad: formData.victim.edad || null,
            profesion: formData.victim.profesion || null,
            redes_sociales: formData.victim.redesSociales || null,
            telefono_contacto_familiar: formData.victim.telefonoContactoFamiliar || null,
            direccion_completa: formData.victim.direccionCompleta || null,
            nacionalidad: formData.victim.nacionalidad || null,
            notas_adicionales: formData.victim.notasAdicionales || null,
          })
          .eq("id", caseId)

        if (victimError) throw victimError

        const { error: incidentError } = await supabase
          .from("hechos")
          .update({
            fecha_hecho: formData.incident.fechaHecho || null,
            fecha_fallecimiento: formData.incident.fechaFallecimiento || null,
            provincia: formData.incident.provincia || null,
            municipio: formData.incident.municipio || null,
            lugar_especifico: formData.incident.lugarEspecifico || null,
            resumen_hecho: formData.incident.resumenHecho || null,
            numero_causa: formData.incident.numeroCausa || null,
            caratula: formData.incident.caratula || null,
            email_fiscalia: formData.incident.emailFiscalia || null,
            telefono_fiscalia: formData.incident.telefonoFiscalia || null,
          })
          .eq("victima_id", caseId)

        if (incidentError) throw incidentError

        await supabase.from("imputados").delete().eq("hecho_id", caseId)

        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { data: accusedData, error: accusedError } = await supabase
                .from("imputados")
                .insert([
                  {
                    hecho_id: caseId,
                    apellido_nombre: accused.apellidoNombre,
                    menor_edad: accused.menorEdad || false,
                    nacionalidad: accused.nacionalidad || null,
                    juzgado_ufi: accused.juzgadoUfi || null,
                    estado_procesal: accused.estadoProcesal || null,
                    pena: accused.pena || null,
                    juicio_abreviado: accused.juicioAbreviado || false,
                  },
                ])
                .select()
                .single()

              if (accusedError) throw accusedError

              if (accused.fechasJuicio && Array.isArray(accused.fechasJuicio)) {
                for (const fecha of accused.fechasJuicio) {
                  if (fecha.fecha) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accusedData.id,
                        fecha: fecha.fecha,
                        descripcion: fecha.descripcion || null,
                      },
                    ])
                  }
                }
              }
            }
          }
        }

        await supabase.from("seguimiento").delete().eq("hecho_id", caseId)
        if (Object.keys(formData.followUp).length > 0) {
          await supabase.from("seguimiento").insert([
            {
              hecho_id: caseId,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamilia || null,
              parentesco: formData.followUp.parentesco || null,
              telefono_contacto: formData.followUp.telefonoContacto || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              primer_contacto: formData.followUp.primerContacto || false,
              notas: formData.followUp.notas || null,
            },
          ])
        }

        await supabase.from("recursos").delete().eq("hecho_id", caseId)
        if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: caseId,
                  tipo: resource.tipo || null,
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                },
              ])
            }
          }
        }
      } else {
        const { data: victimData, error: victimError } = await supabase
          .from("victimas")
          .insert([
            {
              nombre_completo: formData.victim.nombreCompleto,
              fecha_nacimiento: formData.victim.fechaNacimiento || null,
              edad: formData.victim.edad || null,
              profesion: formData.victim.profesion || null,
              redes_sociales: formData.victim.redesSociales || null,
              telefono_contacto_familiar: formData.victim.telefonoContactoFamiliar || null,
              direccion_completa: formData.victim.direccionCompleta || null,
              nacionalidad: formData.victim.nacionalidad || null,
              notas_adicionales: formData.victim.notasAdicionales || null,
            },
          ])
          .select()
          .single()

        if (victimError) throw victimError

        const { data: incidentData, error: incidentError } = await supabase
          .from("hechos")
          .insert([
            {
              victima_id: victimData.id,
              fecha_hecho: formData.incident.fechaHecho || null,
              fecha_fallecimiento: formData.incident.fechaFallecimiento || null,
              provincia: formData.incident.provincia || null,
              municipio: formData.incident.municipio || null,
              lugar_especifico: formData.incident.lugarEspecifico || null,
              resumen_hecho: formData.incident.resumenHecho || null,
              numero_causa: formData.incident.numeroCausa || null,
              caratula: formData.incident.caratula || null,
              email_fiscalia: formData.incident.emailFiscalia || null,
              telefono_fiscalia: formData.incident.telefonoFiscalia || null,
            },
          ])
          .select()
          .single()

        if (incidentError) throw incidentError

        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { error: accusedError } = await supabase.from("imputados").insert([
                {
                  hecho_id: incidentData.id,
                  apellido_nombre: accused.apellidoNombre,
                  menor_edad: accused.menorEdad || false,
                  nacionalidad: accused.nacionalidad || null,
                  juzgado_ufi: accused.juzgadoUfi || null,
                  estado_procesal: accused.estadoProcesal || null,
                  pena: accused.pena || null,
                  juicio_abreviado: accused.juicioAbreviado || false,
                },
              ])

              if (accusedError) throw accusedError

              if (accused.fechasJuicio && Array.isArray(accused.fechasJuicio)) {
                for (const fecha of accused.fechasJuicio) {
                  if (fecha.fecha) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accused.id,
                        fecha: fecha.fecha,
                        descripcion: fecha.descripcion || null,
                      },
                    ])
                  }
                }
              }
            }
          }
        }

        if (Object.keys(formData.followUp).length > 0) {
          await supabase.from("seguimiento").insert([
            {
              hecho_id: incidentData.id,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamilia || null,
              parentesco: formData.followUp.parentesco || null,
              telefono_contacto: formData.followUp.telefonoContacto || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              primer_contacto: formData.followUp.primerContacto || false,
              notas: formData.followUp.notas || null,
            },
          ])
        }

        if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: incidentData.id,
                  tipo: resource.tipo || null,
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                },
              ])
            }
          }
        }
      }

      toast({
        title: mode === "create" ? "Caso creado" : "Caso actualizado",
        description: "Los datos se han guardado correctamente en la base de datos.",
      })

      router.push("/")
    } catch (error) {
      console.error("Error saving case:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el caso. Verifique la conexión a la base de datos.",
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

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando datos del caso...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
