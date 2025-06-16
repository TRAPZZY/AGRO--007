"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Plus, Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
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
      fetchProjects(user.id)
    }
    checkAuth()
  }, [router])

  const fetchProjects = async (farmerId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("farmer_id", farmerId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("farmer_projects")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `farmer_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setProjects((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)))

            // Show notification for funding updates
            if (payload.new.amount_raised > payload.old.amount_raised) {
              const newInvestment = payload.new.amount_raised - payload.old.amount_raised
              toast({
                title: "New Investment Received!",
                description: `₦${newInvestment.toLocaleString()} invested in ${payload.new.title}`,
                type: "success",
              })
            }
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, toast])

  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId)

      if (error) throw error

      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast({
        title: "Project Deleted",
        description: "Project has been successfully deleted.",
        type: "success",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        type: "error",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "funded":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="farmer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalRaised = projects.reduce((sum, p) => sum + (p.amount_raised || 0), 0)
  const activeProjects = projects.filter((p) => p.status === "active").length
  const fundedProjects = projects.filter((p) => p.status === "funded").length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="farmer" />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage and track your farming projects</p>
            </div>
            <Link href="/dashboard/farmer/create-project">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </Link>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{activeProjects}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Raised</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">₦{totalRaised.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Funded Projects</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{fundedProjects}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first farming project to start raising funds</p>
                <Link href="/dashboard/farmer/create-project">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => {
                const progressPercentage = (project.amount_raised / project.funding_goal) * 100

                return (
                  <Card key={project.id} className="overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={project.image_url || "/placeholder.svg?height=200&width=300"}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={getStatusColor(project.status)} variant="secondary">
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge className={getRiskColor(project.risk_level)} variant="secondary">
                          {project.risk_level.charAt(0).toUpperCase() + project.risk_level.slice(1)} Risk
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>

                        {/* Funding Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Raised</p>
                            <p className="font-semibold text-green-600">₦{project.amount_raised.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Goal</p>
                            <p className="font-semibold">₦{project.funding_goal.toLocaleString()}</p>
                          </div>
                        </div>

                        {/* Expected Return */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Expected Return</span>
                          <span className="font-semibold text-green-600">{project.expected_return}%</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
