"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import {
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
} from "lucide-react"

interface Investment {
  id: string
  amount: number
  created_at: string
  status: string
  expected_return: number
  actual_return: number
  project_id: string
  payment_status: string
  return_status: string
  maturity_date: string | null
  projects?: {
    id: string
    title: string
    description: string
    category: string
    funding_goal: number
    amount_raised: number
    status: string
    expected_return: number
    start_date: string | null
    end_date: string | null
    image_url: string | null
    farmer_id: string
    users?: {
      name: string
      avatar_url: string | null
    }
  } | null
}

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const [expectedReturns, setExpectedReturns] = useState(0)
  const [actualReturns, setActualReturns] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const { toast, toasts, removeToast } = useToast()

  useEffect(() => {
    fetchInvestments()

    // Set up real-time subscription
    const channel = supabase
      .channel("investments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
        },
        (payload) => {
          console.log("Investment change detected:", payload)
          fetchInvestments()

          // Show toast for status changes
          if (payload.eventType === "UPDATE" && payload.new.status !== payload.old?.status) {
            toast({
              title: "Investment Status Updated",
              description: `Investment status changed to ${payload.new.status}`,
              type: "info",
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchInvestments = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true)
      else setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to view your investments")
        return
      }

      // Fetch investments with comprehensive project and farmer data
      let { data, error: fetchError } = await supabase
        .from("investments")
        .select(`
          id,
          amount,
          created_at,
          status,
          expected_return,
          actual_return,
          project_id,
          payment_status,
          return_status,
          maturity_date,
          projects (
            id,
            title,
            description,
            category,
            funding_goal,
            amount_raised,
            status,
            expected_return,
            start_date,
            end_date,
            image_url,
            farmer_id,
            users!projects_farmer_id_fkey (
              name,
              avatar_url
            )
          )
        `)
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false })

      // Fallback to manual join if explicit join fails
      if (fetchError || !data) {
        console.log("Using manual join approach:", fetchError)

        const { data: investmentsData, error: invError } = await supabase
          .from("investments")
          .select("*")
          .eq("investor_id", user.id)
          .order("created_at", { ascending: false })

        if (invError) throw invError

        // Get projects separately
        const projectIds = investmentsData?.map((inv) => inv.project_id) || []
        if (projectIds.length > 0) {
          const { data: projectsData, error: projError } = await supabase
            .from("projects")
            .select(`
              *,
              users!projects_farmer_id_fkey (
                name,
                avatar_url
              )
            `)
            .in("id", projectIds)

          if (projError) throw projError

          // Manually join the data
          data =
            investmentsData?.map((investment) => ({
              ...investment,
              projects: projectsData?.find((project) => project.id === investment.project_id) || null,
            })) || []
        } else {
          data = investmentsData || []
        }
      }

      const investmentsData = data || []
      setInvestments(investmentsData)

      // Calculate comprehensive statistics
      const total = investmentsData.reduce((sum, inv) => sum + inv.amount, 0)
      const expectedReturns = investmentsData.reduce((sum, inv) => sum + (inv.expected_return || 0), 0)
      const actualReturns = investmentsData.reduce((sum, inv) => sum + (inv.actual_return || 0), 0)

      setTotalInvested(total)
      setExpectedReturns(expectedReturns)
      setActualReturns(actualReturns)
      setError(null)
    } catch (err: any) {
      console.error("Investment fetch error:", err)
      setError("Failed to load investments")
      toast({
        title: "Error",
        description: "Failed to load your investments. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your investments...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message={error} onRetry={() => fetchInvestments()} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Investments</h1>
          <p className="text-gray-600">Track and manage your agricultural investments</p>
        </div>
        <Button onClick={() => fetchInvestments(true)} variant="outline" disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {investments.length} investments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{expectedReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Projected earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Returns</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{actualReturns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Realized earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.filter((inv) => inv.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      {investments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start investing in agricultural projects to see them here.
            </p>
            <Button onClick={() => (window.location.href = "/dashboard/investor/browse-projects")}>
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {investments.map((investment) => (
            <Card key={investment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {investment.projects?.image_url && (
                        <img
                          src={investment.projects.image_url || "/placeholder.svg"}
                          alt={investment.projects.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=48&width=48&text=Project"
                          }}
                        />
                      )}
                      <div>
                        <CardTitle className="text-xl">{investment.projects?.title || "Project Title"}</CardTitle>
                        <p className="text-sm text-gray-600">
                          by {investment.projects?.users?.name || "Unknown Farmer"}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {investment.projects?.description || "Project description"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={getStatusColor(investment.status)} variant="secondary">
                      <span className="flex items-center gap-1">
                        {getStatusIcon(investment.status)}
                        {investment.status}
                      </span>
                    </Badge>
                    {investment.payment_status !== "completed" && (
                      <Badge variant="outline" className="text-xs">
                        Payment: {investment.payment_status}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Amount</p>
                    <p className="text-lg font-semibold">₦{investment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Return</p>
                    <p className="text-lg font-semibold text-green-600">
                      ₦{(investment.expected_return || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Return</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ₦{(investment.actual_return || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Project Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              ((investment.projects?.amount_raised || 0) / (investment.projects?.funding_goal || 1)) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm">
                        {Math.round(
                          ((investment.projects?.amount_raised || 0) / (investment.projects?.funding_goal || 1)) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Investment Date</p>
                    <p className="text-sm flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(investment.created_at).toLocaleDateString()}
                    </p>
                    {investment.maturity_date && (
                      <p className="text-xs text-gray-500">
                        Matures: {new Date(investment.maturity_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = `/dashboard/investor/investments/${investment.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // In production, generate and download investment certificate
                      toast({
                        title: "Download Started",
                        description: "Your investment certificate is being prepared",
                        type: "info",
                      })
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
