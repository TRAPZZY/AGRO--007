import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Use the actual service role key from your .env.example
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kmmswvgtigyzrdfuflhz.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXN3dmd0aWd5enJkZnVmbGh6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTU3NDUyNSwiZXhwIjoyMDY1MTUwNTI1fQ.3dC1XtKKDMPZKgQlWw3ZEfvbYxpDNi0C0pG3a66RVtI"

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
