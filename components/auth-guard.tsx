"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getUserRole } from "@/lib/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()

        if (!user) {
          router.push(redirectTo)
          return
        }

        if (requiredRole) {
          const userRole = user.role || (await getUserRole())
          const roleHierarchy = { admin: 3, farmer: 2, investor: 1 }
          const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
          const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

          if (userLevel < requiredLevel) {
            router.push("/unauthorized")
            return
          }
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
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
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
