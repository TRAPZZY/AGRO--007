"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signUp } from "@/lib/auth"
import { signUpSchema, type SignUpInput } from "@/lib/validations"

export default function SignupPage() {
  const [formData, setFormData] = useState<SignUpInput>({
    name: "",
    email: "",
    password: "",
    role: "investor",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<SignUpInput>>({})
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    // Validate form data
    const validation = signUpSchema.safeParse(formData)
    if (!validation.success) {
      const errors: Partial<SignUpInput> = {}
      validation.error.errors.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as keyof SignUpInput] = error.message
        }
      })
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await signUp(formData)

      if (error) {
        setError(error.message || "Failed to create account. Please try again.")
        return
      }

      if (data?.user) {
        setSuccess("Account created successfully! Redirecting to your dashboard...")

        // Small delay to show success message, then redirect
        setTimeout(() => {
          if (formData.role === "farmer") {
            router.push("/dashboard/farmer")
          } else if (formData.role === "admin") {
            router.push("/dashboard/admin")
          } else {
            router.push("/dashboard/investor")
          }
        }, 1500)
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof SignUpInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgroInvest
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">Join thousands of farmers and investors</p>
        </div>

        <Card className="agro-card">
          <CardHeader>
            <CardTitle>Get started</CardTitle>
            <CardDescription>Create your account to start investing or farming</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your full name"
                  className={`agro-input ${fieldErrors.name ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="name"
                />
                {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className={`agro-input ${fieldErrors.email ? "border-red-500" : ""}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className={`agro-input pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <Label htmlFor="role">I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={`agro-input ${fieldErrors.role ? "border-red-500" : ""}`}>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Investor - I want to invest in agricultural projects</SelectItem>
                    <SelectItem value="farmer">Farmer - I want to raise funds for my farm</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.role && <p className="text-sm text-red-600 mt-1">{fieldErrors.role}</p>}
              </div>

              <Button type="submit" className="w-full agro-button" disabled={isLoading || !formData.role}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-green-600 hover:text-green-500">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-600 hover:text-green-500">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
