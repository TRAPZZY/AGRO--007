"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function useRealtime<T>(table: string, initialData: T[] = [], filter?: string) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let channel: any

    const setupRealtime = async () => {
      try {
        // Initial fetch
        let query = supabase.from(table).select("*")

        if (filter) {
          query = query.eq(...filter.split("="))
        }

        const { data: fetchedData, error: fetchError } = await query

        if (fetchError) {
          setError(fetchError.message)
        } else {
          setData(fetchedData || [])
        }
      } catch (err) {
        setError("Failed to fetch data")
      } finally {
        setLoading(false)
      }

      // Setup real-time subscription
      channel = supabase
        .channel(`${table}_changes`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setData((current) => [...current, payload.new as T])
            } else if (payload.eventType === "UPDATE") {
              setData((current) => current.map((item: any) => (item.id === payload.new.id ? payload.new : item)))
            } else if (payload.eventType === "DELETE") {
              setData((current) => current.filter((item: any) => item.id !== payload.old.id))
            }
          },
        )
        .subscribe()
    }

    setupRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter])

  return { data, loading, error, refetch: () => setLoading(true) }
}
