"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { supabase } from "@/lib/supabase/client"
import { useToast } from "@/lib/hooks/use-toast"
import { TrendingUp, Calendar, DollarSign, BarChart3 } from "lucide-react"

interface Investment {
  id: string
  amount: number
  created_at: string
  status: string
  expected_return: number
  project: {
    id: string
    title: string
    description: string
    category: string
    funding_goal: number
    current_funding: number
    status: string
    expected_roi: number
    duration_months: number
  }
}

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalInvested, setTotalInvested] = useState(0)
  const [expectedReturns, setExpectedReturns] = useState(0)
  const { toast } = useToast()

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
        () => {
          fetchInvestments()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchInvestments = async () => {
    try {
      setLoading(true)

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to view your investments")
        return
      }

      // Fetch investments with project details
      const { data, error: fetchError } = await supabase
        .from("investments")
        .select(`
          *,
          projects (
            id,
            title,
            description,
            category,
            funding_goal,
            current_funding,
            status,
            expected_roi,
            duration_months
          )
        `)
        .eq("investor_id", user.id)
        .order("created_at", { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
        toast({
          title: "Error loading investments",
          description: fetchError.message,
          variant: "destructive",
        })
        return
      }

      const investmentsData = data || []
      setInvestments(investmentsData)

      // Calculate totals
      const total = investmentsData.reduce((sum, inv) => sum + inv.amount, 0)
      const returns = investmentsData.reduce((sum, inv) => sum + (inv.expected_return || 0), 0)

      setTotalInvested(total)
      setExpectedReturns(returns)
      setError(null)
    } catch (err) {
      setError("Failed to load investments")
      toast({
        title: "Error",
        description: "Failed to load your investments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <ErrorMessage message={error} onRetry={fetchInvestments} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Investments</h1>
        <Button onClick={fetchInvestments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <Button>Browse Projects</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {investments.map((investment) => (
            <Card key={investment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl">{investment.project?.title}</CardTitle>
                    <p className="text-muted-foreground mt-1">{investment.project?.description}</p>
                  </div>
                  <Badge variant={investment.status === "active" ? "default" : "secondary"}>{investment.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <p className="text-sm text-muted-foreground">Project Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((investment.project?.current_funding || 0) / (investment.project?.funding_goal || 1)) *
                                100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm">
                        {Math.round(
                          ((investment.project?.current_funding || 0) / (investment.project?.funding_goal || 1)) * 100,
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
