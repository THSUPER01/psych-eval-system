import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/hooks/useAuth'
import LoadingScreen from '@/components/ui/loading-screen'

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePermission?: string
}

export default function ProtectedRoute({ children, requirePermission }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/psicologo/login" replace />
  }

  // Si se requiere un permiso específico, verificarlo
  if (requirePermission && user.permisos) {
    const hasPermission = user.permisos.some(
      (permiso: any) => permiso.perNombre === requirePermission
    )
    if (!hasPermission) {
      return <Navigate to="/panel/seleccion" replace />
    }
  }

  return <>{children}</>
}
