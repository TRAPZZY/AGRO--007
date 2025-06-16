"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { useRealTimeInvestments } from "@/lib/supabase/real-time"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Eye, TrendingUp, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Image from "next/image"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function MyInvestmentsPage() {
  const [user, setUser] = useState<any>(null)
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)
    }
    checkAuth()
  }, [router])

  const { investments, loading, error } = useRealTimeInvestments(user?.id || "")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="investor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your investments...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalReturns = investments.reduce((sum, inv) => sum + ((inv.actual_return || 0) * inv.amount) / 100, 0)
  const activeInvestments = investments.filter((inv) => inv.status === "active").length
  const completedInvestments = investments.filter((inv) => inv.status === "completed").length

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="investor" />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Investments</h1>
            <p className="text-gray-600 mt-1">Track your agricultural investment portfolio</p>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">₦{totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Returns</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">₦{totalReturns.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Investments</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{activeInvestments}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{completedInvestments}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investments List */}
          {investments.length === 0 ? (
            <Card>
              <CardContent className="p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-600 mb-6">Start investing in agricultural projects to build your portfolio</p>
                <Button className="bg-green-600 hover:bg-green-700">Browse Projects</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {investments.map((investment) => {
                const project = investment.projects
                if (!project) return null

                const progressPercentage = (project.amount_raised / project.funding_goal) * 100
                const returnDifference = (investment.actual_return || 0) - investment.expected_return
                const isPositiveReturn = returnDifference >= 0

                return (
                  <Card key={investment.id}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
                        {/* Project Image */}
                        <div className="relative w-full lg:w-48 h-32 rounded-lg overflow-hidden">
                          <Image
                            src={project.image_url || "/placeholder.svg?height=128&width=192"}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-2 left-2">
                            <Badge className={getStatusColor(investment.status)} variant="secondary">
                              {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Project Details */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">{project.title}</h3>
                            <p className="text-gray-600 text-sm">
                              by {project.users?.name || "Unknown"} • {project.location}
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Project Progress</span>
                              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                          </div>

                          {/* Investment Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Your Investment</p>
                              <p className="text-base md:text-lg font-semibold text-gray-900">
                                ₦{investment.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Expected Return</p>
                              <p className="text-base md:text-lg font-semibold text-blue-600">
                                {investment.expected_return}%
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Current Return</p>
                              <div className="flex items-center">
                                <p
                                  className={`text-base md:text-lg font-semibold ${isPositiveReturn ? "text-green-600" : "text-red-600"}`}
                                >
                                  {investment.actual_return || 0}%
                                </p>
                                {isPositiveReturn ? (
                                  <ArrowUpRight className="w-4 h-4 text-green-600 ml-1" />
                                ) : (
                                  <ArrowDownRight className="w-4 h-4 text-red-600 ml-1" />
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Projected Value</p>
                              <p className="text-base md:text-lg font-semibold text-green-600">
                                ₦{(investment.amount * (1 + (investment.actual_return || 0) / 100)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:w-32">
                          <Button variant="outline" size="sm" className="flex-1 lg:w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {investment.status === "completed" && (
                            <Button variant="outline" size="sm" className="flex-1 lg:w-full text-green-600">
                              Download Report
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
