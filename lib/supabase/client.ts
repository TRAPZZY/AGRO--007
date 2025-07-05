import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Check if we're in v0 environment to avoid CORS issues
const isV0Environment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("vusercontent.net") || window.location.hostname.includes("v0.dev")
}

// Use safe fallback URLs that won't cause CORS issues in v0
const SAFE_FALLBACK_URL = "https://demo.supabase.co"
const SAFE_FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTg5NzI2MCwiZXhwIjoyMDYxNDczMjYwfQ.demo"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SAFE_FALLBACK_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SAFE_FALLBACK_KEY

// Create client with error handling
let supabase: any

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
} catch (error) {
  console.warn("Supabase client creation failed, using mock client:", error)

  // Create a mock client for v0 environment
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: new Error("Mock client") }),
      }),
    }),
    channel: () => ({
      on: () => ({}),
      subscribe: () => Promise.resolve({ error: null }),
    }),
  }
}

export { supabase, createClient }

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  if (error?.code === "PGRST116") {
    return "No data found"
  }
  if (error?.code === "23505") {
    return "This record already exists"
  }
  if (error?.code === "23503") {
    return "Referenced record not found"
  }
  return error?.message || "An unexpected error occurred"
}

// Real-time subscription helper with error handling
export const createRealtimeSubscription = (table: string, filter?: string, callback?: (payload: any) => void) => {
  try {
    const channel = supabase.channel(`${table}_changes`)

    if (filter) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
        callback || (() => {}),
      )
    } else {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        callback || (() => {}),
      )
    }

    return channel.subscribe()
  } catch (error) {
    console.warn("Real-time subscription failed:", error)
    return Promise.resolve({ error: null })
  }
}
