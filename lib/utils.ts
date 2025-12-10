import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateUTC(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const d = new Date(dateString)
  const day = d.getUTCDate()
  const month = d.getUTCMonth() + 1
  const year = d.getUTCFullYear()
  return `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}/${year}`
}
