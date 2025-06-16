"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  userRole: "farmer" | "investor" | "admin"
  userName?: string
}

export function DashboardSidebar({ userRole, userName = "User" }: SidebarProps) {
  const pathname = usePathname()

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
    // Implement logout logic here
    console.log("Logging out...")
    // Redirect to login page
    window.location.href = "/login"
  }

  return (
    <div className="w-64 bg-white border-r border-green-100 h-screen flex flex-col shadow-sm">
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
  )
}
