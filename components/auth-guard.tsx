"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getUserRole } from "@/lib/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const { user, error } = await getCurrentUser()

        if (error || !user) {
          router.push(redirectTo)
          return
        }

        if (requiredRole) {
          const userRole = await getUserRole()

          if (!userRole) {
            setError("Unable to determine user role")
            setIsLoading(false)
            return
          }

          // Check role hierarchy
          const roleHierarchy = { admin: 3, farmer: 2, investor: 1 }
          const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
          const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

          if (userLevel < requiredLevel) {
            setError("You don't have permission to access this page")
            setIsLoading(false)
            return
          }
        }

        setIsAuthorized(true)
      } catch (err) {
        console.error("Auth check failed:", err)
        setError("Authentication check failed")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access denied. Redirecting...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
