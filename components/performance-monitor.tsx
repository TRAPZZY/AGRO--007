"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Zap, Database, Wifi, AlertTriangle } from "lucide-react"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  errorCount: number
  cacheHitRate: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    errorCount: 0,
    cacheHitRate: 0,
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Performance monitoring
    const startTime = performance.now()

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === "navigation") {
          const navEntry = entry as PerformanceNavigationTiming
          setMetrics((prev) => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
          }))
        }
      })
    })

    observer.observe({ entryTypes: ["navigation"] })

    // Memory usage (if available)
    if ("memory" in performance) {
      const memInfo = (performance as any).memory
      setMetrics((prev) => ({
        ...prev,
        memoryUsage: memInfo.usedJSHeapSize / 1024 / 1024, // MB
      }))
    }

    // Network latency estimation
    const measureLatency = async () => {
      const start = performance.now()
      try {
        await fetch("/api/ping", { method: "HEAD" })
        const latency = performance.now() - start
        setMetrics((prev) => ({ ...prev, networkLatency: latency }))
      } catch (error) {
        setMetrics((prev) => ({ ...prev, errorCount: prev.errorCount + 1 }))
      }
    }

    measureLatency()

    return () => observer.disconnect()
  }, [])

  const getPerformanceStatus = () => {
    if (metrics.loadTime > 3000 || metrics.errorCount > 0) return "poor"
    if (metrics.loadTime > 1500 || metrics.networkLatency > 500) return "fair"
    return "good"
  }

  const status = getPerformanceStatus()
  const statusColors = {
    good: "bg-green-100 text-green-800",
    fair: "bg-yellow-100 text-yellow-800",
    poor: "bg-red-100 text-red-800",
  }

  if (!isVisible) {
    return (
      <Button variant="outline" size="sm" onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 z-50">
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[status]} variant="secondary">
              {status}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Load Time
          </span>
          <span>{metrics.loadTime.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Render Time
          </span>
          <span>{metrics.renderTime.toFixed(0)}ms</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Memory
          </span>
          <span>{metrics.memoryUsage.toFixed(1)}MB</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            Latency
          </span>
          <span>{metrics.networkLatency.toFixed(0)}ms</span>
        </div>
        {metrics.errorCount > 0 && (
          <div className="flex items-center justify-between text-red-600">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Errors
            </span>
            <span>{metrics.errorCount}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
