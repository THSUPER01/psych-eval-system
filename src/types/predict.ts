// Tipos estrictos para el endpoint de predicción
export interface PredictRequest {
  CLB_EstadoCivil: string
  CLB_Genero: string
  edad_al_ingresar: number
  Barrio: string
  Comuna: string
  Estrato: number
  hijos: number
  "titulo obtenido": string
  direccion: string
}

export interface PredictResponse {
  probabilidad_permanencia_3_meses: number
  clase_predicha: 0 | 1
}
