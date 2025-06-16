import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Search, DollarSign, TrendingUp, Shield, Users } from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How AgroInvest Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform connects investors with verified farmers, creating opportunities for sustainable agricultural
            growth and profitable returns.
          </p>
        </div>

        {/* For Investors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">For Investors</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>1. Sign Up & Verify</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create your investor account and complete our simple KYC verification process to ensure platform
                  security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>2. Browse Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore verified agricultural projects from farmers across Nigeria. Filter by category, location, and
                  funding goals.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>3. Invest & Track</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose projects that align with your goals, invest any amount, and track progress with real-time
                  updates and reports.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* For Farmers */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">For Farmers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>1. Register & Verify</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sign up as a farmer and complete our verification process including identity verification and farm
                  documentation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>2. Create Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Submit detailed project proposals including farming plans, funding requirements, and expected
                  outcomes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>3. Get Funded</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive funding from multiple investors, provide regular updates, and share profits according to
                  agreed terms.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="bg-gray-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security & Trust</h2>
            <p className="text-lg text-gray-600">
              Your investments and data are protected by industry-leading security measures
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-green-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Farmers</h3>
                <p className="text-gray-600">
                  All farmers undergo thorough background checks, farm visits, and documentation verification before
                  being approved on our platform.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-green-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  All transactions are processed through secure payment gateways with bank-level encryption and fraud
                  protection.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-green-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Regular Monitoring</h3>
                <p className="text-gray-600">
                  Our team conducts regular project monitoring and provides transparent reporting to keep investors
                  informed.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="w-8 h-8 text-green-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Insurance Coverage</h3>
                <p className="text-gray-600">
                  Selected projects are covered by agricultural insurance to protect against weather and other risks.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
