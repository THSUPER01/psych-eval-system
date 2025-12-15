import { Link, useNavigate } from 'react-router-dom'
import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavigationLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  showSpinner?: boolean
  onClick?: (e: React.MouseEvent) => void
}

/**
 * Componente Link con indicador de carga automático
 * Muestra un spinner mientras se navega a la nueva página
 */
export function NavigationLink({ 
  href, 
  children, 
  className = '',
  showSpinner = true,
  onClick 
}: NavigationLinkProps) {
  const navigate = useNavigate()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si hay onClick personalizado, ejecutarlo
    if (onClick) {
      onClick(e)
    }

    // Prevenir navegación por defecto
    e.preventDefault()
    
    // Iniciar estado de carga
    setIsLoading(true)
    
    // Navegar con transición
    startTransition(() => {
      navigate(href)
      setTimeout(() => setIsLoading(false), 300)
    })
  }

  const loading = isPending || isLoading

  return (
    <Link 
      to={href} 
      onClick={handleClick}
      className={cn(
        'relative inline-flex items-center gap-2',
        loading && 'pointer-events-none opacity-70',
        className
      )}
    >
      {loading && showSpinner && (
        <Loader2 className="h-4 w-4 animate-spin absolute -left-6" />
      )}
      {children}
    </Link>
  )
}
