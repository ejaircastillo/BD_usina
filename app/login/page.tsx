"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  const [authState, setAuthState] = useState<"checking" | "processing_token" | "ready">("checking")

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const hasAuthParams = useMemo(() => {
    const code = searchParams.get("code")
    const token = searchParams.get("token")
    const hashParams = typeof window !== "undefined" ? window.location.hash : ""
    const hasHashTokens = hashParams.includes("access_token") || hashParams.includes("refresh_token")

    return !!(code || token || hasHashTokens)
  }, [searchParams])

  const redirectToDashboard = useCallback(() => {
    router.replace("/dashboard")
  }, [router])

  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    if (hasAuthParams) {
      setAuthState("processing_token")
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[v0] Auth state change:", event, !!session)

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (event === "SIGNED_IN" && session) {
        console.log("[v0] SIGNED_IN detectado, redirigiendo...")
        redirectToDashboard()
        return
      }

      // Si recibimos INITIAL_SESSION sin sesión y no hay tokens, mostrar formulario
      if (event === "INITIAL_SESSION" && !session && !hasAuthParams) {
        if (isMounted) {
          setAuthState("ready")
        }
      }

      // Si hay error en el token o sesión inválida
      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session && hasAuthParams)) {
        if (isMounted) {
          setAuthState("ready")
          if (hasAuthParams) {
            setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
          }
        }
      }
    })

    const checkSession = async () => {
      try {
        // Si hay tokens en URL, dar tiempo a Supabase para procesarlos
        if (hasAuthParams) {
          console.log("[v0] Tokens detectados, esperando procesamiento...")

          // Timeout de seguridad
          timeoutId = setTimeout(() => {
            if (isMounted) {
              console.log("[v0] Timeout: tokens no procesados")
              setAuthState("ready")
              setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
            }
          }, 8000)

          return
        }

        // Sin tokens, verificar sesión existente
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.log("[v0] Error al obtener sesión:", sessionError.message)
          if (isMounted) setAuthState("ready")
          return
        }

        if (session) {
          console.log("[v0] Sesión activa encontrada")
          redirectToDashboard()
          return
        }

        if (isMounted) setAuthState("ready")
      } catch (err) {
        console.log("[v0] Error en checkSession:", err)
        if (isMounted) setAuthState("ready")
      }
    }

    checkSession()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase, redirectToDashboard, hasAuthParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setEmailSent(false)

    try {
      const redirectUrl = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
        ? `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL}/login`
        : `${window.location.origin}/login`

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
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

  if (authState === "checking" || authState === "processing_token") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative w-48 h-16 mx-auto">
            <Image
              src="/images/logo-usina-justicia.png"
              alt="Usina de Justicia"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-slate-600 font-medium">
              {authState === "processing_token" ? "Verificando enlace de acceso..." : "Verificando sesión..."}
            </span>
          </div>
        </div>
      </div>
    )
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
