"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "info" | "warning"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, type = "info" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, title, description, type }

    setToasts((prev) => [...prev, newToast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, toast, removeToast }
}
