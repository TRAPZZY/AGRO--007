"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { MapPin, Target, TrendingUp, AlertTriangle, DollarSign, CheckCircle, Shield, Clock } from "lucide-react"
import { z } from "zod"

// Validation schema
const investmentSchema = z.object({
  amount: z.number().min(1000, "Minimum investment is ₦1,000").max(10000000, "Maximum investment is ₦10,000,000"),
  projectId: z.string().uuid("Invalid project ID"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
})

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: any
  onInvestmentSuccess?: () => void
}

export function InvestmentModal({ isOpen, onClose, project, onInvestmentSuccess }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("")
      setErrors({})
      setAcceptedTerms(false)
      setShowConfirmation(false)
    }
  }, [isOpen])

  const validateAmount = useCallback(
    async (value: string) => {
      setIsValidating(true)
      const newErrors: Record<string, string> = {}

      try {
        const numValue = Number(value)

        // Basic validation
        const result = investmentSchema.safeParse({
          amount: numValue,
          projectId: project?.id,
          terms: acceptedTerms,
        })

        if (!result.success) {
          result.error.errors.forEach((error) => {
            if (error.path[0] === "amount") {
              newErrors.amount = error.message
            }
          })
        }

        // Project-specific validation
        if (project && numValue > 0) {
          const remainingAmount = Math.max(0, (project.funding_goal || 0) - (project.amount_raised || 0))

          if (numValue > remainingAmount) {
            newErrors.amount = "Amount exceeds remaining funding needed"
          }

          if (project.min_investment && numValue < project.min_investment) {
            newErrors.amount = `Minimum investment for this project is ₦${project.min_investment.toLocaleString()}`
          }

          if (project.max_investment && numValue > project.max_investment) {
            newErrors.amount = `Maximum investment for this project is ₦${project.max_investment.toLocaleString()}`
          }
        }

        // Simulate API call to check user balance/eligibility
        if (numValue > 0 && !newErrors.amount) {
          await new Promise((resolve) => setTimeout(resolve, 300))

          // In production, check user's available balance
          // const { data: userBalance } = await checkUserBalance(user.id)
          // if (numValue > userBalance) {
          //   newErrors.amount = "Insufficient balance"
          // }
        }
      } catch (error) {
        newErrors.amount = "Error validating amount"
      }

      setErrors(newErrors)
      setIsValidating(false)
      return Object.keys(newErrors).length === 0
    },
    [project, acceptedTerms, user],
  )

  const handleInvest = async () => {
    if (!user || !project || !(await validateAmount(amount)) || !acceptedTerms) return

    const investmentAmount = Number(amount)
    setIsLoading(true)

    try {
      // Start database transaction
      const { data: investment, error: investmentError } = await supabase
        .from("investments")
        .insert({
          investor_id: user.id,
          project_id: project.id,
          amount: investmentAmount,
          expected_return: (investmentAmount * (project.expected_return || 15)) / 100,
          status: "pending", // Start as pending for payment processing
          payment_method: "bank_transfer", // In production, get from payment form
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (investmentError) throw investmentError

      // Update project funding (optimistic update)
      const newAmountRaised = (project.amount_raised || 0) + investmentAmount
      const newStatus = newAmountRaised >= (project.funding_goal || 0) ? "funded" : "active"

      const { error: updateError } = await supabase
        .from("projects")
        .update({
          amount_raised: newAmountRaised,
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === "funded" && { funded_at: new Date().toISOString() }),
        })
        .eq("id", project.id)

      if (updateError) {
        // Rollback investment if project update fails
        await supabase.from("investments").delete().eq("id", investment.id)
        throw updateError
      }

      // Create notification for farmer
      await supabase.from("notifications").insert({
        user_id: project.farmer_id,
        title: "New Investment Received!",
        message: `You received a new investment of ₦${investmentAmount.toLocaleString()} for ${project.title}`,
        type: "success",
        category: "investment",
        action_url: `/dashboard/farmer/my-projects/${project.id}`,
      })

      // Create notification for investor
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Investment Submitted Successfully!",
        message: `Your investment of ₦${investmentAmount.toLocaleString()} in ${project.title} is being processed`,
        type: "success",
        category: "investment",
        action_url: `/dashboard/investor/my-investments`,
      })

      toast({
        title: "Investment Successful! 🎉",
        description: `You've invested ₦${investmentAmount.toLocaleString()} in ${project.title}`,
        type: "success",
        duration: 6000,
        action: {
          label: "View Investments",
          onClick: () => {
            window.location.href = "/dashboard/investor/my-investments"
          },
        },
      })

      onInvestmentSuccess?.()
      onClose()
      setAmount("")
      setErrors({})
      setAcceptedTerms(false)
    } catch (error: any) {
      console.error("Investment error:", error)
      toast({
        title: "Investment Failed",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
        duration: 8000,
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
  const projectMinInvestment = project.min_investment || 1000

  const remainingAmount = Math.max(0, projectFundingGoal - projectAmountRaised)
  const progressPercentage = projectFundingGoal > 0 ? (projectAmountRaised / projectFundingGoal) * 100 : 0

  const isFormValid = amount && !errors.amount && !isValidating && Number(amount) > 0 && acceptedTerms

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            {showConfirmation ? "Confirm Investment" : "Invest in Project"}
          </DialogTitle>
          <DialogDescription>
            {showConfirmation ? "Please review your investment details" : `Make an investment in ${projectTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
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

          {!showConfirmation ? (
            <>
              {/* Investment Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Investment Amount (₦)</Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        if (e.target.value) {
                          validateAmount(e.target.value)
                        } else {
                          setErrors({})
                        }
                      }}
                      placeholder="Enter amount"
                      min={projectMinInvestment}
                      max={remainingAmount}
                      className={`${errors.amount ? "border-red-500" : ""} ${isValidating ? "pr-10" : ""}`}
                      disabled={isLoading}
                    />
                    {isValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                  {errors.amount ? (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {errors.amount}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: ₦{projectMinInvestment.toLocaleString()} • Maximum: ₦{remainingAmount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[projectMinInvestment, 50000, 100000]
                    .filter((amt) => amt <= remainingAmount)
                    .map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAmount(quickAmount.toString())
                          validateAmount(quickAmount.toString())
                        }}
                        disabled={quickAmount > remainingAmount || isLoading}
                        className="text-xs"
                      >
                        ₦{quickAmount.toLocaleString()}
                      </Button>
                    ))}
                </div>

                {/* Risk Warning */}
                {projectRiskLevel === "high" && (
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">High Risk Investment</p>
                      <p>
                        This project carries higher risk. Please invest responsibly and only what you can afford to
                        lose.
                      </p>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I accept the{" "}
                      <a href="/terms" target="_blank" className="text-green-600 hover:underline" rel="noreferrer">
                        Terms and Conditions
                      </a>{" "}
                      and understand the risks involved in agricultural investments.
                    </label>
                  </div>
                </div>

                {/* Investment Summary */}
                {amount && !errors.amount && Number(amount) > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Investment Summary
                    </h4>
                    <div className="space-y-2 text-sm text-green-800">
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
                      <div className="flex justify-between">
                        <span>Project Duration:</span>
                        <span className="font-medium">{project.project_duration_months || 12} months</span>
                      </div>
                      <div className="flex justify-between border-t border-green-300 pt-2 mt-2">
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
              <div className="flex space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!isFormValid || !user || remainingAmount <= 0}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Review Investment
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Confirmation Screen */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Investment Confirmation
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Project:</span>
                      <span className="font-medium">{projectTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Amount:</span>
                      <span className="font-medium">₦{Number(amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Return:</span>
                      <span className="font-medium">
                        ₦{(Number(amount) * (projectExpectedReturn / 100)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        1-2 business days
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Your investment will be processed within 1-2 business days</p>
                  <p>• You will receive email notifications about your investment status</p>
                  <p>• Returns will be paid according to the project timeline</p>
                  <p>• You can track your investment progress in your dashboard</p>
                </div>
              </div>

              {/* Confirmation Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button onClick={handleInvest} className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Investment
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
