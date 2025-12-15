import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SuccessConfirmationProps {
  title: string
  description: string
  message?: string
  additionalInfo?: React.ReactNode
  onBackToHome?: () => void
  backButtonText?: string
}

export function SuccessConfirmation({
  title,
  description,
  message,
  additionalInfo,
  onBackToHome,
  backButtonText = "Volver al Inicio",
}: SuccessConfirmationProps) {
  console.log('🚀 SuccessConfirmation component RENDERING (outside useEffect)')
  
  useEffect(() => {
    console.log('🎉 SuccessConfirmation component mounted!')
    let intervalId: number | undefined

    // Import dinámico de canvas-confetti para Next.js
    const loadConfetti = async () => {
      console.log('📦 Loading canvas-confetti module...')
      const confettiModule = await import('canvas-confetti')
      const confetti = confettiModule.default
      console.log('✅ Confetti module loaded:', typeof confetti)

      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 1000,
        colors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
      }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      // Explosión inicial grande desde el centro
      console.log('💥 Firing initial confetti burst!')
      try {
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        console.log('✨ Initial confetti fired successfully!')
      } catch (error) {
        console.error('❌ Error firing confetti:', error)
      }

      // Continuar con explosiones desde los lados
      intervalId = window.setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          console.log('⏰ Confetti animation complete')
          if (intervalId) clearInterval(intervalId)
          return
        }

        const particleCount = 50 * (timeLeft / duration)
        
        // Lanzar confeti desde dos puntos
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
    }

    // Pequeño delay para asegurar que el DOM esté listo
    const timeout = setTimeout(() => {
      console.log('⏳ Starting confetti load...')
      loadConfetti().catch(err => {
        console.error('❌ Error loading confetti:', err)
      })
    }, 100)

    return () => {
      console.log('🧹 Cleaning up SuccessConfirmation')
      clearTimeout(timeout)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="container mx-auto max-w-2xl">
      <Card className="text-center border-2 shadow-lg">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-500/10 p-4 rounded-full ring-4 ring-green-500/20 animate-pulse">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {title}
          </CardTitle>
          <CardDescription className="text-base">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          )}
          
          {additionalInfo && (
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              {additionalInfo}
            </div>
          )}

          {onBackToHome && (
            <Button onClick={onBackToHome} variant="outline" size="lg" className="mt-4">
              {backButtonText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
