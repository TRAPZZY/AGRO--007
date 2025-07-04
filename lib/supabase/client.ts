import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// ---------------------------------------------------------------------------
// ✅ ALWAYS-VALID SUPABASE CREDENTIALS
// ---------------------------------------------------------------------------
//   • First try the live NEXT_PUBLIC_* env vars (works in Vercel deployments)
//   • Otherwise fall back to the demo credentials in `.env.example`.
//   • If *both* are missing / invalid, throw a descriptive error so the UI
//     can render a friendly message instead of crashing with “NetworkError”.
const FALLBACK_SUPABASE_URL = "https://kmmswvgtigyzrdfuflhz.supabase.co" // demo project from .env.example
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXN3dmd0aWd5enJkZnVmbGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NzQ1MjUsImV4cCI6MjA2NTE1MDUyNX0.T7PI50-EHty6MuU2gulHloxFbh49rBg9uh1H4lIsNJo"

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim() || FALLBACK_SUPABASE_URL
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim() || FALLBACK_SUPABASE_ANON_KEY

if (!supabaseUrl.startsWith("https://") || supabaseAnonKey.length < 40) {
  /* eslint-disable no-console */
  console.error(
    "[Supabase] Environment variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing or invalid.\n" +
      "Set them in Vercel → Project Settings → Environment Variables, then redeploy.",
  )
  // Throwing prevents the auth client from initialising with an empty URL.
  throw new Error(
    "Supabase credentials not configured – please supply NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  )
}
// ---------------------------------------------------------------------------

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

// Re-export helpers
export { createClient }

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
