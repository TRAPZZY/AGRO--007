"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

interface ProjectCardProps {
  id: string
  title: string
  description: string
  image: string
  fundingGoal: number
  amountRaised: number
  category: string
  farmerName: string
  location: string
  onInvest?: (projectId: string) => void
}

export function ProjectCard({
  id,
  title,
  description,
  image,
  fundingGoal,
  amountRaised,
  category,
  farmerName,
  location,
  onInvest,
}: ProjectCardProps) {
  const progressPercentage = (amountRaised / fundingGoal) * 100

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <Badge className="absolute top-2 right-2 bg-green-600">{category}</Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="text-sm text-gray-500">
          <p>Farmer: {farmerName}</p>
          <p>Location: {location}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Raised</p>
              <p className="font-semibold">₦{amountRaised.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Goal</p>
              <p className="font-semibold">₦{fundingGoal.toLocaleString()}</p>
            </div>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onInvest?.(id)}>
            Invest Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
