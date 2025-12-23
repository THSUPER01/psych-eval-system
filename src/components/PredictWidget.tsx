import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Zap } from 'lucide-react'
import type { Candidato } from '@/types/selection.types'
import { parseUtcDate } from '@/lib/date'

type Props = {
  candidato: Candidato
}

export function PredictWidget({ candidato }: Props) {
  const hasPrediction = useMemo(() => {
    return (
      candidato.prediccionPermanencia !== null &&
      candidato.probabilidadPermanencia !== null &&
      candidato.fechaPrediccion !== null
    )
  }, [candidato])

  const normalizedProb = useMemo(() => {
    const raw = candidato.probabilidadPermanencia ?? 0
    return Math.min(1, Math.max(0, raw))
  }, [candidato.probabilidadPermanencia])

  const probPct = normalizedProb * 100

  const getAccent = (p: number) => {
    if (p >= 0.75) return { color: '#0ea5e9', badge: 'default' as const, label: 'Alta' }
    if (p >= 0.5) return { color: '#eab308', badge: 'secondary' as const, label: 'Media' }
    return { color: '#ef4444', badge: 'destructive' as const, label: 'Baja' }
  }

  const accent = getAccent(normalizedProb)
  const ringStyle = {
    background: `conic-gradient(${accent.color} ${probPct}%, #e5e7eb ${probPct}%)`,
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—'
    try {
      const date = parseUtcDate(dateStr)
      if (!date) return '-'
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '—'
    }
  }

  const getPredictionLabel = (prediction: number | null) => {
    if (prediction === null) return 'Sin predicción'
    return prediction === 1 ? 'Permanencia (≥ 3 meses)' : 'No permanencia (< 3 meses)'
  }

  const getPredictionColor = (prediction: number | null) => {
    if (prediction === null) return 'secondary'
    return prediction === 1 ? 'default' : 'destructive'
  }

  if (!hasPrediction) {
    return (
      <Card className="rounded-3xl shadow-xl border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            Predicción de permanencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              La predicción aún no está disponible. Los datos se analizarán cuando el candidato
              complete el formulario demográfico.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-lg border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Predicción de permanencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Predicción Principal */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Anillo Animado Responsivo */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 mx-auto sm:mx-0">
            <div
              className="absolute inset-0 rounded-full animate-[spin_20s_linear_infinite] opacity-15"
              style={{ background: 'conic-gradient(#c7d2fe 0%, #e0f2fe 40%, #c7d2fe 100%)' }}
            />
            <div className="relative w-full h-full rounded-full p-1.5 bg-white shadow-md border border-slate-100">
              <div
                className="w-full h-full rounded-full flex items-center justify-center"
                style={ringStyle}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white flex flex-col items-center justify-center shadow-sm gap-0.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prob.</span>
                  <span 
                    className="text-xl sm:text-2xl md:text-3xl font-extrabold font-mono" 
                    style={{ color: accent.color }}
                    aria-live="polite"
                    role="status"
                  >
                    {probPct.toFixed(0)}%
                  </span>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 py-0 h-4" 
                    style={{ borderColor: accent.color, color: accent.color }}
                    aria-label={`Nivel de permanencia: ${accent.label}`}
                  >
                    {accent.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Información y Predicción */}
          <div className="flex-1 flex flex-col items-center sm:items-start gap-3">
            <Badge 
              variant={getPredictionColor(candidato.prediccionPermanencia)} 
              className="text-xs sm:text-sm px-3 py-1"
              aria-label={getPredictionLabel(candidato.prediccionPermanencia)}
            >
              {getPredictionLabel(candidato.prediccionPermanencia)}
            </Badge>
            <p className="text-xs text-slate-600 text-center sm:text-left">
              Probabilidad de permanecer más de 3 meses en la posición
            </p>
          </div>
        </div>

        {/* Metadatos Compactos */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-slate-100 text-xs">
          <div>
            <p className="text-slate-500 font-semibold mb-1">Fecha predicción</p>
            <p className="text-slate-700 text-xs">{formatDate(candidato.fechaPrediccion)}</p>
          </div>
          <div>
            <p className="text-slate-500 font-semibold mb-1">Modelo</p>
            <p className="text-slate-700 text-xs font-mono">{candidato.versionModelo !== null ? `v${candidato.versionModelo}` : '—'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PredictWidget
