"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { useOptimizedData } from "@/lib/hooks/use-optimized-data"
import { Plus, DollarSign, Users, TrendingUp, Leaf, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Project {
  id: string
  title: string
  funding_goal: number
  amount_raised: number
  status: string
  created_at: string
}

interface Investment {
  id: string
  investor_id: string
  project_id: string
  amount: number
  status: string
}

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: 0,
    activeInvestors: 0,
    successRate: 0,
  })
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

  // Initialize user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser()

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

  // Optimized data fetching for projects
  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
    isConnected: projectsConnected,
    refetch: refetchProjects,
  } = useOptimizedData<Project>({
    table: "projects",
    select: "*",
    filter: user?.id ? { farmer_id: user.id } : undefined,
    orderBy: { column: "created_at", ascending: false },
    enabled: !!user?.id && isInitialized,
    cacheKey: `farmer-projects-${user?.id}`,
    refetchInterval: 30000,
  })

  // Get project IDs for investment fetching
  const projectIds = useMemo(() => projects.map((p) => p.id), [projects])

  // Optimized data fetching for investments (for this farmer's projects)
  const {
    data: investments,
    loading: investmentsLoading,
    error: investmentsError,
    isConnected: investmentsConnected,
    refetch: refetchInvestments,
  } = useOptimizedData<Investment>({
    table: "investments",
    select: "*",
    filter: projectIds.length > 0 ? { project_id: projectIds[0] } : undefined, // Simplified for demo
    enabled: projectIds.length > 0 && isInitialized,
    cacheKey: `farmer-investments-${user?.id}`,
  })

  // Calculate stats from projects and investments data
  const calculatedStats = useMemo(() => {
    if (!projects.length) {
      return {
        totalProjects: 0,
        totalRaised: 0,
        activeInvestors: 0,
        successRate: 0,
      }
    }

    const totalRaised = projects.reduce((sum, p) => sum + (p.amount_raised || 0), 0)
    const uniqueInvestors = new Set(investments.map((inv) => inv.investor_id)).size
    const completedProjects = projects.filter((p) => p.status === "completed").length
    const successRate = projects.length ? Math.round((completedProjects / projects.length) * 100) : 0

    return {
      totalProjects: projects.length,
      totalRaised,
      activeInvestors: uniqueInvestors,
      successRate,
    }
  }, [projects, investments])

  // Update stats when data changes
  useEffect(() => {
    setStats(calculatedStats)
  }, [calculatedStats])

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchProjects(), refetchInvestments()])
      toast({
        title: "Data Refreshed",
        description: "Your dashboard data has been updated",
        type: "success",
      })
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        type: "error",
      })
    }
  }

  if (!isInitialized || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Safe user data access
  const userName = user?.user_metadata?.name || user?.email || "Farmer"
  const isConnected = projectsConnected && investmentsConnected

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="farmer" userName={userName} />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with refresh button */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
              <p className="text-gray-600 mt-2">Manage your agricultural projects and track your progress</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                {isConnected ? "Connected" : "Disconnected"}
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Error Alerts */}
          {(projectsError || investmentsError) && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {projectsError || investmentsError}.{" "}
                <button onClick={handleRefresh} className="underline">
                  Try refreshing
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">Active farming projects</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">₦{stats.totalRaised.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From all investments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.activeInvestors}</div>
                <p className="text-xs text-muted-foreground">Supporting your projects</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">Project completion rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with your farming projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/farmer/create-project">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Project
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/my-projects">
                  <Button variant="outline" className="w-full bg-transparent">
                    View My Projects
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/profile">
                  <Button variant="outline" className="w-full bg-transparent">
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest project updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dashboard loaded</p>
                      <p className="text-xs text-gray-500">Real-time data synchronized</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Projects active</p>
                      <p className="text-xs text-gray-500">{stats.totalProjects} projects running</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ready for investments</p>
                      <p className="text-xs text-gray-500">Create projects to attract investors</p>
                    </div>
                  </div>
                  {projects.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Latest project</p>
                        <p className="text-xs text-gray-500">
                          {projects[0]?.title || "Untitled"} - {new Date(projects[0]?.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
