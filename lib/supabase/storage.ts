import { createClient } from "./client"

const BUCKET_NAME = "archivos-casos"

export interface UploadResult {
  success: boolean
  path?: string
  url?: string
  error?: string
}

export async function uploadFile(file: File, folder = "general"): Promise<UploadResult> {
  const supabase = createClient()

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

export async function deleteFile(filePath: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    console.error("Delete error:", error)
    return false
  }

  return true
}

export function getFileUrl(filePath: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  return data.publicUrl
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
