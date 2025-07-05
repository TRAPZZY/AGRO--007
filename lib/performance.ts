"use client"

// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private observers: Map<string, PerformanceObserver> = new Map()
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  // Measure component render time
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    this.metrics.set(`${componentName}_render`, end - start)
  }

  // Debounce function for expensive operations
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  }

  // Throttle function for frequent events
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }) as T
  }

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src
          observer.unobserve(img)
        }
      })
    })
    observer.observe(img)
  }

  // Preload critical resources
  preloadResource(url: string, type: "script" | "style" | "image" | "fetch") {
    const link = document.createElement("link")
    link.rel = "preload"
    link.href = url

    switch (type) {
      case "script":
        link.as = "script"
        break
      case "style":
        link.as = "style"
        break
      case "image":
        link.as = "image"
        break
      case "fetch":
        link.as = "fetch"
        link.crossOrigin = "anonymous"
        break
    }

    document.head.appendChild(link)
  }

  // Monitor Core Web Vitals
  monitorWebVitals() {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.set("LCP", lastEntry.startTime)
    })
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        this.metrics.set("FID", entry.processingStart - entry.startTime)
      })
    })
    fidObserver.observe({ entryTypes: ["first-input"] })

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.metrics.set("CLS", clsValue)
        }
      })
    })
    clsObserver.observe({ entryTypes: ["layout-shift"] })

    this.observers.set("webVitals", lcpObserver)
  }

  // Get performance metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const optimizer = PerformanceOptimizer.getInstance()

  const measureRender = (renderFn: () => void) => {
    optimizer.measureRender(componentName, renderFn)
  }

  const debounce = <T extends (...args: any[]) => any>(func: T, wait: number) => {
    return optimizer.debounce(func, wait)
  }

  const throttle = <T extends (...args: any[]) => any>(func: T, limit: number) => {
    return optimizer.throttle(func, limit)
  }

  return { measureRender, debounce, throttle }
}
