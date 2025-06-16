import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Shield, Users, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 agro-pattern opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 10,000+ farmers and investors
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Invest in Agriculture.
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 block">
                  Empower Farmers.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
                Connect with verified farmers across Nigeria, track your investments in real-time, and earn secured
                returns while supporting sustainable agriculture and food security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="agro-button px-8 py-4 text-lg">
                    Start Investing Today
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg border-green-200 text-green-700 hover:bg-green-50"
                  >
                    Learn How It Works
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 mt-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  No hidden fees
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Verified farmers
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Insured investments
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero-farming.png"
                  alt="Nigerian farmers working in agricultural fields"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Floating stats cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">₦45M+</div>
                <div className="text-sm text-gray-600">Total Invested</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-green-100">
                <div className="text-2xl font-bold text-green-600">18.5%</div>
                <div className="text-sm text-gray-600">Avg. Returns</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose AgroInvest?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Secure, transparent, and profitable agricultural investments with industry-leading features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="agro-card text-center group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Verified Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  All farmers undergo thorough verification, KYC processes, and farm visits to ensure legitimacy and
                  trustworthiness.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="agro-card text-center group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Real-Time Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Monitor your investments with live updates, progress photos, GPS tracking, and detailed reports from
                  the field.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="agro-card text-center group hover:scale-105 transition-transform duration-300">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">Secured Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Enjoy competitive returns backed by agricultural insurance, escrow protection, and our comprehensive
                  risk management system.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-green-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">₦45M+</div>
              <div className="text-green-100">Total Invested</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">2,500+</div>
              <div className="text-green-100">Projects Funded</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">94%</div>
              <div className="text-green-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">Real stories from farmers and investors across Nigeria</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="agro-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "AgroInvest has transformed how I fund my farming operations. The platform is transparent, and I've
                  built lasting relationships with investors who believe in sustainable agriculture."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-green-600 font-semibold">SO</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Okafor</div>
                    <div className="text-sm text-gray-600">Rice Farmer, Lagos State</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "As an investor, I love being able to track my investments in real-time and see the direct impact on
                  farming communities. The returns have been consistently excellent!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-semibold">MC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Michael Chen</div>
                    <div className="text-sm text-gray-600">Investor, Abuja</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="agro-card">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "The verification process gave me confidence to invest. Knowing that every farmer is vetted and every
                  project is monitored makes all the difference."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 font-semibold">AA</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Aisha Abdullahi</div>
                    <div className="text-sm text-gray-600">Investor, Kano</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Agricultural Investment Journey?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of investors and farmers who are building a sustainable future through agriculture.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
