"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for case locations
const caseLocations = [
  { province: "Buenos Aires", cases: 342, coordinates: { x: 58, y: 65 } },
  { province: "CABA", cases: 189, coordinates: { x: 58, y: 62 } },
  { province: "Santa Fe", cases: 156, coordinates: { x: 52, y: 55 } },
  { province: "Córdoba", cases: 134, coordinates: { x: 48, y: 55 } },
  { province: "Mendoza", cases: 98, coordinates: { x: 38, y: 68 } },
  { province: "Tucumán", cases: 76, coordinates: { x: 45, y: 42 } },
  { province: "Entre Ríos", cases: 65, coordinates: { x: 52, y: 58 } },
  { province: "Salta", cases: 54, coordinates: { x: 42, y: 35 } },
  { province: "Misiones", cases: 43, coordinates: { x: 62, y: 45 } },
  { province: "Chaco", cases: 38, coordinates: { x: 52, y: 42 } },
]

const getPointSize = (cases: number) => {
  if (cases > 200) return "w-4 h-4"
  if (cases > 100) return "w-3 h-3"
  if (cases > 50) return "w-2 h-2"
  return "w-1.5 h-1.5"
}

const getPointColor = (cases: number) => {
  if (cases > 200) return "bg-red-500"
  if (cases > 100) return "bg-orange-500"
  if (cases > 50) return "bg-yellow-500"
  return "bg-blue-500"
}

export function ArgentinaMap() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="font-heading">Mapa de Casos por Provincia</CardTitle>
        <CardDescription>Distribución geográfica de los casos registrados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div className="relative bg-slate-100 rounded-lg p-8 h-96 overflow-hidden">
              {/* Simplified Argentina outline */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full"
                style={{ filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))" }}
              >
                {/* Argentina silhouette - simplified path */}
                <path
                  d="M45 15 L55 15 L60 20 L65 25 L68 35 L65 45 L62 55 L58 65 L55 75 L50 85 L45 90 L40 85 L35 75 L32 65 L30 55 L28 45 L30 35 L35 25 L40 20 L45 15 Z"
                  fill="white"
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                />

                {/* Case location points */}
                {caseLocations.map((location) => (
                  <g key={location.province}>
                    <circle
                      cx={location.coordinates.x}
                      cy={location.coordinates.y}
                      r={location.cases > 200 ? "2" : location.cases > 100 ? "1.5" : location.cases > 50 ? "1" : "0.8"}
                      className={`${getPointColor(location.cases)} opacity-80`}
                      fill="currentColor"
                    />
                    <circle
                      cx={location.coordinates.x}
                      cy={location.coordinates.y}
                      r={location.cases > 200 ? "3" : location.cases > 100 ? "2.5" : location.cases > 50 ? "2" : "1.5"}
                      className={`${getPointColor(location.cases)} opacity-30`}
                      fill="currentColor"
                    />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Legend and Statistics */}
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-slate-900 mb-3 font-heading">Leyenda</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-slate-600">Más de 200 casos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-slate-600">100-200 casos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-slate-600">50-100 casos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-600">Menos de 50 casos</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3 font-heading">Top Provincias</h4>
              <div className="space-y-2">
                {caseLocations
                  .sort((a, b) => b.cases - a.cases)
                  .slice(0, 5)
                  .map((location) => (
                    <div key={location.province} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{location.province}</span>
                      <Badge variant="outline" className="text-xs">
                        {location.cases}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-medium text-slate-900 mb-2 text-sm">Resumen Geográfico</h5>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total provincias:</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex justify-between">
                  <span>Con casos registrados:</span>
                  <span className="font-medium">{caseLocations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total casos:</span>
                  <span className="font-medium">{caseLocations.reduce((sum, loc) => sum + loc.cases, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
