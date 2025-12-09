import type { SupabaseClient } from "@supabase/supabase-js"

const BUCKET_NAME = "archivos-casos"

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

export async function uploadFile(supabase: SupabaseClient, file: File, folder = "general"): Promise<UploadResult> {
  // Generate unique file name
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
  const filePath = `${folder}/${timestamp}_${sanitizedName}`

  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Upload error:", error)
    return { success: false, error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

  return {
    success: true,
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function deleteFile(supabase: SupabaseClient, filePath: string): Promise<boolean> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    console.error("Delete error:", error)
    return false
  }

  return true
}

export function getFileUrl(supabase: SupabaseClient, filePath: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
  return data.publicUrl
}

export function getPublicFileUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`
}

export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "image"
  if (mimeType.startsWith("video/")) return "video"
  if (mimeType.startsWith("audio/")) return "audio"
  if (mimeType === "application/pdf") return "pdf"
  if (mimeType.includes("word") || mimeType.includes("document")) return "document"
  return "file"
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
