"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
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

interface SidebarProps {
  userRole: "farmer" | "investor" | "admin"
  userName?: string
}

export function CollapsibleSidebar({ userRole, userName = "User" }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  // Mobile overlay
  const MobileOverlay = () => (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity",
        isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
      )}
      onClick={() => setIsMobileOpen(false)}
    />
  )

  // Mobile toggle button
  const MobileToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )

  return (
    <>
      <MobileToggle />
      <MobileOverlay />

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-green-100 h-screen shadow-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
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
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          {!isCollapsed && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
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
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                    isCollapsed && "justify-center",
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && link.label}
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

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-green-100 shadow-lg transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-green-100">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              AgroInvest
            </h1>
          </Link>
          <div className="mt-3">
            <p className="text-sm text-gray-600">Welcome back,</p>
            <p className="font-semibold text-gray-900 truncate">{userName}</p>
            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full mt-1 capitalize">
              {userRole}
            </span>
          </div>
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
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700",
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.label}
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
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </>
  )
}
