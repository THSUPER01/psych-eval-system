import { useNavigate } from 'react-router-dom'
import { useState, useTransition } from 'react'

/**
 * Hook personalizado para manejar navegación con indicador de carga
 * Muestra un spinner durante las transiciones de página
 */
export function useNavigationLoader() {
  const navigateRouter = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigate = (url: string) => {
    setIsNavigating(true)
    startTransition(() => {
      navigateRouter(url)
      // El estado se limpiará automáticamente cuando la navegación complete
      setTimeout(() => setIsNavigating(false), 500)
    })
  }

  return {
    navigate,
    isNavigating: isPending || isNavigating,
  }
}
