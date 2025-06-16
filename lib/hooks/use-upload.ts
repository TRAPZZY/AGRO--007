"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFile = async (
    file: File,
    bucket: string,
    path: string,
    options?: {
      onProgress?: (progress: number) => void
      upsert?: boolean
    },
  ) => {
    setUploading(true)
    setProgress(0)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${path}/${fileName}`

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90)
          options?.onProgress?.(newProgress)
          return newProgress
        })
      }, 100)

      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        upsert: options?.upsert || false,
      })

      clearInterval(progressInterval)

      if (error) throw error

      setProgress(100)
      options?.onProgress?.(100)

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

      return {
        data: {
          ...data,
          publicUrl: urlData.publicUrl,
        },
        error: null,
      }
    } catch (error: any) {
      return {
        data: null,
        error: error.message,
      }
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path])

      return { error: error?.message || null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
  }
}
