import { supabase } from "./supabase/client"

export async function uploadFile(file: File, bucket: string, path: string) {
  try {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      throw new Error("File type not allowed. Please upload JPEG, PNG, WebP, or PDF files.")
    }

    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(path)

    return { data: { ...data, publicUrl }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteFile(bucket: string, path: string) {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
