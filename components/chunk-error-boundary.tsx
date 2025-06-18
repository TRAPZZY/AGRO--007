"use client"

import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChunkErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ChunkErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ChunkErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ChunkErrorBoundaryState {
    // Check if it's a chunk loading error
    if (error.message.includes("Loading chunk") || error.message.includes("ChunkLoadError")) {
      return { hasError: true, error }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chunk loading error:", error, errorInfo)
  }

  handleRetry = () => {
    // Clear the error state and reload the page
    this.setState({ hasError: false })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md p-6">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              There was an error loading the page. This might be due to a network issue.
            </p>
            <Button onClick={this.handleRetry} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
