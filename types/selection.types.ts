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
  
  fechaCreacion: string
  fechaActualizacion?: string
  
  formulario: FormularioCandidatoDto | null
  documentos?: Documento[]
}

export interface CrearCandidatoDto {
  requerimientoId: number
  cedulaCiudadania: string
  nombreCompleto: string
  email: string
  telefono: string
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
