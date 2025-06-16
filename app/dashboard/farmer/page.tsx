"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Plus, DollarSign, Users, TrendingUp, Leaf } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: 0,
    activeInvestors: 0,
    successRate: 0,
  })
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await getCurrentUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUser(user)
      await fetchStats(user.id)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const fetchStats = async (farmerId: string) => {
    try {
      // Fetch projects stats
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("farmer_id", farmerId)

      if (projectsError) throw projectsError

      // Fetch investments for this farmer's projects
      const projectIds = projects?.map((p) => p.id) || []
      const { data: investments, error: investmentsError } = await supabase
        .from("investments")
        .select("*")
        .in("project_id", projectIds)

      if (investmentsError) throw investmentsError

      const totalRaised = projects?.reduce((sum, p) => sum + (p.amount_raised || 0), 0) || 0
      const uniqueInvestors = new Set(investments?.map((inv) => inv.investor_id)).size
      const completedProjects = projects?.filter((p) => p.status === "completed").length || 0
      const successRate = projects?.length ? Math.round((completedProjects / projects.length) * 100) : 0

      setStats({
        totalProjects: projects?.length || 0,
        totalRaised,
        activeInvestors: uniqueInvestors,
        successRate,
      })
    } catch (error: any) {
      console.error("Error fetching stats:", error)
    }
  }

  // Real-time subscription for project updates
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("farmer_dashboard")
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
            // Show notification for new investments
            if (payload.new.amount_raised > payload.old.amount_raised) {
              const newInvestment = payload.new.amount_raised - payload.old.amount_raised
              toast({
                title: "New Investment Received!",
                description: `₦${newInvestment.toLocaleString()} invested in ${payload.new.title}`,
                type: "success",
              })
            }
          }
          // Refresh stats
          fetchStats(user.id)
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="farmer" />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.user_metadata?.name || user?.email}!
            </h1>
            <p className="text-gray-600 mt-2">Manage your agricultural projects and track your progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.totalProjects}</div>
                <p className="text-xs text-muted-foreground">Active farming projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">₦{stats.totalRaised.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From all investments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.activeInvestors}</div>
                <p className="text-xs text-muted-foreground">Supporting your projects</p>
              </CardContent>
            </Card>

            <Card>
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
            <Card>
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
                  <Button variant="outline" className="w-full">
                    View My Projects
                  </Button>
                </Link>
                <Link href="/dashboard/farmer/profile">
                  <Button variant="outline" className="w-full">
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
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
