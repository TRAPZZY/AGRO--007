"use client"

import { useState } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProjectCard } from "@/components/project-card"
import { InvestmentModal } from "@/components/investment-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const mockProjects = [
  {
    id: "1",
    title: "Organic Rice Farming - Kebbi State",
    description:
      "Sustainable rice farming using organic methods to produce high-quality rice for local and export markets.",
    image: "/placeholder.svg?height=200&width=300",
    fundingGoal: 500000,
    amountRaised: 350000,
    category: "crops",
    farmerName: "Aminu Hassan",
    location: "Kebbi State",
  },
  {
    id: "2",
    title: "Modern Poultry Farm Setup",
    description: "Establishing a modern poultry farm with automated feeding systems and climate control.",
    image: "/placeholder.svg?height=200&width=300",
    fundingGoal: 800000,
    amountRaised: 200000,
    category: "poultry",
    farmerName: "Grace Okonkwo",
    location: "Ogun State",
  },
  {
    id: "3",
    title: "Cassava Processing Plant",
    description: "Setting up a cassava processing facility to produce garri, starch, and other cassava products.",
    image: "/placeholder.svg?height=200&width=300",
    fundingGoal: 1200000,
    amountRaised: 900000,
    category: "processing",
    farmerName: "John Adebayo",
    location: "Oyo State",
  },
]

export default function BrowseProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handleInvest = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId)
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const filteredProjects = mockProjects.filter((project) => {
    const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.farmerName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar userRole="investor" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Browse Projects</h1>
            <p className="text-gray-600">Discover agricultural projects to invest in</p>
          </div>

          {/* Filters */}
          <div className="flex space-x-4 mb-8">
            <div className="flex-1">
              <Input
                placeholder="Search projects or farmers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="crops">Crops</SelectItem>
                <SelectItem value="poultry">Poultry</SelectItem>
                <SelectItem value="livestock">Livestock</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} onInvest={handleInvest} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <InvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={selectedProject} />
    </div>
  )
}
