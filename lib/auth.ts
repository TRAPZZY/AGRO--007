import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface AuthUser extends User {
  user_metadata?: {
    name?: string
    role?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  role: "farmer" | "investor" | "admin"
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  kyc_status?: string
  created_at: string
  updated_at: string
}

// Enhanced error handling
export class AuthError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export async function signUp(email: string, password: string, userData: { name: string; role: string }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    })

    if (error) {
      throw new AuthError(error.message, error.message)
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { user: null, error: error.message || "Failed to create account" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new AuthError(error.message, error.message)
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    console.error("Signin error:", error)
    return { user: null, error: error.message || "Failed to sign in" }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error("Signout error:", error)
    return { error: error.message || "Failed to sign out" }
  }
}

export async function getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new AuthError(error.message, error.message)
    }

    return { user: user as AuthUser, error: null }
  } catch (error: any) {
    console.error("Get current user error:", error)
    return { user: null, error: error.message || "Failed to get current user" }
  }
}

export async function getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      if (error.code === "PGRST116") {
        return { profile: null, error: "Profile not found" }
      }
      throw error
    }

    return { profile: data as UserProfile, error: null }
  } catch (error: any) {
    console.error("Get user profile error:", error)
    return { profile: null, error: error.message || "Failed to get user profile" }
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
): Promise<{ profile: UserProfile | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    return { profile: data as UserProfile, error: null }
  } catch (error: any) {
    console.error("Update user profile error:", error)
    return { profile: null, error: error.message || "Failed to update profile" }
  }
}

// Demo login functions for testing
export async function signInAsDemo(role: "farmer" | "investor") {
  const demoCredentials = {
    farmer: { email: "farmer@demo.com", password: "demo123456" },
    investor: { email: "investor@demo.com", password: "demo123456" },
  }

  return signIn(demoCredentials[role].email, demoCredentials[role].password)
}

// Password reset
export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error("Password reset error:", error)
    return { error: error.message || "Failed to send reset email" }
  }
}

// Session management
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback((session?.user as AuthUser) || null)
  })
}
