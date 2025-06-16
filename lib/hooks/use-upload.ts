"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      setUploading(true)
      setProgress(0)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        })
        return null
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      })

      return urlData.publicUrl
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      return null
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  return { uploadFile, uploading, progress }
}
