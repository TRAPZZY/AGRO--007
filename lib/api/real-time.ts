// Real-time project creation
export const createProject = async (projectData: any) => {
  try {
    // Generate unique ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const project = {
      id: projectId,
      ...projectData,
      amount_raised: 0,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Store in localStorage for demo (in production, use real database)
    const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]")
    existingProjects.push(project)
    localStorage.setItem("projects", JSON.stringify(existingProjects))

    return { data: project, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Real-time investment processing
export const createInvestment = async (investmentData: any) => {
  try {
    const investmentId = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const investment = {
      id: investmentId,
      ...investmentData,
      status: "active",
      created_at: new Date().toISOString(),
    }

    // Update project funding
    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const projectIndex = projects.findIndex((p: any) => p.id === investmentData.project_id)

    if (projectIndex !== -1) {
      projects[projectIndex].amount_raised += investmentData.amount
      if (projects[projectIndex].amount_raised >= projects[projectIndex].funding_goal) {
        projects[projectIndex].status = "funded"
      }
      localStorage.setItem("projects", JSON.stringify(projects))
    }

    // Store investment
    const existingInvestments = JSON.parse(localStorage.getItem("investments") || "[]")
    existingInvestments.push(investment)
    localStorage.setItem("investments", JSON.stringify(existingInvestments))

    return { data: investment, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// Real-time data fetching
export const getProjects = async (filters?: any) => {
  try {
    let projects = JSON.parse(localStorage.getItem("projects") || "[]")

    // Apply filters
    if (filters?.category && filters.category !== "all") {
      projects = projects.filter((p: any) => p.category === filters.category)
    }

    if (filters?.farmer_id) {
      projects = projects.filter((p: any) => p.farmer_id === filters.farmer_id)
    }

    return { data: projects, error: null }
  } catch (error) {
    return { data: [], error }
  }
}

export const getInvestments = async (investor_id: string) => {
  try {
    const investments = JSON.parse(localStorage.getItem("investments") || "[]")
    const userInvestments = investments.filter((inv: any) => inv.investor_id === investor_id)

    // Add project details to investments
    const projects = JSON.parse(localStorage.getItem("projects") || "[]")
    const enrichedInvestments = userInvestments.map((inv: any) => ({
      ...inv,
      project: projects.find((p: any) => p.id === inv.project_id),
    }))

    return { data: enrichedInvestments, error: null }
  } catch (error) {
    return { data: [], error }
  }
}
