"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { InvestmentModal } from "@/components/investment-modal"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import {
  Search,
  Filter,
  MapPin,
  Target,
  TrendingUp,
  Calendar,
  Users,
  Leaf,
  Shield,
  Star,
  RefreshCw,
} from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  farmer_id: string
  category: string
  location: string
  funding_goal: number
  amount_raised: number
  status: string
  image_url: string | null
  start_date: string | null
  end_date: string | null
  expected_return: number
  risk_level: string
  min_investment: number
  max_investment: number | null
  project_duration_months: number | null
  harvest_season: string | null
  farming_method: string | null
  certifications: string[] | null
  insurance_coverage: boolean
  weather_protection: boolean
  created_at: string
  users?: {
    name: string
    avatar_url: string | null
    kyc_status: string
  }
}

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showInvestmentModal, setShowInvestmentModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)

  const { toast, toasts, removeToast } = useToast()

  useEffect(() => {
    fetchProjects()

    // Set up real-time subscription
    const channel = supabase
      .channel("projects_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
        },
        (payload) => {
          console.log("Project change detected:", payload)
          fetchProjects()

          if (payload.eventType === "INSERT" && payload.new.status === "active") {
            toast({
              title: "New Project Available!",
              description: `${payload.new.title} is now accepting investments`,
              type: "success",
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchProjects = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select(`
          *,
          users!projects_farmer_id_fkey (
            name,
            avatar_url,
            kyc_status
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setProjects(data || [])
      setError(null)
    } catch (err: any) {
      console.error("Projects fetch error:", err)
      setError("Failed to load projects")
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter
      const matchesRisk = riskFilter === "all" || project.risk_level === riskFilter

      return matchesSearch && matchesCategory && matchesRisk
    })

    // Sort projects
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "funding_goal_high":
        filtered.sort((a, b) => b.funding_goal - a.funding_goal)
        break
      case "funding_goal_low":
        filtered.sort((a, b) => a.funding_goal - b.funding_goal)
        break
      case "return_high":
        filtered.sort((a, b) => b.expected_return - a.expected_return)
        break
      case "return_low":
        filtered.sort((a, b) => a.expected_return - b.expected_return)
        break
      case "progress":
        filtered.sort((a, b) => b.amount_raised / b.funding_goal - a.amount_raised / a.funding_goal)
        break
      default:
        break
    }

    return filtered
  }, [projects, searchTerm, categoryFilter, riskFilter, sortBy])

  const handleInvestClick = (project: Project) => {
    setSelectedProject(project)
    setShowInvestmentModal(true)
  }

  const handleInvestmentSuccess = () => {
    fetchProjects(true)
    toast({
      title: "Investment Successful!",
      description: "Your investment has been submitted successfully",
      type: "success",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "crops":
        return <Leaf className="w-4 h-4" />
      case "poultry":
        return <Users className="w-4 h-4" />
      case "livestock":
        return <Users className="w-4 h-4" />
      case "processing":
        return <Target className="w-4 h-4" />
      case "equipment":
        return <Shield className="w-4 h-4" />
      default:
        return <Leaf className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
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
      <div className="container mx-auto p-6">
        <ErrorMessage message={error} onRetry={() => fetchProjects()} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Browse Projects</h1>
          <p className="text-gray-600">Discover agricultural investment opportunities</p>
        </div>
        <Button onClick={() => fetchProjects(true)} variant="outline" disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <p className="text-sm text-gray-600">
                {filteredProjects.length} of {projects.length} projects
              </p>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
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

                <div>
                  <label className="text-sm font-medium mb-2 block">Risk Level</label>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Risk Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="funding_goal_high">Highest Funding Goal</SelectItem>
                      <SelectItem value="funding_goal_low">Lowest Funding Goal</SelectItem>
                      <SelectItem value="return_high">Highest Return</SelectItem>
                      <SelectItem value="return_low">Lowest Return</SelectItem>
                      <SelectItem value="progress">Most Funded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setCategoryFilter("all")
                      setRiskFilter("all")
                      setSortBy("newest")
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Try adjusting your search criteria or filters to find more projects.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setCategoryFilter("all")
                setRiskFilter("all")
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const progressPercentage = (project.amount_raised / project.funding_goal) * 100
            const remainingAmount = project.funding_goal - project.amount_raised
            const daysLeft = project.end_date
              ? Math.max(
                  0,
                  Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                )
              : null

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img
                    src={project.image_url || "/placeholder.svg?height=200&width=400&text=Project+Image"}
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=Project+Image"
                    }}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className={getRiskColor(project.risk_level)} variant="secondary">
                      {project.risk_level} risk
                    </Badge>
                    {project.insurance_coverage && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Insured
                      </Badge>
                    )}
                  </div>
                  {project.users?.kyc_status === "approved" && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        {getCategoryIcon(project.category)}
                        <span className="ml-1 capitalize">{project.category}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Farmer Info */}
                    <div className="flex items-center gap-2">
                      <img
                        src={project.users?.avatar_url || "/placeholder.svg?height=32&width=32&text=F"}
                        alt={project.users?.name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=32&width=32&text=F"
                        }}
                      />
                      <span className="text-sm font-medium">{project.users?.name || "Unknown Farmer"}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>₦{project.amount_raised.toLocaleString()} raised</span>
                        <span>₦{project.funding_goal.toLocaleString()} goal</span>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                        <span>{project.expected_return}% return</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-1 text-blue-600" />
                        <span>₦{project.min_investment.toLocaleString()} min</span>
                      </div>
                      {daysLeft !== null && (
                        <div className="flex items-center col-span-2">
                          <Calendar className="w-4 h-4 mr-1 text-orange-600" />
                          <span>{daysLeft} days left</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Features */}
                    {(project.certifications?.length || project.weather_protection) && (
                      <div className="flex flex-wrap gap-1">
                        {project.weather_protection && (
                          <Badge variant="outline" className="text-xs">
                            Weather Protected
                          </Badge>
                        )}
                        {project.certifications?.slice(0, 2).map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleInvestClick(project)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={remainingAmount <= 0}
                    >
                      {remainingAmount <= 0 ? "Fully Funded" : "Invest Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={showInvestmentModal}
        onClose={() => setShowInvestmentModal(false)}
        project={selectedProject}
        onInvestmentSuccess={handleInvestmentSuccess}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
