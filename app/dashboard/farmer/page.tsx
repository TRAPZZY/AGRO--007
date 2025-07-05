"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AuthGuard } from "@/components/auth-guard"
import { Plus, DollarSign, Users, TrendingUp, Leaf } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalRaised: 0,
    activeInvestors: 0,
    successRate: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        // In a real app, you'd fetch actual project data here
        setStats({
          totalProjects: 3,
          totalRaised: 85000,
          activeInvestors: 12,
          successRate: 95,
        })
      }
      setIsLoading(false)
    }

    getUser()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Farmer"

  return (
    <AuthGuard requiredRole="farmer">
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="farmer" userName={userName} />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
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
                        <p className="text-sm font-medium">Welcome to AgroInvest!</p>
                        <p className="text-xs text-gray-500">Your farmer account is ready</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile created</p>
                        <p className="text-xs text-gray-500">Complete your profile to attract investors</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ready to create projects</p>
                        <p className="text-xs text-gray-500">Start your first agricultural project</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
