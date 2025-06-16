"use client"

import type React from "react"

import { useState, useRef } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useUpload } from "@/lib/hooks/use-upload"
import { useToast } from "@/lib/hooks/use-toast"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  currentImage?: string
  onUploadComplete: (url: string) => void
  bucket: string
  path: string
  className?: string
  size?: "sm" | "md" | "lg"
  shape?: "square" | "circle"
  accept?: string
}

export function ImageUpload({
  currentImage,
  onUploadComplete,
  bucket,
  path,
  className,
  size = "md",
  shape = "circle",
  accept = "image/*",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, uploading, progress } = useUpload()
  const { toast } = useToast()

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        type: "error",
      })
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        type: "error",
      })
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
    const { data, error } = await uploadFile(file, bucket, path, {
      onProgress: (progress) => {
        // Progress is handled by the hook
      },
    })

    if (error) {
      toast({
        title: "Upload Failed",
        description: error,
        type: "error",
      })
      setPreview(null)
      return
    }

    if (data?.publicUrl) {
      onUploadComplete(data.publicUrl)
      toast({
        title: "Upload Successful",
        description: "Your image has been uploaded successfully.",
        type: "success",
      })
    }
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayImage = preview || currentImage

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      <div
        className={cn(
          "relative overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer group",
          sizeClasses[size],
          shape === "circle" ? "rounded-full" : "rounded-lg",
          uploading && "pointer-events-none",
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {displayImage ? (
          <>
            <Image
              src={displayImage || "/placeholder.svg"}
              alt="Profile"
              fill
              className="object-cover"
              onError={() => {
                setPreview(null)
              }}
            />
            {!uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Upload className="w-6 h-6 mb-1" />
            <span className="text-xs">Upload</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <LoadingSpinner size="sm" className="mb-2" />
              <div className="text-xs">{progress}%</div>
            </div>
          </div>
        )}

        {preview && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              clearPreview()
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {uploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
