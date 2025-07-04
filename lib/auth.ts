import { supabase } from "./supabase/client"
import { z } from "zod"

// Input validation schemas
const emailSchema = z.string().email().min(1).max(255)
const passwordSchema = z.string().min(8).max(128)
const nameSchema = z.string().min(2).max(100)

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting function
function checkRateLimit(key: string, maxAttempts = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// Sanitize input function
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export async function signUp(email: string, password: string, name: string, role: string) {
  try {
    // Input validation
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())
    const validatedPassword = passwordSchema.parse(password)
    const validatedName = nameSchema.parse(sanitizeInput(name))

    // Rate limiting
    if (!checkRateLimit(`signup_${validatedEmail}`)) {
      throw new Error("Too many signup attempts. Please try again later.")
    }

    // Role validation
    if (!["farmer", "investor"].includes(role)) {
      throw new Error("Invalid role selected")
    }

    const { data, error } = await supabase.auth.signUp({
      email: validatedEmail,
      password: validatedPassword,
      options: {
        data: {
          name: validatedName,
          role: role,
        },
      },
    })

    if (error) throw error

    // Log successful signup
    if (data.user) {
      await logAuditEvent("user_signup", data.user.id, { email: validatedEmail, role })
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { data: null, error: error.message || "Signup failed" }
  }
}

export async function signIn(email: string, password: string, rememberMe = false) {
  try {
    // Input validation
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())
    const validatedPassword = passwordSchema.parse(password)

    // Rate limiting
    if (!checkRateLimit(`signin_${validatedEmail}`)) {
      throw new Error("Too many login attempts. Please try again later.")
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail,
      password: validatedPassword,
    })

    if (error) {
      // Log failed login attempt
      await logAuditEvent("failed_login", null, { email: validatedEmail, error: error.message })
      throw error
    }

    // Update user login stats
    if (data.user) {
      await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          login_count: supabase.raw("login_count + 1"),
          failed_login_attempts: 0,
          locked_until: null,
        })
        .eq("id", data.user.id)

      // Log successful login
      await logAuditEvent("user_login", data.user.id, { email: validatedEmail })
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signin error:", error)
    return { data: null, error: error.message || "Login failed" }
  }
}

export async function signOut() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.auth.signOut()

    if (user) {
      await logAuditEvent("user_logout", user.id, {})
    }

    return { error }
  } catch (error: any) {
    return { error: error.message || "Logout failed" }
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
      // Get additional user data
      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (userError) throw userError

      return { user: { ...user, ...userData }, error: null }
    }

    return { user: null, error: null }
  } catch (error: any) {
    return { user: null, error: error.message || "Failed to get user" }
  }
}

export async function resetPassword(email: string) {
  try {
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())

    // Rate limiting
    if (!checkRateLimit(`reset_${validatedEmail}`, 3)) {
      throw new Error("Too many reset attempts. Please try again later.")
    }

    const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    await logAuditEvent("password_reset_request", null, { email: validatedEmail })

    return { error: null }
  } catch (error: any) {
    return { error: error.message || "Password reset failed" }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const validatedPassword = passwordSchema.parse(newPassword)

    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    })

    if (error) throw error

    // Update password changed timestamp
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("users").update({ password_changed_at: new Date().toISOString() }).eq("id", user.id)

      await logAuditEvent("password_changed", user.id, {})
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message || "Password update failed" }
  }
}

// Audit logging function
async function logAuditEvent(action: string, userId: string | null, details: any) {
  try {
    await supabase.from("audit_logs").insert({
      user_id: userId,
      action,
      new_values: details,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Audit logging failed:", error)
  }
}

// Helper functions
export async function isAuthenticated() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    return false
  }
}

export async function getUserRole() {
  try {
    const { user } = await getCurrentUser()
    return user?.role || null
  } catch (error) {
    return null
  }
}

export async function checkUserPermissions(requiredRole: string) {
  try {
    const { user } = await getCurrentUser()
    if (!user) return false

    const roleHierarchy = { admin: 3, farmer: 2, investor: 1 }
    const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  } catch (error) {
    return false
  }
}
