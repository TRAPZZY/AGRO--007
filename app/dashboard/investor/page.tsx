import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react"

export default function InvestorDashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar userRole="investor" />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Sarah!</h1>
            <p className="text-gray-600">Track your agricultural investments and discover new opportunities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦1,850,000</div>
                <p className="text-xs text-muted-foreground">Across 12 projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Return</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5%</div>
                <p className="text-xs text-muted-foreground">Annual return rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₦2,190,000</div>
                <p className="text-xs text-muted-foreground">+18.4% growth</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Investments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Investment Activity</CardTitle>
              <CardDescription>Your latest investments and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { project: "Rice Farming - Kebbi State", amount: "₦200,000", return: "+15%", status: "Active" },
                  { project: "Cassava Processing Plant", amount: "₦350,000", return: "+22%", status: "Completed" },
                  { project: "Poultry Farm Expansion", amount: "₦150,000", return: "+8%", status: "Active" },
                ].map((investment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{investment.project}</h3>
                      <p className="text-sm text-gray-600">Invested: {investment.amount}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{investment.return}</p>
                      <p className="text-sm text-gray-600">{investment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
