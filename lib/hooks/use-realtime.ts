"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function useRealtime<T>(table: string, initialData: T[] = [], filter?: string) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let subscription: any

    const setupSubscription = async () => {
      try {
        // Initial fetch
        let query = supabase.from(table).select("*")

        if (filter) {
          const [column, operator, value] = filter.split(".")
          query = query.eq(column, value)
        }

        const { data: initialData, error: fetchError } = await query

        if (fetchError) throw fetchError

        setData(initialData || [])
        setError(null)

        // Set up real-time subscription
        const channel = supabase.channel(`${table}_realtime`)

        const subscriptionConfig: any = {
          event: "*",
          schema: "public",
          table,
        }

        if (filter) {
          subscriptionConfig.filter = filter
        }

        channel.on("postgres_changes", subscriptionConfig, (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          setData((current) => {
            switch (eventType) {
              case "INSERT":
                return [...current, newRecord as T]
              case "UPDATE":
                return current.map((item) => ((item as any).id === newRecord.id ? (newRecord as T) : item))
              case "DELETE":
                return current.filter((item) => (item as any).id !== oldRecord.id)
              default:
                return current
            }
          })
        })

        subscription = channel.subscribe()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [table, filter])

  return { data, loading, error, setData }
}
