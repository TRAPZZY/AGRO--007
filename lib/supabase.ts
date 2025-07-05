// This file will contain Supabase configuration
// Add your Supabase URL and anon key here after setting up your project

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Uncomment and configure after adding Supabase
import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Re-export for backwards compatibility from "./supabase/client"
export { supabaseAdmin } from "./supabase/server"
