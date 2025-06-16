import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "demo-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
