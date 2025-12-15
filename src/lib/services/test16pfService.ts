import type { Pregunta16PF, Instrucciones16PF, Respuesta16PFItem, Resultado16PFDto, GuardarRespuestas16PFResponse, Escala16PF } from '@/types/test16pf.types'

const API_BASE = import.meta.env.VITE_API_SELECCION_URL || 'http://localhost:5208/api'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    const msg = data.message || `Error ${res.status}`
    throw new Error(msg)
  }
  return data.data || data
}

export const test16pfService = {
  async getPreguntas(token: string): Promise<{ preguntas: Pregunta16PF[]; totalPreguntas: number; instrucciones?: Instrucciones16PF }> {
    // if (!API_BASE) throw new Error('API base no configurada') // Removed check as we have fallback
    const data = await fetchJson<{ preguntas: Pregunta16PF[]; totalPreguntas: number; instrucciones?: Instrucciones16PF }>(`${API_BASE}/test16pf/candidato/${token}/preguntas`)
    return data
  },
  async guardarRespuestas(token: string, candidatoId: number, respuestas: Respuesta16PFItem[]): Promise<GuardarRespuestas16PFResponse> {
    if (respuestas.length !== 185) throw new Error(`Debes responder las 185 preguntas. Completadas: ${respuestas.length}`)
    // if (!API_BASE) throw new Error('API base no configurada')
    const body = JSON.stringify({ candidatoId, respuestas })
    const data = await fetchJson<GuardarRespuestas16PFResponse>(`${API_BASE}/test16pf/candidato/${token}/guardar-respuestas`, { method: 'POST', body })
    return data
  },
  async getResultado(token: string): Promise<Resultado16PFDto> {
    // if (!API_BASE) throw new Error('API base no configurada')
    return fetchJson<Resultado16PFDto>(`${API_BASE}/test16pf/candidato/${token}/resultado`)
  },
  async getEscalas(): Promise<Escala16PF[]> {
    // if (!API_BASE) throw new Error('API base no configurada')
    return fetchJson<Escala16PF[]>(`${API_BASE}/test16pf/escalas`)
  },
}
