"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProjectCard } from "@/components/project-card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Search, Filter, AlertCircle, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

// Simple Investment Modal Component (inline to avoid chunk loading issues)
function SimpleInvestmentModal({
  isOpen,
  onClose,
  project,
}: {
  isOpen: boolean
  onClose: () => void
  project: any
}) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen || !project) return null

  const handleInvest = async () => {
    if (!amount || Number(amount) < 1000) {
      toast({
        title: "Invalid Amount",
        description: "Minimum investment is ₦1,000",
        type: "error",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate investment for now
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Investment Successful! 🎉",
        description: `You've invested ₦${Number(amount).toLocaleString()} in ${project.title}`,
        type: "success",
      })

      onClose()
      setAmount("")
    } catch (error) {
      toast({
        title: "Investment Failed",
        description: "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Invest in {project.title}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Investment Amount (₦)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1000"
            />
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading || !amount}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Invest Now"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  // Sample projects data as fallback
  const sampleProjects = [
    {
      id: "1",
      title: "Organic Rice Farming Project",
      description:
        "Sustainable rice farming using organic methods to produce high-quality rice for local and export markets.",
      image_url: "/images/rice-farming.png",
      funding_goal: 2500000,
      amount_raised: 1800000,
      category: "crops",
      location: "Kebbi State, Nigeria",
      expected_return: 18,
      risk_level: "medium",
      status: "active",
    },
    {
      id: "2",
      title: "Modern Poultry Farm Expansion",
      description:
        "Expanding poultry operations with modern equipment and facilities to increase egg and meat production.",
      image_url: "/images/poultry-farm.png",
      funding_goal: 3000000,
      amount_raised: 900000,
      category: "poultry",
      location: "Ogun State, Nigeria",
      expected_return: 22,
      risk_level: "low",
      status: "active",
    },
    {
      id: "3",
      title: "Cassava Processing Plant",
      description:
        "Setting up a modern cassava processing facility to produce garri, flour, and starch for commercial distribution.",
      image_url: "/images/cassava-processing.png",
      funding_goal: 5000000,
      amount_raised: 2100000,
      category: "processing",
      location: "Oyo State, Nigeria",
      expected_return: 25,
      risk_level: "medium",
      status: "active",
    },
  ]

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Check authentication
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)

        // Try to fetch real projects, fallback to sample data
        try {
          const { data, error: fetchError } = await supabase.from("projects").select("*").eq("status", "active")

          if (fetchError) {
            console.warn("Database not available, using sample data:", fetchError)
            setProjects(sampleProjects)
          } else {
            setProjects(data || sampleProjects)
          }
        } catch (dbError) {
          console.warn("Database connection failed, using sample data:", dbError)
          setProjects(sampleProjects)
        }

        setError(null)
      } catch (err: any) {
        console.error("Page initialization error:", err)
        setError(err.message || "Failed to load page")
      } finally {
        setLoading(false)
        setIsInitialized(true)
      }
    }

    initializePage()
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

  const handleRetry = () => {
    window.location.reload()
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

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="investor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={handleRetry} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
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

      <SimpleInvestmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} project={selectedProject} />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
