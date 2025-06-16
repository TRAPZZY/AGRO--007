"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bell, Shield } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

export default function FarmerSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    projectUpdates: true,
    investmentAlerts: true,
    weeklyReports: true,
    twoFactorAuth: false,
    profileVisibility: "public",
    dataSharing: false,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = await getCurrentUser()
        if (user) {
          setUser(user)
          // Load user settings from database or use defaults
          // This would typically come from a user_settings table
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Save settings to database
      // This would typically update a user_settings table
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

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
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Password updated successfully!" })
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update password." })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard requiredRole="farmer">
        <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
          <CollapsibleSidebar userRole="farmer" />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredRole="farmer">
      <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <CollapsibleSidebar userRole="farmer" />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
            </div>

            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"} className="mb-6">
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notification Settings */}
              <Card className="agro-card">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    <CardTitle>Notifications</CardTitle>
                  </div>
                  <CardDescription>Choose how you want to be notified about important updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Project Updates</Label>
                      <p className="text-sm text-gray-500">Get notified about your project progress</p>
                    </div>
                    <Switch
                      checked={settings.projectUpdates}
                      onCheckedChange={(checked) => handleSettingChange("projectUpdates", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Investment Alerts</Label>
                      <p className="text-sm text-gray-500">Notifications when you receive new investments</p>
                    </div>
                    <Switch
                      checked={settings.investmentAlerts}
                      onCheckedChange={(checked) => handleSettingChange("investmentAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                    </div>
                    <Switch
                      checked={settings.weeklyReports}
                      onCheckedChange={(checked) => handleSettingChange("weeklyReports", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive updates about new features and tips</p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="agro-card">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <CardTitle>Security</CardTitle>
                  </div>
                  <CardDescription>Manage your account security and privacy settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorAuth", checked)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base">Profile Visibility</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="public"
                          name="visibility"
                          value="public"
                          checked={settings.profileVisibility === "public"}
                          onChange={(e) => handleSettingChange("profileVisibility", e.target.value)}
                          className="text-green-600"
                        />
                        <Label htmlFor="public" className="text-sm">
                          Public - Visible to all investors
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="limited"
                          name="visibility"
                          value="limited"
                          checked={settings.profileVisibility === "limited"}
                          onChange={(e) => handleSettingChange("profileVisibility", e.target.value)}
                          className="text-green-600"
                        />
                        <Label htmlFor="limited" className="text-sm">
                          Limited - Only basic information visible
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Sharing</Label>
                      <p className="text-sm text-gray-500">Allow anonymous data sharing for platform improvement</p>
                    </div>
                    <Switch
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Password Change */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                      className="agro-input"
                    />
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

              {/* Account Information */}
              <Card className="agro-card">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your account details and verification status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Account Type</Label>
                      <p className="font-medium capitalize">{user?.role}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Member Since</Label>
                      <p className="font-medium">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-gray-500">KYC Status</Label>
                      <p
                        className={`font-medium capitalize ${
                          user?.kyc_status === "approved"
                            ? "text-green-600"
                            : user?.kyc_status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {user?.kyc_status || "Pending"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSaving} className="agro-button px-8">
                {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                Save All Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
