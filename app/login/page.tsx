"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Loader2, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [authState, setAuthState] = useState<"checking" | "processing_token" | "ready">("checking")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const hasRedirectedRef = useRef(false)

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

  useEffect(() => {
    if (isRedirecting || hasRedirectedRef.current) {
      return
    }

    let isMounted = true
    let timeoutId: NodeJS.Timeout

    if (hasAuthParams) {
      setAuthState("processing_token")
    }

    const performRedirect = () => {
      if (hasRedirectedRef.current || isRedirecting) {
        return
      }

      hasRedirectedRef.current = true
      setIsRedirecting(true)

      window.location.href = "/"
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (hasRedirectedRef.current) {
        return
      }

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        performRedirect()
        return
      }

      if (event === "INITIAL_SESSION" && !session && !hasAuthParams) {
        if (isMounted) {
          setAuthState("ready")
        }
      }

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
      if (hasRedirectedRef.current) {
        return
      }

      try {
        if (hasAuthParams) {
          timeoutId = setTimeout(() => {
            if (isMounted && !hasRedirectedRef.current) {
              setAuthState("ready")
              setError("El enlace ha expirado o es inválido. Solicita uno nuevo.")
            }
          }, 8000)

          return
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          if (isMounted) setAuthState("ready")
          return
        }

        if (session) {
          performRedirect()
          return
        }

        if (isMounted) setAuthState("ready")
      } catch (err) {
        if (isMounted) setAuthState("ready")
      }
    }

    checkSession()

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [supabase, hasAuthParams, router, isRedirecting])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError("")

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
        },
      })

      if (authError) {
        setError("Error al conectar con Google. Intente nuevamente.")
      }
    } catch (err) {
      console.error("Google sign in error:", err)
      setError("Error al conectar con Google. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError("Email o contraseña incorrectos. Intente nuevamente.")
        return
      }

      // Successful login will trigger redirect via onAuthStateChange
    } catch (err) {
      console.error("Auth error:", err)
      setError("Error al iniciar sesión. Intente nuevamente.")
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
            <div className="space-y-6">
              <Button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium bg-transparent"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Sign in with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">O ingresa con tu cuenta</span>
                </div>
              </div>

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

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700 font-medium">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600"
                      placeholder="••••••••"
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
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </div>

            <div className="text-center pt-4 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-500">
                Ingresa con tu email y contraseña registrados o con tu cuenta de Google.
              </p>
              <p className="text-xs text-slate-400">Acceso restringido para personal autorizado</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
