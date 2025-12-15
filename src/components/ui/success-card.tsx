import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import type { ReactNode } from "react"
import confetti from "canvas-confetti"

interface SuccessCardProps {
  /** Icono o elemento visual a mostrar en el header */
  icon: ReactNode
  /** Título principal de la tarjeta */
  title: string
  /** Subtítulo o descripción del header */
  subtitle?: string
  /** Contenido principal de la tarjeta */
  description: string
  /** Contenido adicional opcional (ej: retroalimentación, detalles) */
  additionalContent?: ReactNode
  /** Badge a mostrar al final */
  badge?: {
    label: string
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string
  }
  /** Botón primario opcional */
  primaryButton?: {
    label: string
    onClick: () => void
  }
  /** Botón secundario opcional */
  secondaryButton?: {
    label: string
    onClick: () => void
  }
  /** Colores del gradiente del header */
  headerGradient?: string
  /** Color del contenedor del icono */
  iconBgColor?: string
  /** Clase personalizada para el icono */
  iconClassName?: string
  /** Imagen decorativa opcional */
  decorativeImage?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  /** Mostrar confeti al cargar (default: true) */
  showConfetti?: boolean
}

export function SuccessCard({
  icon,
  title,
  subtitle,
  description,
  additionalContent,
  badge,
  primaryButton,
  secondaryButton,
  headerGradient = "from-green-50 to-emerald-50",
  iconBgColor = "bg-green-100",
  iconClassName = "text-green-600",
  decorativeImage,
  showConfetti = true,
}: SuccessCardProps) {
  // Animar confeti al cargar el componente
  useEffect(() => {
    if (showConfetti) {
      // Pequeña demora para que la animación sea más visible
      const timer = setTimeout(() => {
        lanzarConfeti()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const lanzarConfeti = () => {
    // Confeti desde la izquierda
    confetti({
      particleCount: 40,
      angle: 45,
      spread: 50,
      origin: { x: 0, y: 0.5 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
    })

    // Confeti desde la derecha
    confetti({
      particleCount: 40,
      angle: 135,
      spread: 50,
      origin: { x: 1, y: 0.5 },
      colors: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
    })

    // Confeti desde arriba (centro)
    confetti({
      particleCount: 50,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0 },
      gravity: 0.8,
      colors: ["#059669", "#10b981", "#34d399", "#6ee7b7"],
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden border-none bg-white shadow-2xl rounded-3xl">
          {/* Header con gradiente */}
          <CardHeader className={`bg-gradient-to-r ${headerGradient} text-center relative overflow-hidden`}>
            {/* Elemento decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: "currentColor" }} />
              <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl" style={{ background: "currentColor" }} />
            </div>

            <div className="relative">
              {/* Icono */}
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${iconBgColor}`}>
                <div className={`h-10 w-10 ${iconClassName}`}>
                  {icon}
                </div>
              </div>

              {/* Título */}
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">
                {title}
              </CardTitle>

              {/* Subtítulo */}
              {subtitle && (
                <CardDescription className="text-base sm:text-lg">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </CardHeader>

          {/* Contenido */}
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Imagen decorativa opcional */}
            {decorativeImage && (
              <div className="flex justify-center mb-6">
                <img
                  src={decorativeImage.src}
                  alt={decorativeImage.alt}
                  width={decorativeImage.width || 300}
                  height={decorativeImage.height || 200}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Descripción principal */}
            <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed">
              {description}
            </p>

            {/* Contenido adicional */}
            {additionalContent && (
              <div className="mt-6">
                {additionalContent}
              </div>
            )}

            {/* Badge */}
            {badge && (
              <div className="flex justify-center pt-4">
                <Badge
                  variant={badge.variant || "outline"}
                  className={badge.className}
                >
                  {badge.label}
                </Badge>
              </div>
            )}

            {/* Botones */}
            {(primaryButton || secondaryButton) && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                {secondaryButton && (
                  <Button
                    variant="outline"
                    onClick={secondaryButton.onClick}
                    className="sm:order-1"
                  >
                    {secondaryButton.label}
                  </Button>
                )}
                {primaryButton && (
                  <Button
                    onClick={primaryButton.onClick}
                    className="sm:order-2"
                  >
                    {primaryButton.label}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
