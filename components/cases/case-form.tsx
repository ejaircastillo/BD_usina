"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X, Plus, Trash2, Users } from "lucide-react"
import Link from "next/link"
import { VictimForm } from "./forms/victim-form"
import { IncidentForm } from "./forms/incident-form"
import { AccusedForm } from "./forms/accused-form"
import { FollowUpForm } from "./forms/follow-up-form"
import { ResourcesForm } from "./forms/resources-form"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface CaseFormProps {
  mode: "create" | "edit"
  caseId?: string
}

// Define types for clarity (optional but recommended)
interface Resource {
  id?: string | number
  tipo: string
  titulo: string
  url: string
  fuente: string
  descripcion: string
  archivo_path: string | null
  archivo_nombre: string | null
  archivo_tipo: string | null
  archivo_size: number | null
  input_mode?: "file" | "url"
  isNew?: boolean // For tracking new resources
}

interface VictimData {
  id?: string | number
  casoId?: string | null
  nombreCompleto: string
  fechaNacimiento: string
  edad: string
  profesion: string
  redesSociales: string
  nacionalidad: string
  notasAdicionales: string
  provinciaResidencia: string
  municipioResidencia: string
  fechaHecho: string
  fechaFallecimiento: string
  resources: Resource[]
}

interface IncidentData {
  provincia: string
  municipio: string
  localidadBarrio: string
  tipoLugar: string
  lugarOtro: string
  resumenHecho: string
  tipoCrimen: string
  tipoArma: string
  armaOtro: string
  contextType: string
  perpetratorType: string
  perpetrators: string[]
  perpetratorDetails: string
  aggravatingFactors: string[]
  otherAggravating: string
  resources: Resource[]
}

interface FollowUpData {
  estadoCausa?: string
  caratula?: string
  juzgado?: string
  fiscal?: string
  querellante?: string
  notasSeguimiento?: string
  // ... potentially more fields from the original followUp object
}

interface ActorData {
  id?: string | number
  tipoActor: string
  nombreActor: string
  rolActor: string
  detallesActor: string
}

const getEmptyVictimData = (): VictimData => ({
  id: undefined,
  casoId: null,
  nombreCompleto: "",
  fechaNacimiento: "",
  edad: "",
  profesion: "",
  redesSociales: "",
  nacionalidad: "",
  notasAdicionales: "",
  provinciaResidencia: "",
  municipioResidencia: "",
  fechaHecho: "",
  fechaFallecimiento: "",
  resources: [],
})

const getEmptyIncidentData = (): IncidentData => ({
  provincia: "",
  municipio: "",
  localidadBarrio: "",
  tipoLugar: "",
  lugarOtro: "",
  resumenHecho: "",
  tipoCrimen: "",
  tipoArma: "",
  armaOtro: "",
  contextType: "",
  perpetratorType: "",
  perpetrators: [],
  perpetratorDetails: "",
  aggravatingFactors: [],
  otherAggravating: "",
  resources: [],
})

const getEmptyFollowUpData = (): FollowUpData => ({
  estadoCausa: "",
  caratula: "",
  juzgado: "",
  fiscal: "",
  querellante: "",
  notasSeguimiento: "",
})

const getEmptyActorData = (): ActorData => ({
  id: undefined,
  tipoActor: "",
  nombreActor: "",
  rolActor: "",
  detallesActor: "",
})

export function CaseForm({ mode, caseId }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("victim")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === "edit")

  const [formData, setFormData] = useState({
    victims: [getEmptyVictimData()],
    incident: getEmptyIncidentData(),
    accused: [], // Assuming AccusedForm handles its own structure
    followUp: getEmptyFollowUpData(),
    resources: [], // General resources for the incident
    actors: [] as ActorData[],
    status: "En investigación",
  })

  const [realIds, setRealIds] = useState<{
    victimaId: string | null
    hechoId: string | null
    casoId: string | null
  }>({
    victimaId: null,
    hechoId: null,
    casoId: null,
  })

  const loadExistingCaseData = useCallback(async () => {
    if (mode !== "edit" || !caseId) return

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: currentCase, error: caseError } = await supabase
        .from("casos")
        .select(`
          id,
          estado_general,
          victima_id,
          hecho_id,
          victimas (
            id,
            nombre_completo,
            fecha_nacimiento,
            edad,
            profesion,
            redes_sociales,
            nacionalidad,
            notas_adicionales,
            provincia_residencia,
            municipio_residencia,
            fecha_hecho,
            fecha_fallecimiento,
            created_at
          ),
          hechos (
            id,
            provincia,
            municipio,
            localidad_barrio,
            tipo_lugar,
            lugar_otro,
            resumen_hecho,
            tipo_crimen,
            tipo_arma
          )
        `)
        .eq("id", caseId)
        .single()

      if (caseError) throw caseError
      if (!currentCase) {
        throw new Error("Caso no encontrado")
      }

      const victima = currentCase.victimas as any
      const hecho = currentCase.hechos as any

      setRealIds({
        victimaId: victima?.id || null,
        hechoId: hecho?.id || null,
        casoId: currentCase.id,
      })

      // Get all victims related to the same hecho, ordered by created_at
      let allVictims: VictimData[] = []
      if (hecho?.id) {
        const { data: relatedCases, error: relatedError } = await supabase
          .from("casos")
          .select(`
            id,
            victima_id,
            victimas (
              id,
              nombre_completo,
              fecha_nacimiento,
              edad,
              profesion,
              redes_sociales,
              nacionalidad,
              notas_adicionales,
              provincia_residencia,
              municipio_residencia,
              fecha_hecho,
              fecha_fallecimiento,
              created_at
            )
          `)
          .eq("hecho_id", hecho.id)
          .order("created_at", { ascending: true })

        if (!relatedError && relatedCases) {
          // Sort by victimas.created_at to maintain original order
          const sortedCases = relatedCases.sort((a: any, b: any) => {
            const dateA = new Date(a.victimas?.created_at || 0).getTime()
            const dateB = new Date(b.victimas?.created_at || 0).getTime()
            return dateA - dateB
          })

          // Get resources for all victims
          const victimIds = sortedCases.map((c: any) => c.victimas?.id).filter(Boolean)
          const { data: allResources } = await supabase.from("recursos").select("*").in("victima_id", victimIds)

          allVictims = sortedCases.map((c: any) => {
            const v = c.victimas
            const victimResources = allResources?.filter((r: any) => r.victima_id === v?.id) || []
            return {
              id: v?.id || undefined,
              nombreCompleto: v?.nombre_completo || "",
              fechaNacimiento: v?.fecha_nacimiento || "",
              edad: v?.edad?.toString() || "",
              profesion: v?.profesion || "",
              redesSociales: v?.redes_sociales || "",
              nacionalidad: v?.nacionalidad || "",
              notasAdicionales: v?.notas_adicionales || "",
              provinciaResidencia: v?.provincia_residencia || "",
              municipioResidencia: v?.municipio_residencia || "",
              fechaHecho: v?.fecha_hecho || "",
              fechaFallecimiento: v?.fecha_fallecimiento || "",
              resources: victimResources.map((r: any) => ({
                id: r.id,
                tipo: r.tipo || "",
                titulo: r.titulo || "",
                url: r.url || "",
                fuente: r.fuente || "",
                descripcion: r.descripcion || "",
                archivo_path: r.archivo_path || "",
                archivo_nombre: r.archivo_nombre || "",
                archivo_tipo: r.archivo_tipo || "",
                archivo_size: r.archivo_size || 0,
              })),
            }
          })
        }
      }

      // Fallback to single victim if no related cases found
      if (allVictims.length === 0 && victima) {
        const { data: victimResources } = await supabase.from("recursos").select("*").eq("victima_id", victima.id)

        allVictims = [
          {
            id: victima.id,
            nombreCompleto: victima.nombre_completo || "",
            fechaNacimiento: victima.fecha_nacimiento || "",
            edad: victima.edad?.toString() || "",
            profesion: victima.profesion || "",
            redesSociales: victima.redes_sociales || "",
            nacionalidad: victima.nacionalidad || "",
            notasAdicionales: victima.notas_adicionales || "",
            provinciaResidencia: victima.provincia_residencia || "",
            municipioResidencia: victima.municipio_residencia || "",
            fechaHecho: victima.fecha_hecho || "",
            fechaFallecimiento: victima.fecha_fallecimiento || "",
            resources:
              victimResources?.map((r: any) => ({
                id: r.id,
                tipo: r.tipo || "",
                titulo: r.titulo || "",
                url: r.url || "",
                fuente: r.fuente || "",
                descripcion: r.descripcion || "",
                archivo_path: r.archivo_path || "",
                archivo_nombre: r.archivo_nombre || "",
                archivo_tipo: r.archivo_tipo || "",
                archivo_size: r.archivo_size || 0,
              })) || [],
          },
        ]
      }

      // Load incident resources
      const { data: incidentResources } = await supabase.from("recursos").select("*").eq("hecho_id", hecho?.id)

      // Load seguimiento
      const { data: seguimientoData } = await supabase
        .from("seguimiento")
        .select("*")
        .eq("hecho_id", hecho?.id)
        .maybeSingle()

      // Load actores
      const { data: actoresData } = await supabase.from("actores").select("*").eq("hecho_id", hecho?.id)

      setFormData({
        victims: allVictims,
        incident: {
          provincia: hecho?.provincia || "",
          municipio: hecho?.municipio || "",
          localidadBarrio: hecho?.localidad_barrio || "",
          tipoLugar: hecho?.tipo_lugar || "",
          lugarOtro: hecho?.lugar_otro || "",
          resumenHecho: hecho?.resumen_hecho || "",
          tipoCrimen: hecho?.tipo_crimen || "",
          tipoArma: hecho?.tipo_arma || "",
          armaOtro: hecho?.arma_otro || "",
          contextType: hecho?.context_type || "",
          perpetratorType: hecho?.perpetrator_type || "",
          perpetrators: hecho?.perpetrators || [],
          perpetratorDetails: hecho?.perpetrator_details || "",
          aggravatingFactors: hecho?.aggravating_factors || [],
          otherAggravating: hecho?.other_aggravating || "",
          resources:
            incidentResources?.map((r: any) => ({
              id: r.id,
              tipo: r.tipo || "",
              titulo: r.titulo || "",
              url: r.url || "",
              fuente: r.fuente || "",
              descripcion: r.descripcion || "",
              archivo_path: r.archivo_path || "",
              archivo_nombre: r.archivo_nombre || "",
              archivo_tipo: r.archivo_tipo || "",
              archivo_size: r.archivo_size || 0,
            })) || [],
        },
        accused: [], // Assuming AccusedForm will handle fetching/displaying accused data
        followUp: {
          estadoCausa: seguimientoData?.estado_causa || "",
          caratula: seguimientoData?.caratula || "",
          juzgado: seguimientoData?.juzgado || "",
          fiscal: seguimientoData?.fiscal || "",
          querellante: seguimientoData?.querellante || "",
          notasSeguimiento: seguimientoData?.notas_seguimiento || "",
          // Map other followUp fields as needed
        },
        resources:
          incidentResources?.map((r: any) => ({
            id: r.id,
            tipo: r.tipo || "",
            titulo: r.titulo || "",
            url: r.url || "",
            fuente: r.fuente || "",
            descripcion: r.descripcion || "",
            archivo_path: r.archivo_path || "",
            archivo_nombre: r.archivo_nombre || "",
            archivo_tipo: r.archivo_tipo || "",
            archivo_size: r.archivo_size || 0,
          })) || [],
        actors:
          actoresData?.map((actor: any) => ({
            id: actor.id,
            tipoActor: actor.tipo_actor || "",
            nombreActor: actor.nombre_actor || "",
            rolActor: actor.rol_actor || "",
            detallesActor: actor.detalles_actor || "",
          })) || [],
        status: currentCase.estado_general || "En investigación",
      })
    } catch (error) {
      console.error("Error loading case:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el caso",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [mode, caseId, toast])

  useEffect(() => {
    loadExistingCaseData()
  }, [loadExistingCaseData])

  const buildImputadoInsert = (accused: any, hechoId: string) => ({
    hecho_id: hechoId,
    apellido_nombre: accused.apellidoNombre,
    alias: accused.alias || null,
    edad: accused.edad || null,
    menor_edad: accused.menorEdad || false,
    nacionalidad: accused.nacionalidad || null,
    juzgado_ufi: accused.juzgadoUfi || null,
    estado_procesal: accused.estadoProcesal || null,
    pena: accused.pena || null,
    juicio_abreviado: accused.juicioAbreviado || false,
    prision_perpetua: accused.prisionPerpetua || false,
    fecha_veredicto: accused.fechaVeredicto || null,
    documento_identidad: accused.documentoIdentidad || null,
    tribunal_fallo: accused.tribunalFallo || null,
    es_extranjero: accused.esExtranjero || false,
    detenido_previo: accused.detenidoPrevio || false,
    fallecido: accused.fallecido || false,
    es_reincidente: accused.esReincidente || false,
    cargos: accused.cargos || null,
  })

  const addVictim = () => {
    setFormData((prev) => ({
      ...prev,
      victims: [...prev.victims, getEmptyVictimData()],
    }))
  }

  const removeVictim = (index: number) => {
    if (formData.victims.length <= 1) return
    setFormData((prev) => ({
      ...prev,
      victims: prev.victims.filter((_, i) => i !== index),
    }))
  }

  const updateVictim = (index: number, data: Partial<VictimData>) => {
    setFormData((prev) => ({
      ...prev,
      victims: prev.victims.map((v, i) => (i === index ? { ...v, ...data } : v)),
    }))
  }

  const handleSave = async () => {
    const supabase = createClient()
    setIsSaving(true)

    try {
      if (mode === "edit" && caseId) {
        const hechoId = realIds.hechoId

        if (!hechoId) throw new Error("No se encontró el ID del hecho para actualizar.")

        // Update victims
        for (const victim of formData.victims) {
          const victimDataToUpdate = {
            nombre_completo: victim.nombreCompleto || null,
            fecha_nacimiento: victim.fechaNacimiento || null,
            edad: victim.edad ? Number.parseInt(victim.edad) : null,
            profesion: victim.profesion || null,
            redes_sociales: victim.redesSociales || null,
            nacionalidad: victim.nacionalidad || null,
            notas_adicionales: victim.notasAdicionales || null,
            provincia_residencia: victim.provinciaResidencia || null,
            municipio_residencia: victim.municipioResidencia || null,
            fecha_hecho: victim.fechaHecho || null,
            fecha_fallecimiento: victim.fechaFallecimiento || null,
          }

          if (victim.id) {
            // Update existing victim
            const { error: victimError } = await supabase
              .from("victimas")
              .update(victimDataToUpdate)
              .eq("id", victim.id)

            if (victimError) throw victimError

            // Update victim resources (simplified: assuming no deletion logic here for now)
            if (victim.resources && Array.isArray(victim.resources)) {
              for (const resource of victim.resources) {
                if (resource.id) {
                  // Update existing resource
                  await supabase
                    .from("recursos")
                    .update({
                      tipo: resource.tipo || "other",
                      titulo: resource.titulo || null,
                      url: resource.url || null,
                      fuente: resource.fuente || null,
                      descripcion: resource.descripcion || null,
                      archivo_path: resource.archivo_path || null,
                      archivo_nombre: resource.archivo_nombre || null,
                      archivo_tipo: resource.archivo_tipo || null,
                      archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                    })
                    .eq("id", resource.id)
                } else if (resource.titulo || resource.url || resource.archivo_path) {
                  // Insert new resource
                  await supabase.from("recursos").insert([
                    {
                      victima_id: victim.id,
                      hecho_id: hechoId,
                      tipo: resource.tipo || "other",
                      titulo: resource.titulo || null,
                      url: resource.url || null,
                      fuente: resource.fuente || null,
                      descripcion: resource.descripcion || null,
                      archivo_path: resource.archivo_path || null,
                      archivo_nombre: resource.archivo_nombre || null,
                      archivo_tipo: resource.archivo_tipo || null,
                      archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                    },
                  ])
                }
              }
            }
          } else {
            // Insert new victim
            const { data: newVictimData, error: victimInsertError } = await supabase
              .from("victimas")
              .insert([victimDataToUpdate])
              .select()
              .single()

            if (victimInsertError) throw victimInsertError

            // Create CASOS record linking new victim_id + hecho_id
            const { error: casoInsertError } = await supabase.from("casos").insert([
              {
                victima_id: newVictimData.id,
                hecho_id: hechoId,
                estado_general: "En investigación", // Default status
              },
            ])
            if (casoInsertError) throw casoInsertError

            // Insert victim resources for the new victim
            if (victim.resources && Array.isArray(victim.resources)) {
              for (const resource of victim.resources) {
                if (resource.titulo || resource.url || resource.archivo_path) {
                  await supabase.from("recursos").insert([
                    {
                      victima_id: newVictimData.id,
                      hecho_id: hechoId,
                      tipo: resource.tipo || "other",
                      titulo: resource.titulo || null,
                      url: resource.url || null,
                      fuente: resource.fuente || null,
                      descripcion: resource.descripcion || null,
                      archivo_path: resource.archivo_path || null,
                      archivo_nombre: resource.archivo_nombre || null,
                      archivo_tipo: resource.archivo_tipo || null,
                      archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                    },
                  ])
                }
              }
            }
          }
        }

        // Update incident data
        const { error: incidentError } = await supabase
          .from("hechos")
          .update({
            provincia: formData.incident.provincia || null,
            municipio: formData.incident.municipio || null,
            localidad_barrio: formData.incident.localidadBarrio || null,
            tipo_lugar: formData.incident.tipoLugar || null,
            lugar_otro: formData.incident.lugarOtro || null,
            resumen_hecho: formData.incident.resumenHecho || null,
            tipo_crimen: formData.incident.tipoCrimen || null,
            tipo_arma: formData.incident.tipoArma || null,
            arma_otro: formData.incident.armaOtro || null,
            context_type: formData.incident.contextType || null,
            perpetrator_type: formData.incident.perpetratorType || null,
            perpetrators: formData.incident.perpetrators || [],
            perpetrator_details: formData.incident.perpetratorDetails || null,
            aggravating_factors: formData.incident.aggravatingFactors || [],
            other_aggravating: formData.incident.otherAggravating || null,
          })
          .eq("id", hechoId)

        if (incidentError) throw incidentError

        // Update or insert accused (actors)
        if (formData.accused && Array.isArray(formData.accused)) {
          const currentAccusedIds = formData.accused
            .filter((a: any) => a.id && typeof a.id === "string" && !a.id.startsWith("temp-"))
            .map((a: any) => a.id)

          // Delete accused that are no longer in the form
          const { data: existingAccused } = await supabase.from("actores").select("id").eq("hecho_id", hechoId)
          const existingAccusedIds = existingAccused?.map((a) => a.id) || []
          const accusedToDelete = existingAccusedIds.filter((id) => !currentAccusedIds.includes(id))

          for (const idToDelete of accusedToDelete) {
            await supabase.from("actores").delete().eq("id", idToDelete)
          }

          for (const accused of formData.accused) {
            const accusedData = {
              hecho_id: hechoId,
              tipo_actor: "Imputado", // Assuming 'accused' implies 'Imputado'
              nombre_actor: accused.apellidoNombre,
              rol_actor: accused.rol || "", // Add if AccusedForm has a 'rol' field
              detalles_actor: accused.detalles || "", // Add if AccusedForm has 'detalles'
            }

            if (accused.id && typeof accused.id === "string" && !accused.id.startsWith("temp-")) {
              // Update existing accused
              await supabase.from("actores").update(accusedData).eq("id", accused.id)
            } else {
              // Insert new accused
              await supabase.from("actores").insert([accusedData])
            }
          }
        }

        // Update or insert follow-up data
        const { data: existingSeguimiento } = await supabase
          .from("seguimiento")
          .select("id")
          .eq("hecho_id", hechoId)
          .single()

        const followUpDataToUpdate = {
          hecho_id: hechoId,
          estado_causa: formData.followUp.estadoCausa || null,
          caratula: formData.followUp.caratula || null,
          juzgado: formData.followUp.juzgado || null,
          fiscal: formData.followUp.fiscal || null,
          querellante: formData.followUp.querellante || null,
          notas_seguimiento: formData.followUp.notasSeguimiento || null,
          // Map other followUp fields
        }

        if (existingSeguimiento?.id) {
          const { error: followUpError } = await supabase
            .from("seguimiento")
            .update(followUpDataToUpdate)
            .eq("id", existingSeguimiento.id)
          if (followUpError) throw followUpError
        } else {
          const { error: followUpError } = await supabase.from("seguimiento").insert([followUpDataToUpdate])
          if (followUpError) throw followUpError
        }

        // Update general resources for the fact
        if (formData.resources && Array.isArray(formData.resources)) {
          for (const resource of formData.resources) {
            if (resource.id) {
              // Update existing resource
              await supabase
                .from("recursos")
                .update({
                  hecho_id: hechoId,
                  tipo: resource.tipo || "other",
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                })
                .eq("id", resource.id)
            } else if (resource.titulo || resource.url || resource.archivo_path) {
              // Insert new resource
              await supabase.from("recursos").insert([
                {
                  hecho_id: hechoId,
                  tipo: resource.tipo || "other",
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                },
              ])
            }
          }
        }

        // Update case status
        await supabase.from("casos").update({ estado_general: formData.status }).eq("id", caseId)
      } else {
        // CREATE MODE
        // Step 1: Insert the HECHO (once, use dates from the first victim)
        const firstVictim = formData.victims[0]
        const { data: incidentData, error: incidentError } = await supabase
          .from("hechos")
          .insert([
            {
              fecha_hecho: firstVictim.fechaHecho || null,
              fecha_fallecimiento: firstVictim.fechaFallecimiento || null,
              provincia: formData.incident.provincia || null,
              municipio: formData.incident.municipio || null,
              localidad_barrio: formData.incident.localidadBarrio || null,
              tipo_lugar: formData.incident.tipoLugar || null,
              lugar_otro: formData.incident.lugarOtro || null,
              resumen_hecho: formData.incident.resumenHecho || null,
              tipo_crimen: formData.incident.tipoCrimen || null,
              tipo_arma: formData.incident.tipoArma || null,
              arma_otro: formData.incident.armaOtro || null,
              context_type: formData.incident.contextType || null,
              perpetrator_type: formData.incident.perpetratorType || null,
              perpetrators: formData.incident.perpetrators || [],
              perpetrator_details: formData.incident.perpetratorDetails || null,
              aggravating_factors: formData.incident.aggravatingFactors || [],
              other_aggravating: formData.incident.otherAggravating || null,
            },
          ])
          .select()
          .single()

        if (incidentError) throw incidentError
        const hechoId = incidentData.id

        // Step 2: Iterate through VICTIMS array
        const createdVictimIds: string[] = []
        for (const victim of formData.victims) {
          // Insert victim
          const { data: victimData, error: victimError } = await supabase
            .from("victimas")
            .insert([
              {
                nombre_completo: victim.nombreCompleto || null,
                fecha_nacimiento: victim.fechaNacimiento || null,
                edad: victim.edad ? Number.parseInt(victim.edad) : null,
                profesion: victim.profesion || null,
                redes_sociales: victim.redesSociales || null,
                nacionalidad: victim.nacionalidad || null,
                notas_adicionales: victim.notasAdicionales || null,
                provincia_residencia: victim.provinciaResidencia || null,
                municipio_residencia: victim.municipioResidencia || null,
                fecha_hecho: victim.fechaHecho || null,
                fecha_fallecimiento: victim.fechaFallecimiento || null,
              },
            ])
            .select()
            .single()

          if (victimError) throw victimError
          createdVictimIds.push(victimData.id)

          // Create CASOS record linking victim_id + hecho_id
          await supabase.from("casos").insert([
            {
              victima_id: victimData.id,
              hecho_id: hechoId,
              estado_general: "En investigación",
            },
          ])

          // Insert victim resources
          if (victim.resources && Array.isArray(victim.resources)) {
            for (const resource of victim.resources) {
              if (resource.titulo || resource.url || resource.archivo_path) {
                await supabase.from("recursos").insert([
                  {
                    victima_id: victimData.id,
                    hecho_id: hechoId,
                    tipo: resource.tipo || "other",
                    titulo: resource.titulo || null,
                    url: resource.url || null,
                    fuente: resource.fuente || null,
                    descripcion: resource.descripcion || null,
                    archivo_path: resource.archivo_path || null,
                    archivo_nombre: resource.archivo_nombre || null,
                    archivo_tipo: resource.archivo_tipo || null,
                    archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                  },
                ])
              }
            }
          }
        }

        // Update the HECHO with the first victim's ID if available
        if (createdVictimIds.length > 0) {
          await supabase.from("hechos").update({ victima_id: createdVictimIds[0] }).eq("id", hechoId)
        }

        // Step 3: Iterate through ACCUSED array (actors)
        if (formData.actors && Array.isArray(formData.actors)) {
          for (const actor of formData.actors) {
            if (actor.nombreActor) {
              await supabase.from("actores").insert([
                {
                  hecho_id: hechoId,
                  tipo_actor: actor.tipoActor || "Otro",
                  nombre_actor: actor.nombreActor,
                  rol_actor: actor.rolActor || null,
                  detalles_actor: actor.detallesActor || null,
                },
              ])
            }
          }
        }

        // Insert seguimiento
        if (formData.followUp) {
          await supabase.from("seguimiento").insert([
            {
              hecho_id: hechoId,
              estado_causa: formData.followUp.estadoCausa || null,
              caratula: formData.followUp.caratula || null,
              juzgado: formData.followUp.juzgado || null,
              fiscal: formData.followUp.fiscal || null,
              querellante: formData.followUp.querellante || null,
              notas_seguimiento: formData.followUp.notasSeguimiento || null,
              // Map other followUp fields
            },
          ])
        }

        // Insert general resources for the fact
        if (formData.resources && Array.isArray(formData.resources)) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: hechoId,
                  tipo: resource.tipo || "other",
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size ? Number(resource.archivo_size) : null,
                },
              ])
            }
          }
        }

        // Create the main CASO record
        await supabase.from("casos").insert([
          {
            id: caseId, // Use the provided caseId if available, otherwise let DB generate one
            victima_id: createdVictimIds[0] || null,
            hecho_id: hechoId,
            estado_general: formData.status || "En investigación",
          },
        ])
      }

      toast({
        title: mode === "edit" ? "Caso actualizado" : "Caso guardado",
        description:
          mode === "edit"
            ? "Los cambios han sido guardados correctamente."
            : `Se han registrado ${formData.victims.length} víctima(s) correctamente.`,
      })

      router.push("/casos")
    } catch (error: any) {
      console.error("Error saving case:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el caso. Verifique la conexión a la base de datos.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando datos del caso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/casos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              {mode === "edit" ? "Editar Caso" : "Nuevo Caso"}
            </h1>
            <p className="text-sm text-slate-500">
              {mode === "edit"
                ? "Modifica los datos del caso existente"
                : "Complete los datos para registrar un nuevo caso"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/casos">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </Link>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar Caso"}
          </Button>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg font-heading">Información del Caso</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              {" "}
              {/* Increased cols for Actors */}
              <TabsTrigger value="victim" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Víctimas ({formData.victims.length})
              </TabsTrigger>
              <TabsTrigger value="incident">Hecho</TabsTrigger>
              <TabsTrigger value="accused">Imputados</TabsTrigger>
              <TabsTrigger value="followup">Seguimiento</TabsTrigger>
              <TabsTrigger value="actors">Actores</TabsTrigger> {/* New Tab */}
            </TabsList>

            <TabsContent value="victim" className="space-y-6">
              {formData.victims.length > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Caso con múltiples víctimas</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Este hecho tiene {formData.victims.length} víctimas registradas. Todas comparten el mismo hecho,
                      imputados y seguimiento, pero cada una tiene su propia ficha individual.
                    </p>
                  </div>
                </div>
              )}

              <div className="max-w-4xl mx-auto space-y-6">
                {formData.victims.map((victim, index) => (
                  <Card key={victim.id?.toString() || `temp-${index}`} className="border-slate-200">
                    {" "}
                    {/* Use temp index for new victims */}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base font-heading">
                          Víctima #{index + 1}
                          {victim.nombreCompleto && ` - ${victim.nombreCompleto}`}
                        </CardTitle>
                        {mode === "edit" && (
                          <Badge variant={victim.id ? "outline" : "default"} className="text-xs">
                            {victim.id ? "Guardada" : "Nueva"}
                          </Badge>
                        )}
                      </div>
                      {formData.victims.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeVictim(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      <VictimForm data={victim} onChange={(data) => updateVictim(index, data)} showDates={true} />
                      <div className="border-t pt-6">
                        <h4 className="text-md font-semibold text-slate-900 font-heading mb-2">
                          Recursos de la Víctima
                        </h4>
                        <p className="text-xs text-slate-500 mb-4">
                          Fotos, documentos y enlaces relacionados con esta víctima.
                        </p>
                        <ResourcesForm
                          data={victim.resources || []}
                          onChange={(resources) => updateVictim(index, { resources })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  onClick={addVictim}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-6 hover:border-slate-400 bg-transparent"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Víctima
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="incident">
              <div className="max-w-4xl mx-auto">
                <IncidentForm
                  data={formData.incident}
                  onChange={(data) => setFormData((prev) => ({ ...prev, incident: data }))}
                  hideDates={true}
                />
              </div>
            </TabsContent>

            <TabsContent value="accused">
              {/* Assuming AccusedForm now handles the structure and updates for 'accused' */}
              <AccusedForm
                data={formData.accused}
                onChange={(data) => setFormData((prev) => ({ ...prev, accused: data }))}
              />
            </TabsContent>

            <TabsContent value="followup">
              <div className="max-w-4xl mx-auto">
                <FollowUpForm
                  data={formData.followUp}
                  onChange={(data) => setFormData((prev) => ({ ...prev, followUp: data }))}
                  // Pass resources if FollowUpForm needs to manage them directly
                  // resources={formData.resources}
                  // onResourcesChange={(resources) => setFormData((prev) => ({ ...prev, resources }))}
                />
              </div>
            </TabsContent>

            {/* New Tab for Actors */}
            <TabsContent value="actors">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                  <Users className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Otros Actores Involucrados</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Registre aquí a otros actores relevantes para el caso, como testigos, abogados, etc.
                    </p>
                  </div>
                </div>
                {formData.actors.map((actor, index) => (
                  <Card key={actor.id?.toString() || `temp-${index}`} className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50">
                      <CardTitle className="text-base font-heading">
                        Actor #{index + 1}
                        {actor.nombreActor && ` - ${actor.nombreActor}`}
                      </CardTitle>
                      {formData.actors.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              actors: prev.actors.filter((_, i) => i !== index),
                            }))
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`actor-type-${index}`} className="block text-sm font-medium text-gray-700">
                            Tipo de Actor
                          </label>
                          <select
                            id={`actor-type-${index}`}
                            value={actor.tipoActor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                actors: prev.actors.map((a, i) =>
                                  i === index ? { ...a, tipoActor: e.target.value } : a,
                                ),
                              }))
                            }
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="">Seleccione un tipo</option>
                            <option value="Testigo">Testigo</option>
                            <option value="Abogado">Abogado</option>
                            <option value="Familiar">Familiar</option>
                            <option value="Organización">Organización</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`actor-nombre-${index}`} className="block text-sm font-medium text-gray-700">
                            Nombre
                          </label>
                          <input
                            type="text"
                            id={`actor-nombre-${index}`}
                            value={actor.nombreActor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                actors: prev.actors.map((a, i) =>
                                  i === index ? { ...a, nombreActor: e.target.value } : a,
                                ),
                              }))
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`actor-rol-${index}`} className="block text-sm font-medium text-gray-700">
                            Rol/Ocupación
                          </label>
                          <input
                            type="text"
                            id={`actor-rol-${index}`}
                            value={actor.rolActor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                actors: prev.actors.map((a, i) =>
                                  i === index ? { ...a, rolActor: e.target.value } : a,
                                ),
                              }))
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`actor-detalles-${index}`}
                            className="block text-sm font-medium text-gray-700"
                          >
                            Detalles/Contacto
                          </label>
                          <input
                            type="text"
                            id={`actor-detalles-${index}`}
                            value={actor.detallesActor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                actors: prev.actors.map((a, i) =>
                                  i === index ? { ...a, detallesActor: e.target.value } : a,
                                ),
                              }))
                            }
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      actors: [...prev.actors, getEmptyActorData()],
                    }))
                  }
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-6 hover:border-slate-400 bg-transparent"
                >
                  <Plus className="w-5 h-5" />
                  Agregar Actor
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
