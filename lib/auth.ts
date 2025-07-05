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

// Sign up function
export async function signUp(data: SignUpData) {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(data)

    // Create user account
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
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("Failed to create user account")
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Don't throw here as the auth user was created successfully
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
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

    // Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user || !authData.session) {
      throw new Error("Invalid email or password")
    }

    return { user: authData.user, session: authData.session }
  } catch (error) {
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

// Get current user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    throw new Error(error.message)
  }
  return user
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
