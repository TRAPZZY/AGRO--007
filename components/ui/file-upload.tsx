"use client"

import type React from "react"

import { useState, useRef } from "react"
import { LoadingSpinner } from "./loading-spinner"
import { Upload, X, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadFile } from "@/lib/storage"
import Image from "next/image"

interface FileUploadProps {
  onUpload: (url: string) => void
  bucket: string
  path: string
  accept?: string
  maxSize?: number
  className?: string
  children?: React.ReactNode
}

export function FileUpload({
  onUpload,
  bucket,
  path,
  accept = "image/*,.pdf",
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  children,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }

    setIsUploading(true)

    try {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${path}/${fileName}`

      const { data, error } = await uploadFile(file, bucket, filePath)

      if (error) throw error

      onUpload(data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative">
          {preview.startsWith("data:image") ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
              <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <FileText className="w-8 h-8 text-gray-500" />
              <span className="text-sm text-gray-700">File selected</span>
              <button onClick={clearPreview} className="ml-auto text-red-500 hover:text-red-700" disabled={isUploading}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
        >
          {children || (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {isUploading ? <LoadingSpinner size="sm" /> : <Upload className="w-6 h-6 text-green-600" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP or PDF up to {Math.round(maxSize / 1024 / 1024)}MB</p>
            </>
          )}
        </div>
      )}

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {isUploading && (
        <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Uploading file...
        </div>
      )}
    </div>
  )
}
