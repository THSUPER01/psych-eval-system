const ROLES_API_URL = process.env.NEXT_PUBLIC_MS_ROLES_URL ||
  'https://app.administracionsuper.com/Microservices/MS_RolesPermisos/Api'

const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN ||
  'B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${ROLES_API_URL}${path}`, {
    ...init,
    headers: {
      'App-Token': APP_TOKEN,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const data = JSON.parse(text)
      message = data?.mensaje || message
    } catch {}
    throw new Error(message || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

import type { PermisosRolResponse, RolResponse } from '@/types/auth.types'

interface GetRolesResponse {
  success: boolean
  message: string
  data: Array<{
    rolIdRol: number
    rolRol: string
    rolAplIdAplicacion: number
    rolDescripcion: string
    rolEstEstado: number
    rolUsuarioCreacion: string
    rolUsuarioModificacion: string
    rolFechaCreacion: string
    rolFechaModificacion: string
  }>
}

export const rolesService = {
  async getPermisosRol(id: number): Promise<PermisosRolResponse> {
    return http<PermisosRolResponse>(`/permisos/GetPermisosRol/${id}`, { method: 'GET' })
  },

  async getRolById(id: number): Promise<RolResponse> {
    return http<RolResponse>(`/rol/${id}`, { method: 'GET' })
  },
  async getAllRoles(): Promise<GetRolesResponse> {
    return http<GetRolesResponse>(`/rol/GetRoles`, { method: 'GET' })
  }
}
