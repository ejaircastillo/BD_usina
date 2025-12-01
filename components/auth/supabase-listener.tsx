"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function SupabaseListener() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    console.log("SupabaseListener está activo y escuchando...")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento de Supabase Auth detectado:", event)

      if (event === "PASSWORD_RECOVERY") {
        console.log("Evento PASSWORD_RECOVERY detectado! Redirigiendo a /update-password...")
        router.push("/update-password")
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  return null
}
