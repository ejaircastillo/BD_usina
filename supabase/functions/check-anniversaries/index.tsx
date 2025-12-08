import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "https://esm.sh/resend@2.0.0"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Victima {
  id: string
  nombre_completo: string
  fecha_nacimiento: string | null
  fecha_fallecimiento: string | null
}

interface Aniversario {
  nombre: string
  tipo: "cumpleanos" | "fallecimiento"
  anos: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables")
    }

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY environment variable")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const resend = new Resend(resendApiKey)

    // Get today's date
    const today = new Date()
    const todayDay = today.getDate()
    const todayMonth = today.getMonth() + 1 // JavaScript months are 0-indexed
    const currentYear = today.getFullYear()

    // Fetch all victims with birth or death dates
    const { data: victimas, error } = await supabase
      .from("victimas")
      .select("id, nombre_completo, fecha_nacimiento, fecha_fallecimiento")
      .or("fecha_nacimiento.not.is.null,fecha_fallecimiento.not.is.null")

    if (error) {
      throw new Error(`Error fetching victims: ${error.message}`)
    }

    if (!victimas || victimas.length === 0) {
      return new Response(JSON.stringify({ message: "No victims with dates found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Filter for today's anniversaries
    const aniversarios: Aniversario[] = []

    for (const victima of victimas as Victima[]) {
      // Check birthday
      if (victima.fecha_nacimiento) {
        const fechaNac = new Date(victima.fecha_nacimiento)
        if (fechaNac.getDate() === todayDay && fechaNac.getMonth() + 1 === todayMonth) {
          const anos = currentYear - fechaNac.getFullYear()
          aniversarios.push({
            nombre: victima.nombre_completo || "Sin nombre",
            tipo: "cumpleanos",
            anos,
          })
        }
      }

      // Check death anniversary
      if (victima.fecha_fallecimiento) {
        const fechaFall = new Date(victima.fecha_fallecimiento)
        if (fechaFall.getDate() === todayDay && fechaFall.getMonth() + 1 === todayMonth) {
          const anos = currentYear - fechaFall.getFullYear()
          aniversarios.push({
            nombre: victima.nombre_completo || "Sin nombre",
            tipo: "fallecimiento",
            anos,
          })
        }
      }
    }

    // If no anniversaries today, return early
    if (aniversarios.length === 0) {
      return new Response(JSON.stringify({ message: "No anniversaries today", date: today.toISOString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Build HTML email content
    const formatAniversario = (a: Aniversario) => {
      if (a.tipo === "cumpleanos") {
        return `<li><strong>${a.nombre}</strong> — Cumpleaños (habría cumplido ${a.anos} años)</li>`
      } else {
        return `<li><strong>${a.nombre}</strong> — Aniversario de Fallecimiento (${a.anos} ${a.anos === 1 ? "año" : "años"})</li>`
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e3a5f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          ul { list-style: none; padding: 0; }
          li { padding: 12px; margin: 8px 0; background: white; border-left: 4px solid #1e3a5f; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🕯️ Recordatorio de Aniversarios</h1>
            <p style="margin: 10px 0 0;">Usina de Justicia</p>
          </div>
          <div class="content">
            <p>Hoy, <strong>${today.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>, honramos la memoria de:</p>
            <ul>
              ${aniversarios.map(formatAniversario).join("")}
            </ul>
            <p style="margin-top: 20px; font-style: italic;">En su memoria, seguimos trabajando por la justicia.</p>
          </div>
          <div class="footer">
            <p>Este es un correo automático generado por el Sistema de Gestión de Casos de Usina de Justicia.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Recipients list
    const recipients = [
      "info@usinadejusticia.org",
      // Add more recipients as needed
    ]

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Usina de Justicia <alertas@usinadejusticia.org>",
      to: recipients,
      subject: `🕯️ Recordatorio de Aniversarios - ${today.toLocaleDateString("es-AR")}`,
      html: htmlContent,
    })

    if (emailError) {
      throw new Error(`Error sending email: ${emailError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully`,
        aniversarios: aniversarios.length,
        emailId: emailData?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
