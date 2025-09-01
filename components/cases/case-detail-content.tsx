"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Edit,
  Trash2,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  FileText,
  ExternalLink,
  AlertTriangle,
  Loader2,
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

interface CaseData {
  id: string
  // Victim Data
  victimName: string
  victimBirthDate?: string
  victimAge?: number
  victimProfession?: string
  victimAddress?: string
  victimPhone?: string
  victimEmail?: string
  victimNationality?: string
  victimSocialNetworks?: string
  victimNotes?: string

  // Incident Information
  incidentDate?: string
  deathDate?: string
  incidentLocation?: string
  incidentProvince?: string
  incidentMunicipality?: string
  incidentSpecificPlace?: string
  incidentSummary?: string
  caseNumber?: string
  caseTitle?: string
  prosecutorEmail?: string
  prosecutorPhone?: string

  // Legal Status
  status?: string
  statusDate?: string

  // Accused Persons
  accused: Array<{
    id: number
    fullName?: string
    isMinor?: boolean
    nationality?: string
    court?: string
    legalStatus?: string
    trialDate?: string
    verdictDate?: string
    sentence?: string
    abbreviatedTrial?: boolean
  }>

  // NGO Follow-up
  assignedMember?: string
  familyContact?: string
  familyContactPhone?: string
  followUpNotes?: string
  supportType?: string[]
  plaintiffLawyer?: string
  amicusCuriae?: boolean
  howCaseArrived?: string
  firstContact?: boolean

  // Multimedia Resources
  resources: Array<{
    id: number
    type: string
    title: string
    url: string
    source?: string
    description?: string
    date: string
  }>
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
    case "Prescripción":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
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

      const { data: victimData, error: victimError } = await supabase
        .from("victimas")
        .select("*")
        .eq("id", caseId)
        .single()

      if (victimError) throw victimError

      const { data: incidentData, error: incidentError } = await supabase
        .from("hechos")
        .select("*")
        .eq("victima_id", caseId)
        .single()

      const { data: accusedData, error: accusedError } = await supabase
        .from("imputados")
        .select("*")
        .eq("victima_id", caseId)

      const { data: followUpData, error: followUpError } = await supabase
        .from("seguimiento")
        .select("*")
        .eq("victima_id", caseId)
        .single()

      const { data: resourcesData, error: resourcesError } = await supabase
        .from("recursos")
        .select("*")
        .eq("victima_id", caseId)

      // Transform data to match component interface
      const transformedData: CaseData = {
        id: victimData.id,
        victimName: victimData.nombre_completo,
        victimBirthDate: victimData.fecha_nacimiento,
        victimAge: victimData.edad,
        victimProfession: victimData.profesion,
        victimAddress: victimData.direccion_completa,
        victimPhone: victimData.telefono_contacto_familiar,
        victimEmail: victimData.redes_sociales,
        victimNationality: victimData.nacionalidad,
        victimNotes: victimData.notas_adicionales,

        incidentDate: incidentData?.fecha_hecho,
        deathDate: incidentData?.fecha_fallecimiento,
        incidentLocation: incidentData?.lugar_hecho,
        incidentProvince: incidentData?.provincia,
        incidentMunicipality: incidentData?.municipio,
        incidentSpecificPlace: incidentData?.lugar_especifico,
        incidentSummary: incidentData?.resumen_hecho,
        caseNumber: incidentData?.numero_causa,
        caseTitle: incidentData?.caratula,
        prosecutorEmail: incidentData?.email_fiscalia,
        prosecutorPhone: incidentData?.telefono_fiscalia,

        status: incidentData?.estado_legal || "En investigación",
        statusDate: incidentData?.updated_at,

        accused:
          accusedData?.map((accused, index) => ({
            id: index + 1,
            fullName: accused.apellido_nombre,
            isMinor: accused.menor_edad,
            nationality: accused.nacionalidad,
            court: accused.juzgado_ufi,
            legalStatus: accused.estado_procesal,
            trialDate: accused.fecha_juicio,
            verdictDate: accused.fecha_veredicto,
            sentence: accused.pena,
            abbreviatedTrial: accused.juicio_abreviado,
          })) || [],

        assignedMember: followUpData?.miembro_asignado,
        familyContact: followUpData?.contacto_familiar,
        familyContactPhone: followUpData?.telefono_familiar,
        followUpNotes: followUpData?.notas_seguimiento,
        supportType: followUpData?.tipo_acompanamiento ? JSON.parse(followUpData.tipo_acompanamiento) : [],
        plaintiffLawyer: followUpData?.abogado_querellante,
        amicusCuriae: followUpData?.amicus_curiae,
        howCaseArrived: followUpData?.como_llego_caso,
        firstContact: followUpData?.primer_contacto,

        resources:
          resourcesData?.map((resource, index) => ({
            id: index + 1,
            type: resource.tipo,
            title: resource.titulo,
            url: resource.url,
            source: resource.fuente,
            description: resource.descripcion,
            date: resource.created_at,
          })) || [],
      }

      setCaseData(transformedData)
    } catch (err) {
      console.error("Error fetching case data:", err)
      setError("Error al cargar los datos del caso")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const { error } = await supabase.from("victimas").delete().eq("id", caseId)

      if (error) throw error

      router.push("/")
    } catch (err) {
      console.error("Error deleting case:", err)
      setError("Error al eliminar el caso")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Cargando caso...</span>
        </div>
      </main>
    )
  }

  if (error || !caseData) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error al cargar el caso</h3>
          <p className="text-slate-600 mb-4">{error || "No se pudo encontrar el caso solicitado"}</p>
          <Link href="/">
            <Button variant="outline">Volver a Casos</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Volver a Casos
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-heading">
              Caso #{caseId} - {caseData.victimName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`text-xs ${getStatusColor(caseData.status || "")}`}>{caseData.status}</Badge>
              <span className="text-sm text-slate-500">
                Actualizado: {caseData.statusDate ? new Date(caseData.statusDate).toLocaleDateString("es-AR") : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/casos/${caseId}/editar`}>
            <Button className="bg-slate-800 hover:bg-slate-700 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar Caso
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
                  ¿Está seguro que desea eliminar este caso? Esta acción no se puede deshacer y se perderá toda la
                  información asociada.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? "Eliminando..." : "Eliminar Caso"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Victim Information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <User className="w-5 h-5 text-slate-600" />
                Datos de la Víctima
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
                  <p className="text-slate-900 font-medium">{caseData.victimName}</p>
                </div>
                {caseData.victimBirthDate && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                    <p className="text-slate-900">
                      {new Date(caseData.victimBirthDate).toLocaleDateString("es-AR")}
                      {caseData.victimAge && ` (${caseData.victimAge} años)`}
                    </p>
                  </div>
                )}
                {caseData.victimProfession && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Profesión</label>
                    <p className="text-slate-900">{caseData.victimProfession}</p>
                  </div>
                )}
                {caseData.victimPhone && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Teléfono de Contacto Familiar</label>
                    <p className="text-slate-900">{caseData.victimPhone}</p>
                  </div>
                )}
              </div>
              {caseData.victimAddress && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Dirección</label>
                  <p className="text-slate-900">{caseData.victimAddress}</p>
                </div>
              )}
              {caseData.victimEmail && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Redes Sociales</label>
                  <p className="text-slate-900">{caseData.victimEmail}</p>
                </div>
              )}
              {caseData.victimNationality && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Nacionalidad</label>
                  <p className="text-slate-900">{caseData.victimNationality}</p>
                </div>
              )}
              {caseData.victimNotes && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Notas Adicionales</label>
                  <p className="text-slate-900 leading-relaxed">{caseData.victimNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Incident Information */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading">
                <AlertTriangle className="w-5 h-5 text-slate-600" />
                Información del Hecho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.incidentDate && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Fecha del Hecho</label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(caseData.incidentDate).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
                {caseData.deathDate && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Fecha de Fallecimiento</label>
                    <p className="text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(caseData.deathDate).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                )}
                {caseData.incidentProvince && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Provincia</label>
                    <p className="text-slate-900">{caseData.incidentProvince}</p>
                  </div>
                )}
                {caseData.incidentMunicipality && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Municipio</label>
                    <p className="text-slate-900">{caseData.incidentMunicipality}</p>
                  </div>
                )}
                {caseData.caseNumber && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Número de Causa</label>
                    <p className="text-slate-900">{caseData.caseNumber}</p>
                  </div>
                )}
                {caseData.caseTitle && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Carátula</label>
                    <p className="text-slate-900">{caseData.caseTitle}</p>
                  </div>
                )}
              </div>
              {caseData.incidentLocation && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Lugar del Hecho</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {caseData.incidentLocation}
                  </p>
                </div>
              )}
              {caseData.incidentSummary && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Resumen del Hecho</label>
                  <p className="text-slate-900 leading-relaxed">{caseData.incidentSummary}</p>
                </div>
              )}
              {(caseData.prosecutorEmail || caseData.prosecutorPhone) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caseData.prosecutorEmail && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Email de la Fiscalía</label>
                        <p className="text-slate-900">{caseData.prosecutorEmail}</p>
                      </div>
                    )}
                    {caseData.prosecutorPhone && (
                      <div>
                        <label className="text-sm font-medium text-slate-700">Teléfono de la Fiscalía</label>
                        <p className="text-slate-900">{caseData.prosecutorPhone}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Accused Persons */}
          {caseData.accused.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <FileText className="w-5 h-5 text-slate-600" />
                  Imputados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseData.accused.map((person, index) => (
                    <div key={person.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-slate-900">Imputado #{index + 1}</h4>
                        {person.legalStatus && (
                          <Badge variant="outline" className="text-xs">
                            {person.legalStatus}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {person.fullName && (
                          <div>
                            <span className="font-medium text-slate-700">Apellido y Nombre:</span>
                            <span className="ml-2 text-slate-900">{person.fullName}</span>
                          </div>
                        )}
                        {person.nationality && (
                          <div>
                            <span className="font-medium text-slate-700">Nacionalidad:</span>
                            <span className="ml-2 text-slate-900">{person.nationality}</span>
                          </div>
                        )}
                        {person.court && (
                          <div>
                            <span className="font-medium text-slate-700">Juzgado/UFI:</span>
                            <span className="ml-2 text-slate-900">{person.court}</span>
                          </div>
                        )}
                        {person.sentence && (
                          <div>
                            <span className="font-medium text-slate-700">Pena:</span>
                            <span className="ml-2 text-slate-900">{person.sentence}</span>
                          </div>
                        )}
                        {person.isMinor && (
                          <div className="md:col-span-2">
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                              Menor de Edad
                            </Badge>
                          </div>
                        )}
                        {person.abbreviatedTrial && (
                          <div className="md:col-span-2">
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              Juicio Abreviado
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* NGO Follow-up */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <User className="w-5 h-5 text-slate-600" />
                Seguimiento ONG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {caseData.assignedMember && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Miembro Asignado</label>
                  <p className="text-slate-900 font-medium">{caseData.assignedMember}</p>
                </div>
              )}

              {(caseData.familyContact || caseData.familyContactPhone) && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Contacto Familiar</label>
                    {caseData.familyContact && <p className="text-slate-900">{caseData.familyContact}</p>}
                    {caseData.familyContactPhone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                        <Phone className="w-3 h-3" />
                        <span>{caseData.familyContactPhone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {caseData.supportType && caseData.supportType.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Tipo de Acompañamiento</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {caseData.supportType.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {caseData.followUpNotes && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-slate-700">Notas de Seguimiento</label>
                    <p className="text-slate-900 text-sm leading-relaxed">{caseData.followUpNotes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Multimedia Resources */}
          {caseData.resources.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading text-base">
                  <ExternalLink className="w-5 h-5 text-slate-600" />
                  Recursos Multimedia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {caseData.resources.map((resource) => (
                    <div key={resource.id} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(resource.date).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                      <h5 className="font-medium text-sm text-slate-900 mb-1 line-clamp-2">{resource.title}</h5>
                      {resource.source && <p className="text-xs text-slate-600 mb-2">{resource.source}</p>}
                      {resource.description && <p className="text-xs text-slate-600 mb-2">{resource.description}</p>}
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Ver recurso
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
