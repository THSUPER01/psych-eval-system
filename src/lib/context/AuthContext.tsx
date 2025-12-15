import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/lib/services/authService'
import { rolesService } from '@/lib/services/rolesService'
import type { AuthContextType, Permiso, User, Rol } from '@/types/auth.types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<number[]>([])
  const [userRole, setUserRole] = useState<Rol | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Fetch role data when user changes
  useEffect(() => {
    const fetchRole = async () => {
      if (user?.RolApp) {
        try {
          const response = await rolesService.getRolById(Number(user.RolApp))
          if (response.success && response.data) {
            setUserRole(response.data)
          }
        } catch (error) {
          console.error('Error fetching role:', error)
        }
      } else {
        setUserRole(null)
      }
    }
    fetchRole()
  }, [user])

  useEffect(() => {
    try {
      // Bridge cookies -> localStorage if needed (for SSO set by middleware)
      if (typeof document !== 'undefined') {
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
          return match ? decodeURIComponent(match[1]) : ''
        }
        const token = authService.getToken()
        if (!token) {
          const cookieToken = getCookie('authToken')
          const cookiePerms = getCookie('appPermisos')
          if (cookieToken) {
            try {
              localStorage.setItem('authToken', cookieToken)
              if (cookiePerms) localStorage.setItem('appPermisos', cookiePerms)
            } catch {}
          }
        }
      }

      if (authService.isAuthenticated()) {
        const decoded = authService.decodeToken()
        setUser((decoded || null) as User)
        setPermissions(authService.decodePermissions())
      } else {
        setUser(null)
        setPermissions([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((token: string, permisos: Permiso[]) => {
    authService.login(token, permisos)
    const decoded = authService.decodeToken()
    setUser((decoded || null) as User)
    setPermissions(authService.decodePermissions())
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setPermissions([])
    setUserRole(null)
    navigate('/psicologo/login')
  }, [navigate])

  const hasPermission = useCallback(
    (permisoId: number) => permissions.includes(permisoId),
    [permissions],
  )

  const value: AuthContextType = useMemo(
    () => ({
      user,
      permissions,
      userRole,
      isAuthenticated: !!user && !authService.isTokenExpired(),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, permissions, userRole, isLoading, login, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
