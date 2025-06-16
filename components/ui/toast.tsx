"use client"

import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./button"
import type { Toast } from "@/lib/hooks/use-toast"

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  const Icon = iconMap[toast.type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${colorMap[toast.type]} animate-in slide-in-from-right`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold">{toast.title}</h4>
          {toast.description && <p className="text-sm mt-1 opacity-90">{toast.description}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onRemove(toast.id)} className="h-6 w-6 p-0 hover:bg-black/10">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <>
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </>
  )
}
