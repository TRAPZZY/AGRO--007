import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Get environment variables with fallbacks for v0 environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-anon-key"

// Validate that we have proper credentials
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === "" || supabaseAnonKey === "") {
  console.warn("⚠️ Supabase credentials not found. Using demo mode.")
}

// Create Supabase client with error handling
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

// Test connection (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  supabase.auth.getSession().catch((error) => {
    console.warn("Supabase connection test failed:", error.message)
    console.info("App will use mock authentication for demo purposes")
  })
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
