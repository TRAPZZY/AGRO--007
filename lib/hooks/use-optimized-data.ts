"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"

interface UseOptimizedDataOptions {
  table: string
  select?: string
  filter?: Record<string, any>
  orderBy?: { column: string; ascending?: boolean }
  enabled?: boolean
  cacheKey?: string
  refetchInterval?: number
}

interface OptimizedDataState<T> {
  data: T[]
  loading: boolean
  error: string | null
  isConnected: boolean
  lastFetch: Date | null
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function useOptimizedData<T>({
  table,
  select = "*",
  filter,
  orderBy,
  enabled = true,
  cacheKey,
  refetchInterval,
}: UseOptimizedDataOptions): OptimizedDataState<T> & {
  refetch: () => Promise<void>
  invalidateCache: () => void
} {
  const [state, setState] = useState<OptimizedDataState<T>>({
    data: [],
    loading: true,
    error: null,
    isConnected: false,
    lastFetch: null,
  })

  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const getCacheKey = useCallback(() => {
    if (cacheKey) return cacheKey
    const filterStr = filter ? JSON.stringify(filter) : ""
    const orderStr = orderBy ? JSON.stringify(orderBy) : ""
    return `${table}-${select}-${filterStr}-${orderStr}`
  }, [table, select, filter, orderBy, cacheKey])

  const getFromCache = useCallback((key: string) => {
    const cached = dataCache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    return null
  }, [])

  const setCache = useCallback((key: string, data: any) => {
    dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    })
  }, [])

  const invalidateCache = useCallback(() => {
    const key = getCacheKey()
    dataCache.delete(key)
  }, [getCacheKey])

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!enabled) return

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      try {
        if (showLoading) {
          setState((prev) => ({ ...prev, loading: true, error: null }))
        }

        // Check cache first
        const cacheKey = getCacheKey()
        const cachedData = getFromCache(cacheKey)
        if (cachedData && showLoading) {
          setState((prev) => ({
            ...prev,
            data: cachedData,
            loading: false,
            lastFetch: new Date(),
          }))
          return
        }

        // Build query
        let query = supabase.from(table).select(select)

        // Apply filters
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }

        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
        }

        const { data, error } = await query

        if (signal.aborted) return

        if (error) {
          throw error
        }

        const fetchedData = data || []

        // Update cache
        setCache(cacheKey, fetchedData)

        setState((prev) => ({
          ...prev,
          data: fetchedData,
          loading: false,
          error: null,
          isConnected: true,
          lastFetch: new Date(),
        }))
      } catch (error: any) {
        if (signal.aborted) return

        console.error(`Error fetching ${table}:`, error)
        const errorMessage = error.message || "Failed to fetch data"

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isConnected: false,
        }))

        // Show toast only for unexpected errors
        if (error.code !== "PGRST116") {
          toast({
            title: "Data Loading Error",
            description: errorMessage,
            type: "error",
          })
        }

        // Retry logic for network errors
        if (error.code === "NETWORK_ERROR" || error.message.includes("fetch")) {
          retryTimeoutRef.current = setTimeout(() => {
            fetchData(false)
          }, 3000)
        }
      }
    },
    [enabled, table, select, filter, orderBy, getCacheKey, getFromCache, setCache, toast],
  )

  const refetch = useCallback(async () => {
    invalidateCache()
    await fetchData(true)
  }, [fetchData, invalidateCache])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      refetchIntervalRef.current = setInterval(() => {
        fetchData(false)
      }, refetchInterval)

      return () => {
        if (refetchIntervalRef.current) {
          clearInterval(refetchIntervalRef.current)
        }
      }
    }
  }, [refetchInterval, fetchData])

  // Set up real-time subscription
  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`${table}_optimized_${Date.now()}`)
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

            setState((currentState) => {
              const newData = [...currentState.data]

              switch (eventType) {
                case "INSERT":
                  // Check if record matches our filters
                  if (filter) {
                    const matchesFilter = Object.entries(filter).every(([key, value]) => newRecord[key] === value)
                    if (!matchesFilter) return currentState
                  }
                  newData.unshift(newRecord as T)
                  break

                case "UPDATE":
                  const updateIndex = newData.findIndex((item: any) => item.id === newRecord.id)
                  if (updateIndex !== -1) {
                    newData[updateIndex] = newRecord as T
                  }
                  break

                case "DELETE":
                  const deleteIndex = newData.findIndex((item: any) => item.id === oldRecord.id)
                  if (deleteIndex !== -1) {
                    newData.splice(deleteIndex, 1)
                  }
                  break

                default:
                  return currentState
              }

              // Update cache
              const cacheKey = getCacheKey()
              setCache(cacheKey, newData)

              return {
                ...currentState,
                data: newData,
                isConnected: true,
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
        setState((prev) => ({
          ...prev,
          isConnected: status === "SUBSCRIBED",
        }))
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, getCacheKey, setCache, toast, enabled])

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current)
      }
    }
  }, [])

  return {
    ...state,
    refetch,
    invalidateCache,
  }
}
