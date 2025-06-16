"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Project = Database["public"]["Tables"]["projects"]["Row"] & {
  users?: Database["public"]["Tables"]["users"]["Row"]
}

type Investment = Database["public"]["Tables"]["investments"]["Row"] & {
  projects?: Project
}

export function useRealTimeProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch projects with user information using explicit join
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select(`
            *,
            users!projects_farmer_id_fkey (
              id,
              name,
              email
            )
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching projects:", fetchError)
          setError(fetchError.message)
          return
        }

        setProjects(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Set up real-time subscription
    const channel = supabase
      .channel("projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        () => {
          fetchProjects()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { projects, loading, error }
}

export function useRealTimeInvestments(userId: string) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const fetchInvestments = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch investments with project and user information
        const { data, error: fetchError } = await supabase
          .from("investments")
          .select(`
            *,
            projects!investments_project_id_fkey (
              *,
              users!projects_farmer_id_fkey (
                id,
                name,
                email
              )
            )
          `)
          .eq("investor_id", userId)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching investments:", fetchError)
          setError(fetchError.message)
          return
        }

        setInvestments(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load investments")
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()

    // Set up real-time subscription
    const channel = supabase
      .channel("investments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
          filter: `investor_id=eq.${userId}`,
        },
        () => {
          fetchInvestments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { investments, loading, error }
}

export function useRealTimeFarmerProjects(farmerId: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!farmerId) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from("projects")
          .select("*")
          .eq("farmer_id", farmerId)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Error fetching farmer projects:", fetchError)
          setError(fetchError.message)
          return
        }

        setProjects(data || [])
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Set up real-time subscription
    const channel = supabase
      .channel("farmer-projects-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `farmer_id=eq.${farmerId}`,
        },
        () => {
          fetchProjects()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [farmerId])

  return { projects, loading, error }
}
