"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, getUserProfile } from "@/lib/auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { AuthUser, UserProfile } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "farmer" | "investor" | "admin"
  fallbackPath?: string
}

export function AuthGuard({ children, requiredRole, fallbackPath = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const { user: currentUser, error: userError } = await getCurrentUser()

        if (!isMounted) return

        if (userError || !currentUser) {
          console.log("No authenticated user, redirecting to login")
          router.push(fallbackPath)
          return
        }

        setUser(currentUser)

        // Get user profile for role information
        const { profile: userProfile, error: profileError } = await getUserProfile(currentUser.id)

        if (!isMounted) return

        if (profileError) {
          console.error("Profile fetch error:", profileError)
          // Try to get role from user metadata as fallback
          const roleFromMetadata = currentUser.user_metadata?.role
          if (roleFromMetadata) {
            setProfile({
              id: currentUser.id,
              email: currentUser.email || "",
              name: currentUser.user_metadata?.name || "User",
              role: roleFromMetadata as "farmer" | "investor" | "admin",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          } else {
            setError("Unable to load user profile")
            return
          }
        } else {
          setProfile(userProfile)
        }

        // Check role-based access
        if (requiredRole && userProfile?.role !== requiredRole) {
          console.log(`Access denied. Required: ${requiredRole}, User: ${userProfile?.role}`)
          router.push(`/dashboard/${userProfile?.role || "investor"}`)
          return
        }

        // Redirect to appropriate dashboard if on login/signup pages
        if (pathname === "/login" || pathname === "/signup") {
          const userRole = userProfile?.role || currentUser.user_metadata?.role || "investor"
          router.push(`/dashboard/${userRole}`)
          return
        }
      } catch (error: any) {
        console.error("Auth guard error:", error)
        if (isMounted) {
          setError("Authentication error occurred")
          router.push(fallbackPath)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [router, pathname, requiredRole, fallbackPath])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return <>{children}</>
}
