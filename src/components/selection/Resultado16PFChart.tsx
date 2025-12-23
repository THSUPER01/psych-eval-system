import { useMemo } from "react"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js"
import type { ChartOptions, Plugin } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import type { Dimension16PF, Escala16PF } from "@/types/test16pf.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { parseUtcDate } from "@/lib/date"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)

// Rangos visuales para el decatipo (1-10)
const RANGOS_DECATIPO = [
  { label: "Bajo", start: 0, end: 3, color: "#FEE2E2" }, // Rojo muy claro
  { label: "Medio", start: 3, end: 7, color: "#FEF3C7" }, // Amarillo claro
  { label: "Alto", start: 7, end: 10, color: "#D1FAE5" }, // Verde claro
]

const INTERPRETATION_BADGE: Record<string, string> = {
  BAJO: "border-rose-200 bg-rose-50 text-rose-700",
  MEDIO: "border-amber-200 bg-amber-50 text-amber-700",
  ALTO: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

interface EscalasChartProps {
  escalas: Escala16PF[]
  compact?: boolean
}

function EscalasChart({ escalas, compact }: EscalasChartProps) {
  const labels = escalas.map((e) => `${e.codigoEscala} - ${e.nombreEscala}`)
  const dataDecatipo = escalas.map((e) => e.decatipo)
  const chartHeight = compact ? 420 : 600

  // Plugin para dibujar rangos de fondo
  const backgroundPlugin: Plugin<"bar"> = useMemo(
    () => ({
      id: "backgroundRangos",
      beforeDatasetsDraw(chart: any) {
        const {
          ctx,
          chartArea: { left, right, top, bottom },
          scales: { x, y },
        } = chart

        // Dibujar rangos de fondo para cada barra
        escalas.forEach((e, idx) => {
          const yPos = y.getPixelForValue(idx)
          const barHeight = y.getPixelForValue(0) - y.getPixelForValue(1)
          const barTop = yPos - barHeight / 2
          const barBottom = yPos + barHeight / 2

          // Dibujar cada rango de color
          RANGOS_DECATIPO.forEach((rango) => {
            const xStart = x.getPixelForValue(rango.start)
            const xEnd = x.getPixelForValue(rango.end)

            ctx.save()
            ctx.fillStyle = rango.color
            ctx.fillRect(xStart, barTop, xEnd - xStart, barHeight)
            ctx.restore()
          })
        })
      },
    }),
    [escalas]
  )

  const datasets = [
    {
      label: "Decatipo",
      data: dataDecatipo,
      backgroundColor: "rgba(139, 92, 246, 0.85)", // Violeta con 85% opacidad
      borderRadius: 4,
      barPercentage: 0.6,
      borderWidth: 2,
      borderColor: "#7C3AED",
    },
  ]

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 10,
        stacked: false,
        title: {
          display: true,
          text: "Decatipo (1 - 10)",
        },
      },
      y: {
        stacked: false,
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const e = escalas[ctx.dataIndex]
            return [
              `Decatipo: ${e.decatipo}`,
              `PD: ${e.puntuacionDirecta}`,
              `${e.poloBajo} ← → ${e.poloAlto}`,
              `Interpretación: ${e.interpretacion || "N/A"}`,
            ]
          },
        },
      },
      datalabels: {
        display: true,
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: (value: any, ctx: any) => {
          return escalas[ctx.dataIndex].decatipo
        },
      } as any,
    },
  }

  return (
    <div style={{ height: `${chartHeight}px` }}>
      <Bar data={{ labels, datasets }} options={options} plugins={[backgroundPlugin]} />
    </div>
  )
}

interface DimensionesChartProps {
  dimensiones: Dimension16PF[]
  compact?: boolean
}

function DimensionesChart({ dimensiones, compact }: DimensionesChartProps) {
  const labels = dimensiones.map((d) => `${d.codigoDimension} - ${d.nombreDimension}`)
  const dataDecatipo = dimensiones.map((d) => d.decatipoDimension)
  const baseHeight = compact ? 45 : 60
  const minHeight = compact ? 240 : 300

  // Plugin para dibujar rangos de fondo
  const backgroundPlugin: Plugin<"bar"> = useMemo(
    () => ({
      id: "backgroundRangos",
      beforeDatasetsDraw(chart: any) {
        const {
          ctx,
          scales: { x, y },
        } = chart

        // Dibujar rangos de fondo para cada barra
        dimensiones.forEach((d, idx) => {
          const yPos = y.getPixelForValue(idx)
          const barHeight = y.getPixelForValue(0) - y.getPixelForValue(1)
          const barTop = yPos - barHeight / 2
          const barBottom = yPos + barHeight / 2

          // Dibujar cada rango de color
          RANGOS_DECATIPO.forEach((rango) => {
            const xStart = x.getPixelForValue(rango.start)
            const xEnd = x.getPixelForValue(rango.end)

            ctx.save()
            ctx.fillStyle = rango.color
            ctx.fillRect(xStart, barTop, xEnd - xStart, barHeight)
            ctx.restore()
          })
        })
      },
    }),
    [dimensiones]
  )

  const datasets = [
    {
      label: "Decatipo",
      data: dataDecatipo,
      backgroundColor: "rgba(139, 92, 246, 0.85)",
      borderRadius: 4,
      barPercentage: 0.6,
      borderWidth: 2,
      borderColor: "#7C3AED",
    },
  ]

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: 0,
        max: 10,
        stacked: false,
        title: {
          display: true,
          text: "Decatipo (1 - 10)",
        },
      },
      y: {
        stacked: false,
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const d = dimensiones[ctx.dataIndex]
            return [
              `Decatipo: ${d.decatipoDimension}`,
              `PB: ${d.puntuacionBruta}`,
              `Pos: ${d.sumaPositiva} | Neg: ${d.sumaNegativa}`,
            ]
          },
        },
      },
      datalabels: {
        display: true,
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 12,
        },
        formatter: (value: any, ctx: any) => {
          return dimensiones[ctx.dataIndex].decatipoDimension
        },
      } as any,
    },
  }

  return (
    <div style={{ height: `${Math.max(minHeight, dimensiones.length * baseHeight)}px` }}>
      <Bar data={{ labels, datasets }} options={options} plugins={[backgroundPlugin]} />
    </div>
  )
}

interface Resultado16PFChartProps {
  escalas: Escala16PF[]
  dimensiones?: Dimension16PF[]
  nombreCandidato?: string
  fechaAplicacion?: string
  tipoNormativa?: string
  generoAplicado?: string
  totalRespuestas?: number
  compact?: boolean
}

export function Resultado16PFChart({
  escalas,
  dimensiones = [],
  nombreCandidato,
  fechaAplicacion,
  tipoNormativa,
  generoAplicado,
  totalRespuestas,
  compact,
}: Resultado16PFChartProps) {
  const fechaLabel = useMemo(() => {
    if (!fechaAplicacion) return null
    const date = parseUtcDate(fechaAplicacion)
    if (!date) return null
    return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
  }, [fechaAplicacion])

  if (!escalas.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No hay resultados 16PF disponibles.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>16 Factores de Personalidad (16PF)</CardTitle>
          <CardDescription>
            {nombreCandidato && <span className="block">Candidato: {nombreCandidato}</span>}
            {tipoNormativa && <span className="block">Normativa: {tipoNormativa}</span>}
            {fechaLabel && <span className="block">Fecha: {fechaLabel}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {generoAplicado && <Badge variant="outline">Genero: {generoAplicado}</Badge>}
            {typeof totalRespuestas === "number" && (
              <Badge variant="outline">Respuestas: {totalRespuestas}</Badge>
            )}
            <Badge variant="outline">Escala: 1 - 10 (decatipo)</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escalas Primarias</CardTitle>
          <CardDescription>{escalas.length} escalas evaluadas</CardDescription>
        </CardHeader>
        <CardContent>
          <EscalasChart escalas={escalas} compact={compact} />
        </CardContent>
      </Card>

      {dimensiones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dimensiones Globales</CardTitle>
            <CardDescription>{dimensiones.length} dimensiones evaluadas</CardDescription>
          </CardHeader>
          <CardContent>
            <DimensionesChart dimensiones={dimensiones} compact={compact} />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded border border-gray-300" style={{ backgroundColor: "#FEE2E2" }} />
          <span>Bajo (1-3)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded border border-gray-300" style={{ backgroundColor: "#FEF3C7" }} />
          <span>Medio (3-7)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded border border-gray-300" style={{ backgroundColor: "#D1FAE5" }} />
          <span>Alto (8-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-4 rounded border-2" style={{ backgroundColor: "rgba(139, 92, 246, 0.85)", borderColor: "#7C3AED" }} />
          <span>Decatipo</span>
        </div>
      </div>
    </div>
  )
}
