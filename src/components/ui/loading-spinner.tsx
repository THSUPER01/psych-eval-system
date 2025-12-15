import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function NavigationLoadingSpinner() {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(false)
  }, [location])

  useEffect(() => {
    const handleStart = () => setIsNavigating(true)
    const handleComplete = () => setIsNavigating(false)

    // Listen to custom navigation events
    window.addEventListener("navigationStart", handleStart)
    window.addEventListener("navigationComplete", handleComplete)

    return () => {
      window.removeEventListener("navigationStart", handleStart)
      window.removeEventListener("navigationComplete", handleComplete)
    }
  }, [])

  if (!isNavigating) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}

export function LoadingSpinner({ 
  size = "default",
  text = "Cargando..."
}: { 
  size?: "small" | "default" | "large"
  text?: string 
}) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
}

export function FullPageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
