"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Plus, Eye, Edit, Trash2, TrendingUp, Calendar, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Project } from "@/lib/types"

// Mock data - replace with actual API calls
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Organic Rice Farming - Kebbi State",
    description:
      "Sustainable rice farming using organic methods to produce high-quality rice for local and export markets. This project focuses on implementing modern irrigation systems and organic pest control methods.",
    farmer_id: "farmer1",
    farmer_name: "John Farmer",
    category: "crops",
    location: "Kebbi State",
    funding_goal: 500000,
    amount_raised: 450000,
    status: "active",
    image_url: "/placeholder.svg?height=200&width=300",
    start_date: "2024-01-15",
    end_date: "2024-12-15",
    expected_return: 18,
    risk_level: "low",
    created_at: "2024-01-01",
    updated_at: "2024-01-15",
  },
  {
    id: "2",
    title: "Modern Poultry Farm Setup",
    description:
      "Establishing a modern poultry farm with automated feeding systems, climate control, and biosecurity measures to ensure high-quality egg and meat production.",
    farmer_id: "farmer1",
    farmer_name: "John Farmer",
    category: "poultry",
    location: "Ogun State",
    funding_goal: 800000,
    amount_raised: 200000,
    status: "active",
    image_url: "/placeholder.svg?height=200&width=300",
    start_date: "2024-02-01",
    end_date: "2024-11-30",
    expected_return: 22,
    risk_level: "medium",
    created_at: "2024-01-20",
    updated_at: "2024-02-01",
  },
  {
    id: "3",
    title: "Cassava Processing Plant",
    description:
      "Setting up a cassava processing facility to produce garri, starch, and other cassava products for both local consumption and export opportunities.",
    farmer_id: "farmer1",
    farmer_name: "John Farmer",
    category: "processing",
    location: "Oyo State",
    funding_goal: 1200000,
    amount_raised: 1200000,
    status: "funded",
    image_url: "/placeholder.svg?height=200&width=300",
    start_date: "2023-12-01",
    end_date: "2024-08-31",
    expected_return: 25,
    risk_level: "medium",
    created_at: "2023-11-15",
    updated_at: "2024-01-10",
  },
]

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setProjects(mockProjects)
      } catch (err) {
        setError("Failed to load projects. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "funded":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskColor = (risk: Project["risk_level"]) => {
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
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <DashboardSidebar userRole="farmer" userName="John Farmer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <DashboardSidebar userRole="farmer" userName="John Farmer" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-1">Manage and track your farming projects</p>
            </div>
            <Link href="/dashboard/farmer/create-project">
              <Button className="agro-button">
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </Button>
            </Link>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Projects</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {projects.filter((p) => p.status === "active").length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Raised</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₦{projects.reduce((sum, p) => sum + p.amount_raised, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">94%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="agro-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first farming project to start raising funds</p>
                <Link href="/dashboard/farmer/create-project">
                  <Button className="agro-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => {
                const progressPercentage = (project.amount_raised / project.funding_goal) * 100

                return (
                  <Card key={project.id} className="agro-card overflow-hidden">
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
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
    </div>
  )
}
