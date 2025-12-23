export type ProspectoEstado =
  | "NUEVO"
  | "CONTACTADO"
  | "INTERESADO"
  | "NO_INTERESADO"
  | "CONVERTIDO"

export type ProspectoFuente =
  | "LinkedIn"
  | "Computrabajo"
  | "Indeed"
  | "Referido"
  | "Otro"

export interface ProspectoResumen {
  id: number
  nombreCompleto: string
  email: string
  cargoActual?: string | null
  fuente?: ProspectoFuente | string | null
  estado: ProspectoEstado
  fechaCreacion?: string | null
  respuesta?: boolean | null
  psicologoNombre?: string | null
  psicologoDocumento?: string | null
  salarioActual?: number | null
  aspiracionSalarial?: number | null
  urlHojaVida?: string | null
}

export interface Prospecto extends ProspectoResumen {
  nombres?: string | null
  apellidos?: string | null
  documento?: string | null
  telefono?: string | null
  empresaActual?: string | null
  anosExperiencia?: number | null
  nivelEducacion?: string | null
  urlPerfil?: string | null
  fechaContacto?: string | null
  fechaRespuesta?: string | null
  notas?: string | null
  requerimientoId?: number | null
  candidatoId?: number | null
  fechaModificacion?: string | null
}

export interface CrearProspectoDto {
  nombres: string
  apellidos: string
  documento?: string | null
  email: string
  telefono?: string | null
  cargoActual?: string | null
  empresaActual?: string | null
  anosExperiencia?: number | null
  nivelEducacion?: string | null
  fuente: ProspectoFuente | string
  urlPerfil?: string | null
  notas?: string | null
  requerimientoId?: number | null
  salarioActual?: number | null
  aspiracionSalarial?: number | null
  urlHojaVida?: string | null
}

export type ActualizarProspectoDto = Partial<CrearProspectoDto>

export interface RegistrarContactoDto {
  respuesta?: boolean | null
  notas?: string | null
}

export interface ConvertirProspectoDto {
  requerimientoId: number
  enviarEmailBienvenida?: boolean
}
