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

// Demo users for v0 environment
const DEMO_USERS = {
  "farmer@demo.com": {
    id: "demo-farmer-id",
    email: "farmer@demo.com",
    name: "Demo Farmer",
    role: "farmer",
    password: "password123",
  },
  "investor@demo.com": {
    id: "demo-investor-id",
    email: "investor@demo.com",
    name: "Demo Investor",
    role: "investor",
    password: "password123",
  },
  "admin@demo.com": {
    id: "demo-admin-id",
    email: "admin@demo.com",
    name: "Demo Admin",
    role: "admin",
    password: "password123",
  },
}

// Check if we're in v0 environment (CORS issues with Supabase)
const isV0Environment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("v0.dev")
}

// Mock user storage for v0 environment
const mockUserStorage = {
  getUsers: () => {
    if (typeof window === "undefined") return {}
    const users = localStorage.getItem("demo-users")
    return users ? JSON.parse(users) : { ...DEMO_USERS }
  },
  saveUser: (email: string, userData: any) => {
    if (typeof window === "undefined") return
    const users = mockUserStorage.getUsers()
    users[email] = userData
    localStorage.setItem("demo-users", JSON.stringify(users))
  },
  getUser: (email: string) => {
    const users = mockUserStorage.getUsers()
    return users[email] || null
  },
}

// Mock session storage for v0 environment
const mockSessionStorage = {
  getSession: () => {
    if (typeof window === "undefined") return null
    const session = localStorage.getItem("demo-session")
    return session ? JSON.parse(session) : null
  },
  setSession: (user: any) => {
    if (typeof window === "undefined") return
    const session = {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      },
      access_token: "demo-token",
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }
    localStorage.setItem("demo-session", JSON.stringify(session))
  },
  clearSession: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("demo-session")
  },
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

    // In v0 environment, use mock signup
    if (isV0Environment()) {
      // Check if user already exists
      const existingUser = mockUserStorage.getUser(validatedEmail)
      if (existingUser) {
        throw new Error("An account with this email already exists")
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: validatedEmail,
        name: validatedName,
        role: role,
        password: validatedPassword, // In production, this would be hashed
        created_at: new Date().toISOString(),
      }

      // Save user to mock storage
      mockUserStorage.saveUser(validatedEmail, newUser)

      console.log("User created successfully:", { email: validatedEmail, name: validatedName, role })

      return {
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            user_metadata: {
              name: newUser.name,
              role: newUser.role,
            },
          },
        },
        error: null,
      }
    }

    // Real Supabase signup for production
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

    // In v0 environment, use mock authentication
    if (isV0Environment()) {
      // Get user from mock storage (includes both demo users and registered users)
      const user = mockUserStorage.getUser(validatedEmail)

      if (!user) {
        throw new Error("No account found with this email address")
      }

      if (user.password !== validatedPassword) {
        throw new Error("Invalid password")
      }

      // Set session
      mockSessionStorage.setSession(user)

      console.log("User signed in successfully:", { email: validatedEmail, role: user.role })

      return {
        data: {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: {
              name: user.name,
              role: user.role,
            },
          },
        },
        error: null,
      }
    }

    // Real Supabase signin for production
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail,
      password: validatedPassword,
    })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signin error:", error)
    return { data: null, error: error.message || "Login failed" }
  }
}

export async function signOut() {
  try {
    // In v0 environment, clear mock session
    if (isV0Environment()) {
      mockSessionStorage.clearSession()
      console.log("User signed out successfully")
      return { error: null }
    }

    // Real Supabase signout for production
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error: any) {
    return { error: error.message || "Logout failed" }
  }
}

export async function getCurrentUser() {
  try {
    // In v0 environment, get mock user
    if (isV0Environment()) {
      const session = mockSessionStorage.getSession()
      if (session && session.expires_at > Date.now()) {
        return { user: session.user, error: null }
      }
      return { user: null, error: null }
    }

    // Real Supabase user for production
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error

    if (user) {
      // Try to get additional user data, but don't fail if it doesn't work
      try {
        const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()
        return { user: { ...user, ...userData }, error: null }
      } catch {
        // Return basic user data if extended data fetch fails
        return { user, error: null }
      }
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

    // In v0 environment, simulate password reset
    if (isV0Environment()) {
      const user = mockUserStorage.getUser(validatedEmail)
      if (!user) {
        throw new Error("No account found with this email address")
      }
      // Just return success for demo
      return { error: null }
    }

    // Real Supabase password reset for production
    const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    return { error: error.message || "Password reset failed" }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const validatedPassword = passwordSchema.parse(newPassword)

    // In v0 environment, simulate password update
    if (isV0Environment()) {
      const session = mockSessionStorage.getSession()
      if (session?.user?.email) {
        const user = mockUserStorage.getUser(session.user.email)
        if (user) {
          user.password = validatedPassword
          mockUserStorage.saveUser(session.user.email, user)
        }
      }
      return { error: null }
    }

    // Real Supabase password update for production
    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    })

    if (error) throw error

    return { error: null }
  } catch (error: any) {
    return { error: error.message || "Password update failed" }
  }
}

// Helper functions
export async function isAuthenticated() {
  try {
    // In v0 environment, check mock session
    if (isV0Environment()) {
      const session = mockSessionStorage.getSession()
      return !!session && session.expires_at > Date.now()
    }

    // Real Supabase session check for production
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
    return user?.user_metadata?.role || user?.role || null
  } catch (error) {
    return null
  }
}

export async function checkUserPermissions(requiredRole: string) {
  try {
    const { user } = await getCurrentUser()
    if (!user) return false

    const userRole = user.user_metadata?.role || user.role
    const roleHierarchy = { admin: 3, farmer: 2, investor: 1 }
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  } catch (error) {
    return false
  }
}

// Debug function to see all registered users (only in v0 environment)
export function getRegisteredUsers() {
  if (isV0Environment()) {
    return mockUserStorage.getUsers()
  }
  return {}
}
