"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { getCurrentUser } from "@/lib/auth"
import { useEffect } from "react"

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    funding_goal: "",
    category: "",
    location: "",
    expected_return: "",
    risk_level: "medium" as "low" | "medium" | "high",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()
  const { toasts, toast, removeToast } = useToast()

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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `project-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("project-images").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("project-images").getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    try {
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { data, error } = await supabase
        .from("projects")
        .insert({
          title: formData.title,
          description: formData.description,
          farmer_id: user.id,
          category: formData.category,
          location: formData.location,
          funding_goal: Number.parseInt(formData.funding_goal),
          expected_return: Number.parseInt(formData.expected_return),
          risk_level: formData.risk_level,
          image_url: imageUrl,
          status: "active",
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
      toast({
        title: "Error Creating Project",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
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

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Provide information about your farming project</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Rice Farming in Kebbi State"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project, farming methods, expected outcomes..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="funding_goal">Funding Goal (₦) *</Label>
                    <Input
                      id="funding_goal"
                      type="number"
                      value={formData.funding_goal}
                      onChange={(e) => setFormData({ ...formData, funding_goal: e.target.value })}
                      placeholder="500000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="expected_return">Expected Return (%) *</Label>
                    <Input
                      id="expected_return"
                      type="number"
                      value={formData.expected_return}
                      onChange={(e) => setFormData({ ...formData, expected_return: e.target.value })}
                      placeholder="15"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
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
                  </div>

                  <div>
                    <Label htmlFor="risk_level">Risk Level *</Label>
                    <Select
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
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Kebbi State, Nigeria"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">Project Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
