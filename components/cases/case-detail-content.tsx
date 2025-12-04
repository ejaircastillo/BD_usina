"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  Phone,
  FileText,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Users,
  Gavel,
  Building,
  Heart,
  Scale,
  Download,
  ImageIcon,
  File,
  LinkIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"

interface CaseDetailContentProps {
  caseId: string
}

interface Victima {
  id: string
  nombre_completo: string | null
  edad: number | null
  fecha_nacimiento: string | null
  profesion: string | null
  nacionalidad: string | null
  redes_sociales: string | null
  notas_adicionales: string | null
  provincia_residencia: string | null
  municipio_residencia: string | null
  fecha_hecho: string | null
  fecha_fallecimiento: string | null
}

interface Hecho {
  id: string
  fecha_hecho: string | null
  fecha_fallecimiento: string | null
  municipio: string | null
  provincia: string | null
  localidad_barrio: string | null
  tipo_lugar: string | null
  lugar_otro: string | null
  tipo_crimen: string | null
  tipo_arma: string | null
  resumen_hecho: string | null
  numero_causa: string | null
  caratula: string | null
  telefono_fiscalia: string | null
  email_fiscalia: string | null
}

interface InstanciaJudicial {
  id: string
  orden_nivel: string | null
  numero_causa: string | null
  caratula: string | null
  fiscal: string | null
  fiscalia: string | null
}

interface Imputado {
  id: string
  apellido_nombre: string | null
  nacionalidad: string | null
  documento_identidad: string | null
  edad: string | null
  alias: string | null
  menor_edad: boolean | null
  estado_procesal: string | null
  juzgado_ufi: string | null
  tribunal_fallo: string | null
  juicio_abreviado: boolean | null
  pena: string | null
  prision_perpetua: boolean | null
  fecha_veredicto: string | null
  es_extranjero: boolean | null
  detenido_previo: boolean | null
  fallecido: boolean | null
  es_reincidente: boolean | null
  cargos: string | null
  instancias_judiciales: InstanciaJudicial[]
}

interface Seguimiento {
  id: string
  primer_contacto: boolean | null
  como_llego_caso: string | null
  miembro_asignado: string | null
  contacto_familia: string | null
  parentesco_contacto: string | null
  parentesco_otro: string | null
  telefono_contacto: string | null
  email_contacto: string | null
  direccion_contacto: string | null
  tipo_acompanamiento: string[] | null
  abogado_querellante: string | null
  amicus_curiae: boolean | null
  notas_seguimiento: string | null
  proximas_acciones: string | null
}

interface Recurso {
  id: string
  tipo: string | null
  titulo: string | null
  descripcion: string | null
  url: string | null
  fuente: string | null
  archivo_path: string | null
  archivo_nombre: string | null
  archivo_tipo: string | null
  archivo_size: number | null
  victima_id: string | null
  hecho_id: string | null
  imputado_id: string | null
}

interface HermanoHecho {
  caso_id: string
  victima_id: string
  victima_nombre: string | null
}

interface CaseData {
  caso_id: string
  victima: Victima
  hecho: Hecho | null
  imputados: Imputado[]
  seguimiento: Seguimiento | null
  recursos: Recurso[]
  hermanos_hecho: HermanoHecho[]
  estado_general: string | null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "En investigación":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "Imputado identificado":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "Procesado":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "Juicio oral":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "Condenado":
      return "bg-green-100 text-green-800 border-green-200"
    case "Absuelto":
      return "bg-gray-100 text-gray-800 border-gray-200"
    case "Sobreseído":
      return "bg-slate-100 text-slate-800 border-slate-200"
    case "Archivo":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getResourceIcon = (tipo: string | null, archivoTipo: string | null) => {
  if (archivoTipo?.startsWith("image/")) return <ImageIcon className="w-4 h-4" />
  if (archivoTipo?.includes("pdf")) return <File className="w-4 h-4" />
  if (tipo === "noticia" || tipo === "video") return <ExternalLink className="w-4 h-4" />
  return <LinkIcon className="w-4 h-4" />
}

export function CaseDetailContent({ caseId }: CaseDetailContentProps) {
  const [caseData, setCaseData] = useState<CaseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCaseData()
  }, [caseId])

  const fetchCaseData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First get the caso to find the victima_id and hecho_id
      const { data: casoData, error: casoError } = await supabase
        .from("casos")
        .select("id, victima_id, hecho_id, estado_general")
        .eq("id", caseId)
        .single()

      if (casoError) throw casoError

      // Fetch victima
      const { data: victimaData, error: victimaError } = await supabase
        .from("victimas")
        .select("*")
        .eq("id", casoData.victima_id)
        .single()

      if (victimaError) throw victimaError

      // Fetch hecho
      let hechoData = null
      if (casoData.hecho_id) {
        const { data, error } = await supabase.from("hechos").select("*").eq("id", casoData.hecho_id).maybeSingle() // Use maybeSingle to avoid error when no record exists
        if (!error) hechoData = data
      }

      // Fetch imputados with instancias judiciales
      let imputadosData: Imputado[] = []
      if (casoData.hecho_id) {
        const { data: rawImputados, error: impError } = await supabase
          .from("imputados")
          .select("*")
          .eq("hecho_id", casoData.hecho_id)

        if (!impError && rawImputados) {
          // Fetch instancias for each imputado
          const imputadosWithInstancias = await Promise.all(
            rawImputados.map(async (imp) => {
              const { data: instancias } = await supabase
                .from("instancias_judiciales")
                .select("*")
                .eq("imputado_id", imp.id)
              return { ...imp, instancias_judiciales: instancias || [] }
            }),
          )
          imputadosData = imputadosWithInstancias
        }
      }

      let seguimientoData = null
      if (casoData.hecho_id) {
        const { data, error } = await supabase
          .from("seguimiento")
          .select("*")
          .eq("hecho_id", casoData.hecho_id)
          .maybeSingle() // Use maybeSingle instead of single to avoid "multiple rows" error
        if (!error) seguimientoData = data
      }

      // Fetch recursos (from victima, hecho, and imputados)
      const { data: recursosData } = await supabase
        .from("recursos")
        .select("*")
        .or(`victima_id.eq.${casoData.victima_id},hecho_id.eq.${casoData.hecho_id}`)

      // Fetch "Hermanos de Hecho" - other victims of the same incident
      let hermanosHecho: HermanoHecho[] = []
      if (casoData.hecho_id) {
        const { data: otrosCasos } = await supabase
          .from("casos")
          .select("id, victima_id, victimas(nombre_completo)")
          .eq("hecho_id", casoData.hecho_id)
          .neq("id", caseId)

        if (otrosCasos) {
          hermanosHecho = otrosCasos.map((c: any) => ({
            caso_id: c.id,
            victima_id: c.victima_id,
            victima_nombre: c.victimas?.nombre_completo || null,
          }))
        }
      }

      setCaseData({
        caso_id: casoData.id,
        victima: victimaData,
        hecho: hechoData,
        imputados: imputadosData,
        seguimiento: seguimientoData,
        recursos: recursosData || [],
        hermanos_hecho: hermanosHecho,
        estado_general: casoData.estado_general,
      })
    } catch (err: any) {
      console.error("Error fetching case data:", err.message)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const { error } = await supabase.from("casos").delete().eq("id", caseId)
      if (error) throw error
      router.push("/casos")
    } catch (err) {
      console.error("Error deleting case:", err)
      setError("Error al eliminar el caso")
    } finally {
      setIsDeleting(false)
    }
  }

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from("archivos-casos").getPublicUrl(path)
    return data.publicUrl
  }

  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Cargando caso...</span>
        </div>
      </main>
    )
  }

  if (error || !caseData) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error al cargar el caso</h3>
          <p className="text-slate-600 mb-4">{error || "No se pudo encontrar el caso solicitado"}</p>
          <Link href="/casos">
            <Button variant="outline">Volver a Casos</Button>
          </Link>
        </div>
      </main>
    )
  }

  const { victima, hecho, imputados, seguimiento, recursos, hermanos_hecho, estado_general } = caseData

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/casos">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{victima.nombre_completo || "Víctima sin nombre"}</h1>
            <div className="flex items-center gap-2 mt-1">
              {estado_general && (
                <Badge className={`text-xs ${getStatusColor(estado_general)}`}>{estado_general}</Badge>
              )}
              {hecho?.tipo_crimen && (
                <Badge variant="outline" className="text-xs">
                  {hecho.tipo_crimen}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/casos/${caseId}/editar`}>
            <Button className="bg-slate-800 hover:bg-slate-700 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Confirmar Eliminación
                </AlertDialogTitle>
                <AlertDialogDescription>
                  ¿Está seguro que desea eliminar este caso? Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {hermanos_hecho.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-800 text-base">
              <Users className="w-5 h-5" />
              Otras Víctimas de este Hecho ({hermanos_hecho.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {hermanos_hecho.map((hermano) => (
                <Link key={hermano.caso_id} href={`/casos/${hermano.caso_id}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-amber-100 border-amber-300 text-amber-800"
                  >
                    <User className="w-3 h-3 mr-1" />
                    {hermano.victima_nombre}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Victim Information */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-slate-600" />
              Datos de la Víctima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {victima.nombre_completo && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Nombre Completo</label>
                  <p className="text-slate-900">{victima.nombre_completo}</p>
                </div>
              )}
              {victima.edad && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Edad</label>
                  <p className="text-slate-900">{victima.edad} años</p>
                </div>
              )}
              {victima.fecha_nacimiento && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Fecha de Nacimiento</label>
                  <p className="text-slate-900">{new Date(victima.fecha_nacimiento).toLocaleDateString("es-AR")}</p>
                </div>
              )}
              {victima.nacionalidad && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Nacionalidad</label>
                  <p className="text-slate-900">{victima.nacionalidad}</p>
                </div>
              )}
              {victima.profesion && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Profesión</label>
                  <p className="text-slate-900">{victima.profesion}</p>
                </div>
              )}
              {(victima.provincia_residencia || victima.municipio_residencia) && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Residencia</label>
                  <p className="text-slate-900">
                    {[victima.municipio_residencia, victima.provincia_residencia].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
              {victima.redes_sociales && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-500">Redes Sociales</label>
                  <p className="text-slate-900">{victima.redes_sociales}</p>
                </div>
              )}
            </div>
            {victima.notas_adicionales && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-sm font-medium text-slate-500">Notas Adicionales</label>
                <p className="text-slate-900 mt-1">{victima.notas_adicionales}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incident Information */}
        {hecho && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                Información del Hecho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hecho.fecha_hecho && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Fecha del Hecho</label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(hecho.fecha_hecho).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
                {hecho.fecha_fallecimiento && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Fecha de Fallecimiento</label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(hecho.fecha_fallecimiento).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
                {hecho.tipo_crimen && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Tipo de Crimen</label>
                    <p className="text-slate-900">{hecho.tipo_crimen}</p>
                  </div>
                )}
                {hecho.tipo_arma && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Tipo de Arma/Medio</label>
                    <p className="text-slate-900">{hecho.tipo_arma}</p>
                  </div>
                )}
                {hecho.provincia && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Provincia</label>
                    <p className="text-slate-900">{hecho.provincia}</p>
                  </div>
                )}
                {hecho.municipio && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Municipio</label>
                    <p className="text-slate-900">{hecho.municipio}</p>
                  </div>
                )}
                {hecho.localidad_barrio && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Localidad/Barrio</label>
                    <p className="text-slate-900">{hecho.localidad_barrio}</p>
                  </div>
                )}
                {hecho.tipo_lugar && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Tipo de Lugar</label>
                    <p className="text-slate-900">{hecho.tipo_lugar}</p>
                  </div>
                )}
              </div>
              {hecho.resumen_hecho && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-500">Resumen del Hecho</label>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{hecho.resumen_hecho}</p>
                </div>
              )}
              {(hecho.numero_causa || hecho.caratula || hecho.telefono_fiscalia || hecho.email_fiscalia) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    Información Judicial
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hecho.numero_causa && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Número de Causa</label>
                        <p className="text-slate-900">{hecho.numero_causa}</p>
                      </div>
                    )}
                    {hecho.caratula && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Carátula</label>
                        <p className="text-slate-900">{hecho.caratula}</p>
                      </div>
                    )}
                    {hecho.telefono_fiscalia && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Teléfono Fiscalía</label>
                        <p className="text-slate-900">{hecho.telefono_fiscalia}</p>
                      </div>
                    )}
                    {hecho.email_fiscalia && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Email Fiscalía</label>
                        <p className="text-slate-900">{hecho.email_fiscalia}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {imputados.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-slate-600" />
                Imputados ({imputados.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {imputados.map((imputado, index) => (
                  <AccordionItem key={imputado.id} value={imputado.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-medium">{imputado.apellido_nombre || `Imputado #${index + 1}`}</span>
                        {imputado.estado_procesal && (
                          <Badge variant="outline" className="text-xs">
                            {imputado.estado_procesal}
                          </Badge>
                        )}
                        {imputado.fallecido && (
                          <Badge variant="destructive" className="text-xs">
                            Fallecido
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-4 space-y-4">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {imputado.documento_identidad && (
                            <div>
                              <span className="font-medium text-slate-500">DNI:</span>{" "}
                              <span className="text-slate-900">{imputado.documento_identidad}</span>
                            </div>
                          )}
                          {imputado.nacionalidad && (
                            <div>
                              <span className="font-medium text-slate-500">Nacionalidad:</span>{" "}
                              <span className="text-slate-900">{imputado.nacionalidad}</span>
                            </div>
                          )}
                          {imputado.edad && (
                            <div>
                              <span className="font-medium text-slate-500">Edad:</span>{" "}
                              <span className="text-slate-900">{imputado.edad}</span>
                            </div>
                          )}
                          {imputado.alias && (
                            <div>
                              <span className="font-medium text-slate-500">Alias:</span>{" "}
                              <span className="text-slate-900">{imputado.alias}</span>
                            </div>
                          )}
                        </div>

                        {/* Flags */}
                        <div className="flex flex-wrap gap-2">
                          {imputado.menor_edad && <Badge variant="secondary">Menor de edad</Badge>}
                          {imputado.es_extranjero && <Badge variant="secondary">Extranjero</Badge>}
                          {imputado.detenido_previo && <Badge variant="secondary">Detenido previo al juicio</Badge>}
                          {imputado.es_reincidente && <Badge variant="secondary">Reincidente</Badge>}
                          {imputado.juicio_abreviado && <Badge variant="secondary">Juicio abreviado</Badge>}
                          {imputado.prision_perpetua && <Badge variant="destructive">Prisión perpetua</Badge>}
                        </div>

                        {/* Legal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {imputado.juzgado_ufi && (
                            <div>
                              <span className="font-medium text-slate-500">Juzgado/UFI:</span>{" "}
                              <span className="text-slate-900">{imputado.juzgado_ufi}</span>
                            </div>
                          )}
                          {imputado.tribunal_fallo && (
                            <div>
                              <span className="font-medium text-slate-500">Tribunal del Fallo:</span>{" "}
                              <span className="text-slate-900">{imputado.tribunal_fallo}</span>
                            </div>
                          )}
                          {imputado.pena && (
                            <div>
                              <span className="font-medium text-slate-500">Pena:</span>{" "}
                              <span className="text-slate-900">{imputado.pena}</span>
                            </div>
                          )}
                          {imputado.fecha_veredicto && (
                            <div>
                              <span className="font-medium text-slate-500">Fecha Veredicto:</span>{" "}
                              <span className="text-slate-900">
                                {new Date(imputado.fecha_veredicto).toLocaleDateString("es-AR")}
                              </span>
                            </div>
                          )}
                          {imputado.cargos && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-slate-500">Cargos:</span>{" "}
                              <span className="text-slate-900">{imputado.cargos}</span>
                            </div>
                          )}
                        </div>

                        {/* Instancias Judiciales */}
                        {imputado.instancias_judiciales.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              Instancias Judiciales
                            </h5>
                            <div className="space-y-3">
                              {imputado.instancias_judiciales.map((inst) => (
                                <div key={inst.id} className="bg-slate-50 rounded-lg p-3 text-sm">
                                  <div className="font-medium text-slate-800 mb-2">
                                    {inst.orden_nivel || "Instancia"}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                                    {inst.numero_causa && (
                                      <div>
                                        <span className="font-medium">Causa:</span> {inst.numero_causa}
                                      </div>
                                    )}
                                    {inst.caratula && (
                                      <div>
                                        <span className="font-medium">Carátula:</span> {inst.caratula}
                                      </div>
                                    )}
                                    {inst.fiscal && (
                                      <div>
                                        <span className="font-medium">Fiscal:</span> {inst.fiscal}
                                      </div>
                                    )}
                                    {inst.fiscalia && (
                                      <div>
                                        <span className="font-medium">Fiscalía:</span> {inst.fiscalia}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {seguimiento && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-slate-600" />
                Seguimiento ONG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Acompañamiento */}
              {seguimiento.tipo_acompanamiento && seguimiento.tipo_acompanamiento.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-500">Tipo de Acompañamiento</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {seguimiento.tipo_acompanamiento.map((tipo, i) => (
                      <Badge key={i} variant="secondary">
                        {tipo}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seguimiento.miembro_asignado && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Miembro Asignado</label>
                    <p className="text-slate-900">{seguimiento.miembro_asignado}</p>
                  </div>
                )}
                {seguimiento.como_llego_caso && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Cómo llegó el caso</label>
                    <p className="text-slate-900">{seguimiento.como_llego_caso}</p>
                  </div>
                )}
                {seguimiento.primer_contacto !== null && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Primer Contacto</label>
                    <p className="text-slate-900">{seguimiento.primer_contacto ? "Sí" : "No"}</p>
                  </div>
                )}
                {seguimiento.abogado_querellante && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Abogado Querellante</label>
                    <p className="text-slate-900">{seguimiento.abogado_querellante}</p>
                  </div>
                )}
                {seguimiento.amicus_curiae !== null && (
                  <div>
                    <label className="text-sm font-medium text-slate-500">Amicus Curiae</label>
                    <p className="text-slate-900">{seguimiento.amicus_curiae ? "Sí" : "No"}</p>
                  </div>
                )}
              </div>

              {/* Contacto Familiar */}
              {(seguimiento.contacto_familia || seguimiento.telefono_contacto || seguimiento.email_contacto) && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contacto Familiar
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seguimiento.contacto_familia && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Nombre</label>
                        <p className="text-slate-900">{seguimiento.contacto_familia}</p>
                      </div>
                    )}
                    {(seguimiento.parentesco_contacto || seguimiento.parentesco_otro) && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Parentesco</label>
                        <p className="text-slate-900">
                          {seguimiento.parentesco_contacto === "Otro"
                            ? seguimiento.parentesco_otro
                            : seguimiento.parentesco_contacto}
                        </p>
                      </div>
                    )}
                    {seguimiento.telefono_contacto && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Teléfono</label>
                        <p className="text-slate-900">{seguimiento.telefono_contacto}</p>
                      </div>
                    )}
                    {seguimiento.email_contacto && (
                      <div>
                        <label className="text-sm font-medium text-slate-500">Email</label>
                        <p className="text-slate-900">{seguimiento.email_contacto}</p>
                      </div>
                    )}
                    {seguimiento.direccion_contacto && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-slate-500">Dirección</label>
                        <p className="text-slate-900">{seguimiento.direccion_contacto}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              {seguimiento.notas_seguimiento && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-500">Notas de Seguimiento</label>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{seguimiento.notas_seguimiento}</p>
                </div>
              )}
              {seguimiento.proximas_acciones && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium text-slate-500">Próximas Acciones</label>
                  <p className="text-slate-900 mt-1 whitespace-pre-wrap">{seguimiento.proximas_acciones}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {recursos.length > 0 && (
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                Recursos y Archivos ({recursos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recursos.map((recurso) => (
                  <div
                    key={recurso.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        {getResourceIcon(recurso.tipo, recurso.archivo_tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">
                          {recurso.titulo || recurso.archivo_nombre || "Sin título"}
                        </h4>
                        {recurso.descripcion && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{recurso.descripcion}</p>
                        )}
                        {recurso.fuente && <p className="text-xs text-slate-500 mt-1">Fuente: {recurso.fuente}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {recurso.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {recurso.tipo}
                            </Badge>
                          )}
                          {recurso.archivo_path ? (
                            <a
                              href={getFileUrl(recurso.archivo_path)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Descargar
                            </a>
                          ) : recurso.url ? (
                            <a
                              href={recurso.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Abrir enlace
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
