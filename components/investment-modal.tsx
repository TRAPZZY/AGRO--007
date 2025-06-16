"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { MapPin, Target, TrendingUp, AlertTriangle, DollarSign } from "lucide-react"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: any
}

export function InvestmentModal({ isOpen, onClose, project }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  const validateAmount = (value: string) => {
    const numValue = Number(value)
    const newErrors: Record<string, string> = {}

    if (!value || isNaN(numValue) || numValue <= 0) {
      newErrors.amount = "Please enter a valid amount"
    } else if (numValue < 1000) {
      newErrors.amount = "Minimum investment is ₦1,000"
    } else if (project && numValue > remainingAmount) {
      newErrors.amount = "Amount exceeds remaining funding needed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInvest = async () => {
    if (!user || !project || !validateAmount(amount)) return

    const investmentAmount = Number(amount)
    setIsLoading(true)

    try {
      // Create investment record
      const { data: investment, error: investmentError } = await supabase
        .from("investments")
        .insert({
          investor_id: user.id,
          project_id: project.id,
          amount: investmentAmount,
          expected_return: project.expected_return || 15,
          status: "active",
        })
        .select()
        .single()

      if (investmentError) throw investmentError

      // Update project funding
      const newAmountRaised = (project.amount_raised || 0) + investmentAmount
      const newStatus = newAmountRaised >= (project.funding_goal || 0) ? "funded" : "active"

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          amount_raised: newAmountRaised,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", project.id)

      if (updateError) throw updateError

      toast({
        title: "Investment Successful!",
        description: `You've invested ₦${investmentAmount.toLocaleString()} in ${project.title || "this project"}`,
        type: "success",
      })

      onClose()
      setAmount("")
      setErrors({})
    } catch (error: any) {
      console.error("Investment error:", error)
      toast({
        title: "Investment Failed",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Return null if no project
  if (!project) return null

  // Safe property access with defaults
  const projectTitle = project.title || "Unknown Project"
  const projectLocation = project.location || "Unknown Location"
  const projectFundingGoal = project.funding_goal || 0
  const projectAmountRaised = project.amount_raised || 0
  const projectExpectedReturn = project.expected_return || 15
  const projectRiskLevel = project.risk_level || "medium"

  const remainingAmount = Math.max(0, projectFundingGoal - projectAmountRaised)
  const progressPercentage = projectFundingGoal > 0 ? (projectAmountRaised / projectFundingGoal) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Invest in Project
          </DialogTitle>
          <DialogDescription>Make an investment in {projectTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {projectLocation}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1 text-blue-600" />
                <span>Goal: ₦{projectFundingGoal.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
                <span>Return: {projectExpectedReturn}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Raised: ₦{projectAmountRaised.toLocaleString()}</span>
                <span>Remaining: ₦{remainingAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Investment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Investment Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  if (errors.amount) {
                    validateAmount(e.target.value)
                  }
                }}
                onBlur={() => validateAmount(amount)}
                placeholder="Enter amount"
                min="1000"
                max={remainingAmount}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount ? (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₦1,000 • Maximum: ₦{remainingAmount.toLocaleString()}
                </p>
              )}
            </div>

            {projectRiskLevel === "high" && (
              <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">High Risk Investment</p>
                  <p>This project carries higher risk. Please invest responsibly.</p>
                </div>
              </div>
            )}

            {/* Investment Summary */}
            {amount && !errors.amount && Number(amount) > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-medium text-green-900 mb-2">Investment Summary</h4>
                <div className="space-y-1 text-sm text-green-800">
                  <div className="flex justify-between">
                    <span>Investment Amount:</span>
                    <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Return ({projectExpectedReturn}%):</span>
                    <span className="font-medium">
                      ₦{(Number(amount) * (projectExpectedReturn / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-green-300 pt-1 mt-2">
                    <span>Total Expected Value:</span>
                    <span className="font-bold">
                      ₦{(Number(amount) * (1 + projectExpectedReturn / 100)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading || !amount || !user || remainingAmount <= 0 || !!errors.amount}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                "Invest Now"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
