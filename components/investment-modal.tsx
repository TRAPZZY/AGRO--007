"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: {
    id: string
    title: string
    fundingGoal: number
    amountRaised: number
  } | null
}

export function InvestmentModal({ isOpen, onClose, project }: InvestmentModalProps) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!project) return null

  const remainingAmount = project.fundingGoal - project.amountRaised

  const handleInvest = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    onClose()
    // Show success message
    alert("Investment successful!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {project.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm mb-2">
              <span>Funding Goal:</span>
              <span className="font-semibold">₦{project.fundingGoal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span>Amount Raised:</span>
              <span className="font-semibold">₦{project.amountRaised.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Remaining:</span>
              <span className="font-semibold text-green-600">₦{remainingAmount.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Investment Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={!amount || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Confirm Investment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
