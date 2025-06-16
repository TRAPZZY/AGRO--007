import { supabase } from "../supabase/client"
import type { InvestmentInput } from "../validations"

export async function createInvestment(investmentData: InvestmentInput & { investor_id: string }) {
  try {
    // Start a transaction
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("funding_goal, amount_raised, expected_return")
      .eq("id", investmentData.projectId)
      .single()

    if (projectError) throw projectError

    // Check if investment would exceed funding goal
    const newTotal = project.amount_raised + investmentData.amount
    if (newTotal > project.funding_goal) {
      throw new Error("Investment amount exceeds remaining funding needed")
    }

    // Create investment
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .insert({
        investor_id: investmentData.investor_id,
        project_id: investmentData.projectId,
        amount: investmentData.amount,
        expected_return: project.expected_return,
        status: "active",
      })
      .select()
      .single()

    if (investmentError) throw investmentError

    // Update project amount_raised
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        amount_raised: newTotal,
        status: newTotal >= project.funding_goal ? "funded" : "active",
      })
      .eq("id", investmentData.projectId)

    if (updateError) throw updateError

    return { data: investment, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getInvestments(investor_id: string) {
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
      .eq("investor_id", investor_id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getInvestment(id: string) {
  try {
    const { data, error } = await supabase
      .from("investments")
      .select(`
        *,
        projects(*),
        users!investments_investor_id_fkey(name, email)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
