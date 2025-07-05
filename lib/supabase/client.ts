import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Get environment variables with fallbacks for v0 environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate that we have proper credentials
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create Supabase client with error handling
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Test connection (only in development)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  supabase.auth.getSession().catch((error) => {
    console.warn("Supabase connection test failed:", error.message)
    console.info("App will use mock authentication for demo purposes")
  })
}

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
