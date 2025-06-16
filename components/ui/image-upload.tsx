"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, User } from "lucide-react"
import { useUpload } from "@/lib/hooks/use-upload"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  currentImage?: string | null
  onUpload: (url: string) => void
  bucket: string
  path: string
  className?: string
}

export function ImageUpload({ currentImage, onUpload, bucket, path, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, uploading, progress } = useUpload()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${path}/${fileName}`

    const url = await uploadFile(file, bucket, filePath)
    if (url) {
      onUpload(url)
    }
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
          {preview ? (
            <img src={preview || "/placeholder.svg"} alt="Profile preview" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>

        {preview && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
            onClick={clearImage}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">Uploading... {progress}%</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {preview ? "Change Photo" : "Upload Photo"}
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
