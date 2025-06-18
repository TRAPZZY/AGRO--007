"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { useState } from "react"

interface ProjectCardProps {
  id?: string
  title?: string
  description?: string
  image?: string
  image_url?: string
  fundingGoal?: number
  funding_goal?: number
  amountRaised?: number
  amount_raised?: number
  category?: string
  farmerName?: string
  farmer_name?: string
  location?: string
  onInvest?: (projectId: string) => void
  expected_return?: number
  risk_level?: string
}

export function ProjectCard({
  id = "",
  title = "Untitled Project",
  description = "No description available",
  image,
  image_url,
  fundingGoal,
  funding_goal,
  amountRaised,
  amount_raised,
  category = "general",
  farmerName,
  farmer_name,
  location = "Unknown Location",
  onInvest,
  expected_return = 0,
  risk_level = "medium",
}: ProjectCardProps) {
  const [imageError, setImageError] = useState(false)

  // Normalize prop names and provide defaults
  const projectId = id || ""
  const projectTitle = title || "Untitled Project"
  const projectDescription = description || "No description available"
  const projectImage = image_url || image || "/placeholder.svg?height=200&width=300"
  const projectFundingGoal = funding_goal || fundingGoal || 0
  const projectAmountRaised = amount_raised || amountRaised || 0
  const projectCategory = category || "general"
  const projectFarmerName = farmerName || farmer_name || "Unknown Farmer"
  const projectLocation = location || "Unknown Location"
  const projectExpectedReturn = expected_return || 0
  const projectRiskLevel = risk_level || "medium"

  // Safe calculation with fallback
  const progressPercentage = projectFundingGoal > 0 ? (projectAmountRaised / projectFundingGoal) * 100 : 0

  const handleInvestClick = () => {
    if (onInvest && projectId) {
      onInvest(projectId)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <Image
            src={projectImage || "/placeholder.svg"}
            alt={projectTitle}
            fill
            className="object-cover"
            onError={handleImageError}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <p className="text-sm">Project Image</p>
            </div>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-green-600 text-white">
          {projectCategory.charAt(0).toUpperCase() + projectCategory.slice(1)}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-2">{projectTitle}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{projectDescription}</p>
        <div className="text-sm text-gray-500">
          <p>Farmer: {projectFarmerName}</p>
          <p>Location: {projectLocation}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Raised</p>
              <p className="font-semibold">₦{projectAmountRaised.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Goal</p>
              <p className="font-semibold">₦{projectFundingGoal.toLocaleString()}</p>
            </div>
          </div>
          {projectExpectedReturn > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Expected Return</span>
              <span className="font-semibold text-green-600">{projectExpectedReturn}%</span>
            </div>
          )}
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleInvestClick}
            disabled={!projectId || !onInvest}
          >
            Invest Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
