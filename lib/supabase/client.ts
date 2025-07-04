import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

/* -------------------------------------------------------------------------- */
/*  🛡  SUPABASE INITIALISATION – ALWAYS VALID / ALWAYS SAFE                  */
/* -------------------------------------------------------------------------- */

/**
 * 1.  Try the real env vars first         (✅  Vercel production & preview)
 * 2.  Fallback to public demo credentials (✅  Local dev / CodeSandbox etc.)
 * 3.  If we *still* have nothing valid    (❌  Mis-configuration)
 *     → throw a descriptive error so the UI can recover cleanly.
 */
const FALLBACK_URL = "https://kmmswvgtigyzrdfuflhz.supabase.co"
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXN3dmd0aWd5enJkZnVmbGh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NDk0NjAsImV4cCI6MjA2MTQyNzQ2MH0.f8JTcgA9hMOQav9-YnSs4-tyLztc5NcksGDW9o1JiCw"

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim() || FALLBACK_URL
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim() || FALLBACK_ANON_KEY

/* Basic sanity check so @supabase/auth-js never receives an empty URL */
if (!supabaseUrl.startsWith("https://") || supabaseAnonKey.length < 40) {
  // eslint-disable-next-line no-console
  console.error(
    [
      "🚨  Supabase credentials are missing or invalid.",
      "      → Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "        in Vercel → Project Settings → Environment Variables.",
    ].join("\n"),
  )
  throw new Error("Supabase credentials not configured.")
}

/* -------------------------------------------------------------------------- */
/*  ✅  CREATE THE SHARED CLIENT                                              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  🔄  HELPERS                                                               */
/* -------------------------------------------------------------------------- */

export { createClient }

/** Human-readable error mapping */
export const handleSupabaseError = (error: any) => {
  if (error?.code === "PGRST116") return "No data found"
  if (error?.code === "23505") return "This record already exists"
  if (error?.code === "23503") return "Referenced record not found"
  return error?.message || "An unexpected error occurred"
}

/** Typed helper for live Postgres changes */
export const createRealtimeSubscription = (table: string, filter?: string, callback?: (payload: any) => void) => {
  const channel = supabase.channel(`${table}_changes`)

  channel.on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table,
      ...(filter ? { filter } : {}),
    },
    callback || (() => {}),
  )

  return channel.subscribe()
}
