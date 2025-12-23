/**
 * Servicio API Pblico para Candidatos
 * 
 * Este servicio maneja los endpoints pblicos (sin autenticacin)
 * para el registro y gestin de candidatos mediante tokens.
 * 
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md
 */

import type {
  Candidato,
  RegistroSimpleDto,
  FormularioPublicoDto,
  CrearFormularioCandidatoDto,
  ApiResponse,
  CmtPreguntasResponseDto,
  CmtEnviarRespuestasDto,
  CmtEnviarRespuestasResponseDto,
  CmtResultadoResponseDto,
} from '@/types/selection.types'
import type { PruebaEstadoDto } from '@/types/pruebasEstado.types'

const API_URL = import.meta.env.VITE_API_SELECCION_URL || 'http://localhost:5208/api'

function normalizeEstado(raw: any): PruebaEstadoDto {
  return {
    estado: raw?.Estado ?? raw?.estado,
    fechaLimiteUtc: raw?.FechaLimiteUtc ?? raw?.fechaLimiteUtc ?? null,
    tiempoLimiteMinutos: raw?.TiempoLimiteMinutos ?? raw?.tiempoLimiteMinutos ?? null,
    segundosConsumidos: raw?.SegundosConsumidos ?? raw?.segundosConsumidos ?? 0,
    segundosRestantes: raw?.SegundosRestantes ?? raw?.segundosRestantes ?? 0,
    bloqueada: raw?.Bloqueada ?? raw?.bloqueada ?? false,
    motivoBloqueo: raw?.MotivoBloqueo ?? raw?.motivoBloqueo ?? null,
    totalPreguntas: raw?.TotalPreguntas ?? raw?.totalPreguntas,
    preguntasRespondidas: raw?.PreguntasRespondidas ?? raw?.preguntasRespondidas,
  }
}

/**
 * Helper para realizar peticiones HTTP a la API pblica
 * No requiere autenticacin - acceso pblico mediante token
 */
async function httpPublic<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || data?.mensaje || `HTTP ${res.status}`,
        errors: data?.errors || [],
      }
    }

    // La API retorna { success, data, message }
    return {
      success: data.success !== false,
      data: data.data || data,
      message: data.message,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de conexin',
      errors: [String(error)],
    }
  }
}

export const candidatePublicApiService = {
  /**
   * Consulta los datos del candidato por su token nico
   * Endpoint: GET /api/publico/candidato/{token}
   * 
   * @param token - Token nico de 32 caracteres del candidato
   * @returns Datos completos del candidato o null si no existe
   * 
   * @example
   * ```ts
   * const response = await obtenerPorToken('abc123def456...')
   * if (response.success && response.data) {
   *   console.log(`Hola ${response.data.nombreCompleto}`)
   *   console.log(`Estado: ${response.data.estado.estDescripcion}`)
   * }
   * ```
   */
  async obtenerPorToken(token: string): Promise<ApiResponse<Candidato>> {
    return httpPublic<Candidato>(`/publico/candidato/${token}`, {
      method: 'GET',
    })
  },

  /**
   * Registro simple de candidato (solo datos bsicos)
   * Endpoint: POST /api/publico/registro
   * 
   * El backend:
   * - Genera un token nico automticamente
   * - Envía email con el link de acceso
   * - Estado inicial: CAND_REGISTRADO
   * 
   * @param dto - Datos bsicos del candidato
   * @returns Candidato creado con su token
   * 
   * @example
   * ```ts
   * const response = await registroSimple({
   *   cedulaCiudadania: '1234567890',
   *   nombreCompleto: 'Mara Gonzlez',
   *   email: 'maria@email.com',
   *   telefono: '3009876543'
   * })
   * 
   * if (response.success && response.data) {
   *   const token = response.data.token
   *   // Guardar token y redirigir a formulario
   *   localStorage.setItem('candidatoToken', token)
   *   router.push(`/candidato/${token}`)
   * }
   * ```
   */
  async registroSimple(dto: RegistroSimpleDto): Promise<ApiResponse<Candidato>> {
    return httpPublic<Candidato>('/publico/registro', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Registro completo de candidato (datos bsicos + formulario demogrfico)
   * Endpoint: POST /api/publico/registro-completo
   * 
   * Todo en una sola peticin:
   * - Crea el candidato
   * - Completa el formulario demogrfico
   * - Genera token
   * - Envía email
   * - Estado final: CAND_FORMULARIO_COMPLETO
   * 
   * @param dto - Datos completos del candidato y formulario
   * @returns Candidato creado con formulario completo
   * 
   * @example
   * ```ts
   * const response = await registroCompleto({
   *   // Datos del candidato
   *   nombreCompleto: 'Pedro Ramrez',
   *   email: 'pedro@email.com',
   *   telefono: '3201234567',
   *   
   *   // Datos del formulario
   *   estadoCivil: 'Casado',
   *   genero: 'Masculino',
   *   edadIngreso: 32,
   *   municipio: 'Bello',
   *   comuna: 'Centro',
   *   barrio: 'Parque',
   *   direccion: 'Carrera 50 # 30-20',
   *   estrato: 3,
   *   tieneHijo: true,
   *   edadesHijos: [5, 8, 10],
   *   tallaCamisa: 'L',
   *   tallaPantalon: '32',
   *   tallaZapato: '42'
   * })
   * 
   * if (response.success) {
   *   // Registro completado, redirigir a confirmacin
   *   router.push(`/candidato/${response.data.token}/confirmacion`)
   * }
   * ```
   */
  async registroCompleto(dto: FormularioPublicoDto): Promise<ApiResponse<Candidato>> {
    return httpPublic<Candidato>('/publico/registro-completo', {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  /**
   * Completar formulario demogrfico de candidato existente
   * Endpoint: POST /api/publico/candidato/{token}/formulario
   * 
   * El candidato debe haber sido creado previamente (registro simple o por psicólogo).
   * Cambia el estado a: CAND_FORMULARIO_COMPLETO
   * 
   * @param token - Token nico del candidato
   * @param dto - Datos del formulario demogrfico
   * @returns Formulario completado
   * 
   * @example
   * ```ts
   * const response = await completarFormulario(token, {
   *   estadoCivil: 'Soltero',
   *   genero: 'Femenino',
   *   edadIngreso: 28,
   *   municipio: 'Medelln',
   *   comuna: 'El Poblado',
   *   barrio: 'Manila',
   *   direccion: 'Calle 10 # 43A-30 Apt 501',
   *   estrato: 4,
   *   tieneHijo: true,
   *   edadesHijos: [3, 5],
   *   tallaCamisa: 'M',
   *   tallaPantalon: '8',
   *   tallaZapato: '37'
   * })
   * 
   * if (response.success) {
   *   toast.success({
   *     title: 'Formulario completado',
   *     description: 'Tu información ha sido guardada exitosamente'
   *   })
   * }
   * ```
   */
  async completarFormulario(
    token: string,
    dto: CrearFormularioCandidatoDto
  ): Promise<ApiResponse<any>> {
    return httpPublic<any>(`/publico/candidato/${token}/formulario`, {
      method: 'POST',
      body: JSON.stringify(dto),
    })
  },

  // ==================== CMT (PRUEBA MOTIVACIONAL) ====================

  /**
   * Obtener las preguntas de la prueba CMT
   * Endpoint: GET /api/publico/candidato/{token}/cmt/preguntas
   * 
   * @param token - Token nico del candidato
   * @returns 15 preguntas CMT con 5 opciones cada una
   * 
   * @example
   * ```ts
   * const response = await obtenerPreguntasCMT(token)
   * if (response.success && response.data) {
   *   console.log(`Total preguntas: ${response.data.length}`) // 15
   * }
   * ```
   */
  async obtenerPreguntasCMT(token: string): Promise<CmtPreguntasResponseDto> {
    return httpPublic<any>(`/publico/candidato/${token}/cmt/preguntas`, {
      method: 'GET',
    }) as Promise<CmtPreguntasResponseDto>
  },

  /**
   * Enviar respuestas de la prueba CMT
   * Endpoint: POST /api/publico/candidato/{token}/cmt/responder
   * 
   * @param token - Token nico del candidato
   * @param data - Objeto con array de 15 respuestas (A-E)
   * @returns Confirmacin del envo
   * 
   * @example
   * ```ts
   * const response = await enviarRespuestasCMT(token, {
   *   respuestas: [
   *     { numeroEnunciado: 1, letraSeleccionada: "A", tiempoRespuestaMs: 5000 },
   *     { numeroEnunciado: 2, letraSeleccionada: "D", tiempoRespuestaMs: 4500 },
   *     // ... 13 respuestas ms
   *   ]
   * })
   * 
   * if (response.success) {
   *   console.log('Prueba CMT completada exitosamente')
   * }
   * ```
   */
  async enviarRespuestasCMT(
    token: string,
    data: CmtEnviarRespuestasDto
  ): Promise<CmtEnviarRespuestasResponseDto> {
    return httpPublic<any>(`/publico/candidato/${token}/cmt/responder`, {
      method: 'POST',
      body: JSON.stringify(data),
    }) as Promise<CmtEnviarRespuestasResponseDto>
  },

  /**
   * Obtener el resultado de la prueba CMT
   * Endpoint: GET /api/publico/candidato/{token}/cmt/resultado
   * 
   * @param token - Token nico del candidato
   * @param recalcular - Si true, fuerza reclculo del resultado
   * @returns Resultado con 15 dimensiones y percentiles
   * 
   * @example
   * ```ts
   * const response = await obtenerResultadoCMT(token)
   * if (response.success && response.data) {
   *   response.data.dimensiones.forEach(dim => {
   *     console.log(`${dim.nombreDimension}: Percentil ${dim.percentil}`)
   *   })
   * }
   * ```
   */
  async obtenerResultadoCMT(token: string, recalcular = false): Promise<CmtResultadoResponseDto> {
    const queryParam = recalcular ? '?recalcular=true' : ''
    return httpPublic<any>(`/publico/candidato/${token}/cmt/resultado${queryParam}`, {
      method: 'GET',
    }) as Promise<CmtResultadoResponseDto>
  },

  async obtenerEstadoCMT(token: string): Promise<ApiResponse<PruebaEstadoDto>> {
    const res = await httpPublic<any>(`/publico/candidato/${token}/cmt/estado`, { method: 'GET' })
    if (!res.success || !res.data) return res as ApiResponse<PruebaEstadoDto>
    return { ...res, data: normalizeEstado(res.data) }
  },

  async autosaveCMT(
    token: string,
    data: { respuesta: any; segundosConsumidosCliente: number }
  ): Promise<ApiResponse<void>> {
    return httpPublic<void>(`/publico/candidato/${token}/cmt/autosave`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
