/**
 * Asigna manualmente una prueba CMT a un candidato
 * Endpoint: POST /api/Candidatos/{id}/asignar-cmt
 * @param candidatoId - ID del candidato
 * @param tipoNormativaId - ID del tipo de normativa CMT
 * @returns AsignacionPrueba creada o null si ya existía
 */
export async function asignarCmtManual(candidatoId: number, tipoNormativaId: number): Promise<AsignacionPrueba> {
  return http<AsignacionPrueba>(`/Candidatos/${candidatoId}/asignar-cmt`, {
    method: 'POST',
    body: JSON.stringify({ tipoNormativaId }),
  })
}
import type {
  Requerimiento,
  CrearRequerimientoDto,
  ActualizarRequerimientoDto,
  Candidato,
  CrearCandidatoDto,
  RegistrarResultadoDto,
  PruebaPsicotecnica,
  VersionPrueba,
  PublicacionPrueba,
  AsignacionPrueba,
  CrearAsignacionDto,
  ResultadoPrueba,
  RespuestaItem,
  Documento,
  TipoNormativa,
  CmtResultadoDto,
  CmtResultadoResponseDto,
} from '@/types/selection.types'

const API_URL = import.meta.env.VITE_API_SELECCION_URL || 'http://localhost:5208/api'
const APP_TOKEN = import.meta.env.VITE_APP_TOKEN ||
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

  async getCandidatosPorPsicologo(documento: string): Promise<Candidato[]> {
    return http<Candidato[]>(`/Candidatos/psicologo/${documento}`, { method: 'GET' })
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

  /**
   * Asigna un candidato a un requerimiento existente
   * Endpoint esperado: PATCH /api/Candidatos/{id}/asignar-requerimiento
   */
  async asignarCandidatoARequerimiento(candidatoId: number, requerimientoId: number): Promise<Candidato> {
    return http<Candidato>(`/Candidatos/${candidatoId}/asignar-requerimiento`, {
      method: 'PATCH',
      body: JSON.stringify({ requerimientoId }),
    })
  },

  /**
   * Registra el resultado final del proceso de selección del candidato
   * Endpoint: PATCH /api/candidatos/{id}/resultado
   * 
   * @param candidatoId - ID del candidato
   * @param dto - Resultado (aprobado/rechazado) y motivo si es rechazado
   * @returns Candidato actualizado con el resultado
   * 
   * @example
   * ```ts
   * // Aprobar candidato
   * await registrarResultado(60, { resultadoSeleccion: true })
   * 
   * // Rechazar candidato (motivo es obligatorio)
   * await registrarResultado(60, {
   *   resultadoSeleccion: false,
   *   motivoRechazo: 'No cumple con experiencia mínima requerida'
   * })
   * ```
   */
  async registrarResultado(candidatoId: number, dto: RegistrarResultadoDto): Promise<Candidato> {
    return http<Candidato>(`/Candidatos/${candidatoId}/resultado`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
  },

  // ==================== PRUEBAS PSICOTÉCNICAS ====================

  async getPruebasPsicotecnicas(): Promise<PruebaPsicotecnica[]> {
    return http<PruebaPsicotecnica[]>('/PruebasPsicotecnicas', { method: 'GET' })
  },

  async getVersionesPrueba(pruebaId: number): Promise<VersionPrueba[]> {
    return http<VersionPrueba[]>(`/PruebasPsicotecnicas/${pruebaId}/versiones`, { method: 'GET' })
  },

  async getPublicacionesActivas(): Promise<PublicacionPrueba[]> {
    return http<PublicacionPrueba[]>('/PruebasPsicotecnicas/publicaciones/activas', { method: 'GET' })
  },

  // ==================== ASIGNACIONES ====================

  async getAsignaciones(): Promise<AsignacionPrueba[]> {
    return http<AsignacionPrueba[]>('/Asignaciones', { method: 'GET' })
  },

  async getAsignacionesPorCandidato(candidatoId: number): Promise<AsignacionPrueba[]> {
    return http<AsignacionPrueba[]>(`/Asignaciones/candidato/${candidatoId}`, { method: 'GET' })
  },

  async crearAsignacion(dto: CrearAsignacionDto): Promise<AsignacionPrueba> {
    return http<AsignacionPrueba>('/Asignaciones', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  async eliminarAsignacion(id: number): Promise<void> {
    return http<void>(`/Asignaciones/${id}`, { method: 'DELETE' })
  },

  // ==================== RESULTADOS ====================

  async getResultadosPorCandidato(candidatoId: number): Promise<ResultadoPrueba[]> {
    return http<ResultadoPrueba[]>(`/Resultados/candidato/${candidatoId}`, { method: 'GET' })
  },

  async getRespuestasIntento(intentoId: number): Promise<RespuestaItem[]> {
    return http<RespuestaItem[]>(`/Resultados/intento/${intentoId}/respuestas`, { method: 'GET' })
  },

  // ==================== DOCUMENTOS ====================

  async subirDocumento(candidatoId: number, file: File, tipoDocumento: string): Promise<Documento> {
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('tipoDocumento', tipoDocumento)

    const res = await fetch(`${API_URL}/Documentos/candidato/${candidatoId}`, {
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
    return http<Documento[]>(`/Documentos/candidato/${candidatoId}`, { method: 'GET' })
  },

  async eliminarDocumento(documentoId: number): Promise<void> {
    return http<void>(`/Documentos/${documentoId}`, { method: 'DELETE' })
  },

  // ==================== TIPOS DE NORMATIVA ====================

  async getTiposNormativa(): Promise<TipoNormativa[]> {
    return http<TipoNormativa[]>('/TiposNormativa', { method: 'GET' })
  },

  async getTipoNormativaPorId(id: number): Promise<TipoNormativa> {
    return http<TipoNormativa>(`/TiposNormativa/${id}`, { method: 'GET' })
  },

  // ==================== COLABORADORES (TALENTO HUMANO) ====================

  /**
   * Obtiene información de colaborador por número de documento.
   * Devuelve null si no existe o si hay error para no bloquear el flujo.
   */
  async getColaboradorPorDocumento(documento: string): Promise<any | null> {
    try {
      return await http<any>(`/Colaboradores/${encodeURIComponent(documento)}`, { method: 'GET' })
    } catch (e) {
      return null
    }
  },

  // ==================== FLUJO PÚBLICO (TOKEN) ====================

  /**
   * Obtiene un candidato por token público
   */
  async getPublicoCandidatoPorToken<T = any>(token: string): Promise<T> {
    return http<T>(`/Publico/candidato/${token}`, { method: 'GET' })
  },

  /**
   * Completa el formulario público por token
   * dto esperado (ejemplo): {
   *  estadoCivil, genero, edadIngreso, municipio, comuna, barrio, direccion,
   *  estrato, tieneHijo, edadesHijos?: number[], tallaCamisa?, tallaPantalon?, tallaZapatos?
   * }
   */
  async completarFormularioPublico(token: string, dto: Record<string, any>): Promise<void> {
    await http<void>(`/Publico/candidato/${token}/formulario`, {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Registro público simple: crea candidato y devuelve token
   */
  async registroPublico(dto: {
    cedulaCiudadania: string
    nombreCompleto: string
    email: string
    telefono: string
  }): Promise<{ token: string } | any> {
    return http<{ token: string } | any>(`/Publico/registro`, {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Registro público completo en una sola petición
   * Incluye datos del candidato y formulario
   */
  async registroPublicoCompleto(dto: Record<string, any>): Promise<{ token: string } | any> {
    return http<{ token: string } | any>(`/Publico/registro-completo`, {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  // ==================== RESULTADOS CMT ====================

  /**
   * Obtiene el resultado de la prueba CMT de un candidato (para psicólogos)
   * Endpoint: GET /api/publico/candidato/{token}/cmt/resultado
   */
  async getResultadoCMTPorToken(token: string, recalcular = false): Promise<CmtResultadoDto> {
    const queryParam = recalcular ? '?recalcular=true' : ''
    // El helper http ya extrae data.data, por lo que retorna directamente CmtResultadoDto
    return await http<CmtResultadoDto>(
      `/publico/candidato/${token}/cmt/resultado${queryParam}`,
      { method: 'GET' }
    )
  },
  /**
   * Asigna la prueba 16PF al candidato.
   * Endpoint: POST /api/Candidatos/{id}/asignar-16pf
   * No requiere body; la normativa se determina automáticamente según género.
   */
  async asignar16pf(candidatoId: number): Promise<AsignacionPrueba> {
    return http<AsignacionPrueba>(`/Candidatos/${candidatoId}/asignar-16pf`, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
}
