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

import type { PermisosRolResponse } from '@/types/auth.types'

export const rolesService = {
  async getPermisosRol(id: number): Promise<PermisosRolResponse> {
    return http<PermisosRolResponse>(`/permisos/GetPermisosRol/${id}`, { method: 'GET' })
  },
}
