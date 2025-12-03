"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, X, UserPlus } from "lucide-react"
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

const getEmptyVictimData = () => ({})
const getEmptyAccusedData = () => []
const getEmptyVictimResources = () => []

export function CaseForm({ mode, caseId }: CaseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("victim")
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingAndContinue, setIsSavingAndContinue] = useState(false)
  const [isLoading, setIsLoading] = useState(mode === "edit")
  const [formData, setFormData] = useState({
    victim: {},
    victimResources: [],
    incident: {
      instanciasJudiciales: [],
    },
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
            recursos (*),
            instancias_judiciales (*)
          )
        `)
        .eq("id", caseId)
        .single()

      if (victimError) throw victimError

      const { data: victimResourcesData } = await supabase
        .from("recursos")
        .select("*")
        .eq("victima_id", caseId)
        .is("hecho_id", null)
        .is("imputado_id", null)

      if (!victimData.hechos || victimData.hechos.length === 0) {
        throw new Error("No se encontraron hechos asociados a esta víctima")
      }

      const hecho = victimData.hechos[0]

      const imputadosWithResources = await Promise.all(
        (hecho?.imputados || []).map(async (imputado: any) => {
          const { data: imputadoResources } = await supabase.from("recursos").select("*").eq("imputado_id", imputado.id)

          return {
            id: imputado.id,
            apellidoNombre: imputado.apellido_nombre || "",
            menorEdad: imputado.menor_edad || false,
            nacionalidad: imputado.nacionalidad || "",
            juzgadoUfi: imputado.juzgado_ufi || "",
            estadoProcesal: imputado.estado_procesal || "",
            pena: imputado.pena || "",
            juicioAbreviado: imputado.juicio_abreviado || false,
            prisionPerpetua: imputado.prision_perpetua || false,
            fechaVeredicto: imputado.fecha_veredicto || "",
            trialDates: imputado.fechas_juicio?.map((fecha: any) => fecha.fecha_audiencia || fecha.fecha) || [],
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

      setFormData({
        victim: {
          nombreCompleto: victimData.nombre_completo || "",
          fechaNacimiento: victimData.fecha_nacimiento || "",
          edad: victimData.edad?.toString() || "",
          profesion: victimData.profesion || "",
          redesSociales: victimData.redes_sociales || "",
          nacionalidad: victimData.nacionalidad || "",
          notasAdicionales: victimData.notas_adicionales || "",
          provinciaResidencia: victimData.provincia_residencia || "",
          municipioResidencia: victimData.municipio_residencia || "",
        },
        victimResources: (victimResourcesData || []).map((r: any) => ({
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
        incident: {
          fechaHecho: hecho?.fecha_hecho || "",
          fechaFallecimiento: hecho?.fecha_fallecimiento || "",
          provincia: hecho?.provincia || "",
          municipio: hecho?.municipio || "",
          localidadBarrio: hecho?.localidad_barrio || "",
          tipoLugar: hecho?.tipo_lugar || "",
          lugarOtro: hecho?.lugar_otro || "",
          resumenHecho: hecho?.resumen_hecho || "",
          tipoCrimen: hecho?.tipo_crimen || "",
          tipoArma: hecho?.tipo_arma || "",
          instanciasJudiciales: (hecho?.instancias_judiciales || []).map((inst: any) => ({
            id: inst.id,
            numeroCausa: inst.numero_causa || "",
            fiscalFiscalia: inst.fiscal_fiscalia || "",
            caratula: inst.caratula || "",
            ordenNivel: inst.orden_nivel || "",
          })),
        },
        accused: imputadosWithResources,
        followUp: {
          miembroAsignado: hecho?.seguimiento?.[0]?.miembro_asignado || "",
          contactoFamiliar: hecho?.seguimiento?.[0]?.contacto_familia || "",
          telefonoContacto: hecho?.seguimiento?.[0]?.telefono_contacto || "",
          tipoAcompanamiento: hecho?.seguimiento?.[0]?.tipo_acompanamiento || [],
          abogadoQuerellante: hecho?.seguimiento?.[0]?.abogado_querellante || "",
          amicusCuriae: hecho?.seguimiento?.[0]?.amicus_curiae || false,
          comoLlegoCaso: hecho?.seguimiento?.[0]?.como_llego_caso || "",
          primerContacto: hecho?.seguimiento?.[0]?.primer_contacto || false,
          notasSeguimiento: hecho?.seguimiento?.[0]?.notas_seguimiento || "",
        },
        resources: (hecho?.recursos || [])
          .filter((r: any) => !r.imputado_id)
          .map((recurso: any) => ({
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
    } catch (error: any) {
      console.error("Error loading case data:", error)
      toast({
        title: "Error al cargar el caso",
        description: error.message || "No se pudieron cargar los datos del caso.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndContinue = async () => {
    setIsSavingAndContinue(true)
    const supabase = createClient()

    try {
      const { data: victimData, error: victimError } = await supabase
        .from("victimas")
        .insert([
          {
            nombre_completo: formData.victim.nombreCompleto || null,
            fecha_nacimiento: formData.victim.fechaNacimiento || null,
            edad: formData.victim.edad ? Number.parseInt(formData.victim.edad) : null,
            profesion: formData.victim.profesion || null,
            redes_sociales: formData.victim.redesSociales || null,
            nacionalidad: formData.victim.nacionalidad || null,
            notas_adicionales: formData.victim.notasAdicionales || null,
            provincia_residencia: formData.victim.provinciaResidencia || null,
            municipio_residencia: formData.victim.municipioResidencia || null,
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

      if (formData.incident.instanciasJudiciales && formData.incident.instanciasJudiciales.length > 0) {
        for (const instancia of formData.incident.instanciasJudiciales) {
          if (instancia.numeroCausa || instancia.fiscalFiscalia || instancia.caratula) {
            await supabase.from("instancias_judiciales").insert([
              {
                hecho_id: incidentData.id,
                numero_causa: instancia.numeroCausa || null,
                fiscal_fiscalia: instancia.fiscalFiscalia || null,
                caratula: instancia.caratula || null,
                orden_nivel: instancia.ordenNivel || null,
              },
            ])
          }
        }
      }

      if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
        for (const accused of formData.accused) {
          if (accused.apellidoNombre) {
            const { data: accusedData, error: accusedError } = await supabase
              .from("imputados")
              .insert([
                {
                  hecho_id: incidentData.id,
                  apellido_nombre: accused.apellidoNombre,
                  menor_edad: accused.menorEdad || false,
                  nacionalidad: accused.nacionalidad || null,
                  juzgado_ufi: accused.juzgadoUfi || null,
                  estado_procesal: accused.estadoProcesal || null,
                  pena: accused.pena || null,
                  juicio_abreviado: accused.juicioAbreviado || false,
                  prision_perpetua: accused.prisionPerpetua || false,
                  fecha_veredicto: accused.fechaVeredicto || null,
                },
              ])
              .select()
              .single()

            if (accusedError) throw accusedError

            if (accused.trialDates && Array.isArray(accused.trialDates)) {
              for (const fecha of accused.trialDates) {
                if (fecha) {
                  await supabase.from("fechas_juicio").insert([
                    {
                      imputado_id: accusedData.id,
                      fecha_audiencia: fecha,
                    },
                  ])
                }
              }
            }

            if (accused.resources && Array.isArray(accused.resources)) {
              for (const resource of accused.resources) {
                if (resource.titulo || resource.url || resource.archivo_path) {
                  await supabase.from("recursos").insert([
                    {
                      imputado_id: accusedData.id,
                      hecho_id: incidentData.id,
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

      if (formData.followUp) {
        const { error: followUpError } = await supabase.from("seguimiento").insert([
          {
            hecho_id: incidentData.id,
            primer_contacto: formData.followUp.primerContacto || null,
            como_llego_caso: formData.followUp.comoLlegoCaso || null,
            miembro_asignado: formData.followUp.miembroAsignado || null,
            contacto_familia: formData.followUp.contactoFamiliar || null,
            tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
            abogado_querellante: formData.followUp.abogadoQuerellante || null,
            amicus_curiae: formData.followUp.amicusCuriae || false,
            notas_seguimiento: formData.followUp.notasSeguimiento || null,
          },
        ])

        if (followUpError) throw followUpError
      }

      if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
        for (const resource of formData.resources) {
          if (resource.titulo || resource.url || resource.archivo_path) {
            await supabase.from("recursos").insert([
              {
                hecho_id: incidentData.id,
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

      if (formData.victimResources && Array.isArray(formData.victimResources) && formData.victimResources.length > 0) {
        for (const resource of formData.victimResources) {
          if (resource.titulo || resource.url || resource.archivo_path) {
            await supabase.from("recursos").insert([
              {
                victima_id: victimData.id,
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

      toast({
        title: "Caso guardado",
        description: "Caso guardado. Listo para cargar la siguiente víctima del mismo hecho.",
      })

      setFormData((prev) => ({
        ...prev,
        victim: getEmptyVictimData(),
        victimResources: getEmptyVictimResources(),
      }))

      setActiveTab("victim")
    } catch (error) {
      console.error("Error saving case:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el caso. Verifique la conexión a la base de datos.",
        variant: "destructive",
      })
    } finally {
      setIsSavingAndContinue(false)
    }
  }

  const handleSave = async () => {
    const supabase = createClient()
    setIsSaving(true)

    try {
      if (mode === "edit" && caseId) {
        const { error: victimError } = await supabase
          .from("victimas")
          .update({
            nombre_completo: formData.victim.nombreCompleto || null,
            fecha_nacimiento: formData.victim.fechaNacimiento || null,
            edad: formData.victim.edad ? Number.parseInt(formData.victim.edad) : null,
            profesion: formData.victim.profesion || null,
            redes_sociales: formData.victim.redesSociales || null,
            nacionalidad: formData.victim.nacionalidad || null,
            notas_adicionales: formData.victim.notasAdicionales || null,
            provincia_residencia: formData.victim.provinciaResidencia || null,
            municipio_residencia: formData.victim.municipioResidencia || null,
          })
          .eq("id", caseId)

        if (victimError) throw victimError

        const { data: hechoData, error: hechoSelectError } = await supabase
          .from("hechos")
          .select("id")
          .eq("victima_id", caseId)
          .single()

        if (hechoSelectError) throw hechoSelectError

        const hechoId = hechoData.id

        const { error: incidentError } = await supabase
          .from("hechos")
          .update({
            fecha_hecho: formData.incident.fechaHecho || null,
            fecha_fallecimiento: formData.incident.fechaFallecimiento || null,
            provincia: formData.incident.provincia || null,
            municipio: formData.incident.municipio || null,
            localidad_barrio: formData.incident.localidadBarrio || null,
            tipo_lugar: formData.incident.tipoLugar || null,
            lugar_otro: formData.incident.lugarOtro || null,
            resumen_hecho: formData.incident.resumenHecho || null,
            tipo_crimen: formData.incident.tipoCrimen || null,
            tipo_arma: formData.incident.tipoArma || null,
          })
          .eq("id", hechoId)

        if (incidentError) throw incidentError

        await supabase.from("instancias_judiciales").delete().eq("hecho_id", hechoId)

        if (formData.incident.instanciasJudiciales && formData.incident.instanciasJudiciales.length > 0) {
          for (const instancia of formData.incident.instanciasJudiciales) {
            if (instancia.numeroCausa || instancia.fiscalFiscalia || instancia.caratula) {
              await supabase.from("instancias_judiciales").insert([
                {
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

        await supabase.from("imputados").delete().eq("hecho_id", hechoId)

        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { data: accusedData, error: accusedError } = await supabase
                .from("imputados")
                .insert([
                  {
                    hecho_id: hechoId,
                    apellido_nombre: accused.apellidoNombre,
                    menor_edad: accused.menorEdad || false,
                    nacionalidad: accused.nacionalidad || null,
                    juzgado_ufi: accused.juzgadoUfi || null,
                    estado_procesal: accused.estadoProcesal || null,
                    pena: accused.pena || null,
                    juicio_abreviado: accused.juicioAbreviado || false,
                    prision_perpetua: accused.prisionPerpetua || false,
                    fecha_veredicto: accused.fechaVeredicto || null,
                  },
                ])
                .select()
                .single()

              if (accusedError) throw accusedError

              if (accused.trialDates && Array.isArray(accused.trialDates) && accused.trialDates.length > 0) {
                for (const date of accused.trialDates) {
                  if (date) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accusedData.id,
                        fecha_audiencia: date,
                      },
                    ])
                  }
                }
              }

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

        await supabase.from("seguimiento").delete().eq("hecho_id", hechoId)

        if (formData.followUp) {
          const { error: followUpError } = await supabase.from("seguimiento").insert([
            {
              hecho_id: hechoId,
              primer_contacto: formData.followUp.primerContacto || null,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamiliar || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              notas_seguimiento: formData.followUp.notasSeguimiento || null,
            },
          ])

          if (followUpError) throw followUpError
        }

        await supabase.from("recursos").delete().eq("hecho_id", hechoId).is("imputado_id", null)

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

        await supabase.from("recursos").delete().eq("victima_id", caseId).is("hecho_id", null).is("imputado_id", null)

        if (
          formData.victimResources &&
          Array.isArray(formData.victimResources) &&
          formData.victimResources.length > 0
        ) {
          for (const resource of formData.victimResources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  victima_id: caseId,
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
        const { data: victimData, error: victimError } = await supabase
          .from("victimas")
          .insert([
            {
              nombre_completo: formData.victim.nombreCompleto || null,
              fecha_nacimiento: formData.victim.fechaNacimiento || null,
              edad: formData.victim.edad ? Number.parseInt(formData.victim.edad) : null,
              profesion: formData.victim.profesion || null,
              redes_sociales: formData.victim.redesSociales || null,
              nacionalidad: formData.victim.nacionalidad || null,
              notas_adicionales: formData.victim.notasAdicionales || null,
              provincia_residencia: formData.victim.provinciaResidencia || null,
              municipio_residencia: formData.victim.municipioResidencia || null,
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

        if (formData.incident.instanciasJudiciales && formData.incident.instanciasJudiciales.length > 0) {
          for (const instancia of formData.incident.instanciasJudiciales) {
            if (instancia.numeroCausa || instancia.fiscalFiscalia || instancia.caratula) {
              await supabase.from("instancias_judiciales").insert([
                {
                  hecho_id: incidentData.id,
                  numero_causa: instancia.numeroCausa || null,
                  fiscal_fiscalia: instancia.fiscalFiscalia || null,
                  caratula: instancia.caratula || null,
                  orden_nivel: instancia.ordenNivel || null,
                },
              ])
            }
          }
        }

        if (formData.accused && Array.isArray(formData.accused) && formData.accused.length > 0) {
          for (const accused of formData.accused) {
            if (accused.apellidoNombre) {
              const { data: accusedData, error: accusedError } = await supabase
                .from("imputados")
                .insert([
                  {
                    hecho_id: incidentData.id,
                    apellido_nombre: accused.apellidoNombre,
                    menor_edad: accused.menorEdad || false,
                    nacionalidad: accused.nacionalidad || null,
                    juzgado_ufi: accused.juzgadoUfi || null,
                    estado_procesal: accused.estadoProcesal || null,
                    pena: accused.pena || null,
                    juicio_abreviado: accused.juicioAbreviado || false,
                    prision_perpetua: accused.prisionPerpetua || false,
                    fecha_veredicto: accused.fechaVeredicto || null,
                  },
                ])
                .select()
                .single()

              if (accusedError) throw accusedError

              if (accused.trialDates && Array.isArray(accused.trialDates)) {
                for (const fecha of accused.trialDates) {
                  if (fecha) {
                    await supabase.from("fechas_juicio").insert([
                      {
                        imputado_id: accusedData.id,
                        fecha_audiencia: fecha,
                      },
                    ])
                  }
                }
              }

              if (accused.resources && Array.isArray(accused.resources)) {
                for (const resource of accused.resources) {
                  if (resource.titulo || resource.url || resource.archivo_path) {
                    await supabase.from("recursos").insert([
                      {
                        imputado_id: accusedData.id,
                        hecho_id: incidentData.id,
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

        if (formData.followUp) {
          const { error: followUpError } = await supabase.from("seguimiento").insert([
            {
              hecho_id: incidentData.id,
              primer_contacto: formData.followUp.primerContacto || null,
              como_llego_caso: formData.followUp.comoLlegoCaso || null,
              miembro_asignado: formData.followUp.miembroAsignado || null,
              contacto_familia: formData.followUp.contactoFamiliar || null,
              tipo_acompanamiento: formData.followUp.tipoAcompanamiento || null,
              abogado_querellante: formData.followUp.abogadoQuerellante || null,
              amicus_curiae: formData.followUp.amicusCuriae || false,
              notas_seguimiento: formData.followUp.notasSeguimiento || null,
            },
          ])

          if (followUpError) throw followUpError
        }

        if (formData.resources && Array.isArray(formData.resources) && formData.resources.length > 0) {
          for (const resource of formData.resources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  hecho_id: incidentData.id,
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

        if (
          formData.victimResources &&
          Array.isArray(formData.victimResources) &&
          formData.victimResources.length > 0
        ) {
          for (const resource of formData.victimResources) {
            if (resource.titulo || resource.url || resource.archivo_path) {
              await supabase.from("recursos").insert([
                {
                  victima_id: victimData.id,
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

        <div className="flex flex-wrap gap-2">
          {mode === "create" && (
            <Button
              onClick={handleSaveAndContinue}
              disabled={isSaving || isSavingAndContinue}
              variant="outline"
              className="flex items-center gap-2 bg-transparent border-slate-300 hover:bg-slate-50"
            >
              <UserPlus className="w-4 h-4" />
              {isSavingAndContinue ? "Guardando..." : "Guardar y Agregar Otra Víctima"}
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || isSavingAndContinue}
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
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-900 font-heading mb-4">
                  Recursos Multimedia de la Víctima
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Fotos, documentos y enlaces relacionados directamente con la víctima (no con el hecho).
                </p>
                <ResourcesForm
                  data={formData.victimResources}
                  onChange={(data) => updateFormData("victimResources", data)}
                />
              </div>
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
