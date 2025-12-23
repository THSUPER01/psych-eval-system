export type EstadoPrueba = 'PENDIENTE' | 'INICIADA' | 'COMPLETADA' | 'EXPIRADA'

export type PruebaEstadoDto = {
  estado: EstadoPrueba
  fechaLimiteUtc: string | null
  tiempoLimiteMinutos: number | null
  segundosConsumidos: number
  segundosRestantes: number
  bloqueada: boolean
  motivoBloqueo: string | null
  totalPreguntas?: number
  preguntasRespondidas?: number
}

