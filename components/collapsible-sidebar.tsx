"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Plus,
  FolderOpen,
  User,
  LogOut,
  Search,
  Wallet,
  Users,
  CheckCircle,
  Leaf,
  Settings,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface SidebarProps {
  userRole: "farmer" | "investor" | "admin"
}

export function CollapsibleSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
    }
    loadUser()
  }, [])

  const farmerLinks = [
    { href: "/dashboard/farmer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/farmer/create-project", label: "Create Project", icon: Plus },
    { href: "/dashboard/farmer/my-projects", label: "My Projects", icon: FolderOpen },
    { href: "/dashboard/farmer/profile", label: "Profile", icon: User },
    { href: "/dashboard/farmer/settings", label: "Settings", icon: Settings },
  ]

  const investorLinks = [
    { href: "/dashboard/investor", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/investor/browse-projects", label: "Browse Projects", icon: Search },
    { href: "/dashboard/investor/my-investments", label: "My Investments", icon: Wallet },
    { href: "/dashboard/investor/profile", label: "Profile", icon: User },
    { href: "/dashboard/investor/settings", label: "Settings", icon: Settings },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "All Users", icon: Users },
    { href: "/dashboard/admin/projects", label: "All Projects", icon: FolderOpen },
    { href: "/dashboard/admin/investments", label: "All Investments", icon: Wallet },
    { href: "/dashboard/admin/kyc", label: "KYC Approvals", icon: CheckCircle },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
  ]

  const links = userRole === "farmer" ? farmerLinks : userRole === "investor" ? investorLinks : adminLinks

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsCollapsed(true)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-white border-r border-green-100 h-screen flex flex-col shadow-lg transition-all duration-300 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobile ? "fixed left-0 top-0" : "relative",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-green-100">
          <div className="flex items-center justify-between">
            <Link href="/" className={cn("flex items-center space-x-2", isCollapsed && "justify-center")}>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  AgroInvest
                </h1>
              )}
            </Link>
            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="p-1 hover:bg-green-50">
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>

          {!isCollapsed && user && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900 truncate">{user.name || user.email}</p>
              <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full mt-1 capitalize">
                {userRole}
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && link.label}
                  {isCollapsed && (
                    <div className="absolute left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {link.label}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-green-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50",
              isCollapsed && "justify-center",
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </>
  )
}
