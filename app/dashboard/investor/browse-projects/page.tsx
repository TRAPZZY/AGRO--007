"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProjectCard } from "@/components/project-card"
import { InvestmentModal } from "@/components/investment-modal"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Mock data fallback
const mockProjects = [
  {
    id: "1",
    title: "Organic Rice Farming - Kebbi State",
    description:
      "Sustainable rice farming using organic methods to produce high-quality rice for local and export markets.",
    image_url: "/placeholder.svg?height=200&width=300",
    funding_goal: 500000,
    amount_raised: 350000,
    category: "crops",
    location: "Kebbi State",
    status: "active",
    farmer_id: "farmer1",
    users: { name: "Aminu Hassan" },
    expected_return: 18,
    risk_level: "low",
    created_at: "2024-01-01",
    updated_at: "2024-01-15",
  },
  {
    id: "2",
    title: "Modern Poultry Farm Setup",
    description: "Establishing a modern poultry farm with automated feeding systems and climate control.",
    image_url: "/placeholder.svg?height=200&width=300",
    funding_goal: 800000,
    amount_raised: 200000,
    category: "poultry",
    location: "Ogun State",
    status: "active",
    farmer_id: "farmer2",
    users: { name: "Grace Okonkwo" },
    expected_return: 20,
    risk_level: "medium",
    created_at: "2024-01-20",
    updated_at: "2024-02-01",
  },
]

export default function BrowseProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()
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
          console.error("Supabase error:", fetchError)
          // Use mock data as fallback
          setProjects(mockProjects)
          toast({
            title: "Using Demo Data",
            description: "Connected to demo projects for testing",
            type: "info",
          })
        } else {
          setProjects(data || [])
        }
      } catch (err) {
        console.error("Fetch error:", err)
        // Use mock data as fallback
        setProjects(mockProjects)
        toast({
          title: "Using Demo Data",
          description: "Connected to demo projects for testing",
          type: "info",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [toast])

  const handleInvest = (projectId: string) => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to invest.",
        type: "error",
      })
      return
    }

    const project = projects.find((p) => p.id === projectId)
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.users?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const isActive = project.status === "active"
    return matchesCategory && matchesSearch && isActive
  })

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="investor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="investor" />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Browse Projects</h1>
            <p className="text-gray-600">Discover agricultural projects to invest in</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search projects or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crops">Crops</SelectItem>
                <SelectItem value="poultry">Poultry</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                farmerName={project.users?.name || "Unknown Farmer"}
                onInvest={handleInvest}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found matching your criteria.</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading projects: {error}</p>
            </div>
          )}
        </div>
      </div>

      <InvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={selectedProject} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
