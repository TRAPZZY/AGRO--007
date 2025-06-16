"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"

interface UseRealtimeDataOptions {
  table: string
  select?: string
  filter?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  enabled?: boolean
}

export function useRealtimeData<T>({ table, select = "*", filter, orderBy, enabled = true }: UseRealtimeDataOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(table).select(select)

      // Apply filters
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
      }

      const { data: fetchedData, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setData(fetchedData || [])
      setIsConnected(true)
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch data"
      setError(errorMessage)
      console.error(`Error fetching ${table}:`, err)

      // Show toast only for unexpected errors, not for expected ones like "no data"
      if (err.code !== "PGRST116") {
        toast({
          title: "Data Loading Error",
          description: errorMessage,
          type: "error",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [table, select, filter, orderBy, enabled, toast])

  useEffect(() => {
    if (!enabled) return

    fetchData()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${table}_realtime_${Date.now()}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          try {
            const { eventType, new: newRecord, old: oldRecord } = payload

            setData((currentData) => {
              switch (eventType) {
                case "INSERT":
                  // Check if record matches our filters
                  if (filter) {
                    const matchesFilter = Object.entries(filter).every(([key, value]) => newRecord[key] === value)
                    if (!matchesFilter) return currentData
                  }
                  return [...currentData, newRecord as T]

                case "UPDATE":
                  return currentData.map((item: any) => (item.id === newRecord.id ? (newRecord as T) : item))

                case "DELETE":
                  return currentData.filter((item: any) => item.id !== oldRecord.id)

                default:
                  return currentData
              }
            })

            // Show notification for relevant updates
            if (eventType === "INSERT") {
              toast({
                title: "New Update",
                description: `New ${table.slice(0, -1)} added`,
                type: "info",
              })
            }
          } catch (err) {
            console.error("Real-time update error:", err)
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [table, fetchData, filter, toast, enabled])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    isConnected,
    refetch,
  }
}
