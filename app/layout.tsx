import type React from "react"
import type { Metadata } from "next"
import { Lato, Montserrat } from "next/font/google"
import "./globals.css"

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Usina de Justicia - Observatorio de Víctimas",
  description: "Sistema de seguimiento y registro de casos de inseguridad",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${lato.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">{children}</body>
    </html>
  )
}
