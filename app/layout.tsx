import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ChunkErrorBoundary } from "@/components/chunk-error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AgroInvest - Invest in Agriculture, Empower Farmers",
  description:
    "Connect with verified farmers, track investments in real-time, and earn secured returns while supporting sustainable agriculture across Nigeria.",
  keywords: "agriculture, investment, farming, Nigeria, crowdfunding, sustainable farming",
  authors: [{ name: "AgroInvest Team" }],
  openGraph: {
    title: "AgroInvest - Invest in Agriculture, Empower Farmers",
    description: "Connect with verified farmers and earn secured returns while supporting sustainable agriculture.",
    type: "website",
    locale: "en_NG",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChunkErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">{children}</div>
        </ChunkErrorBoundary>
      </body>
    </html>
  )
}
