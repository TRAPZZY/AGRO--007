"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, DollarSign, Target, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { getProjects } from "@/lib/api/projects"
import Image from "next/image"

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFundsRaised: 0,
    activeProjects: 0,
    successRate: 0,
    totalInvestors: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) return

        setUser(user)

        // Load farmer's projects
        const { data: projectsData } = await getProjects({ farmer_id: user.id })
        if (projectsData) {
          setProjects(projectsData)

          // Calculate stats
          const totalRaised = projectsData.reduce((sum, p) => sum + p.amount_raised, 0)
          const activeCount = projectsData.filter((p) => p.status === "active").length
          const completedCount = projectsData.filter((p) => p.status === "completed").length
          const successRate = projectsData.length > 0 ? (completedCount / projectsData.length) * 100 : 0

          setStats({
            totalFundsRaised: totalRaised,
            activeProjects: activeCount,
            successRate: Math.round(successRate),
            totalInvestors: Math.floor(Math.random() * 200) + 50, // Mock data for now
          })
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <AuthGuard requiredRole="farmer">
        <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <CollapsibleSidebar userRole="farmer" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="farmer">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CollapsibleSidebar userRole="farmer" />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Farmer"}!</h1>
              <p className="text-gray-600">Here's an overview of your farming projects and performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Funds Raised</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats.totalFundsRaised.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalFundsRaised > 0 ? "+12% from last month" : "Start your first project"}
                  </p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                  <p className="text-xs text-muted-foreground">
                    {projects.filter((p) => p.status === "funded").length} fully funded
                  </p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.successRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.successRate >= 80 ? "Excellent performance" : "Keep improving"}
                  </p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInvestors}</div>
                  <p className="text-xs text-muted-foreground">+8 this week</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Projects */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Projects</CardTitle>
                    <CardDescription>Your latest farming projects and their status</CardDescription>
                  </div>
                  <Link href="/dashboard/farmer/create-project">
                    <Button className="agro-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
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
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.slice(0, 3).map((project, index) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={project.image_url || "/images/rice-farming.png"}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{project.title}</h3>
                            <p className="text-sm text-gray-600 capitalize">{project.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{project.amount_raised.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">of ₦{project.funding_goal.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <div className="text-center pt-4">
                        <Link href="/dashboard/farmer/my-projects">
                          <Button variant="outline">View All Projects</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
