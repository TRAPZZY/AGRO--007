"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Leaf } from "lucide-react"
import { signIn } from "@/lib/auth"
import { useToast } from "@/lib/hooks/use-toast"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      })

      if (result.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in to your account.",
        })

        // Redirect based on user role or to dashboard
        const userRole = result.user.user_metadata?.role || "investor"
        if (userRole === "farmer") {
          router.push("/dashboard/farmer")
        } else if (userRole === "investor") {
          router.push("/dashboard/investor")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login"
      setError(errorMessage)
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn({ email, password })

      if (result.user) {
        toast({
          title: `Welcome, Demo ${role}!`,
          description: "You have successfully signed in with the demo account.",
        })

        if (role === "Farmer") {
          router.push("/dashboard/farmer")
        } else {
          router.push("/dashboard/investor")
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Demo login failed"
      setError(errorMessage)
      toast({
        title: "Demo Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgroInvest
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your AgroInvest account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR TRY DEMO ACCOUNTS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("farmer@demo.com", "password123", "Farmer")}
              disabled={isLoading}
              className="w-full"
            >
              Demo Farmer
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDemoLogin("investor@demo.com", "password123", "Investor")}
              disabled={isLoading}
              className="w-full"
            >
              Demo Investor
            </Button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/reset-password" className="text-sm text-muted-foreground hover:text-primary">
              Forgot your password?
            </Link>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
