import type { PredictRequest, PredictResponse } from '@/types/predict'

const BASE_URL = import.meta.env.VITE_PREDICT_API_BASE_URL || 'http://127.0.0.1:8000'

export async function predictCandidate(payload: PredictRequest): Promise<PredictResponse> {
  const url = `${BASE_URL}/predict`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('Predict API error:', res.status, res.statusText, text)
      throw new Error(`Error al obtener la predicción (${res.status})`)
    }

    const data = (await res.json()) as unknown
    // Validación mínima del shape
    if (
      typeof data === 'object' && data !== null &&
      'probabilidad_permanencia_3_meses' in data &&
      'clase_predicha' in data
    ) {
      const pr = data as PredictResponse
      if (
        typeof pr.probabilidad_permanencia_3_meses === 'number' &&
        (pr.clase_predicha === 0 || pr.clase_predicha === 1)
      ) {
        return pr
      }
    }

    console.error('Predict API response shape invalid:', data)
    throw new Error('Respuesta inválida de la predicción')
  } catch (err) {
    console.error('Predict API network/parse error:', err)
    throw new Error('No fue posible comunicarse con el servidor de predicción')
  }
}
