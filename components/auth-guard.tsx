"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import type { User } from "@supabase/supabase-js"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: "farmer" | "investor" | "admin"
  redirectTo?: string
}

export function AuthGuard({ children, requireAuth = true, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // Get user profile for role checking
          if (requiredRole) {
            const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

            setUserProfile(profile)

            // Check if user has required role
            if (profile && profile.role !== requiredRole) {
              router.push("/dashboard") // Redirect to general dashboard
              return
            }
          }
        } else if (requireAuth) {
          router.push(redirectTo)
          return
        }
      } catch (error) {
        console.error("Auth check error:", error)
        if (requireAuth) {
          router.push(redirectTo)
          return
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)

        if (requiredRole) {
          const { data: profile } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          setUserProfile(profile)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserProfile(null)
        if (requireAuth) {
          router.push(redirectTo)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [requireAuth, requiredRole, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect
  }

  if (requiredRole && (!userProfile || userProfile.role !== requiredRole)) {
    return null // Will redirect
  }

  return <>{children}</>
}
