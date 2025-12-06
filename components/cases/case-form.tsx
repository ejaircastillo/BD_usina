"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react"
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

const getEmptyVictimData = () => ({
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

export function CaseForm({ mode, caseId }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("victim")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === "edit")

  const [formData, setFormData] = useState({
    victims: [getEmptyVictimData()],
    incident: {
      provincia: "",
      municipio: "",
      localidadBarrio: "",
      tipoLugar: "",
      lugarOtro: "",
      resumenHecho: "",
      tipoCrimen: "",
      tipoArma: "",
    },
    accused: [],
    followUp: {},
    resources: [],
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

  useEffect(() => {
    if (mode === "edit" && caseId) {
      loadExistingCaseData()
    }
  }, [mode, caseId])

  const loadExistingCaseData = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      let victimaId: string | null = null
      let hechoId: string | null = null
      let casoId: string | null = null

      // Strategy 1: Try to find by caso.id first
      const { data: casoData } = await supabase
        .from("casos")
        .select("id, victima_id, hecho_id")
        .eq("id", caseId)
        .maybeSingle()

      if (casoData) {
        console.log("[v0] Found caso record:", casoData)
        casoId = casoData.id
        victimaId = casoData.victima_id
        hechoId = casoData.hecho_id
      } else {
        // Strategy 2: Try to find by victima.id
        const { data: victimaCheck } = await supabase.from("victimas").select("id").eq("id", caseId).maybeSingle()

        if (victimaCheck) {
          console.log("[v0] Found victima record:", victimaCheck)
          victimaId = victimaCheck.id

          // Get the hecho associated with this victima
          const { data: hechoCheck } = await supabase
            .from("hechos")
            .select("id")
            .eq("victima_id", victimaId)
            .maybeSingle()

          if (hechoCheck) {
            hechoId = hechoCheck.id
          }
        } else {
          // Strategy 3: Try to find by hecho.id
          const { data: hechoCheck } = await supabase
            .from("hechos")
            .select("id, victima_id")
            .eq("id", caseId)
            .maybeSingle()

          if (hechoCheck) {
            console.log("[v0] Found hecho record:", hechoCheck)
            hechoId = hechoCheck.id
            victimaId = hechoCheck.victima_id
          }
        }
      }

      console.log("[v0] Resolved IDs - victimaId:", victimaId, "hechoId:", hechoId, "casoId:", casoId)

      if (!victimaId) {
        throw new Error("No se pudo encontrar la víctima asociada a este caso")
      }

      // Store real IDs for later use in updates
      setRealIds({ victimaId, hechoId, casoId })

      // Now fetch all data using the resolved IDs
      const { data: victimData, error: victimError } = await supabase
        .from("victimas")
        .select("*")
        .eq("id", victimaId)
        .single()

      if (victimError) throw victimError

      console.log("[v0] Victim data loaded:", victimData)

      // Fetch hecho data
      let hechoData = null
      if (hechoId) {
        const { data } = await supabase.from("hechos").select("*").eq("id", hechoId).single()
        hechoData = data
      } else {
        // Fallback: find hecho by victima_id
        const { data } = await supabase.from("hechos").select("*").eq("victima_id", victimaId).maybeSingle()
        hechoData = data
        if (data) {
          hechoId = data.id
          setRealIds((prev) => ({ ...prev, hechoId: data.id }))
        }
      }

      console.log("[v0] Hecho data loaded:", hechoData)

      // Fetch seguimiento data
      let seguimientoData = null
      if (hechoId) {
        const { data } = await supabase.from("seguimiento").select("*").eq("hecho_id", hechoId).maybeSingle()
        seguimientoData = data
      }

      console.log("[v0] Seguimiento data loaded:", seguimientoData)

      // Fetch imputados with their resources and instancias
      let imputadosData: any[] = []
      if (hechoId) {
        const { data } = await supabase.from("imputados").select("*").eq("hecho_id", hechoId)
        imputadosData = data || []
      }

      const imputadosWithResources = await Promise.all(
        imputadosData.map(async (imputado: any) => {
          const { data: imputadoResources } = await supabase.from("recursos").select("*").eq("imputado_id", imputado.id)
          const { data: instanciasData } = await supabase
            .from("instancias_judiciales")
            .select("*")
            .eq("imputado_id", imputado.id)

          return {
            id: imputado.id,
            apellidoNombre: imputado.apellido_nombre || "",
            alias: imputado.alias || "",
            edad: imputado.edad || "",
            menorEdad: imputado.menor_edad || false,
            nacionalidad: imputado.nacionalidad || "",
            juzgadoUfi: imputado.juzgado_ufi || "",
            estadoProcesal: imputado.estado_procesal || "",
            pena: imputado.pena || "",
            juicioAbreviado: imputado.juicio_abreviado || false,
            prisionPerpetua: imputado.prision_perpetua || false,
            fechaVeredicto: imputado.fecha_veredicto || "",
            documentoIdentidad: imputado.documento_identidad || "",
            tribunalFallo: imputado.tribunal_fallo || "",
            esExtranjero: imputado.es_extranjero || false,
            detenidoPrevio: imputado.detenido_previo || false,
            fallecido: imputado.fallecido || false,
            esReincidente: imputado.es_reincidente || false,
            cargos: imputado.cargos || "",
            trialDates: [],
            instanciasJudiciales: (instanciasData || []).map((inst: any) => ({
              id: inst.id,
              numeroCausa: inst.numero_causa || "",
              fiscalFiscalia: inst.fiscal_fiscalia || inst.fiscal || "",
              caratula: inst.caratula || "",
              ordenNivel: inst.orden_nivel || "",
            })),
            resources: (imputadoResources || []).map((r: any) => ({
              id: r.id,
              tipo: r.tipo || "",
              titulo: r.titulo || "",
              url: r.url || "",
              fuente: r.fuente || "",
              descripcion: r.descripcion || "",
              archivo_path: r.archivo_path,
              archivo_nombre: r.archivo_nombre,
              archivo_tipo: r.archivo_tipo,
              archivo_size: r.archivo_size,
              input_mode: r.archivo_path ? "file" : "url",
            })),
          }
        }),
      )

      // Fetch recursos generales del hecho
      let recursosGenerales: any[] = []
      if (hechoId) {
        const { data } = await supabase
          .from("recursos")
          .select("*")
          .eq("hecho_id", hechoId)
          .is("imputado_id", null)
          .is("victima_id", null)
        recursosGenerales = data || []
      }

      // Parse JSONB fields from seguimiento
      const listaMiembros = seguimientoData?.lista_miembros_asignados || []
      const listaContactos = seguimientoData?.lista_contactos_familiares || []
      const listaAbogados = seguimientoData?.datos_abogados_querellantes || []

      // Build the form data
      setFormData({
        victims: [
          {
            nombreCompleto: victimData.nombre_completo || "",
            fechaNacimiento: victimData.fecha_nacimiento || "",
            edad: victimData.edad?.toString() || "",
            profesion: victimData.profesion || "",
            redesSociales: victimData.redes_sociales || "",
            nacionalidad: victimData.nacionalidad || "",
            notasAdicionales: victimData.notas_adicionales || "",
            provinciaResidencia: victimData.provincia_residencia || "",
            municipioResidencia: victimData.municipio_residencia || "",
            fechaHecho: victimData.fecha_hecho || "",
            fechaFallecimiento: victimData.fecha_fallecimiento || "",
            resources: [],
          },
        ],
        incident: {
          provincia: hechoData?.provincia || "",
          municipio: hechoData?.municipio || "",
          localidadBarrio: hechoData?.localidad_barrio || "",
          tipoLugar: hechoData?.tipo_lugar || "",
          lugarOtro: hechoData?.lugar_otro || "",
          resumenHecho: hechoData?.resumen_hecho || "",
          tipoCrimen: hechoData?.tipo_crimen || "",
          tipoArma: hechoData?.tipo_arma || "",
        },
        accused: imputadosWithResources,
        followUp: {
          miembroAsignado: seguimientoData?.miembro_asignado || "",
          contactoFamiliar: seguimientoData?.contacto_familia || "",
          telefonoContacto: seguimientoData?.telefono_contacto || "",
          tipoAcompanamiento: seguimientoData?.tipo_acompanamiento || [],
          abogadoQuerellante: seguimientoData?.abogado_querellante || "",
          amicusCuriae: seguimientoData?.amicus_curiae || false,
          comoLlegoCaso: seguimientoData?.como_llego_caso || "",
          primerContacto: seguimientoData?.primer_contacto || false,
          notasSeguimiento: seguimientoData?.notas_seguimiento || "",
          emailContacto: seguimientoData?.email_contacto || "",
          direccionContacto: seguimientoData?.direccion_contacto || "",
          telefonoMiembro: seguimientoData?.telefono_miembro || "",
          emailMiembro: seguimientoData?.email_miembro || "",
          fechaAsignacion: seguimientoData?.fecha_asignacion || "",
          proximasAcciones: seguimientoData?.proximas_acciones || "",
          parentescoContacto: seguimientoData?.parentesco_contacto || "",
          parentescoOtro: seguimientoData?.parentesco_otro || "",
          tieneAbogadoQuerellante: seguimientoData?.tiene_abogado_querellante || "ns_nc",
          abogadoUsinaAmicus: seguimientoData?.abogado_usina_amicus || "",
          listaMiembrosAsignados: Array.isArray(listaMiembros) ? listaMiembros : [],
          listaContactosFamiliares: Array.isArray(listaContactos) ? listaContactos : [],
          datosAbogadosQuerellantes: Array.isArray(listaAbogados) ? listaAbogados : [],
        },
        resources: recursosGenerales.map((recurso: any) => ({
          id: recurso.id,
          tipo: recurso.tipo || "",
          titulo: recurso.titulo || "",
          url: recurso.url || "",
          fuente: recurso.fuente || "",
          descripcion: recurso.descripcion || "",
          archivo_path: recurso.archivo_path,
          archivo_nombre: recurso.archivo_nombre,
          archivo_tipo: recurso.archivo_tipo,
          archivo_size: recurso.archivo_size,
          input_mode: recurso.archivo_path ? "file" : "url",
        })),
      })

      console.log("[v0] Form data set successfully")
    } catch (error: any) {
      console.error("[v0] Error loading case data:", error)
      toast({
        title: "Error al cargar el caso",
        description: error.message || "No se pudieron cargar los datos del caso.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  const updateVictim = (index: number, data: any) => {
    setFormData((prev) => ({
      ...prev,
      victims: prev.victims.map((v, i) => (i === index ? data : v)),
    }))
  }

  const handleSave = async () => {
    const supabase = createClient()
    setIsSaving(true)

    try {
      if (mode === "edit" && caseId) {
        const victim = formData.victims[0]

        // Use the stored victimaId for updates
        const { error: victimError } = await supabase
          .from("victimas")
          .update({
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
          })
          .eq("id", realIds.victimaId!) // Use the stored ID

        if (victimError) throw victimError

        const hechoId = realIds.hechoId // Use the stored hechoId

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
          })
          .eq("id", hechoId!) // Use the stored ID

        if (incidentError) throw incidentError

        // Eliminar imputados e instancias judiciales existentes
        await supabase.from("imputados").delete().eq("hecho_id", hechoId)
        await supabase.from("instancias_judiciales").delete().eq("hecho_id", hechoId)
        await supabase.from("fechas_juicio").delete().eq("imputado_id", null).is("hecho_id", hechoId) // Clean up orphaned trial dates

        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { data: accusedData, error: accusedError } = await supabase
                .from("imputados")
                .insert([buildImputadoInsert(accused, hechoId!)])
                .select()
                .single()

              if (accusedError) throw accusedError

              // Insertar fechas de juicio
              if (accused.trialDates && Array.isArray(accused.trialDates) && accused.trialDates.length > 0) {
                for (const date of accused.trialDates) {
                  if (date) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accusedData.id,
                        fecha_audiencia: date,
                        hecho_id: hechoId, // Link to the fact
                      },
                    ])
                  }
                }
              }

              if (
                accused.instanciasJudiciales &&
                Array.isArray(accused.instanciasJudiciales) &&
                accused.instanciasJudiciales.length > 0
              ) {
                for (const instancia of accused.instanciasJudiciales) {
                  if (instancia.numeroCausa || instancia.fiscalFiscalia || instancia.caratula) {
                    await supabase.from("instancias_judiciales").insert([
                      {
                        imputado_id: accusedData.id,
                        hecho_id: hechoId,
                        numero_causa: instancia.numeroCausa || null,
                        fiscal_fiscalia: instancia.fiscalFiscalia || null,
                        caratula: instancia.caratula || null,
                        orden_nivel: instancia.ordenNivel || null,
                      },
                    ])
                  }
                }
              }

              // Insertar recursos del imputado
              if (accused.resources && Array.isArray(accused.resources) && accused.resources.length > 0) {
                for (const resource of accused.resources) {
                  if (resource.titulo || resource.url || resource.archivo_path) {
                    await supabase.from("recursos").insert([
                      {
                        imputado_id: accusedData.id,
                        hecho_id: hechoId,
                        tipo: resource.tipo || null,
                        titulo: resource.titulo || null,
                        url: resource.url || null,
                        fuente: resource.fuente || null,
                        descripcion: resource.descripcion || null,
                        archivo_path: resource.archivo_path || null,
                        archivo_nombre: resource.archivo_nombre || null,
                        archivo_tipo: resource.archivo_tipo || null,
                        archivo_size: resource.archivo_size || null,
                      },
                    ])
                  }
                }
              }
            }
          }
        }

        // Actualizar seguimiento
        await supabase.from("seguimiento").delete().eq("hecho_id", hechoId)

        if (formData.followUp) {
          const { error: followUpError } = await supabase.from("seguimiento").insert([
            {
              hecho_id: hechoId,
              primer_contacto: formData.followUp.primerContacto || null,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamiliar || null,
              telefono_contacto: formData.followUp.telefonoContacto || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              notas_seguimiento: formData.followUp.notasSeguimiento || null,
              email_contacto: formData.followUp.emailContacto || null,
              direccion_contacto: formData.followUp.direccionContacto || null,
              telefono_miembro: formData.followUp.telefonoMiembro || null,
              email_miembro: formData.followUp.emailMiembro || null,
              fecha_asignacion: formData.followUp.fechaAsignacion || null,
              proximas_acciones: formData.followUp.proximasAcciones || null,
              parentesco_contacto: formData.followUp.parentescoContacto || null,
              parentesco_otro: formData.followUp.parentescoOtro || null,
              tiene_abogado_querellante: formData.followUp.tieneAbogadoQuerellante || "ns_nc",
              abogado_usina_amicus: formData.followUp.abogadoUsinaAmicus || null,
              lista_miembros_asignados: formData.followUp.listaMiembrosAsignados || null,
              lista_contactos_familiares: formData.followUp.listaContactosFamiliares || null,
              datos_abogados_querellantes: formData.followUp.datosAbogadosQuerellantes || null,
            },
          ])

          if (followUpError) throw followUpError
        }

        // Actualizar recursos generales
        await supabase.from("recursos").delete().eq("hecho_id", hechoId).is("imputado_id", null).is("victima_id", null)

        if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: hechoId,
                  tipo: resource.tipo || null,
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size || null,
                },
              ])
            }
          }
        }

        // Actualizar recursos de víctima
        await supabase
          .from("recursos")
          .delete()
          .eq("victima_id", realIds.victimaId!)
          .is("hecho_id", null)
          .is("imputado_id", null)

        if (victim.resources && Array.isArray(victim.resources) && victim.resources.length > 0) {
          for (const resource of victim.resources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  victima_id: realIds.victimaId!, // Use the stored ID
                  tipo: resource.tipo || null,
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size || null,
                },
              ])
            }
          }
        }
      } else {
        // Paso 1: Insertar el HECHO (una vez, usa fechas de la primera víctima)
        const firstVictim = formData.victims[0]

        const { data: incidentData, error: incidentError } = await supabase
          .from("hechos")
          .insert([
            {
              victima_id: null, // Se actualizará con la primera víctima
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
            },
          ])
          .select()
          .single()

        if (incidentError) throw incidentError

        const hechoId = incidentData.id

        // Paso 2: Recorrer Array de VÍCTIMAS
        for (let i = 0; i < formData.victims.length; i++) {
          const victim = formData.victims[i]

          // Insertar víctima
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

          // Crear registro en CASOS vinculando victima_id + hecho_id
          const { error: casoInsertError } = await supabase.from("casos").insert([
            {
              victima_id: victimData.id,
              hecho_id: hechoId,
              estado_general: "En investigación",
            },
          ])
          if (casoInsertError) throw casoInsertError

          // Actualizar hecho con la primera víctima
          if (i === 0) {
            await supabase.from("hechos").update({ victima_id: victimData.id }).eq("id", hechoId)
          }

          // Insertar recursos de la víctima
          if (victim.resources && Array.isArray(victim.resources) && victim.resources.length > 0) {
            for (const resource of victim.resources) {
              if (resource.titulo || resource.url || resource.archivo_path) {
                await supabase.from("recursos").insert([
                  {
                    victima_id: victimData.id,
                    hecho_id: hechoId,
                    tipo: resource.tipo || null,
                    titulo: resource.titulo || null,
                    url: resource.url || null,
                    fuente: resource.fuente || null,
                    descripcion: resource.descripcion || null,
                    archivo_path: resource.archivo_path || null,
                    archivo_nombre: resource.archivo_nombre || null,
                    archivo_tipo: resource.archivo_tipo || null,
                    archivo_size: resource.archivo_size || null,
                  },
                ])
              }
            }
          }
        }

        // Paso 3: Recorrer Array de IMPUTADOS con sus INSTANCIAS JUDICIALES
        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { data: accusedData, error: accusedError } = await supabase
                .from("imputados")
                .insert([buildImputadoInsert(accused, hechoId)])
                .select()
                .single()

              if (accusedError) throw accusedError

              // Insertar fechas de juicio
              if (accused.trialDates && Array.isArray(accused.trialDates)) {
                for (const fecha of accused.trialDates) {
                  if (fecha) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accusedData.id,
                        fecha_audiencia: fecha,
                        hecho_id: hechoId, // Link to the fact
                      },
                    ])
                  }
                }
              }

              if (accused.instanciasJudiciales && Array.isArray(accused.instanciasJudiciales)) {
                for (const instancia of accused.instanciasJudiciales) {
                  if (instancia.numeroCausa || instancia.fiscalFiscalia || instancia.caratula) {
                    await supabase.from("instancias_judiciales").insert([
                      {
                        imputado_id: accusedData.id,
                        hecho_id: hechoId,
                        numero_causa: instancia.numeroCausa || null,
                        fiscal_fiscalia: instancia.fiscalFiscalia || null,
                        caratula: instancia.caratula || null,
                        orden_nivel: instancia.ordenNivel || null,
                      },
                    ])
                  }
                }
              }

              // Insertar recursos del imputado
              if (accused.resources && Array.isArray(accused.resources)) {
                for (const resource of accused.resources) {
                  if (resource.titulo || resource.url || resource.archivo_path) {
                    await supabase.from("recursos").insert([
                      {
                        imputado_id: accusedData.id,
                        hecho_id: hechoId,
                        tipo: resource.tipo || null,
                        titulo: resource.titulo || null,
                        url: resource.url || null,
                        fuente: resource.fuente || null,
                        descripcion: resource.descripcion || null,
                        archivo_path: resource.archivo_path || null,
                        archivo_nombre: resource.archivo_nombre || null,
                        archivo_tipo: resource.archivo_tipo || null,
                        archivo_size: resource.archivo_size || null,
                      },
                    ])
                  }
                }
              }
            }
          }
        }

        // Insertar seguimiento
        if (formData.followUp) {
          const { error: followUpError } = await supabase.from("seguimiento").insert([
            {
              hecho_id: hechoId,
              primer_contacto: formData.followUp.primerContacto || null,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamiliar || null,
              telefono_contacto: formData.followUp.telefonoContacto || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              notas_seguimiento: formData.followUp.notasSeguimiento || null,
              email_contacto: formData.followUp.emailContacto || null,
              direccion_contacto: formData.followUp.direccionContacto || null,
              telefono_miembro: formData.followUp.telefonoMiembro || null,
              email_miembro: formData.followUp.emailMiembro || null,
              fecha_asignacion: formData.followUp.fechaAsignacion || null,
              proximas_acciones: formData.followUp.proximasAcciones || null,
              parentesco_contacto: formData.followUp.parentescoContacto || null,
              parentesco_otro: formData.followUp.parentescoOtro || null,
              tiene_abogado_querellante: formData.followUp.tieneAbogadoQuerellante || "ns_nc",
              abogado_usina_amicus: formData.followUp.abogadoUsinaAmicus || null,
              lista_miembros_asignados: formData.followUp.listaMiembrosAsignados || null,
              lista_contactos_familiares: formData.followUp.listaContactosFamiliares || null,
              datos_abogados_querellantes: formData.followUp.datosAbogadosQuerellantes || null,
            },
          ])

          if (followUpError) throw followUpError
        }

        // Insertar recursos generales del hecho
        if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: hechoId,
                  tipo: resource.tipo || null,
                  titulo: resource.titulo || null,
                  url: resource.url || null,
                  fuente: resource.fuente || null,
                  descripcion: resource.descripcion || null,
                  archivo_path: resource.archivo_path || null,
                  archivo_nombre: resource.archivo_nombre || null,
                  archivo_tipo: resource.archivo_tipo || null,
                  archivo_size: resource.archivo_size || null,
                },
              ])
            }
          }
        }
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
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="victim">Víctimas ({formData.victims.length})</TabsTrigger>
              <TabsTrigger value="incident">Hecho</TabsTrigger>
              <TabsTrigger value="accused">Imputados</TabsTrigger>
              <TabsTrigger value="followup">Seguimiento</TabsTrigger>
            </TabsList>

            <TabsContent value="victim" className="space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {formData.victims.map((victim, index) => (
                  <Card key={index} className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-slate-50">
                      <CardTitle className="text-base font-heading">
                        Víctima #{index + 1}
                        {victim.nombreCompleto && ` - ${victim.nombreCompleto}`}
                      </CardTitle>
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
                          onChange={(resources) => updateVictim(index, { ...victim, resources })}
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
                  resources={formData.resources}
                  onResourcesChange={(resources) => setFormData((prev) => ({ ...prev, resources }))}
                  savedResources={formData.resources.filter((r: any) => r.id && typeof r.id === "string")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
