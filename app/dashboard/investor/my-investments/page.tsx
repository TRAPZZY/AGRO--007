"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { Eye, TrendingUp, Calendar, DollarSign, Target, ArrowUpRight, ArrowDownRight } from "lucide-react"
import Image from "next/image"
import type { Investment, Project } from "@/lib/types"

// Mock data - replace with actual API calls
const mockInvestments: (Investment & { project: Project })[] = [
  {
    id: "1",
    investor_id: "investor1",
    project_id: "1",
    amount: 200000,
    status: "active",
    expected_return: 18,
    actual_return: 15,
    created_at: "2024-01-15",
    updated_at: "2024-01-15",
    project: {
      id: "1",
      title: "Organic Rice Farming - Kebbi State",
      description: "Sustainable rice farming using organic methods",
      farmer_id: "farmer1",
      farmer_name: "Aminu Hassan",
      category: "crops",
      location: "Kebbi State",
      funding_goal: 500000,
      amount_raised: 450000,
      status: "active",
      image_url: "/placeholder.svg?height=200&width=300",
      expected_return: 18,
      risk_level: "low",
      created_at: "2024-01-01",
      updated_at: "2024-01-15",
    },
  },
  {
    id: "2",
    investor_id: "investor1",
    project_id: "2",
    amount: 350000,
    status: "completed",
    expected_return: 22,
    actual_return: 25,
    created_at: "2023-12-01",
    updated_at: "2024-01-10",
    project: {
      id: "2",
      title: "Cassava Processing Plant",
      description: "Setting up a cassava processing facility",
      farmer_id: "farmer2",
      farmer_name: "John Adebayo",
      category: "processing",
      location: "Oyo State",
      funding_goal: 1200000,
      amount_raised: 1200000,
      status: "completed",
      image_url: "/placeholder.svg?height=200&width=300",
      expected_return: 22,
      risk_level: "medium",
      created_at: "2023-11-15",
      updated_at: "2024-01-10",
    },
  },
  {
    id: "3",
    investor_id: "investor1",
    project_id: "3",
    amount: 150000,
    status: "active",
    expected_return: 20,
    actual_return: 8,
    created_at: "2024-02-01",
    updated_at: "2024-02-01",
    project: {
      id: "3",
      title: "Modern Poultry Farm Setup",
      description: "Establishing a modern poultry farm",
      farmer_id: "farmer3",
      farmer_name: "Grace Okonkwo",
      category: "poultry",
      location: "Ogun State",
      funding_goal: 800000,
      amount_raised: 300000,
      status: "active",
      image_url: "/placeholder.svg?height=200&width=300",
      expected_return: 20,
      risk_level: "medium",
      created_at: "2024-01-20",
      updated_at: "2024-02-01",
    },
  },
]

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState<(Investment & { project: Project })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setInvestments(mockInvestments)
      } catch (err) {
        setError("Failed to load investments. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  const getStatusColor = (status: Investment["status"]) => {
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

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const totalReturns = investments.reduce((sum, inv) => sum + ((inv.actual_return || 0) * inv.amount) / 100, 0)
  const activeInvestments = investments.filter((inv) => inv.status === "active").length
  const completedInvestments = investments.filter((inv) => inv.status === "completed").length

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <DashboardSidebar userRole="investor" userName="Sarah Investor" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your investments...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <DashboardSidebar userRole="investor" userName="Sarah Investor" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
            <p className="text-gray-600 mt-1">Track your agricultural investment portfolio</p>
          </div>

          {error && <ErrorMessage message={error} className="mb-6" />}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invested</p>
                    <p className="text-2xl font-bold text-gray-900">₦{totalInvested.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Returns</p>
                    <p className="text-2xl font-bold text-green-600">₦{totalReturns.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Investments</p>
                    <p className="text-2xl font-bold text-gray-900">{activeInvestments}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{completedInvestments}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investments List */}
          {investments.length === 0 ? (
            <Card className="agro-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-600 mb-6">Start investing in agricultural projects to build your portfolio</p>
                <Button className="agro-button">Browse Projects</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {investments.map((investment) => {
                const progressPercentage = (investment.project.amount_raised / investment.project.funding_goal) * 100
                const returnDifference = (investment.actual_return || 0) - investment.expected_return
                const isPositiveReturn = returnDifference >= 0

                return (
                  <Card key={investment.id} className="agro-card">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Project Image */}
                        <div className="relative w-full lg:w-48 h-32 rounded-lg overflow-hidden">
                          <Image
                            src={investment.project.image_url || "/placeholder.svg?height=128&width=192"}
                            alt={investment.project.title}
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{investment.project.title}</h3>
                            <p className="text-gray-600 text-sm">
                              by {investment.project.farmer_name} • {investment.project.location}
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
                              <p className="text-lg font-semibold text-gray-900">
                                ₦{investment.amount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Expected Return</p>
                              <p className="text-lg font-semibold text-blue-600">{investment.expected_return}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Current Return</p>
                              <div className="flex items-center">
                                <p
                                  className={`text-lg font-semibold ${isPositiveReturn ? "text-green-600" : "text-red-600"}`}
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
                              <p className="text-lg font-semibold text-green-600">
                                ₦{(investment.amount * (1 + (investment.actual_return || 0) / 100)).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 lg:w-32">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {investment.status === "completed" && (
                            <Button variant="outline" size="sm" className="w-full text-green-600">
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
    </div>
  )
}
