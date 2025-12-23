import type {
  Prospecto,
  ProspectoResumen,
  CrearProspectoDto,
  ActualizarProspectoDto,
  RegistrarContactoDto,
  ConvertirProspectoDto,
} from "@/types/prospectos.types"
import type { Candidato } from "@/types/selection.types"
import { authService } from "@/lib/services/authService"

const API_URL = import.meta.env.VITE_API_SELECCION_URL || "http://localhost:5208/api"
const APP_TOKEN =
  import.meta.env.VITE_APP_TOKEN ||
  "B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438"

function headersToRecord(headers?: HeadersInit): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const out: Record<string, string> = {}
    headers.forEach((value, key) => {
      out[key] = value
    })
    return out
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers.map(([k, v]) => [k, String(v)]))
  }
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, String(v)]))
}

function withSelectionAuthHeaders(initHeaders?: HeadersInit, includeJsonContentType = true): Record<string, string> {
  const merged: Record<string, string> = {
    "App-Token": APP_TOKEN,
    ...(includeJsonContentType ? { "Content-Type": "application/json" } : {}),
    ...headersToRecord(initHeaders),
  }

  const token = authService.getToken()
  if (token && !merged.Authorization) {
    merged.Authorization = `Bearer ${token}`
  }

  const documento = authService.getDocumento()
  if (documento && !("X-Documento" in merged) && !("x-documento" in merged)) {
    merged["X-Documento"] = documento
  }

  if (authService.isAdmin() && !("X-Roles" in merged) && !("x-roles" in merged)) {
    merged["X-Roles"] = "ADMIN"
  }

  return merged
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...withSelectionAuthHeaders(init?.headers, true),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const data = JSON.parse(text)
      message = data?.message || data?.mensaje || message
    } catch {}
    throw new Error(message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  return (data?.data !== undefined ? data.data : data) as T
}

export const prospectosService = {
  async obtenerProspectos(filtroEstado?: string | null): Promise<ProspectoResumen[]> {
    const params = new URLSearchParams()
    if (filtroEstado) params.append("filtroEstado", filtroEstado)
    const query = params.toString()
    const suffix = query ? `?${query}` : ""
    return http<ProspectoResumen[]>(`/Prospectos${suffix}`, { method: "GET" })
  },

  async obtenerProspecto(id: number): Promise<Prospecto> {
    return http<Prospecto>(`/Prospectos/${id}`, { method: "GET" })
  },

  async crearProspecto(dto: CrearProspectoDto): Promise<Prospecto> {
    return http<Prospecto>("/Prospectos", {
      method: "POST",
      body: JSON.stringify(dto),
    })
  },

  async actualizarProspecto(id: number, dto: ActualizarProspectoDto): Promise<Prospecto> {
    return http<Prospecto>(`/Prospectos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    })
  },

  async registrarContacto(id: number, dto: RegistrarContactoDto): Promise<Prospecto> {
    return http<Prospecto>(`/Prospectos/${id}/registrar-contacto`, {
      method: "POST",
      body: JSON.stringify(dto),
    })
  },

  async convertirACandidato(id: number, dto: ConvertirProspectoDto): Promise<Candidato> {
    return http<Candidato>(`/Prospectos/${id}/convertir`, {
      method: "POST",
      body: JSON.stringify(dto),
    })
  },

  async eliminarProspecto(id: number): Promise<void> {
    return http<void>(`/Prospectos/${id}`, { method: "DELETE" })
  },

  async subirCv(id: number, file: File): Promise<Prospecto> {
    const formData = new FormData()
    formData.append("archivo", file)

    const res = await fetch(`${API_URL}/Prospectos/${id}/cv`, {
      method: "POST",
      headers: {
        ...withSelectionAuthHeaders(undefined, false),
      },
      body: formData,
    })

    if (!res.ok) {
      const text = await res.text()
      let message = text
      try {
        const data = JSON.parse(text)
        message = data?.message || data?.mensaje || message
      } catch {}
      throw new Error(message || `HTTP ${res.status}`)
    }
    const data = await res.json()
    return (data?.data !== undefined ? data.data : data) as Prospecto
  },

  async obtenerProspectosPorRequerimiento(requerimientoId: number): Promise<ProspectoResumen[]> {
    return http<ProspectoResumen[]>(`/Prospectos/requerimiento/${requerimientoId}`, { method: "GET" })
  },
}
