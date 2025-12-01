"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  const redirectToDashboard = useCallback(() => {
    router.replace("/dashboard")
  }, [router])

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        const hashParams = window.location.hash
        const hasAuthTokens = hashParams.includes("access_token") || hashParams.includes("refresh_token")

        if (hasAuthTokens) {
          // El listener onAuthStateChange se encargará de la redirección
          console.log("[v0] Tokens detectados en URL, esperando procesamiento...")

          // Timeout de seguridad: si después de 10 segundos no hay sesión, mostrar formulario
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log("[v0] Timeout alcanzado, mostrando formulario")
              setIsCheckingSession(false)
              setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
            }
          }, 10000)

          return // No hacer getSession aún, dejar que el listener maneje
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.log("[v0] Error al obtener sesión:", sessionError.message)
          if (isMounted) {
            setIsCheckingSession(false)
          }
          return
        }

        if (session) {
          console.log("[v0] Sesión activa encontrada, redirigiendo...")
          redirectToDashboard()
          return
        }

        // No hay sesión ni tokens, mostrar formulario
        if (isMounted) {
          setIsCheckingSession(false)
        }
      } catch (err) {
        console.log("[v0] Error en initializeAuth:", err)
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state change:", event, !!session)

      if (event === "SIGNED_IN" && session) {
        // Limpiar timeout si existe
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.log("[v0] SIGNED_IN detectado, redirigiendo...")
        redirectToDashboard()
      }

      if (event === "TOKEN_REFRESHED" && !session) {
        if (isMounted) {
          setIsCheckingSession(false)
          setError("Hubo un problema con tu sesión. Por favor, solicita un nuevo enlace.")
        }
      }

      if (event === "SIGNED_OUT") {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    })

    // Iniciar verificación
    initializeAuth()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [supabase, redirectToDashboard])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailSent(false)

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin,
        },
      })

      if (authError) {
        setError("Error al enviar el enlace. Verifique su email e intente nuevamente.")
        return
      }

      setEmailSent(true)
    } catch (err) {
      console.error("Magic link error:", err)
      setError("Error al enviar el enlace. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-6 pb-8 pt-8">
            <div className="flex justify-center">
              <div className="relative w-48 h-16">
                <Image
                  src="/images/logo-usina-justicia.png"
                  alt="Usina de Justicia"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-800 font-montserrat">Acceso Exclusivo</h1>
              <p className="text-slate-600 text-sm">Base de Datos de Víctimas</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            {emailSent ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 ml-2">
                    ¡Enlace enviado! Revisa tu correo (y la carpeta de spam) para ingresar.
                  </AlertDescription>
                </Alert>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail("")
                  }}
                  className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Enviar a otro correo
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Correo Electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                      placeholder="usuario@usinajusticia.org"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando enlace...
                    </>
                  ) : (
                    "Enviar enlace de acceso"
                  )}
                </Button>
              </form>
            )}

            <div className="text-center pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-500">
                Sin contraseñas. Cada vez que necesites ingresar, te enviaremos un nuevo enlace seguro.
              </p>
              <p className="text-xs text-slate-400">Acceso restringido para personal autorizado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
