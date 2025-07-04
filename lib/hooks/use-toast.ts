"use client"

import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, type = "info", duration = 5000, action }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      title,
      description,
      type,
      duration,
      action,
    }

    setToasts((prev) => [...prev, newToast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const removeAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toasts,
    toast,
    removeToast,
    removeAllToasts,
  }
}
