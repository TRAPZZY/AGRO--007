"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ImageUpload } from "@/components/ui/image-upload"
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Mail, Shield, Phone, User } from "lucide-react"
import { NIGERIAN_STATES } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function FarmerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    farmSize: "",
    farmingExperience: "",
    specialization: "",
    certifications: "",
    bankAccount: "",
    bankName: "",
    avatar_url: "",
  })

  const [kycStatus] = useState<"pending" | "approved" | "rejected">("approved")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)
        await loadProfile(user.id)
        setIsInitialized(true)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        throw error
      }

      if (data) {
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          bio: data.bio || "",
          farmSize: data.farm_size || "",
          farmingExperience: data.farming_experience || "",
          specialization: data.specialization || "",
          certifications: data.certifications || "",
          bankAccount: data.bank_account || "",
          bankName: data.bank_name || "",
          avatar_url: data.avatar_url || "",
        })
      }
    } catch (error: any) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error Loading Profile",
        description: "Using default values. You can update your profile below.",
        type: "info",
      })
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio,
        farm_size: profileData.farmSize,
        farming_experience: profileData.farmingExperience,
        specialization: profileData.specialization,
        certifications: profileData.certifications,
        bank_account: profileData.bankAccount,
        bank_name: profileData.bankName,
        avatar_url: profileData.avatar_url,
        role: "farmer",
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Failed to update profile:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        type: "error",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (url: string) => {
    setProfileData((prev) => ({ ...prev, avatar_url: url }))

    // Auto-save avatar
    if (user?.id) {
      try {
        const { error } = await supabase.from("users").upsert({
          id: user.id,
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      } catch (error: any) {
        console.error("Failed to save avatar:", error)
        toast({
          title: "Avatar Save Failed",
          description: "Avatar uploaded but failed to save to profile.",
          type: "warning",
        })
      }
    }
  }

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <CollapsibleSidebar userRole="farmer" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CollapsibleSidebar userRole="farmer" />

      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your farmer profile and account information</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            {/* Main Profile Information */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <ImageUpload
                      currentImage={profileData.avatar_url}
                      onUploadComplete={handleImageUpload}
                      bucket="avatars"
                      path="farmers"
                      size="lg"
                      shape="circle"
                    />
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{profileData.name || "Farmer"}</h3>
                      <p className="text-gray-600">Farmer</p>
                      <Badge className={getKycStatusColor(kycStatus)} variant="secondary">
                        KYC {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="+234 xxx xxx xxxx"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">State</Label>
                      <Select
                        value={profileData.location}
                        onValueChange={(value) => setProfileData({ ...profileData, location: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {NIGERIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1"
                      placeholder="Tell us about your farming experience and expertise..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                      <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Farming Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Farming Information</CardTitle>
                  <CardDescription>Details about your farming experience and specialization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <Label htmlFor="farmSize">Farm Size</Label>
                      <Input
                        id="farmSize"
                        value={profileData.farmSize}
                        onChange={(e) => setProfileData({ ...profileData, farmSize: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="e.g., 25 hectares"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        value={profileData.farmingExperience}
                        onChange={(e) => setProfileData({ ...profileData, farmingExperience: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="e.g., 15 years"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={profileData.specialization}
                      onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1"
                      placeholder="e.g., Crops & Grains, Poultry, Livestock"
                    />
                  </div>

                  <div>
                    <Label htmlFor="certifications">Certifications</Label>
                    <Textarea
                      id="certifications"
                      value={profileData.certifications}
                      onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                      disabled={!isEditing}
                      rows={3}
                      className="mt-1"
                      placeholder="List your farming certifications and qualifications..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                  <CardDescription>Payment details for receiving funds from investors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={profileData.bankName}
                        onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="e.g., First Bank Nigeria"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        value={profileData.bankAccount}
                        onChange={(e) => setProfileData({ ...profileData, bankAccount: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Email</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Phone</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">KYC Status</span>
                    </div>
                    <Badge className={getKycStatusColor(kycStatus)} variant="secondary">
                      {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Account Type</span>
                    </div>
                    <Badge variant="outline">Farmer</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Completion</span>
                    <span className="font-semibold text-green-600">
                      {Math.round(
                        (Object.values(profileData).filter(Boolean).length / Object.values(profileData).length) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects Created</span>
                    <span className="font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Funds Raised</span>
                    <span className="font-semibold text-green-600">₦0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold">
                      {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
