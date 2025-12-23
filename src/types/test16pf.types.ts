export interface Pregunta16PF {
  pfpIdPregunta: number
  pfpNumeroPregunta: number
  pfpTextoPregunta: string
  pfpOpcionA: string
  pfpOpcionB: string
  pfpOpcionC: string
}

export interface Instrucciones16PF {
  mensaje: string
  tiempoEstimado: string
  formato: string
}

export interface Escala16PF {
  codigoEscala: string
  nombreEscala: string
  poloBajo: string
  poloAlto: string
  puntuacionDirecta: number
  decatipo: number
  interpretacion: string
}

export interface Dimension16PF {
  codigoDimension: string
  nombreDimension: string
  sumaPositiva: number
  sumaNegativa: number
  puntuacionBruta: number
  decatipoDimension: number
}

export interface Resultado16PFDto {
  candidatoId: number
  nombreCandidato: string
  tipoNormativa: string
  generoAplicado: string
  totalRespuestas: number
  fechaAplicacion: string
  escalas: Escala16PF[]
  dimensiones?: Dimension16PF[]
}

export interface Respuesta16PFItem {
  preguntaId: number
  valorRespuesta: 1 | 2 | 3
}

export interface GuardarRespuestas16PFResponse {
  candidatoId: number
  nombreCompleto: string
  fechaRespuesta: string
  totalRespuestas: number
  mensaje: string
}
