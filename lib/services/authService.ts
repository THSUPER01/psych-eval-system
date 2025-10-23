'use client'

import type { DecodedToken, Permiso } from '@/types/auth.types'

const TOKEN_KEY = 'authToken'
const PERMISOS_KEY = 'appPermisos'

function base64UrlDecode(input: string): string {
  try {
    // Convertir base64url a base64 estándar
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    
    // Decodificar base64 y manejar caracteres UTF-8 correctamente
    const binaryString = atob(padded)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Usar TextDecoder para manejar correctamente UTF-8 (ñ, acentos, etc.)
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(bytes)
  } catch (error) {
    console.error('Error decodificando base64:', error)
    return ''
  }
}

function decodeJwt(token: string): DecodedToken | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = base64UrlDecode(payload)
    if (!json) return null
    return JSON.parse(json)
  } catch (error) {
    console.error('Error decodificando JWT:', error)
    return null
  }
}

export const authService = {
  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(TOKEN_KEY)
  },

  decodeToken(): DecodedToken | null {
    const token = this.getToken()
    if (!token) return null
    return decodeJwt(token)
  },

  isTokenExpired(): boolean {
    const decoded = this.decodeToken()
    if (!decoded || !decoded.exp) return true
    const expirationTime = decoded.exp * 1000
    return Date.now() > expirationTime
  },

  // Permissions management
  getPermissionsRaw(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(PERMISOS_KEY)
  },

  setPermissions(permisos: Permiso[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(PERMISOS_KEY, JSON.stringify(permisos))
  },

  decodePermissions(): number[] {
    const permisos = this.getPermissionsRaw()
    if (!permisos) return []
    try {
      const parsed: Permiso[] = JSON.parse(permisos)
      return parsed.map((p) => p.accIdAccion)
    } catch {
      return []
    }
  },

  hasPermission(permisoId: number): boolean {
    const permisos = this.decodePermissions()
    return permisos.includes(permisoId)
  },

  // Authentication state
  isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired()
  },

  login(token: string, permisos: Permiso[]): void {
    this.setToken(token)
    this.setPermissions(permisos)
  },

  logout(): void {
    this.removeToken()
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERMISOS_KEY)
    }
  },
}
