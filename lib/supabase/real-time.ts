"use client"

import { supabase } from "./client"
import { useEffect, useState } from "react"

export function useRealTimeProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            users!projects_farmer_id_fkey(name, location)
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setProjects(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Set up real-time subscription
    const subscription = supabase
      .channel("projects_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setProjects((prev) => [payload.new as any, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setProjects((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)))
        } else if (payload.eventType === "DELETE") {
          setProjects((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { projects, loading, error, refetch: () => setLoading(true) }
}

export function useRealTimeInvestments(investorId: string) {
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!investorId) return

    const fetchInvestments = async () => {
      try {
        const { data, error } = await supabase
          .from("investments")
          .select(`
            *,
            projects(
              *,
              users!projects_farmer_id_fkey(name)
            )
          `)
          .eq("investor_id", investorId)
          .order("created_at", { ascending: false })

        if (error) throw error
        setInvestments(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()

    // Real-time subscription
    const subscription = supabase
      .channel("investments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
          filter: `investor_id=eq.${investorId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            fetchInvestments() // Refetch to get project details
          } else if (payload.eventType === "UPDATE") {
            setInvestments((prev) => prev.map((inv) => (inv.id === payload.new.id ? { ...inv, ...payload.new } : inv)))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [investorId])

  return { investments, loading, error }
}
