import { supabase } from "./supabase/client"
import type { SignUpInput, SignInInput } from "./validations"

export async function signUp({ email, password, name, role }: SignUpInput) {
  try {
    // First, sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (error) throw error

    // If signup successful and user is created
    if (data.user) {
      // Create user profile in the users table
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role,
        kyc_status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't throw here as the user account was created successfully
        // The profile can be created later
      }

      // If email confirmation is required, inform the user
      if (!data.session) {
        return {
          data,
          error: null,
          message: "Please check your email to confirm your account before signing in.",
        }
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { data: null, error }
  }
}

export async function signIn({ email, password }: SignInInput) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get user profile after successful login
    if (data.user && data.session) {
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        // If profile doesn't exist, create it
        if (profileError.code === "PGRST116") {
          const { error: createError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
            role: data.user.user_metadata?.role || "investor",
            kyc_status: "pending",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (createError) {
            console.error("Profile creation error:", createError)
          }
        }
      }

      // Return user data with profile information
      return {
        data: {
          ...data,
          user: {
            ...data.user,
            ...profile,
          },
        },
        error: null,
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Login error:", error)
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Logout error:", error)
    return { error }
  }
}

export async function getCurrentUser() {
  try {
    // First check if there's an active session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
      return { user: null, error: sessionError }
    }

    // If no session, return null user (not an error)
    if (!session || !session.user) {
      return { user: null, error: null }
    }

    const user = session.user

    // Get user profile
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Profile fetch error:", profileError)
      // Return user without profile if profile fetch fails
      return { user, error: null }
    }

    return {
      user: profile ? { ...user, ...profile } : user,
      error: null,
    }
  } catch (error: any) {
    console.error("Get current user error:", error)
    return { user: null, error: null } // Don't throw errors, just return null user
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error("Update password error:", error)
    return { error }
  }
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error("Auth check error:", error)
    return false
  }
}
