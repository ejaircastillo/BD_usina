"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, User } from "lucide-react"
import { useEffect, useState } from "react"

const mockCases = [
  {
    id: "1",
    victimName: "María Elena Rodríguez",
    incidentDate: "2024-03-15",
    location: "La Plata, Buenos Aires",
    province: "Buenos Aires",
    status: "En investigación",
    assignedMember: "Dr. María González",
  },
  {
    id: "2",
    victimName: "Carlos Alberto Fernández",
    incidentDate: "2024-02-28",
    location: "Rosario, Santa Fe",
    province: "Santa Fe",
    status: "Procesado",
    assignedMember: "Dr. Carlos Rodríguez",
  },
  {
    id: "3",
    victimName: "Ana Sofía Martínez",
    incidentDate: "2024-01-20",
    location: "Córdoba Capital",
    province: "Córdoba",
    status: "Juicio oral",
    assignedMember: "Dra. Ana Martínez",
  },
  {
    id: "4",
    victimName: "Roberto Luis García",
    incidentDate: "2023-12-10",
    location: "Mendoza Capital",
    province: "Mendoza",
    status: "Condenado",
    assignedMember: "Dr. Luis Fernández",
  },
  {
    id: "5",
    victimName: "Laura Patricia López",
    incidentDate: "2023-11-05",
    location: "Tucumán Capital",
    province: "Tucumán",
    status: "En investigación",
    assignedMember: "Dra. Carmen López",
  },
  {
    id: "6",
    victimName: "Diego Alejandro Morales",
    incidentDate: "2023-10-18",
    location: "Salta Capital",
    province: "Salta",
    status: "Imputado identificado",
    assignedMember: "Dr. María González",
  },
  {
    id: "7",
    victimName: "Carmen Rosa Jiménez",
    incidentDate: "2024-04-02",
    location: "Mar del Plata, Buenos Aires",
    province: "Buenos Aires",
    status: "Procesado",
    assignedMember: "Dr. Carlos Rodríguez",
  },
  {
    id: "8",
    victimName: "José Miguel Torres",
    incidentDate: "2024-01-15",
    location: "Santa Fe Capital",
    province: "Santa Fe",
    status: "Archivo",
    assignedMember: "Dra. Ana Martínez",
  },
  {
    id: "9",
    victimName: "Silvia Beatriz Herrera",
    incidentDate: "2023-09-22",
    location: "Villa Carlos Paz, Córdoba",
    province: "Córdoba",
    status: "Sobreseído",
    assignedMember: "Dr. Luis Fernández",
  },
  {
    id: "10",
    victimName: "Fernando Daniel Castro",
    incidentDate: "2024-05-10",
    location: "San Miguel de Tucumán",
    province: "Tucumán",
    status: "En investigación",
    assignedMember: "Dra. Carmen López",
  },
  {
    id: "11",
    victimName: "Patricia Mónica Vega",
    incidentDate: "2024-06-12",
    location: "Neuquén Capital",
    province: "Neuquén",
    status: "Procesado",
    assignedMember: "Dr. Miguel Herrera",
  },
  {
    id: "12",
    victimName: "Andrés Felipe Ruiz",
    incidentDate: "2024-07-08",
    location: "Posadas, Misiones",
    province: "Misiones",
    status: "En investigación",
    assignedMember: "Dra. Elena Castro",
  },
]

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

interface CaseCardProps {
  case: (typeof mockCases)[0]
}

function CaseCard({ case: caseData }: CaseCardProps) {
  return (
    <Link href={`/casos/${caseData.id}`}>
      <Card className="w-80 flex-shrink-0 hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300 cursor-pointer hover:scale-105">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 font-heading mb-2 line-clamp-2">
                {caseData.victimName}
              </h3>
              <Badge className={`text-xs ${getStatusColor(caseData.status)}`}>{caseData.status}</Badge>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{new Date(caseData.incidentDate).toLocaleDateString("es-AR")}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="line-clamp-1">{caseData.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="line-clamp-1">{caseData.assignedMember}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface ScrollingRowProps {
  cases: typeof mockCases
  direction: "left" | "right"
  speed: number
}

function ScrollingRow({ cases, direction, speed }: ScrollingRowProps) {
  const [duplicatedCases, setDuplicatedCases] = useState<typeof mockCases>([])

  useEffect(() => {
    // Duplicate cases to create seamless loop
    setDuplicatedCases([...cases, ...cases, ...cases])
  }, [cases])

  return (
    <div className="relative overflow-hidden">
      <div
        className={`flex gap-6 ${direction === "left" ? "animate-scroll-left" : "animate-scroll-right"}`}
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {duplicatedCases.map((caseData, index) => (
          <CaseCard key={`${caseData.id}-${index}`} case={caseData} />
        ))}
      </div>
    </div>
  )
}

export function AnimatedCasesGrid() {
  const [rows, setRows] = useState<(typeof mockCases)[]>([])

  useEffect(() => {
    // Split cases into multiple rows
    const chunkSize = 4
    const caseRows = []
    for (let i = 0; i < mockCases.length; i += chunkSize) {
      caseRows.push(mockCases.slice(i, i + chunkSize))
    }
    setRows(caseRows)
  }, [])

  return (
    <div className="space-y-8 py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 font-heading mb-4">Casos Recientes</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Observatorio de víctimas - Seguimiento continuo de casos de violencia institucional
        </p>
      </div>

      <div className="space-y-8">
        {rows.map((rowCases, index) => (
          <ScrollingRow
            key={index}
            cases={rowCases}
            direction={index % 2 === 0 ? "left" : "right"}
            speed={30 + index * 5}
          />
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/casos"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Todos los Casos
        </Link>
      </div>
    </div>
  )
}
