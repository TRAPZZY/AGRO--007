import { supabase } from "../supabase/client"
import type { ProjectInput } from "../validations"

export async function createProject(projectData: ProjectInput & { farmer_id: string }) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        ...projectData,
        status: "draft",
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getProjects(filters?: {
  category?: string
  status?: string
  farmer_id?: string
}) {
  try {
    let query = supabase.from("projects").select(`
        *,
        users!projects_farmer_id_fkey(name)
      `)

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category)
    }

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.farmer_id) {
      query = query.eq("farmer_id", filters.farmer_id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getProject(id: string) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        users!projects_farmer_id_fkey(name, location, avatar_url)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateProject(id: string, updates: Partial<ProjectInput>) {
  try {
    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function deleteProject(id: string) {
  try {
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}
