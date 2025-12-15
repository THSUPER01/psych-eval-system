import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { usePredictCandidate } from '@/hooks/usePredictCandidate'
import type { PredictRequest } from '@/types/predict'

type Props = {
  values: {
    CLB_EstadoCivil?: string
    CLB_Genero?: string
    edad_al_ingresar?: number
    Barrio?: string
    Comuna?: string
    Estrato?: number
    hijos?: number
    titulo_obtenido?: string // mapped to "titulo obtenido"
    direccion?: string
  }
}

export function PredictWidget({ values }: Props) {
  const { data, loading, error, runPrediction } = usePredictCandidate()

  const missing = useMemo(() => {
    const req: Array<[keyof Props['values'], string]> = [
      ['CLB_EstadoCivil', 'Estado civil'],
      ['CLB_Genero', 'Género'],
      ['edad_al_ingresar', 'Edad al ingresar'],
      ['Barrio', 'Barrio'],
      ['Comuna', 'Comuna'],
      ['Estrato', 'Estrato'],
      ['hijos', 'Hijos'],
      ['titulo_obtenido', 'Título obtenido'],
      ['direccion', 'Dirección'],
    ]
    return req
      .filter(([k]) => values[k] === undefined || values[k] === null || values[k] === '')
      .map(([, label]) => label)
  }, [values])

  const canRun = missing.length === 0

  const handleRun = async () => {
    if (!canRun) return
    const payload: PredictRequest = {
      CLB_EstadoCivil: String(values.CLB_EstadoCivil),
      CLB_Genero: String(values.CLB_Genero),
      edad_al_ingresar: Number(values.edad_al_ingresar),
      Barrio: String(values.Barrio),
      Comuna: String(values.Comuna),
      Estrato: Number(values.Estrato),
      hijos: Number(values.hijos),
      // clave literal con espacio
      "titulo obtenido": String(values.titulo_obtenido),
      direccion: String(values.direccion),
    }
    await runPrediction(payload)
  }

  const formatPct = (n: number) => `${(n * 100).toFixed(2)}%`
  const claseLabel = (c: 0 | 1) =>
    c === 1 ? 'Predice permanencia (≥ 3 meses)' : 'Predice no permanencia (< 3 meses)'

  return (
    <Card className="rounded-3xl shadow-xl border-none">
      <CardHeader>
        <CardTitle>Predicción de permanencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canRun && (
          <Alert>
            <AlertDescription>
              Completa los campos requeridos antes de ejecutar la predicción: {missing.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleRun} disabled={!canRun || loading}>
            {loading ? 'Calculando…' : 'Calcular probabilidad'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-6 w-48" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-800 font-medium">
              Probabilidad de permanencia 3 meses: {formatPct(data.probabilidad_permanencia_3_meses)}
            </p>
            <p className="text-slate-700 mt-1">Clase predicha: {claseLabel(data.clase_predicha)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PredictWidget
