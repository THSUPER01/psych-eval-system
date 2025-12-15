const API_URL = import.meta.env.VITE_MS_NOTIFICATIONS_URL
  || '' // If empty, we'll use localStorage mock

export type NotificationType = 'info' | 'warning' | 'success' | 'error'

export interface AppNotification {
  id: string
  titulo: string
  descripcion?: string
  type: NotificationType
  createdAt: string // ISO date
  read: boolean
  link?: string
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

// Local mock fallback persisted per user in localStorage
function getLocalKey(userDoc: string) {
  return `notifications:${userDoc}`
}

function seedFor(userDoc: string): AppNotification[] {
  const now = new Date()
  return [
    {
      id: `${userDoc}-1`,
      titulo: 'Nuevo requerimiento asignado',
      descripcion: 'Requerimiento: Auxiliar de bodega (REQ-1023)',
      type: 'info',
      createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
      read: false,
      link: '/panel/seleccion/requerimientos',
    },
    {
      id: `${userDoc}-2`,
      titulo: 'Candidato completó formulario',
      descripcion: 'Juan Pérez finalizó el formulario',
      type: 'success',
      createdAt: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
      read: true,
      link: '/panel/seleccion/candidatos',
    },
  ]
}

function readLocal(userDoc: string): AppNotification[] {
  if (typeof window === 'undefined') return []
  const key = getLocalKey(userDoc)
  const raw = localStorage.getItem(key)
  if (!raw) {
    const seeded = seedFor(userDoc)
    localStorage.setItem(key, JSON.stringify(seeded))
    return seeded
  }
  try { return JSON.parse(raw) as AppNotification[] } catch { return [] }
}

function writeLocal(userDoc: string, data: AppNotification[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(getLocalKey(userDoc), JSON.stringify(data))
}

export const notificationsService = {
  // Returns list of notifications for a user
  async getNotifications(userDoc: string): Promise<AppNotification[]> {
    if (!API_URL) {
      // mock
      await delay(200)
      return readLocal(userDoc)
    }

    const res = await fetch(`${API_URL}/Notificaciones/${userDoc}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    // Accept either { data: [...] } or [...]
    return (data?.data ?? data) as AppNotification[]
  },

  async markAsRead(userDoc: string, id: string): Promise<void> {
    if (!API_URL) {
      const list = readLocal(userDoc).map((n) => n.id === id ? { ...n, read: true } : n)
      writeLocal(userDoc, list)
      await delay(150)
      return
    }
    const res = await fetch(`${API_URL}/Notificaciones/${id}/leer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  },

  async markAllAsRead(userDoc: string): Promise<void> {
    if (!API_URL) {
      const list = readLocal(userDoc).map((n) => ({ ...n, read: true }))
      writeLocal(userDoc, list)
      await delay(150)
      return
    }
    const res = await fetch(`${API_URL}/Notificaciones/marcar-todas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento: userDoc }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  },
}

export default notificationsService
