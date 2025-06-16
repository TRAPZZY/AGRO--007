"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
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
  {
    id: "4",
    title: "Cattle Ranch Expansion",
    description: "Expanding cattle ranch operations with improved grazing land and modern facilities.",
    image: "/placeholder.svg?height=200&width=300",
    fundingGoal: 2000000,
    amountRaised: 450000,
    category: "livestock",
    farmerName: "Musa Garba",
    location: "Kaduna State",
  },
]

export default function ProjectsPage() {
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Agricultural Projects</h1>
          <p className="text-xl text-gray-600">Discover and invest in verified farming projects across Nigeria</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      <Footer />

      <InvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={selectedProject} />
    </div>
  )
}
