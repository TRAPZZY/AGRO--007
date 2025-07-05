"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()

        if (!user) {
          setIsAuthenticated(false)
          router.push(redirectTo)
          return
        }

        setIsAuthenticated(true)
        const role = user.profile?.role || user.user_metadata?.role || "investor"
        setUserRole(role)

        // Check role permissions if required
        if (requiredRole && role !== requiredRole) {
          // Redirect based on user's actual role
          if (role === "farmer") {
            router.push("/dashboard/farmer")
          } else if (role === "investor") {
            router.push("/dashboard/investor")
          } else {
            router.push("/dashboard")
          }
          return
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return <>{children}</>
}
