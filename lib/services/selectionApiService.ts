import type {
  Requerimiento,
  CrearRequerimientoDto,
  ActualizarRequerimientoDto,
  Candidato,
  CrearCandidatoDto,
  PruebaPsicotecnica,
  VersionPrueba,
  PublicacionPrueba,
  AsignacionPrueba,
  CrearAsignacionDto,
  ResultadoPrueba,
  RespuestaItem,
  Documento,
} from '@/types/selection.types'

const API_URL = process.env.NEXT_PUBLIC_API_SELECCION_URL || 'https://localhost:7162/api'
const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN ||
  'B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
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
      message = data?.message || data?.mensaje || message
    } catch {}
    throw new Error(message || `HTTP ${res.status}`)
  }
  const data = await res.json()
  // La API puede devolver { success, data } o directamente el array
  return (data?.data !== undefined ? data.data : data) as T
}

export const selectionApiService = {
  // ==================== REQUERIMIENTOS ====================
  
  async getRequerimientos(): Promise<Requerimiento[]> {
    return http<Requerimiento[]>('/Requerimientos', { method: 'GET' })
  },

  async getRequerimientoPorId(id: number): Promise<Requerimiento> {
    return http<Requerimiento>(`/Requerimientos/${id}`, { method: 'GET' })
  },

  async getRequerimientosPorPsicologo(documento: string): Promise<Requerimiento[]> {
    return http<Requerimiento[]>(`/Requerimientos/psicologo/${documento}`, { method: 'GET' })
  },

  async crearRequerimiento(dto: CrearRequerimientoDto): Promise<Requerimiento> {
    return http<Requerimiento>('/Requerimientos', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  async actualizarRequerimiento(id: number, dto: ActualizarRequerimientoDto): Promise<Requerimiento> {
    return http<Requerimiento>(`/Requerimientos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    })
  },

  async eliminarRequerimiento(id: number): Promise<void> {
    return http<void>(`/Requerimientos/${id}`, { method: 'DELETE' })
  },

  // ==================== CANDIDATOS ====================

  async getCandidatos(): Promise<Candidato[]> {
    return http<Candidato[]>('/Candidatos', { method: 'GET' })
  },

  async getCandidatoPorId(id: number): Promise<Candidato> {
    return http<Candidato>(`/Candidatos/${id}`, { method: 'GET' })
  },

  async getCandidatosPorRequerimiento(requerimientoId: number): Promise<Candidato[]> {
    return http<Candidato[]>(`/Candidatos/requerimiento/${requerimientoId}`, { method: 'GET' })
  },

  async crearCandidato(dto: CrearCandidatoDto): Promise<Candidato> {
    return http<Candidato>('/Candidatos', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  async marcarLinkEnviado(candidatoId: number): Promise<void> {
    return http<void>(`/Candidatos/${candidatoId}/marcar-link-enviado`, { method: 'POST' })
  },

  async eliminarCandidato(id: number): Promise<void> {
    return http<void>(`/Candidatos/${id}`, { method: 'DELETE' })
  },

  // ==================== PRUEBAS PSICOTÉCNICAS ====================

  async getPruebasPsicotecnicas(): Promise<PruebaPsicotecnica[]> {
    return http<PruebaPsicotecnica[]>('/pruebas-psicotecnicas', { method: 'GET' })
  },

  async getVersionesPrueba(pruebaId: number): Promise<VersionPrueba[]> {
    return http<VersionPrueba[]>(`/pruebas-psicotecnicas/${pruebaId}/versiones`, { method: 'GET' })
  },

  async getPublicacionesActivas(): Promise<PublicacionPrueba[]> {
    return http<PublicacionPrueba[]>('/pruebas-psicotecnicas/publicaciones/activas', { method: 'GET' })
  },

  // ==================== ASIGNACIONES ====================

  async getAsignaciones(): Promise<AsignacionPrueba[]> {
    return http<AsignacionPrueba[]>('/asignaciones', { method: 'GET' })
  },

  async getAsignacionesPorCandidato(candidatoId: number): Promise<AsignacionPrueba[]> {
    return http<AsignacionPrueba[]>(`/asignaciones/candidato/${candidatoId}`, { method: 'GET' })
  },

  async crearAsignacion(dto: CrearAsignacionDto): Promise<AsignacionPrueba> {
    return http<AsignacionPrueba>('/asignaciones', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  async eliminarAsignacion(id: number): Promise<void> {
    return http<void>(`/asignaciones/${id}`, { method: 'DELETE' })
  },

  // ==================== RESULTADOS ====================

  async getResultadosPorCandidato(candidatoId: number): Promise<ResultadoPrueba[]> {
    return http<ResultadoPrueba[]>(`/resultados/candidato/${candidatoId}`, { method: 'GET' })
  },

  async getRespuestasIntento(intentoId: number): Promise<RespuestaItem[]> {
    return http<RespuestaItem[]>(`/resultados/intento/${intentoId}/respuestas`, { method: 'GET' })
  },

  // ==================== DOCUMENTOS ====================

  async subirDocumento(candidatoId: number, file: File, tipoDocumento: string): Promise<Documento> {
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('tipoDocumento', tipoDocumento)

    const res = await fetch(`${API_URL}/documentos/candidato/${candidatoId}`, {
      method: 'POST',
      headers: {
        'App-Token': APP_TOKEN,
        // No establecer Content-Type para que el navegador lo haga automáticamente con boundary
      },
      body: formData,
    })

    if (!res.ok) throw new Error('Error al subir documento')
    const data = await res.json()
    return data?.data || data
  },

  async getDocumentosCandidato(candidatoId: number): Promise<Documento[]> {
    return http<Documento[]>(`/documentos/candidato/${candidatoId}`, { method: 'GET' })
  },

  async eliminarDocumento(documentoId: number): Promise<void> {
    return http<void>(`/documentos/${documentoId}`, { method: 'DELETE' })
  },
}
