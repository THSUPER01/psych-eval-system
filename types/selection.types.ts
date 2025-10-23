// ============================================
// Types para API de Selección
// ============================================

export interface Estado {
  estCodigo: string
  estDescripcion: string
}

export interface Requerimiento {
  reqId: number
  psicologoDocumento: string
  psicologoNombre: string
  psicologoEmail: string
  perfilBasico: string
  cargoObjetivo: string
  areaObjetivo: string
  estado: Estado
  fechaCreacion: string
  totalCandidatos?: number
}

export interface CrearRequerimientoDto {
  psicologoDocumento: string
  psicologoNombre: string
  psicologoEmail: string
  perfilBasico: string
  cargoObjetivo: string
  areaObjetivo: string
}

export interface ActualizarRequerimientoDto {
  psicologoDocumento?: string
  psicologoNombre?: string
  psicologoEmail?: string
  perfilBasico?: string
  cargoObjetivo?: string
  areaObjetivo?: string
  estadoCodigo?: string
}

export interface FormularioCandidato {
  estadoCivil: string
  genero: string
  edadIngreso: number
  municipio: string
  barrio: string
  comuna: string
  estrato: string
  direccion: string
  hijos: string
  numeroHijos?: number
  edadesHijos?: number[]
  tallaCamisa: string
  tallaPantalon: string
  tallaZapatos: string
}

export interface Candidato {
  canId: number
  requerimientoId: number
  nombreCompleto: string
  email: string
  telefono: string
  tokenAcceso: string
  linkEnviado: boolean
  formularioCompleto: boolean
  formulario?: FormularioCandidato
  estado: Estado
  fechaCreacion: string
  fechaActualizacion: string
}

export interface CrearCandidatoDto {
  requerimientoId: number
  nombreCompleto: string
  email: string
  telefono: string
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

// Enums útiles
export const EstadosRequerimiento = {
  CREADO: 'CREADO',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
} as const

export const EstadosCandidato = {
  CREADO: 'CREADO',
  LINK_ENVIADO: 'LINK_ENVIADO',
  FORMULARIO_COMPLETO: 'FORMULARIO_COMPLETO',
  EN_EVALUACION: 'EN_EVALUACION',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
} as const

export const TiposDocumento = {
  CEDULA: 'CEDULA',
  HOJA_VIDA: 'HOJA_VIDA',
  CERTIFICADO: 'CERTIFICADO',
  RESULTADO_PRUEBA: 'RESULTADO_PRUEBA',
  OTRO: 'OTRO',
} as const
