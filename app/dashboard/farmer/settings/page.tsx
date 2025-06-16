"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Shield, User, Globe, Smartphone, Mail, Lock, Eye, EyeOff } from "lucide-react"

export default function FarmerSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [settings, setSettings] = useState({
    // Profile Settings
    name: "",
    email: "",
    phone: "",
    location: "",
    farmSize: "",
    farmType: "",
    experience: "",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    projectUpdates: true,
    investmentAlerts: true,
    weeklyReports: true,
    marketingEmails: false,

    // Privacy Settings
    profileVisibility: "public",
    showContactInfo: true,
    showFarmDetails: true,
    dataSharing: false,

    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,

    // App Preferences
    language: "en",
    currency: "NGN",
    timezone: "Africa/Lagos",
    theme: "light",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}")
        if (userData.id) {
          setUser(userData)
          setSettings((prev) => ({
            ...prev,
            name: userData.name || "",
            email: userData.email || "",
          }))
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update localStorage
      const updatedUser = { ...user, ...settings }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: "success", text: "Settings saved successfully!" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings. Please try again." })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords don't match." })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long." })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update password." })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CollapsibleSidebar userRole="farmer" userName={user?.name} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <CollapsibleSidebar userRole="farmer" userName={user?.name} />

      <div className="flex-1 overflow-auto lg:ml-0 ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-8">
            {/* Profile Information */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <CardTitle>Profile Information</CardTitle>
                </div>
                <CardDescription>Update your personal and farm information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => handleSettingChange("name", e.target.value)}
                      className="agro-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleSettingChange("email", e.target.value)}
                      className="agro-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => handleSettingChange("phone", e.target.value)}
                      className="agro-input"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={settings.location}
                      onChange={(e) => handleSettingChange("location", e.target.value)}
                      className="agro-input"
                      placeholder="State, Nigeria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmSize">Farm Size (Hectares)</Label>
                    <Input
                      id="farmSize"
                      type="number"
                      value={settings.farmSize}
                      onChange={(e) => handleSettingChange("farmSize", e.target.value)}
                      className="agro-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="farmType">Farm Type</Label>
                    <Select value={settings.farmType} onValueChange={(value) => handleSettingChange("farmType", value)}>
                      <SelectTrigger className="agro-input">
                        <SelectValue placeholder="Select farm type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crops">Crop Farming</SelectItem>
                        <SelectItem value="livestock">Livestock</SelectItem>
                        <SelectItem value="poultry">Poultry</SelectItem>
                        <SelectItem value="mixed">Mixed Farming</SelectItem>
                        <SelectItem value="aquaculture">Aquaculture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={settings.experience}
                    onChange={(e) => handleSettingChange("experience", e.target.value)}
                    className="agro-input"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={isSaving} className="agro-button">
                  {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Smartphone className="w-4 h-4 mr-2" />
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Receive alerts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Project Updates</Label>
                      <p className="text-sm text-gray-500">Updates about your projects</p>
                    </div>
                    <Switch
                      checked={settings.projectUpdates}
                      onCheckedChange={(checked) => handleSettingChange("projectUpdates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Investment Alerts</Label>
                      <p className="text-sm text-gray-500">New investment notifications</p>
                    </div>
                    <Switch
                      checked={settings.investmentAlerts}
                      onCheckedChange={(checked) => handleSettingChange("investmentAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Weekly performance summaries</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <CardTitle>Privacy & Security</CardTitle>
                </div>
                <CardDescription>Manage your privacy and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base">Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value) => handleSettingChange("profileVisibility", value)}
                  >
                    <SelectTrigger className="agro-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Visible to all investors</SelectItem>
                      <SelectItem value="limited">Limited - Basic info only</SelectItem>
                      <SelectItem value="private">Private - Hidden from search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Extra security for your account</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Login Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified of new logins</p>
                    </div>
                    <Switch
                      checked={settings.loginAlerts}
                      onCheckedChange={(checked) => handleSettingChange("loginAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Show Contact Info</Label>
                      <p className="text-sm text-gray-500">Display contact details publicly</p>
                    </div>
                    <Switch
                      checked={settings.showContactInfo}
                      onCheckedChange={(checked) => handleSettingChange("showContactInfo", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Sharing</Label>
                      <p className="text-sm text-gray-500">Anonymous analytics sharing</p>
                    </div>
                    <Switch
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  <CardTitle>App Preferences</CardTitle>
                </div>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger className="agro-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ha">Hausa</SelectItem>
                        <SelectItem value="yo">Yoruba</SelectItem>
                        <SelectItem value="ig">Igbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                      <SelectTrigger className="agro-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                      <SelectTrigger className="agro-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                      <SelectTrigger className="agro-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="agro-card">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <CardTitle>Change Password</CardTitle>
                </div>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="agro-input pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="agro-input"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="agro-input"
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                  className="agro-button"
                >
                  {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Save All Settings */}
            <div className="flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving} className="agro-button px-8">
                {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
