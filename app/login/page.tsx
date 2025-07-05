"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Leaf, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/auth"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const performLogin = async (email: string, password: string) => {
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(typeof error === "string" ? error : error.message || "Login failed")
        return
      }

      if (data?.user) {
        setSuccess("Login successful! Redirecting...")
        const userRole = data.user.user_metadata?.role || "investor"

        setTimeout(() => {
          if (userRole === "farmer") {
            router.push("/dashboard/farmer")
          } else if (userRole === "admin") {
            router.push("/dashboard/admin")
          } else {
            router.push("/dashboard/investor")
          }
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(formData.email, formData.password)
  }

  const handleDemoLogin = async (role: "farmer" | "investor" | "admin") => {
    const demoCredentials = {
      farmer: { email: "farmer@demo.com", password: "password123" },
      investor: { email: "investor@demo.com", password: "password123" },
      admin: { email: "admin@demo.com", password: "password123" },
    } as const

    const creds = demoCredentials[role]
    setFormData(creds)
    await performLogin(creds.email, creds.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/signup" className="text-green-600 hover:text-green-500 font-medium">
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Demo accounts */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">Try Demo Accounts:</p>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-white hover:bg-gray-50"
                  onClick={() => handleDemoLogin("farmer")}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Demo Farmer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-white hover:bg-gray-50"
                  onClick={() => handleDemoLogin("investor")}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Demo Investor
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-white hover:bg-gray-50"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Demo Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
