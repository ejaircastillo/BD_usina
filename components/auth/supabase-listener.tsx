"use client" // Esto lo convierte en un Componente de Cliente. Es crucial.

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SupabaseListener() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    console.log("SupabaseListener está activo y escuchando...")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Esta línea nos dirá exactamente qué evento está ocurriendo
      console.log("Evento de Supabase Auth detectado:", event)

      if (event === "PASSWORD_RECOVERY") {
        console.log("Evento PASSWORD_RECOVERY detectado! Redirigiendo a /update-password...")
        router.push("/update-password")
      }
    })

    // Limpiar el escuchador cuando el componente ya no se use
    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  // Este componente no renderiza nada visible, solo ejecuta la lógica.
  return null
}
