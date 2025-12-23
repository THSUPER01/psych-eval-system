import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, FileCheck2, Clock, CheckCircle2, PlayCircle, ExternalLink } from 'lucide-react'
import type { Asignacion16pfDto, AsignacionCmtDto } from '@/types/selection.types'
import { parseUtcDate } from '@/lib/date'

type Props = {
  token: string
  asignacionCmt?: AsignacionCmtDto
  asignacion16pf?: Asignacion16pfDto
}

function EstadoBadge({
  label,
  color = 'bg-slate-100 text-slate-700 border-slate-200',
}: {
  label: string
  color?: string
}) {
  return <Badge variant="outline" className={color}>{label}</Badge>
}

export function PruebasAsignadas({ token, asignacionCmt, asignacion16pf }: Props) {
  const items = [
    asignacion16pf && {
      key: '16pf',
      title: 'Test 16PF',
      icon: <FileCheck2 className="h-6 w-6 text-indigo-600" />,
      descripcion:
        'Cuestionario de 185 ítems que evalúa 16 factores de personalidad. Tiempo estimado: 35-45 minutos.',
      ruta: `/prueba/16pf/${token}`,
      asignacion: asignacion16pf,
      colors: {
        header: 'from-indigo-50 to-blue-50',
        accent: 'bg-indigo-100',
      },
    },
    asignacionCmt && {
      key: 'cmt',
      title: 'Cuestionario de Motivación para el Trabajo (CMT)',
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      descripcion:
        'Cuestionario de 15 grupos de frases. Ordena de 5 a 1 según tu preferencia. Tiempo estimado: 20-35 minutos.',
      ruta: `/prueba/cmt/${token}`,
      asignacion: asignacionCmt,
      colors: {
        header: 'from-purple-50 to-pink-50',
        accent: 'bg-purple-100',
      },
    },
  ].filter(Boolean) as Array<{
    key: string
    title: string
    icon: ReactNode
    descripcion: string
    ruta: string
    asignacion: Asignacion16pfDto | AsignacionCmtDto
    colors: { header: string; accent: string }
  }>

  if (items.length === 0) return null

  const renderEstado = (estado: string, completada: boolean) => {
    if (completada)
      return <EstadoBadge label="Completada" color="bg-green-50 text-green-700 border-green-200" />
    switch (estado) {
      case 'INICIADA':
      case 'EN_PROGRESO':
        return <EstadoBadge label="En progreso" color="bg-amber-50 text-amber-700 border-amber-200" />
      case 'PENDIENTE':
        return <EstadoBadge label="Pendiente" />
      case 'VENCIDA':
      case 'EXPIRADA':
        return <EstadoBadge label="Vencida" color="bg-rose-50 text-rose-700 border-rose-200" />
      default:
        return <EstadoBadge label={estado} />
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {items.map(({ key, title, icon, descripcion, ruta, asignacion, colors }) => {
        const estado = asignacion.estadoAsignacion
        const completada = asignacion.pruebaCompletada
        const fechaLimite = asignacion.fechaLimite

        return (
          <Card key={key} className="overflow-hidden rounded-3xl border-none shadow-xl">
            <div className={`bg-gradient-to-r ${colors.header} p-6`}>{/* Header */}
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full ${colors.accent} flex items-center justify-center`}>{icon}</div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-gray-900">{title}</CardTitle>
                  <div className="mt-1">{renderEstado(estado, !!completada)}</div>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <p className="text-gray-700 text-sm sm:text-base">{descripcion}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                {fechaLimite && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Fecha límite: {parseUtcDate(fechaLimite)?.toLocaleString() || 'Fecha invalida'}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                {completada ? (
                  <Button asChild variant="outline">
                    <Link to={ruta}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Ver resumen
                    </Link>
                  </Button>
                ) : estado === 'VENCIDA' ? (
                  <Button variant="secondary" disabled>
                    <ExternalLink className="mr-2 h-4 w-4" /> No disponible
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to={ruta}>
                      <PlayCircle className="mr-2 h-4 w-4" /> {estado === 'INICIADA' || estado === 'EN_PROGRESO' ? 'Continuar' : 'Iniciar'}
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default PruebasAsignadas
