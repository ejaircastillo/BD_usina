import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // En modo desarrollo, retornar cliente real pero sin validaciones estrictas
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" || process.env.NODE_ENV === "development"
}
