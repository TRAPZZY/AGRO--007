import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Use the actual Supabase credentials from your .env.example
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kmmswvgtigyzrdfuflhz.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXN3dmd0aWd5enJkZnVmbGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzQ1MjUsImV4cCI6MjA2NTE1MDUyNX0.T7PI50-EHty6MuU2gulHloxFbh49rBg9uh1H4lIsNJo"

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

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

// Real-time subscription helper
export const createRealtimeSubscription = (table: string, filter?: string, callback?: (payload: any) => void) => {
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
}

export { createClient }
