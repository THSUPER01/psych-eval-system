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
import type { CmtResultadoDimensionDto } from "@/types/selection.types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels)

// Rangos visuales con colores actualizados
const RANGOS = [
  { label: "Excepcionalmente bajo", start: 0, end: 20, color: "#FEE2E2" }, // Rojo muy claro
  { label: "Relativamente bajo", start: 20, end: 40, color: "#FED7AA" }, // Naranja claro
  { label: "Promedio", start: 40, end: 60, color: "#FEF3C7" }, // Amarillo claro
  { label: "Relativamente alto", start: 60, end: 80, color: "#D1FAE5" }, // Verde claro
  { label: "Excepcionalmente alto", start: 80, end: 100, color: "#A7F3D0" }, // Verde más intenso
]

interface CategoriaChartProps {
  dimensiones: CmtResultadoDimensionDto[]
  categoria: string
}

function CategoriaChart({ dimensiones, categoria }: CategoriaChartProps) {
  const labels = dimensiones.map((d) => d.nombreDimension)
  const dataBarra = dimensiones.map((d) => d.puntajeDirecto)

  // Plugin para dibujar rangos de fondo y marcadores
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
        dimensiones.forEach((d, idx) => {
          const yPos = y.getPixelForValue(idx)
          const barHeight = (y.getPixelForValue(0) - y.getPixelForValue(1))
          const barTop = yPos - barHeight / 2
          const barBottom = yPos + barHeight / 2

          // Dibujar cada rango de color
          RANGOS.forEach((rango) => {
            const xStart = x.getPixelForValue(rango.start)
            const xEnd = x.getPixelForValue(rango.end)
            
            ctx.save()
            ctx.fillStyle = rango.color
            ctx.fillRect(xStart, barTop, xEnd - xStart, barHeight)
            ctx.restore()
          })
        })
      },
      afterDatasetsDraw(chart: any) {
        const {
          ctx,
          scales: { x, y },
        } = chart

        dimensiones.forEach((d, idx) => {
          const yPos = y.getPixelForValue(idx)
          const barHeight = y.getPixelForValue(0) - y.getPixelForValue(1)

          const drawLinea = (valor: number | null | undefined, color: string, width = 2) => {
            if (valor == null) return
            const xPos = x.getPixelForValue(valor)
            ctx.save()
            ctx.strokeStyle = color
            ctx.lineWidth = width
            ctx.beginPath()
            ctx.moveTo(xPos, yPos - barHeight / 2 + 2)
            ctx.lineTo(xPos, yPos + barHeight / 2 - 2)
            ctx.stroke()
            ctx.restore()
          }

          // Dibujar marcadores (invertidos: inferior=rojo, superior=verde)
          drawLinea(d.pdLimiteInferior, "#DC2626", 2) // Rojo - Límite inferior
          drawLinea(d.pdLimiteSuperior, "#059669", 2) // Verde - Límite superior
          drawLinea(d.pdMedia, "#2563EB", 3) // Azul - Media (más gruesa)
        })
      },
    }),
    [dimensiones]
  )

  const datasets = [
    // Solo la barra principal (PD) - los rangos se dibujan como fondo en el plugin
    {
      label: "Puntaje Directo (PD)",
      data: dataBarra,
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
        max: 100,
        stacked: false, // No usar stack ya que solo hay una barra
        title: {
          display: true,
          text: "Puntaje (0 - 100)",
        },
      },
      y: {
        stacked: false,
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        display: false, // Ocultar leyenda automática, usaremos una personalizada
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const d = dimensiones[ctx.dataIndex]
            if (ctx.dataset.label === "Puntaje Directo (PD)") {
              return [
                `PD: ${d.puntajeDirecto}`,
                `PB: ${d.puntajeBruto}`,
                `Percentil: ${d.percentil ?? "N/A"}`,
                `Interpretación: ${d.interpretacion || "N/A"}`,
              ]
            }
            return ctx.dataset.label
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
          // Mostrar solo en la barra de PD
          if (ctx.dataset.label === "Puntaje Directo (PD)") {
            return dimensiones[ctx.dataIndex].puntajeDirecto
          }
          return null
        },
      } as any,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{categoria}</CardTitle>
        <CardDescription>{dimensiones.length} dimensiones evaluadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${Math.max(300, dimensiones.length * 80)}px` }}>
          <Bar data={{ labels, datasets }} options={options} plugins={[backgroundPlugin]} />
        </div>
        
        {/* Leyenda personalizada */}
        <div className="mt-6 space-y-3">
          {/* Leyenda de rangos */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Rangos de interpretación:</p>
            <div className="flex flex-wrap gap-3">
              {RANGOS.map((rango) => (
                <div key={rango.label} className="flex items-center gap-2">
                  <div className="w-6 h-4 rounded border border-gray-300" style={{ backgroundColor: rango.color }} />
                  <span className="text-xs text-muted-foreground">{rango.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="w-6 h-4 rounded border-2" style={{ backgroundColor: "rgba(139, 92, 246, 0.85)", borderColor: "#7C3AED" }} />
                <span className="text-xs text-muted-foreground">Puntaje Directo (PD)</span>
              </div>
            </div>
          </div>
          
          {/* Leyenda de marcadores */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Marcadores estadísticos:</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#2563EB]" />
                <span className="text-xs text-muted-foreground">Media</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#DC2626]" />
                <span className="text-xs text-muted-foreground">Límite Inferior</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-[#059669]" />
                <span className="text-xs text-muted-foreground">Límite Superior</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CmtResultadoChartProps {
  dimensiones: CmtResultadoDimensionDto[]
  nombreCandidato?: string
  fechaResultado?: string
  tipoNormativa?: string
}

export function CmtResultadoChart({
  dimensiones,
  nombreCandidato,
  fechaResultado,
  tipoNormativa,
}: CmtResultadoChartProps) {
  // Agrupar dimensiones por categoría
  const grupos = useMemo(() => {
    const grouped = dimensiones.reduce<Record<string, CmtResultadoDimensionDto[]>>((acc, d) => {
      const cat = d.categoria || "Sin categoría"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(d)
      return acc
    }, {})

    return Object.entries(grouped)
  }, [dimensiones])

  if (dimensiones.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay resultados CMT disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con información del resultado */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado del Cuestionario de Motivación para el Trabajo (CMT)</CardTitle>
          <CardDescription>
            {nombreCandidato && <span className="block">Candidato: {nombreCandidato}</span>}
            {tipoNormativa && <span className="block">Normativa: {tipoNormativa}</span>}
            {fechaResultado && (
              <span className="block">
                Fecha: {new Date(fechaResultado).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{dimensiones.length} dimensiones evaluadas</Badge>
            <Badge variant="outline">Escala: 0 - 100 puntos</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gráficas por categoría */}
      {grupos.map(([categoria, dims]) => (
        <CategoriaChart key={categoria} categoria={categoria} dimensiones={dims} />
      ))}
    </div>
  )
}
