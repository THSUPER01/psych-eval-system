'use client'

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/services/authService'
import type { AuthContextType, Permiso, User } from '@/types/auth.types'

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

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
    router.push('/psychologist/login')
  }, [router])

  const hasPermission = useCallback(
    (permisoId: number) => permissions.includes(permisoId),
    [permissions],
  )

  const value: AuthContextType = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: !!user && !authService.isTokenExpired(),
      isLoading,
      login,
      logout,
      hasPermission,
    }),
    [user, permissions, isLoading, login, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
