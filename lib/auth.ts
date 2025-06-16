import { supabase } from "./supabase/client"
import type { SignUpInput, SignInInput } from "./validations"

export async function signUp({ email, password, name, role }: SignUpInput) {
  try {
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

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role,
        kyc_status: "pending",
      })

      if (profileError) throw profileError
    }

    return { data, error: null }
  } catch (error) {
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
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error

    if (user) {
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileError) throw profileError
      return { user: { ...user, ...profile }, error: null }
    }

    return { user: null, error: null }
  } catch (error) {
    return { user: null, error }
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
    return { error }
  }
}
