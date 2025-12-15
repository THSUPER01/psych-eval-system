// ============================================
// Types para API de Selección
// ============================================

export interface Estado {
  estId: number
  estCodigo: string
  estDescripcion: string
  estActivo: boolean
}

export interface TipoNormativa {
  tipTipoNormativaId: number
  tipNombre: string
  tipDescripcion: string
  tipActivo: boolean
}

export interface Requerimiento {
  reqId: number
  psicologoDocumento: string
  psicologoNombre: string
  psicologoEmail: string
  perfilBasico: string
  rolObjetivo: string
  areaObjetivo: string
  estado: Estado
  tipoNormativa?: TipoNormativa
  fechaCreacion: string
  totalCandidatos?: number
  candidatos?: CandidatoResumen[]
}

export interface CandidatoResumen {
  canId: number
  cedulaCiudadania: string
  nombreCompleto: string
  email: string
  token: string
  formularioCompletado: boolean
  fechaCompletado?: string
}

export interface CrearRequerimientoDto {
  psicologoDocumento: string
  psicologoNombre: string
  psicologoEmail: string
  perfilBasico: string
  rolObjetivo: string
  areaObjetivo: string
}

export interface ActualizarRequerimientoDto {
  psicologoDocumento?: string
  psicologoNombre?: string
  psicologoEmail?: string
  perfilBasico?: string
  rolObjetivo?: string
  areaObjetivo?: string
  estadoCodigo?: string
}

// ============================================
// Types para Formulario de Candidato (según README)
// ============================================

/**
 * DTO para el formulario demográfico del candidato
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - FormularioCandidatoDto
 */
export interface FormularioCandidatoDto {
  forId: number
  candidatoId: number
  estadoCivil: string | null
  genero: string | null
  edadIngreso: number | null // 1-99
  municipio: string | null
  comuna: string | null
  barrio: string | null
  direccion: string | null
  estrato: number | null // 1-6
  tieneHijo: boolean
  cantidadHijo: number | null
  edadesHijos: number[] // Edades de los hijos
  tallaCamisa: string | null
  tallaPantalon: string | null
  tallaZapato: string | null
  habilidades?: string | null // Habilidades del candidato (solo candidatos públicos)
  urlHojaVida?: string | null // URL de la hoja de vida en S3 (solo candidatos públicos)
}

/**
 * DTO para crear/actualizar el formulario demográfico
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - CrearFormularioCandidatoDto
 */
export interface CrearFormularioCandidatoDto {
  estadoCivil?: string
  genero?: string
  edadIngreso?: number // 1-99
  municipio?: string
  comuna?: string
  barrio?: string
  direccion?: string
  estrato?: number // 1-6
  tieneHijo: boolean
  edadesHijos: number[] // Si tieneHijo=false, debe ser []
  tallaCamisa?: string
  tallaPantalon?: string
  tallaZapato?: string
}

/**
 * DTO para registro público completo (datos + formulario en un solo request)
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - FormularioPublicoDto
 */
export interface FormularioPublicoDto {
  // Datos del candidato
  cedulaCiudadania?: string  // Opcional: incluida para formularios que la recopilan
  nombreCompleto: string
  email: string
  telefono: string
  
  // Datos del formulario
  estadoCivil?: string
  genero?: string
  edadIngreso?: number
  municipio?: string
  comuna?: string
  barrio?: string
  direccion?: string
  estrato?: number
  tieneHijo: boolean
  edadesHijos: number[]
  tallaCamisa?: string
  tallaPantalon?: string
  tallaZapato?: string
}

/**
 * DTO para registro público simple (solo datos básicos)
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - POST /api/publico/registro
 */
export interface RegistroSimpleDto {
  cedulaCiudadania: string
  nombreCompleto: string
  email: string
  telefono: string
}

// ============================================
// Types para Candidato (según README)
// ============================================

/**
 * DTO completo del candidato (respuesta de la API)
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - CandidatoDto
 */
export interface Candidato {
  canId: number
  requerimientoId: number | null
  cedulaCiudadania: string
  nombreCompleto: string
  email: string
  telefono: string
  token: string
  tokenAcceso?: string // Alias para token
  
  estado: Estado
  
  linkEnviado: boolean
  fechaEnvioLink: string | null
  
  formularioCompletado: boolean
  formularioCompleto?: boolean // Alias para formularioCompletado
  fechaCompletado: string | null
  
  resultadoSeleccion: boolean | null // null=pendiente, true=aprobado, false=rechazado
  motivoRechazo: string | null
  fechaResultado: string | null
  usuarioResultado: string | null
  usuarioCreacion: string
  fechaCreacion: string
  fechaActualizacion?: string
  
  formulario: FormularioCandidatoDto | null
  documentos?: Documento[]
  asignacionCmt?: AsignacionCmtDto // ⭐ Asignación automática de prueba CMT
  asignacion16pf?: Asignacion16pfDto // ⭐ Asignación de prueba 16PF
}

export interface CrearCandidatoDto {
  requerimientoId: number
  cedulaCiudadania: string
  nombreCompleto: string
  email: string
  telefono: string
  tipoNormativaId?: number // ⭐ RECOMENDADO - Define la normativa CMT a aplicar (según GUIA_INTEGRACION_FRONTEND.md)
}

/**
 * DTO para registrar el resultado final del candidato
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - PATCH /api/candidatos/{id}/resultado
 */
export interface RegistrarResultadoDto {
  resultadoSeleccion: boolean // true=aprobado, false=rechazado
  motivoRechazo?: string // Obligatorio si resultadoSeleccion=false
}

export interface PruebaPsicotecnica {
  ppsId: number
  nombrePrueba: string
  descripcion: string
  codigoPrueba: string
  activo: boolean
  fechaCreacion: string
}

export interface VersionPrueba {
  vprId: number
  pruebaId: number
  nombrePrueba: string
  codigoVersion: string
  descripcion: string
  activo: boolean
  publicado: boolean
  fechaCreacion: string
}

export interface PublicacionPrueba {
  pubId: number
  versionId: number
  nombrePrueba: string
  codigoVersion: string
  fechaPublicacion: string
  fechaInicio: string
  fechaFin: string | null
  activo: boolean
}

export interface AsignacionPrueba {
  aspId: number
  candidatoId: number
  nombreCandidato: string
  publicacionPruebaId: number
  nombrePrueba: string
  codigoVersion: string
  fechaAsignacion: string
  fechaLimite: string | null
  iniciado: boolean
  completado: boolean
  estado: Estado
}

export interface CrearAsignacionDto {
  candidatoId: number
  publicacionPruebaId: number
  fechaLimite?: string
}

export interface ResultadoPrueba {
  rprId: number
  candidatoId: number
  nombreCandidato: string
  pruebaId: number
  nombrePrueba: string
  codigoVersion: string
  puntajeTotal: number
  porcentajeAcierto: number
  fechaInicio: string
  fechaFinalizacion: string
  observaciones: string | null
}

export interface RespuestaItem {
  ritId: number
  intentoId: number
  itemId: number
  enunciadoItem: string
  opcionSeleccionadaId: number | null
  textoOpcion: string | null
  respuestaAbierta: string | null
  puntajeObtenido: number | null
  tiempoRespuestaSeg: number | null
  fechaRespuesta: string
}

export interface Documento {
  docId: number
  candidatoId: number
  nombreArchivo: string
  rutaArchivo: string
  tipoDocumento: string
  tamanioBytes: number
  fechaSubida: string
  subidoPor: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errors?: string[]
}

// ============================================
// Enums y Constantes (según README)
// ============================================

export const EstadosRequerimiento = {
  CREADO: 'CREADO',
  EN_PROGRESO: 'EN_PROGRESO',
  FORMULARIO_COMPLETO: 'FORMULARIO_COMPLETO',
  RESULTADO_REGISTRADO: 'RESULTADO_REGISTRADO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
} as const

/**
 * Estados del candidato según el flujo de selección
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md - Estados del Candidato
 */
export const EstadosCandidato = {
  CAND_REGISTRADO: 'CAND_REGISTRADO', // Al crear el candidato
  CAND_FORMULARIO_COMPLETO: 'CAND_FORMULARIO_COMPLETO', // Al completar formulario
  CAND_EN_EVALUACION: 'CAND_EN_EVALUACION', // Al asignar pruebas
  CAND_APROBADO: 'CAND_APROBADO', // Resultado positivo
  CAND_RECHAZADO: 'CAND_RECHAZADO', // Resultado negativo
} as const

export const TiposDocumento = {
  CEDULA: 'CEDULA',
  HOJA_VIDA: 'HOJA_VIDA',
  CERTIFICADO: 'CERTIFICADO',
  RESULTADO_PRUEBA: 'RESULTADO_PRUEBA',
  OTRO: 'OTRO',
} as const

// ============================================
// Types para Prueba CMT (Cuestionario de Motivación para el Trabajo)
// @see GUIA_INTEGRACION_FRONTEND.md - Módulo 4: Prueba CMT
// ============================================

/**
 * Asignación de la prueba CMT al candidato
 * Se crea automáticamente al crear el candidato
 */
export interface AsignacionCmtDto {
  asignacionId: number
  candidatoId?: number
  fechaAsignacion: string
  fechaLimite: string
  estadoAsignacion: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'VENCIDA' | 'INICIADA'
  pruebaCompletada: boolean
  fechaCompletado?: string
  tipoNormativa: TipoNormativa
}

/**
 * Asignación de la prueba 16PF al candidato
 * Se asigna automáticamente o manualmente por el psicólogo
 */
export interface Asignacion16pfDto {
  asignacionId: number
  candidatoId?: number
  fechaAsignacion: string
  fechaLimite: string
  estadoAsignacion: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'VENCIDA' | 'INICIADA'
  pruebaCompletada: boolean
  fechaCompletado?: string
  notaNormativa?: string // Nota sobre la normativa aplicada automáticamente
}

/**
 * Opción de respuesta para una pregunta CMT
 * Cada pregunta tiene exactamente 5 opciones (A, B, C, D, E)
 */
export interface CmtOpcionDto {
  letraOpcion: string // "A", "B", "C", "D", "E"
  textoOpcion: string
}

/**
 * Pregunta de la prueba CMT
 * La prueba tiene exactamente 15 preguntas
 */
export interface CmtPreguntaDto {
  numeroEnunciado: number // 1-15
  textoEnunciado: string
  opciones: CmtOpcionDto[] // Siempre 5 opciones
}

/**
 * Respuesta individual a una pregunta CMT
 * Usado al enviar las respuestas al backend
 */
export interface CmtResponderPreguntaDto {
  numeroEnunciado: number // 1-15
  ranking: Record<string, number> // Objeto con letras A-E y valores 1-5
  // Ejemplo: { "A": 5, "B": 3, "C": 1, "D": 4, "E": 2 }
  // 5 = Mayor satisfacción, 1 = Menor satisfacción
  tiempoRespuestaMs?: number // Tiempo en milisegundos (opcional)
}

/**
 * DTO para enviar todas las respuestas de la prueba CMT
 * Debe contener exactamente 15 respuestas
 */
export interface CmtEnviarRespuestasDto {
  respuestas: CmtResponderPreguntaDto[] // Exactamente 15 respuestas
}

/**
 * Respuesta completa al obtener las preguntas CMT
 */
export interface CmtPreguntasResponseDto {
  success: true
  data: CmtPreguntaDto[]
  asignacion: {
    // Estado de la sesión de la prueba
    estado: 'PENDIENTE' | 'INICIADA' | 'COMPLETADA' | 'EXPIRADA'
    // Hora del servidor en el momento de la respuesta (ISO)
    serverNowUtc: string
    // Límite de la sesión (ISO) o null si aún no inicia
    fechaLimiteUtc: string | null
    // Tiempo máximo recomendado (minutos)
    tiempoMaxMinutos: number
    // Información de normativa
    tipoNormativa: string
    // Compatibilidad con versiones anteriores
    fechaLimite?: string
  }
  instrucciones: {
    totalPreguntas: number // 15
    opcionesPorPregunta: number // 5
    mensaje: string
  }
}

/**
 * Dimensión calculada del resultado CMT
 * La prueba calcula 15 dimensiones motivacionales
 */
export interface CmtResultadoDimensionDto {
  codigoDimension: string // Ej: "LOGRO", "PODER", "AFILIACION", etc.
  nombreDimension: string // Ej: "Logro", "Poder", "Afiliación", etc.
  categoria: string // Agrupador: "Condiciones motivacionales internas", "Medios preferidos", "Condiciones motivacionales externas"
  
  // Puntajes
  puntajeBruto: number // PB: opciones seleccionadas de esta dimensión
  puntajeDirecto: number // PD: puntaje transformado según normativa
  
  // Rangos normativos
  pdMin: number // Rango mínimo de PD en la normativa
  pdMax: number // Rango máximo de PD en la normativa
  
  // Estadísticas
  percentil?: number | null // Percentil calculado (0-100)
  media?: number | null // Media de la normativa (PB)
  desviacion?: number | null // Desviación estándar (PB)
  limiteInferior?: number | null // Media - Desviación (PB)
  limiteSuperior?: number | null // Media + Desviación (PB)
  
  // PD equivalentes para marcadores visuales
  pdLimiteInferior?: number | null // PD correspondiente a limiteInferior
  pdLimiteSuperior?: number | null // PD correspondiente a limiteSuperior
  pdMedia?: number | null // PD correspondiente a media
  
  // Interpretación textual
  interpretacion?: string | null // "Alto", "Sobre el promedio", "Promedio", "Bajo Promedio", "Muy Bajo"
}

/**
 * Resultado completo de la prueba CMT
 * Contiene las 15 dimensiones calculadas con percentiles
 */
export interface CmtResultadoDto {
  resultadoId: number
  candidatoId: number
  nombreCandidato: string
  fechaResultado: string
  tipoNormativa: string // Ej: "Profesionales M", "Profesionales F"
  genero: string // "M" o "F"
  dimensiones: CmtResultadoDimensionDto[] // 15 dimensiones
}

/**
 * Respuesta al enviar las respuestas CMT
 */
export interface CmtEnviarRespuestasResponseDto {
  success: true
  message: string
  data: {
    candidatoId: number
    nombreCompleto: string
    fechaRespuesta: string
    totalRespuestas: number
    psicologoEmail : string
  }
}

/**
 * Respuesta al obtener el resultado CMT
 */
export interface CmtResultadoResponseDto {
  success: true
  data: CmtResultadoDto
}

// ============================================
// Constantes CMT
// ============================================

/**
 * Estados de asignación de prueba CMT
 */
export const EstadosAsignacionCMT = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADA: 'COMPLETADA',
  VENCIDA: 'VENCIDA',
} as const

/**
 * Opciones válidas para respuestas CMT
 */
export const OpcionesCMT = ['A', 'B', 'C', 'D', 'E'] as const
export type OpcionCMT = typeof OpcionesCMT[number]

/**
 * Total de preguntas en la prueba CMT
 */
export const TOTAL_PREGUNTAS_CMT = 15

/**
 * Opciones por pregunta en CMT
 */
export const OPCIONES_POR_PREGUNTA_CMT = 5

/**
 * Interpretaciones de percentiles según GUIA_INTEGRACION_FRONTEND.md
 */
export const InterpretacionesPercentil = {
  ALTO: 'Alto', // Percentil ≥ 84
  SOBRE_PROMEDIO: 'Sobre el promedio', // Percentil 60-83
  PROMEDIO: 'Promedio', // Percentil 40-59
  BAJO_PROMEDIO: 'Bajo Promedio', // Percentil 16-39
  MUY_BAJO: 'Muy Bajo', // Percentil < 16
} as const

/**
 * Función helper para obtener interpretación según percentil
 */
export function obtenerInterpretacionPercentil(percentil: number): string {
  if (percentil >= 84) return InterpretacionesPercentil.ALTO
  if (percentil >= 60) return InterpretacionesPercentil.SOBRE_PROMEDIO
  if (percentil >= 40) return InterpretacionesPercentil.PROMEDIO
  if (percentil >= 16) return InterpretacionesPercentil.BAJO_PROMEDIO
  return InterpretacionesPercentil.MUY_BAJO
}
