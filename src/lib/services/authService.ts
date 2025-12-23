'use client'

import type { DecodedToken, Permiso } from '@/types/auth.types'

const TOKEN_KEY = 'authToken'
const PERMISOS_KEY = 'appPermisos'
const DOCUMENTO_KEY = 'authDocumento'
const ROLE_NAME_KEY = 'authRoleName'

const ADMIN_ROLAPP_ID = 66

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

function normalizeDocumentoFromDecoded(decoded: DecodedToken | null): string | null {
  if (!decoded) return null

  const direct =
    (decoded as any).documento ??
    (decoded as any).Documento ??
    (decoded as any).DocumentoColaborador ??
    (decoded as any).documentoColaborador ??
    (decoded as any).numeroDocumento ??
    (decoded as any).NumeroDocumento

  if (typeof direct === 'string' && direct.trim()) return direct.trim()
  if (typeof direct === 'number' && Number.isFinite(direct)) return String(direct)

  return null
}

function normalizeRolesFromDecoded(decoded: DecodedToken | null): string[] {
  if (!decoded) return []

  const raw =
    (decoded as any).roles ??
    (decoded as any).Roles ??
    (decoded as any).role ??
    (decoded as any).Role

  if (Array.isArray(raw)) return raw.map(String).filter(Boolean)
  if (typeof raw === 'string') return raw.split(',').map((s) => s.trim()).filter(Boolean)

  return []
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

  // User info helpers (for backend filtering)
  getDocumento(): string | null {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(DOCUMENTO_KEY)
    if (stored?.trim()) return stored.trim()

    const decoded = this.decodeToken()
    return normalizeDocumentoFromDecoded(decoded)
  },

  setDocumento(documento: string): void {
    if (typeof window === 'undefined') return
    const trimmed = String(documento || '').trim()
    if (!trimmed) return
    localStorage.setItem(DOCUMENTO_KEY, trimmed)
  },

  removeDocumento(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(DOCUMENTO_KEY)
  },

  getRoleName(): string | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(ROLE_NAME_KEY)
    return stored?.trim() ? stored.trim() : null
  },

  setRoleName(roleName: string): void {
    if (typeof window === 'undefined') return
    const trimmed = String(roleName || '').trim()
    if (!trimmed) return
    localStorage.setItem(ROLE_NAME_KEY, trimmed)
  },

  removeRoleName(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ROLE_NAME_KEY)
  },

  isAdmin(): boolean {
    const decoded = this.decodeToken()
    const rolApp = (decoded as any)?.RolApp ?? (decoded as any)?.rolApp
    if (rolApp === ADMIN_ROLAPP_ID || rolApp === String(ADMIN_ROLAPP_ID)) return true

    const roleName = this.getRoleName()
    if (roleName && roleName.toUpperCase().includes('ADMIN')) return true

    const roles = normalizeRolesFromDecoded(decoded)
    return roles.some((r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase().includes('ADMIN'))
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
    this.removeDocumento()
    this.removeRoleName()
  },
}
