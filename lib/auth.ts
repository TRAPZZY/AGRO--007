import { supabase } from "./supabase/client"
import type { SignUpInput, SignInInput } from "./validations"

export async function signUp({ email, password, name, role }: SignUpInput) {
  try {
    // First, sign up the user with Supabase Auth
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

    if (error) {
      console.error("Auth signup error:", error)
      throw error
    }

    // If signup successful and user is created
    if (data.user) {
      console.log("User created successfully:", data.user.id)

      // Wait a moment for the auth user to be fully created
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Create user profile in the users table
      try {
        const profileData = {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          role: role as "farmer" | "investor" | "admin",
          kyc_status: "pending" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        console.log("Creating profile with data:", profileData)

        const { data: profileResult, error: profileError } = await supabase
          .from("users")
          .insert(profileData)
          .select()
          .single()

        if (profileError) {
          console.error("Profile creation error details:", {
            error: profileError,
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          })

          // If it's a duplicate key error, try to update instead
          if (profileError.code === "23505") {
            console.log("Profile already exists, updating instead...")
            const { error: updateError } = await supabase
              .from("users")
              .update({
                name: name.trim(),
                role: role as "farmer" | "investor" | "admin",
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.user.id)

            if (updateError) {
              console.error("Profile update error:", updateError)
            } else {
              console.log("Profile updated successfully")
            }
          } else {
            // For other errors, log but don't fail the signup
            console.error("Profile creation failed, but user account created successfully")
          }
        } else {
          console.log("Profile created successfully:", profileResult)
        }
      } catch (profileErr) {
        console.error("Profile creation exception:", profileErr)
        // Don't throw here - the user account was created successfully
      }

      // Check if email confirmation is required
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
    return {
      data: null,
      error: {
        message: error.message || "Failed to create account. Please try again.",
        code: error.code,
      },
    }
  }
}

export async function signIn({ email, password }: SignInInput) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    })

    if (error) {
      console.error("Login error:", error)
      throw error
    }

    // Get or create user profile after successful login
    if (data.user && data.session) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("Profile fetch error:", profileError)

          // If profile doesn't exist, create it
          if (profileError.code === "PGRST116") {
            console.log("Creating missing profile for existing user...")
            const { error: createError } = await supabase.from("users").insert({
              id: data.user.id,
              email: data.user.email!.toLowerCase().trim(),
              name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
              role: (data.user.user_metadata?.role as "farmer" | "investor" | "admin") || "investor",
              kyc_status: "pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (createError) {
              console.error("Profile creation during login error:", createError)
            } else {
              console.log("Profile created successfully during login")
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
      } catch (profileErr) {
        console.error("Profile handling error during login:", profileErr)
        // Return user data without profile if profile operations fail
        return { data, error: null }
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Login error:", error)
    return {
      data: null,
      error: {
        message: error.message || "Failed to sign in. Please check your credentials.",
        code: error.code,
      },
    }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
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

    try {
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
    } catch (profileErr) {
      console.error("Profile fetch exception:", profileErr)
      return { user, error: null }
    }
  } catch (error: any) {
    console.error("Get current user error:", error)
    return { user: null, error: null }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
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

// Helper function to get user role
export async function getUserRole() {
  try {
    const { user } = await getCurrentUser()
    return user?.role || null
  } catch (error) {
    console.error("Get user role error:", error)
    return null
  }
}
