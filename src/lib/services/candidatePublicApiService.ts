/**
 * Servicio API Público para Candidatos
 * 
 * Este servicio maneja los endpoints públicos (sin autenticación)
 * para el registro y gestión de candidatos mediante tokens.
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

const API_URL = import.meta.env.VITE_API_SELECCION_URL || 'http://localhost:5208/api'

/**
 * Helper para realizar peticiones HTTP a la API pública
 * No requiere autenticación - acceso público mediante token
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
      message: error instanceof Error ? error.message : 'Error de conexión',
      errors: [String(error)],
    }
  }
}

export const candidatePublicApiService = {
  /**
   * Consulta los datos del candidato por su token único
   * Endpoint: GET /api/publico/candidato/{token}
   * 
   * @param token - Token único de 32 caracteres del candidato
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
   * Registro simple de candidato (solo datos básicos)
   * Endpoint: POST /api/publico/registro
   * 
   * El backend:
   * - Genera un token único automáticamente
   * - Envía email con el link de acceso
   * - Estado inicial: CAND_REGISTRADO
   * 
   * @param dto - Datos básicos del candidato
   * @returns Candidato creado con su token
   * 
   * @example
   * ```ts
   * const response = await registroSimple({
   *   cedulaCiudadania: '1234567890',
   *   nombreCompleto: 'María González',
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
   * Registro completo de candidato (datos básicos + formulario demográfico)
   * Endpoint: POST /api/publico/registro-completo
   * 
   * Todo en una sola petición:
   * - Crea el candidato
   * - Completa el formulario demográfico
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
   *   nombreCompleto: 'Pedro Ramírez',
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
   *   // Registro completado, redirigir a confirmación
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
   * Completar formulario demográfico de candidato existente
   * Endpoint: POST /api/publico/candidato/{token}/formulario
   * 
   * El candidato debe haber sido creado previamente (registro simple o por psicólogo).
   * Cambia el estado a: CAND_FORMULARIO_COMPLETO
   * 
   * @param token - Token único del candidato
   * @param dto - Datos del formulario demográfico
   * @returns Formulario completado
   * 
   * @example
   * ```ts
   * const response = await completarFormulario(token, {
   *   estadoCivil: 'Soltero',
   *   genero: 'Femenino',
   *   edadIngreso: 28,
   *   municipio: 'Medellín',
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
   * @param token - Token único del candidato
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
   * @param token - Token único del candidato
   * @param data - Objeto con array de 15 respuestas (A-E)
   * @returns Confirmación del envío
   * 
   * @example
   * ```ts
   * const response = await enviarRespuestasCMT(token, {
   *   respuestas: [
   *     { numeroEnunciado: 1, letraSeleccionada: "A", tiempoRespuestaMs: 5000 },
   *     { numeroEnunciado: 2, letraSeleccionada: "D", tiempoRespuestaMs: 4500 },
   *     // ... 13 respuestas más
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
   * @param token - Token único del candidato
   * @param recalcular - Si true, fuerza recálculo del resultado
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
}
