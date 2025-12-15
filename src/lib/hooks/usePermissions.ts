'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { PERMISOS } from '@/types/auth.types'

export function usePermissions() {
  const { permissions, hasPermission } = useAuth()
  return {
    permissions,
    hasPermission,
    canAccessProduccion: hasPermission(PERMISOS.PRODUCCION),
    canAccessRoles: hasPermission(PERMISOS.ROLES),
    canAccessUsuarios: hasPermission(PERMISOS.USUARIOS),
    canAccessSecuenciacion: hasPermission(PERMISOS.SECUENCIACION),
    canUseCuartos: hasPermission(PERMISOS.USO_CUARTOS),
    canAdminLineas: hasPermission(PERMISOS.ADMINISTRADOR_LINEAS),
    canAccess: (permisoId: number) => hasPermission(permisoId),
  }
}
