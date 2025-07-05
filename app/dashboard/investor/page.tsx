"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AuthGuard } from "@/components/auth-guard"
import { DollarSign, TrendingUp, PieChart, Target, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function InvestorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    expectedReturns: 0,
    portfolioGrowth: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUser(user)
        // In a real app, you'd fetch actual investment data here
        setStats({
          totalInvested: 125000,
          activeInvestments: 8,
          expectedReturns: 156000,
          portfolioGrowth: 24.8,
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

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Investor"

  return (
    <AuthGuard requiredRole="investor">
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="investor" userName={userName} />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
              <p className="text-gray-600 mt-2">Track your investments and discover new opportunities</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">₦{stats.totalInvested.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                  <PieChart className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">{stats.activeInvestments}</div>
                  <p className="text-xs text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">₦{stats.expectedReturns.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Projected earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Growth</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl font-bold">+{stats.portfolioGrowth}%</div>
                  <p className="text-xs text-muted-foreground">Expected growth</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Opportunities</CardTitle>
                  <CardDescription>Discover new projects to invest in</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/dashboard/investor/browse-projects">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Browse Projects
                    </Button>
                  </Link>
                  <Link href="/dashboard/investor/my-investments">
                    <Button variant="outline" className="w-full bg-transparent">
                      View My Investments
                    </Button>
                  </Link>
                  <Link href="/dashboard/investor/profile">
                    <Button variant="outline" className="w-full bg-transparent">
                      Update Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest investment updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Welcome to AgroInvest!</p>
                        <p className="text-xs text-gray-500">Your account is ready for investing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Portfolio initialized</p>
                        <p className="text-xs text-gray-500">Ready to track your investments</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Browse available projects</p>
                        <p className="text-xs text-gray-500">Start investing in agricultural projects</p>
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
