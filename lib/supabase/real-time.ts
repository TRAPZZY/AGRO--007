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

        // Try explicit join first
        let { data, error: fetchError } = await supabase
          .from("investments")
          .select(`
            *,
            projects (*)
          `)
          .eq("investor_id", userId)
          .order("created_at", { ascending: false })

        // If explicit join fails, use manual join
        if (fetchError || !data) {
          console.log("Using manual join approach")

          const { data: investmentsData, error: invError } = await supabase
            .from("investments")
            .select("*")
            .eq("investor_id", userId)
            .order("created_at", { ascending: false })

          if (invError) throw invError

          const projectIds = investmentsData?.map((inv) => inv.project_id) || []
          const { data: projectsData, error: projError } = await supabase
            .from("projects")
            .select("*")
            .in("id", projectIds)

          if (projError) throw projError

          data =
            investmentsData?.map((investment) => ({
              ...investment,
              projects: projectsData?.find((project) => project.id === investment.project_id) || null,
            })) || []
        }

        setInvestments(data || [])
      } catch (err) {
        console.error("Error fetching investments:", err)
        setError("Failed to load investments")
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()

    // Set up real-time subscription with error handling
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Real-time subscription active")
        } else if (status === "CHANNEL_ERROR") {
          console.error("Real-time subscription error")
        }
      })

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
