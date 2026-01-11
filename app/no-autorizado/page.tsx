"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

export default function NoAutorizadoPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acceso No Autorizado</CardTitle>
          <CardDescription className="text-base">
            Tu cuenta no tiene permisos para acceder a esta aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <p className="font-medium mb-2">¿Por qué veo este mensaje?</p>
            <p>
              Tu cuenta se autenticó correctamente, pero no está incluida en la lista de usuarios autorizados para
              acceder al sistema.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
            </p>
          </div>
          <Button onClick={handleLogout} className="w-full bg-transparent" variant="outline">
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
