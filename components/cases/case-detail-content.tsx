"use client"

import { useState } from "react"
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
  Mail,
  FileText,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
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

interface CaseDetailContentProps {
  caseId: string
}

// Mock data for demonstration
const mockCaseData = {
  id: "1",
  // Victim Data
  victimName: "María Elena Rodríguez",
  victimBirthDate: "1985-07-15",
  victimAge: 38,
  victimProfession: "Docente",
  victimAddress: "Av. 7 N° 1234, La Plata, Buenos Aires",
  victimPhone: "+54 221 456-7890",
  victimEmail: "maria.rodriguez@email.com",

  // Incident Information
  incidentDate: "2024-03-15",
  incidentTime: "22:30",
  incidentLocation: "Intersección Av. 7 y Calle 50, La Plata",
  incidentProvince: "Buenos Aires",
  incidentSummary:
    "Víctima de robo con arma de fuego mientras regresaba a su domicilio. Los agresores sustrajeron cartera, teléfono celular y documentación personal.",
  legalCase: "IPP N° 06-00-012345-24/00",
  prosecutor: "Dr. Juan Carlos Méndez",
  court: "UFI N° 3 - La Plata",

  // Legal Status
  status: "En investigación",
  statusDate: "2024-03-16",

  // Accused Persons
  accused: [
    {
      id: 1,
      name: "Sin identificar",
      alias: "El Flaco",
      age: "Aproximadamente 25 años",
      description: "Masculino, altura aproximada 1.75m, contextura delgada",
      status: "Prófugo",
      charges: "Robo agravado por el uso de arma de fuego",
    },
    {
      id: 2,
      name: "Sin identificar",
      alias: "El Gordo",
      age: "Aproximadamente 30 años",
      description: "Masculino, altura aproximada 1.70m, contextura robusta",
      status: "Prófugo",
      charges: "Robo agravado por el uso de arma de fuego",
    },
  ],

  // NGO Follow-up
  assignedMember: "Dr. María González",
  assignedMemberPhone: "+54 11 2345-6789",
  assignedMemberEmail: "m.gonzalez@usinajusticia.org",
  familyContact: "Roberto Rodríguez (hermano)",
  familyContactPhone: "+54 221 987-6543",
  followUpNotes: "Familia requiere acompañamiento psicológico. Se coordinó derivación a profesional especializado.",

  // Multimedia Resources
  resources: [
    {
      id: 1,
      type: "Noticia",
      title: "Robo a mano armada en La Plata: buscan a dos sospechosos",
      url: "https://ejemplo.com/noticia-1",
      source: "Diario El Día",
      date: "2024-03-16",
    },
    {
      id: 2,
      type: "Video",
      title: "Cámaras de seguridad captan el momento del robo",
      url: "https://ejemplo.com/video-1",
      source: "Canal 2 La Plata",
      date: "2024-03-17",
    },
  ],
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

export function CaseDetailContent({ caseId }: CaseDetailContentProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const caseData = mockCaseData // In real app, fetch by caseId

  const handleDelete = async () => {
    setIsDeleting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // In real app, delete case and redirect
    console.log("Case deleted:", caseId)
    setIsDeleting(false)
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
              <Badge className={`text-xs ${getStatusColor(caseData.status)}`}>{caseData.status}</Badge>
              <span className="text-sm text-slate-500">
                Actualizado: {new Date(caseData.statusDate).toLocaleDateString("es-AR")}
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
                <div>
                  <label className="text-sm font-medium text-slate-700">Fecha de Nacimiento</label>
                  <p className="text-slate-900">
                    {new Date(caseData.victimBirthDate).toLocaleDateString("es-AR")} ({caseData.victimAge} años)
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Profesión</label>
                  <p className="text-slate-900">{caseData.victimProfession}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Teléfono</label>
                  <p className="text-slate-900">{caseData.victimPhone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Dirección</label>
                <p className="text-slate-900">{caseData.victimAddress}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{caseData.victimEmail}</p>
              </div>
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
                <div>
                  <label className="text-sm font-medium text-slate-700">Fecha del Hecho</label>
                  <p className="text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(caseData.incidentDate).toLocaleDateString("es-AR")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Hora</label>
                  <p className="text-slate-900">{caseData.incidentTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Provincia</label>
                  <p className="text-slate-900">{caseData.incidentProvince}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Causa Judicial</label>
                  <p className="text-slate-900">{caseData.legalCase}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Lugar del Hecho</label>
                <p className="text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {caseData.incidentLocation}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Resumen del Hecho</label>
                <p className="text-slate-900 leading-relaxed">{caseData.incidentSummary}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Fiscal</label>
                  <p className="text-slate-900">{caseData.prosecutor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Juzgado</label>
                  <p className="text-slate-900">{caseData.court}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accused Persons */}
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
                      <Badge variant="outline" className="text-xs">
                        {person.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">Nombre:</span>
                        <span className="ml-2 text-slate-900">{person.name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Alias:</span>
                        <span className="ml-2 text-slate-900">{person.alias}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Edad:</span>
                        <span className="ml-2 text-slate-900">{person.age}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-700">Descripción:</span>
                        <span className="ml-2 text-slate-900">{person.description}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium text-slate-700">Cargos:</span>
                        <span className="ml-2 text-slate-900">{person.charges}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
              <div>
                <label className="text-sm font-medium text-slate-700">Miembro Asignado</label>
                <p className="text-slate-900 font-medium">{caseData.assignedMember}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{caseData.assignedMemberPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-3 h-3" />
                  <span>{caseData.assignedMemberEmail}</span>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-slate-700">Contacto Familiar</label>
                <p className="text-slate-900">{caseData.familyContact}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                  <Phone className="w-3 h-3" />
                  <span>{caseData.familyContactPhone}</span>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-slate-700">Notas de Seguimiento</label>
                <p className="text-slate-900 text-sm leading-relaxed">{caseData.followUpNotes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Multimedia Resources */}
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
                    <p className="text-xs text-slate-600 mb-2">{resource.source}</p>
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
        </div>
      </div>
    </main>
  )
}
