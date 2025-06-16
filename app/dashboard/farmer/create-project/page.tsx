"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    funding_goal: "",
    category: "",
    location: "",
    expected_return: "",
    risk_level: "medium" as "low" | "medium" | "high",
    image_url: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Project title is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = "Project description is required"
    }
    if (!formData.funding_goal || Number(formData.funding_goal) <= 0) {
      newErrors.funding_goal = "Valid funding goal is required"
    }
    if (!formData.category) {
      newErrors.category = "Project category is required"
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    }
    if (!formData.expected_return || Number(formData.expected_return) <= 0) {
      newErrors.expected_return = "Valid expected return is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !validateForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim(),
          farmer_id: user.id,
          category: formData.category,
          location: formData.location.trim(),
          funding_goal: Number(formData.funding_goal),
          expected_return: Number(formData.expected_return),
          risk_level: formData.risk_level,
          image_url: formData.image_url || null,
          status: "active",
          amount_raised: 0,
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Project Created Successfully!",
        description: "Your project is now live and accepting investments.",
        type: "success",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/farmer/my-projects")
      }, 2000)
    } catch (error: any) {
      console.error("Project creation error:", error)
      toast({
        title: "Error Creating Project",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="farmer" />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">Share your farming project with potential investors</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Provide information about your farming project</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Image */}
                  <div>
                    <Label>Project Image</Label>
                    <div className="mt-2">
                      <ImageUpload
                        currentImage={formData.image_url}
                        onUploadComplete={handleImageUpload}
                        bucket="project-images"
                        path="projects"
                        size="lg"
                        shape="square"
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Upload an image that represents your project (optional)
                    </p>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Project Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Rice Farming in Kebbi State"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your project, farming methods, expected outcomes..."
                        rows={4}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="funding_goal">Funding Goal (₦) *</Label>
                      <Input
                        id="funding_goal"
                        type="number"
                        value={formData.funding_goal}
                        onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                        placeholder="500000"
                        min="1000"
                        className={errors.funding_goal ? "border-red-500" : ""}
                      />
                      {errors.funding_goal && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.funding_goal}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="expected_return">Expected Return (%) *</Label>
                      <Input
                        id="expected_return"
                        type="number"
                        value={formData.expected_return}
                        onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                        placeholder="15"
                        min="1"
                        max="100"
                        className={errors.expected_return ? "border-red-500" : ""}
                      />
                      {errors.expected_return && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.expected_return}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select project category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="crops">Crops</SelectItem>
                          <SelectItem value="poultry">Poultry</SelectItem>
                          <SelectItem value="livestock">Livestock</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.category}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="risk_level">Risk Level *</Label>
                      <Select
                        value={formData.risk_level}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setFormData({ ...formData, risk_level: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Kebbi State, Nigeria"
                        className={errors.location ? "border-red-500" : ""}
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
