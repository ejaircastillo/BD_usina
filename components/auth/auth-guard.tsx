"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const pathname = usePathname()
  const hasRedirectedRef = useRef(false)
  const supabase = createClient()

  useEffect(() => {
    if (hasRedirectedRef.current) return

    let isMounted = true

    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        const isAuth = !!session && !error
        setIsAuthenticated(isAuth)

        // Si no está autenticado y no está en login, redirigir a login
        if (!isAuth && pathname !== "/login") {
          hasRedirectedRef.current = true
          window.location.href = "/login"
          return
        }

        // Si está autenticado y está en login, redirigir a dashboard
        if (isAuth && pathname === "/login") {
          hasRedirectedRef.current = true
          window.location.href = "/dashboard"
          return
        }
      } catch (err) {
        if (isMounted) {
          setIsAuthenticated(false)
          if (pathname !== "/login") {
            hasRedirectedRef.current = true
            window.location.href = "/login"
          }
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted || hasRedirectedRef.current) return

      const isAuth = !!session
      setIsAuthenticated(isAuth)

      if (event === "SIGNED_OUT" && pathname !== "/login") {
        hasRedirectedRef.current = true
        window.location.href = "/login"
      }
    })

    checkAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, pathname])

  // Mostrar loading mientras verifica autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si está en la página de login, siempre mostrar
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Si está autenticado, mostrar contenido protegido
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Si no está autenticado, no mostrar nada (la redirección ocurrirá)
  return null
}
