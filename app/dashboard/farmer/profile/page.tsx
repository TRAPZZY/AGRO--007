"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Upload, User, Mail, Shield, Camera, Phone } from "lucide-react"
import { NIGERIAN_STATES } from "@/lib/constants"
import Image from "next/image"

export default function FarmerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "John Adebayo",
    email: "john.adebayo@example.com",
    phone: "+234 801 234 5678",
    location: "Oyo State",
    bio: "Experienced farmer with over 15 years in sustainable agriculture. Specializing in crop rotation, organic farming methods, and modern irrigation systems.",
    farmSize: "25 hectares",
    farmingExperience: "15 years",
    specialization: "Crops & Grains",
    certifications: "Organic Farming Certificate, Agricultural Extension Certificate",
    bankAccount: "0123456789",
    bankName: "First Bank Nigeria",
    avatar_url: "/placeholder.svg?height=150&width=150",
  })

  const [kycStatus] = useState<"pending" | "approved" | "rejected">("approved")

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsEditing(false)
      // Show success message
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <DashboardSidebar userRole="farmer" userName="John Adebayo" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your farmer profile and account information</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Profile Information */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="agro-card">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and contact information</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button onClick={() => setIsEditing(true)} variant="outline">
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={profileData.avatar_url || "/placeholder.svg"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700">
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
                      <p className="text-gray-600">Farmer</p>
                      <Badge className={getKycStatusColor(kycStatus)} variant="secondary">
                        KYC {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">State</Label>
                      <Select
                        value={profileData.location}
                        onValueChange={(value) => setProfileData({ ...profileData, location: value })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="agro-input">
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
                      className="agro-input"
                      placeholder="Tell us about your farming experience and expertise..."
                    />
                  </div>

                  {isEditing && (
                    <div className="flex space-x-4">
                      <Button onClick={handleSave} disabled={isLoading} className="agro-button">
                        {isLoading ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Farming Information */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>Farming Information</CardTitle>
                  <CardDescription>Details about your farming experience and specialization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="farmSize">Farm Size</Label>
                      <Input
                        id="farmSize"
                        value={profileData.farmSize}
                        onChange={(e) => setProfileData({ ...profileData, farmSize: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
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
                        className="agro-input"
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
                      className="agro-input"
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
                      className="agro-input"
                      placeholder="List your farming certifications and qualifications..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                  <CardDescription>Payment details for receiving funds from investors</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={profileData.bankName}
                        onChange={(e) => setProfileData({ ...profileData, bankName: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccount">Account Number</Label>
                      <Input
                        id="bankAccount"
                        value={profileData.bankAccount}
                        onChange={(e) => setProfileData({ ...profileData, bankAccount: e.target.value })}
                        disabled={!isEditing}
                        className="agro-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card className="agro-card">
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

              {/* Statistics */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>Profile Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Projects Created</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Funds Raised</span>
                    <span className="font-semibold text-green-600">₦2.4M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Member Since</span>
                    <span className="font-semibold">Jan 2023</span>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Documents */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>KYC Documents</CardTitle>
                  <CardDescription>Upload required documents for verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Government ID</Label>
                    <div className="mt-2 border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                      <Upload className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload ID card or passport</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Proof of Address</Label>
                    <div className="mt-2 border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                      <Upload className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload utility bill</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Farm Documentation</Label>
                    <div className="mt-2 border-2 border-dashed border-green-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                      <Upload className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload farm ownership docs</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
