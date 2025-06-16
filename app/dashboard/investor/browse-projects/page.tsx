"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProjectCard } from "@/components/project-card"
import { InvestmentModal } from "@/components/investment-modal"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { useRealtime } from "@/lib/hooks/use-realtime"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Search, Filter } from "lucide-react"

export default function BrowseProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  // Real-time projects data
  const { data: projects, loading, error } = useRealtime("projects", [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)
        setIsInitialized(true)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  const handleInvest = (projectId: string) => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to invest.",
        type: "error",
      })
      return
    }

    const project = projects.find((p: any) => p.id === projectId)
    if (!project) {
      toast({
        title: "Project Not Found",
        description: "The selected project could not be found.",
        type: "error",
      })
      return
    }

    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const filteredProjects = projects.filter((project: any) => {
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesSearch =
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const isActive = project.status === "active"
    const hasRemainingFunding = (project.amount_raised || 0) < (project.funding_goal || 0)

    return matchesCategory && matchesSearch && isActive && hasRemainingFunding
  })

  if (loading || !isInitialized) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="investor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading investment opportunities...</p>
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

            {/* Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <Badge variant="outline" className="px-3 py-1">
                {filteredProjects.length} Available Projects
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                ₦
                {filteredProjects
                  .reduce((sum, p) => sum + ((p.funding_goal || 0) - (p.amount_raised || 0)), 0)
                  .toLocaleString()}{" "}
                Total Funding Needed
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects, locations, or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
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
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">Error loading projects: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-green-600 hover:text-green-700 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProjects.map((project: any) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  title={project.title}
                  description={project.description}
                  image_url={project.image_url}
                  funding_goal={project.funding_goal}
                  amount_raised={project.amount_raised}
                  category={project.category}
                  location={project.location}
                  expected_return={project.expected_return}
                  risk_level={project.risk_level}
                  farmerName="Farmer" // This would come from a join in real implementation
                  onInvest={handleInvest}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No investment opportunities available at the moment"}
              </p>
              {(searchTerm || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("")
                    setCategoryFilter("all")
                  }}
                  className="text-green-600 hover:text-green-700 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <InvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={selectedProject} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
