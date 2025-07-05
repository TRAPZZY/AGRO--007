import { supabase } from "./supabase/client"
import { z } from "zod"

// Validation schemas
const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["farmer", "investor"], {
    required_error: "Please select a role",
  }),
})

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>

// Sign up function - simplified to rely on database trigger
export async function signUp(data: SignUpData) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data)

    console.log("Attempting signup with:", { email: validatedData.email, role: validatedData.role })

    // Create user account - the database trigger will handle profile creation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          name: validatedData.name,
          role: validatedData.role,
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("Failed to create user account")
    }

    console.log("Signup successful:", authData.user.id)
    return { user: authData.user, session: authData.session }
  } catch (error) {
    console.error("Signup error:", error)
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map((e) => e.message).join(", "))
    }
    throw error
  }
}

// Sign in function
export async function signIn(data: SignInData) {
  try {
    // Validate input
    const validatedData = signInSchema.parse(data)

    console.log("Attempting signin with:", validatedData.email)

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      console.error("Signin error:", authError)
      throw new Error(authError.message)
    }

    if (!authData.user || !authData.session) {
      throw new Error("Invalid email or password")
    }

    console.log("Signin successful:", authData.user.id)
    return { user: authData.user, session: authData.session }
  } catch (error) {
    console.error("Signin error:", error)
    if (error instanceof z.ZodError) {
      throw new Error(error.errors.map((e) => e.message).join(", "))
    }
    throw error
  }
}

// Sign out function
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

// Get current user with profile data
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw new Error(error.message)
    }

    if (!user) {
      return null
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      // Return user without profile if profile fetch fails
      return { ...user, profile: null }
    }

    return { ...user, profile }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    name: string
    phone: string
    address: string
    bio: string
    avatar_url: string
  }>,
) {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}

// Helper functions for backward compatibility
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

export async function getUserRole() {
  const user = await getCurrentUser()
  return user?.profile?.role || null
}

export async function checkUserPermissions(requiredRole: string) {
  const user = await getCurrentUser()
  if (!user?.profile) return false

  const roleHierarchy = { admin: 3, farmer: 2, investor: 1 }
  const userLevel = roleHierarchy[user.profile.role as keyof typeof roleHierarchy] || 0
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

  return userLevel >= requiredLevel
}
