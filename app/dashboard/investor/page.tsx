"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TrendingUp, DollarSign, Target, Activity, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth"
import { getInvestments } from "@/lib/api/investments"
import Image from "next/image"

export default function InvestorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [investments, setInvestments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvested: 0,
    averageReturn: 0,
    activeInvestments: 0,
    portfolioValue: 0,
  })

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) return

        setUser(user)

        // Load investor's investments
        const { data: investmentsData } = await getInvestments(user.id)
        if (investmentsData) {
          setInvestments(investmentsData)

          // Calculate stats
          const totalInvested = investmentsData.reduce((sum, inv) => sum + inv.amount, 0)
          const activeCount = investmentsData.filter((inv) => inv.status === "active").length
          const avgReturn =
            investmentsData.length > 0
              ? investmentsData.reduce((sum, inv) => sum + (inv.actual_return || inv.expected_return), 0) /
                investmentsData.length
              : 0
          const portfolioValue = investmentsData.reduce((sum, inv) => {
            const returnRate = (inv.actual_return || inv.expected_return) / 100
            return sum + inv.amount * (1 + returnRate)
          }, 0)

          setStats({
            totalInvested,
            averageReturn: Math.round(avgReturn * 10) / 10,
            activeInvestments: activeCount,
            portfolioValue: Math.round(portfolioValue),
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
      <AuthGuard requiredRole="investor">
        <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <CollapsibleSidebar userRole="investor" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Loading your portfolio...</p>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="investor">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CollapsibleSidebar userRole="investor" />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Investor"}!</h1>
              <p className="text-gray-600">Track your agricultural investments and discover new opportunities</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats.totalInvested.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across {investments.length} projects</p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Return</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageReturn}%</div>
                  <p className="text-xs text-muted-foreground">Annual return rate</p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeInvestments}</div>
                  <p className="text-xs text-muted-foreground">Currently active</p>
                </CardContent>
              </Card>

              <Card className="agro-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{stats.portfolioValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.portfolioValue > stats.totalInvested ? "+" : ""}
                    {(((stats.portfolioValue - stats.totalInvested) / Math.max(stats.totalInvested, 1)) * 100).toFixed(
                      1,
                    )}
                    % growth
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Investment Activity */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Investment Activity</CardTitle>
                    <CardDescription>Your latest investments and their performance</CardDescription>
                  </div>
                  <Link href="/dashboard/investor/browse-projects">
                    <Button className="agro-button">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Projects
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {investments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
                    <p className="text-gray-600 mb-6">
                      Start investing in agricultural projects to build your portfolio
                    </p>
                    <Link href="/dashboard/investor/browse-projects">
                      <Button className="agro-button">
                        <Search className="w-4 h-4 mr-2" />
                        Browse Projects
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {investments.slice(0, 3).map((investment) => (
                      <div
                        key={investment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={investment.projects?.image_url || "/images/rice-farming.png"}
                              alt={investment.projects?.title || "Project"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{investment.projects?.title}</h3>
                            <p className="text-sm text-gray-600">Invested: ₦{investment.amount.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {investment.actual_return || investment.expected_return}%
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{investment.status}</p>
                        </div>
                      </div>
                    ))}
                    {investments.length > 3 && (
                      <div className="text-center pt-4">
                        <Link href="/dashboard/investor/my-investments">
                          <Button variant="outline">View All Investments</Button>
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
