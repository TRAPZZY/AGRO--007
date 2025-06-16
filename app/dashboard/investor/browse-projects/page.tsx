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
import { useRealTimeProjects } from "@/lib/supabase/real-time"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function BrowseProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const { projects, loading, error } = useRealTimeProjects()
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
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

    const project = projects.find((p) => p.id === projectId)
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.users?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    const isActive = project.status === "active" // Only show active projects
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
