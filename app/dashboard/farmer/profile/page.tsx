"use client"

import type React from "react"

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
import { useToast } from "@/lib/hooks/use-toast"
import { ToastContainer } from "@/components/ui/toast"
import { Mail, Shield, Phone, User, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { NIGERIAN_STATES } from "@/lib/constants"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { useRealtimeData } from "@/lib/hooks/use-realtime-data"
import Image from "next/image"

interface ProfileData {
  id?: string
  name: string
  email: string
  phone: string
  location: string
  bio: string
  farm_size: string
  farming_experience: string
  specialization: string
  certifications: string
  bank_account: string
  bank_name: string
  avatar_url: string
  kyc_status: "pending" | "approved" | "rejected"
}

export default function FarmerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    farm_size: "",
    farming_experience: "",
    specialization: "",
    certifications: "",
    bank_account: "",
    bank_name: "",
    avatar_url: "",
    kyc_status: "pending",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toasts, toast, removeToast } = useToast()
  const router = useRouter()

  // Real-time user data
  const { data: userData, loading: userLoading } = useRealtimeData<any>({
    table: "users",
    filter: user?.id ? { id: user.id } : undefined,
    enabled: !!user?.id,
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)
      } catch (err) {
        console.error("Auth error:", err)
        router.push("/login")
      }
    }
    checkAuth()
  }, [router])

  // Update profile data when user data changes
  useEffect(() => {
    if (userData && userData.length > 0) {
      const userProfile = userData[0]
      setProfileData({
        id: userProfile.id,
        name: userProfile.name || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        bio: userProfile.bio || "",
        farm_size: userProfile.farm_size || "",
        farming_experience: userProfile.farming_experience || "",
        specialization: userProfile.specialization || "",
        certifications: userProfile.certifications || "",
        bank_account: userProfile.bank_account || "",
        bank_name: userProfile.bank_name || "",
        avatar_url: userProfile.avatar_url || "",
        kyc_status: userProfile.kyc_status || "pending",
      })
    }
  }, [userData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!profileData.name.trim()) {
      newErrors.name = "Name is required"
    }
    if (!profileData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (profileData.phone && !/^\+?[\d\s-()]+$/.test(profileData.phone)) {
      newErrors.phone = "Phone number is invalid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        type: "error",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        type: "error",
      })
      return
    }

    setIsUploadingImage(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

      // Update profile data
      const newProfileData = { ...profileData, avatar_url: urlData.publicUrl }
      setProfileData(newProfileData)

      // Save to database immediately
      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been successfully updated.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Image upload error:", error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        type: "error",
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id || !validateForm()) return

    setIsSaving(true)
    try {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        name: profileData.name.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        location: profileData.location,
        bio: profileData.bio.trim(),
        farm_size: profileData.farm_size.trim(),
        farming_experience: profileData.farming_experience.trim(),
        specialization: profileData.specialization.trim(),
        certifications: profileData.certifications.trim(),
        bank_account: profileData.bank_account.trim(),
        bank_name: profileData.bank_name.trim(),
        avatar_url: profileData.avatar_url,
        role: "farmer",
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setIsEditing(false)
      setErrors({})
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        type: "success",
      })
    } catch (error: any) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        type: "error",
      })
    } finally {
      setIsSaving(false)
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

  const getProfileCompletion = () => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.location,
      profileData.bio,
      profileData.farm_size,
      profileData.farming_experience,
      profileData.specialization,
      profileData.bank_account,
      profileData.bank_name,
    ]
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  if (userLoading || !user) {
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
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                        {profileData.avatar_url ? (
                          <Image
                            src={profileData.avatar_url || "/placeholder.svg"}
                            alt="Profile"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setProfileData((prev) => ({ ...prev, avatar_url: "" }))
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 cursor-pointer transition-colors"
                      >
                        {isUploadingImage ? <LoadingSpinner size="sm" /> : <Camera className="w-4 h-4" />}
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-900">{profileData.name || "Farmer"}</h3>
                      <p className="text-gray-600">Farmer</p>
                      <Badge className={getKycStatusColor(profileData.kyc_status)} variant="secondary">
                        KYC {profileData.kyc_status.charAt(0).toUpperCase() + profileData.kyc_status.slice(1)}
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
                        className={`mt-1 ${errors.name ? "border-red-500" : ""}`}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                        placeholder="Enter your email"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`mt-1 ${errors.phone ? "border-red-500" : ""}`}
                        placeholder="+234 xxx xxx xxxx"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
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
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
                      <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                        {isSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
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
                        value={profileData.farm_size}
                        onChange={(e) => setProfileData({ ...profileData, farm_size: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="e.g., 25 hectares"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        value={profileData.farming_experience}
                        onChange={(e) => setProfileData({ ...profileData, farming_experience: e.target.value })}
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
                        value={profileData.bank_name}
                        onChange={(e) => setProfileData({ ...profileData, bank_name: e.target.value })}
                        disabled={!isEditing}
                        className="mt-1"
                        placeholder="e.g., First Bank Nigeria"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        value={profileData.bank_account}
                        onChange={(e) => setProfileData({ ...profileData, bank_account: e.target.value })}
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
                    <Badge className={getKycStatusColor(profileData.kyc_status)} variant="secondary">
                      {profileData.kyc_status.charAt(0).toUpperCase() + profileData.kyc_status.slice(1)}
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

              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold">{getProfileCompletion()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProfileCompletion()}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Complete your profile to attract more investors and increase your credibility.
                    </p>
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
