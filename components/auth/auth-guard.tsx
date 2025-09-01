"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated")
      const isAuth = authStatus === "true"
      setIsAuthenticated(isAuth)

      // If not authenticated and not on login page, redirect to login
      if (!isAuth && pathname !== "/login") {
        router.push("/login")
      }
      // If authenticated and on login page, redirect to home
      else if (isAuth && pathname === "/login") {
        router.push("/")
      }
    }

    checkAuth()
  }, [router, pathname])

  // Show loading while checking authentication
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

  // If on login page, always show the page
  if (pathname === "/login") {
    return <>{children}</>
  }

  // If authenticated, show the protected content
  if (isAuthenticated) {
    return <>{children}</>
  }

  // If not authenticated, show nothing (redirect will happen)
  return null
}
