"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { DollarSign, TrendingUp, PieChart, Target } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export default function InvestorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    expectedReturns: 0,
    portfolioGrowth: 0,
  })
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

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

  const fetchStats = async (investorId: string) => {
    if (!investorId) return

    try {
      // First, get investments without the relationship
      const { data: investments, error } = await supabase.from("investments").select("*").eq("investor_id", investorId)

      if (error) {
        console.error("Stats fetch error:", error)
        // Fallback to demo data if database is unavailable
        setStats({
          totalInvested: 0,
          activeInvestments: 0,
          expectedReturns: 0,
          portfolioGrowth: 0,
        })
        return
      }

      const totalInvested = investments?.reduce((sum, inv) => sum + (inv?.amount || 0), 0) || 0
      const activeInvestments = investments?.filter((inv) => inv?.status === "active").length || 0
      const expectedReturns =
        investments?.reduce((sum, inv) => {
          const amount = inv?.amount || 0
          const expectedReturn = inv?.expected_return || 0
          return sum + amount * (expectedReturn / 100)
        }, 0) || 0
      const portfolioGrowth =
        totalInvested > 0 ? Math.round(((expectedReturns - totalInvested) / totalInvested) * 100) : 0

      setStats({
        totalInvested,
        activeInvestments,
        expectedReturns,
        portfolioGrowth,
      })
    } catch (error: any) {
      console.error("Error fetching stats:", error)
      // Graceful fallback
      setStats({
        totalInvested: 0,
        activeInvestments: 0,
        expectedReturns: 0,
        portfolioGrowth: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id && isInitialized) {
      fetchStats(user.id)
    }
  }, [user?.id, isInitialized])

  // Real-time subscription for investment updates
  useEffect(() => {
    if (!user?.id || !isInitialized) return

    const subscription = supabase
      .channel("investor_dashboard")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
          filter: `investor_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            toast({
              title: "Investment Confirmed!",
              description: `Your investment of ₦${(payload.new.amount || 0).toLocaleString()} has been processed.`,
              type: "success",
            })
          }
          // Refresh stats
          if (user?.id) {
            fetchStats(user.id)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user?.id, isInitialized, toast])

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Safe user data access
  const userName = user?.user_metadata?.name || user?.email || "Investor"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="investor" />

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
                  <Button className="w-full bg-green-600 hover:bg-green-700">Browse Projects</Button>
                </Link>
                <Link href="/dashboard/investor/my-investments">
                  <Button variant="outline" className="w-full">
                    View My Investments
                  </Button>
                </Link>
                <Link href="/dashboard/investor/profile">
                  <Button variant="outline" className="w-full">
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
