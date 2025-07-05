"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { useOptimizedData } from "@/lib/hooks/use-optimized-data"
import { DollarSign, TrendingUp, PieChart, Target, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Investment {
  id: string
  amount: number
  expected_return: number
  status: string
  created_at: string
}

export default function InvestorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    expectedReturns: 0,
    portfolioGrowth: 0,
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

  // Optimized data fetching for investments
  const {
    data: investments,
    loading: investmentsLoading,
    error: investmentsError,
    isConnected,
    refetch: refetchInvestments,
  } = useOptimizedData<Investment>({
    table: "investments",
    select: "*",
    filter: user?.id ? { investor_id: user.id } : undefined,
    orderBy: { column: "created_at", ascending: false },
    enabled: !!user?.id && isInitialized,
    cacheKey: `investor-investments-${user?.id}`,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Calculate stats from investments data
  const calculatedStats = useMemo(() => {
    if (!investments.length) {
      return {
        totalInvested: 0,
        activeInvestments: 0,
        expectedReturns: 0,
        portfolioGrowth: 0,
      }
    }

    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    const activeInvestments = investments.filter((inv) => inv.status === "active").length
    const expectedReturns = investments.reduce((sum, inv) => {
      const amount = inv.amount || 0
      const expectedReturn = inv.expected_return || 0
      return sum + amount * (expectedReturn / 100)
    }, 0)
    const portfolioGrowth =
      totalInvested > 0 ? Math.round(((expectedReturns - totalInvested) / totalInvested) * 100) : 0

    return {
      totalInvested,
      activeInvestments,
      expectedReturns,
      portfolioGrowth,
    }
  }, [investments])

  // Update stats when investments change
  useEffect(() => {
    setStats(calculatedStats)
  }, [calculatedStats])

  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refetchInvestments()
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

  if (!isInitialized || investmentsLoading) {
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
  const userName = user?.user_metadata?.name || user?.email || "Investor"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="investor" userName={userName} />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with refresh button */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
              <p className="text-gray-600 mt-2">Track your investments and discover new opportunities</p>
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

          {/* Error Alert */}
          {investmentsError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {investmentsError}.{" "}
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
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">₦{stats.totalInvested.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across {investments.length} investments</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                <PieChart className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{stats.activeInvestments}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">₦{stats.expectedReturns.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Projected earnings</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Investment Opportunities</CardTitle>
                <CardDescription>Discover new projects to invest in</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/investor/browse-projects">
                  <Button className="w-full bg-green-600 hover:bg-green-700">Browse Projects</Button>
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

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest investment updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dashboard synchronized</p>
                      <p className="text-xs text-gray-500">Real-time data updated</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Portfolio active</p>
                      <p className="text-xs text-gray-500">{stats.activeInvestments} investments running</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New opportunities available</p>
                      <p className="text-xs text-gray-500">Browse projects to invest</p>
                    </div>
                  </div>
                  {investments.length > 0 && (
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Latest investment</p>
                        <p className="text-xs text-gray-500">
                          {new Date(investments[0]?.created_at).toLocaleDateString()}
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
