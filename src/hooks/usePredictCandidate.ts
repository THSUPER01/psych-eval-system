import { useState, useCallback } from 'react'
import type { PredictRequest, PredictResponse } from '@/types/predict'
import { predictCandidate } from '@/services/predictService'

export function usePredictCandidate() {
  const [data, setData] = useState<PredictResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runPrediction = useCallback(async (payload: PredictRequest) => {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await predictCandidate(payload)
      setData(result)
    } catch (e: any) {
      console.error('usePredictCandidate error:', e)
      setError(e?.message || 'Error desconocido realizando la predicción')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, runPrediction }
}
