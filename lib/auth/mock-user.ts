export interface MockUser {
  id: string
  email: string
  name: string
  role: string
}

// Usuario mock para desarrollo y testing
export const MOCK_USER: MockUser = {
  id: "mock-user-dev-123",
  email: "desarrollo@usinajusticia.org",
  name: "Usuario de Pruebas",
  role: "admin",
}

// Helper para verificar si estamos en modo desarrollo
export function isMockAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" || process.env.NODE_ENV === "development"
}

// Hook para obtener el usuario actual (mock o real)
export function getCurrentMockUser(): MockUser | null {
  if (isMockAuthEnabled()) {
    console.log("[v0] Mock user activo:", MOCK_USER.email)
    return MOCK_USER
  }
  return null
}
