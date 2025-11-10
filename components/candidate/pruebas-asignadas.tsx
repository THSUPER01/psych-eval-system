"use client"

import { usePruebasCandidato } from "@/lib/hooks/useCandidatePublic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Brain, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  PlayCircle, 
  AlertCircle,
  FileText 
} from "lucide-react"
import { parseISO, format, subHours, isBefore } from "date-fns"
import { es } from "date-fns/locale"

interface PruebasAsignadasProps {
  token: string
  candidatoNombre: string
}

// Helper para formatear fechas UTC a hora de Bogotá (UTC-5)
const formatearFecha = (fechaUTC: string): string => {
  try {
    const fechaUTCParsed = parseISO(fechaUTC)
    const fechaBogota = subHours(fechaUTCParsed, 5)
    return format(fechaBogota, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })
  } catch (error) {
    return "Fecha inválida"
  }
}

export function PruebasAsignadas({ token, candidatoNombre }: PruebasAsignadasProps) {
  const { data: pruebas, isLoading, error } = usePruebasCandidato(token)

  // Loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none bg-white shadow-xl rounded-3xl">
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="rounded-2xl">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="ml-2">
          <strong>Error al cargar las pruebas</strong>
          <p className="mt-1 text-sm">No se pudieron cargar tus pruebas asignadas. Intenta recargar la página.</p>
        </AlertDescription>
      </Alert>
    )
  }

  // Sin pruebas asignadas
  if (!pruebas || pruebas.length === 0) {
    return (
      <Card className="overflow-hidden border-none bg-white shadow-xl rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle className="text-xl">Evaluaciones Psicológicas</CardTitle>
          <CardDescription className="text-base">
            Aún no tienes pruebas asignadas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 text-sm">
            El equipo de psicología te asignará las evaluaciones correspondientes pronto. 
            Te notificaremos por correo electrónico cuando estén disponibles.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Con pruebas asignadas
  return (
    <Card className="overflow-hidden border-none bg-white shadow-xl rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl">Evaluaciones Psicológicas</CardTitle>
            <CardDescription className="text-base">
              Tienes {pruebas.length} {pruebas.length === 1 ? 'prueba asignada' : 'pruebas asignadas'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {pruebas.map((prueba: any) => {
          const fechaLimite = prueba.fechaLimite ? parseISO(prueba.fechaLimite) : null
          const estaVencida = fechaLimite ? isBefore(fechaLimite, new Date()) : false
          const puedeIniciar = !prueba.completado && !estaVencida

          return (
            <div 
              key={prueba.aspId}
              className={`
                relative rounded-2xl border-2 p-6 transition-all
                ${prueba.completado 
                  ? 'border-green-200 bg-green-50/50' 
                  : estaVencida
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-blue-200 bg-blue-50/50 hover:shadow-md'
                }
              `}
            >
              {/* Header de la prueba */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {prueba.nombrePrueba}
                    </h3>
                    {prueba.codigoVersion && (
                      <Badge variant="outline" className="text-xs">
                        v{prueba.codigoVersion}
                      </Badge>
                    )}
                  </div>
                  
                  {prueba.descripcion && (
                    <p className="text-sm text-gray-600 mb-3">
                      {prueba.descripcion}
                    </p>
                  )}
                </div>

                {/* Badge de estado */}
                {prueba.completado ? (
                  <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Completada
                  </Badge>
                ) : estaVencida ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Vencida
                  </Badge>
                ) : prueba.iniciado ? (
                  <Badge variant="outline" className="gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                    <Clock className="h-3 w-3" />
                    En progreso
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Pendiente
                  </Badge>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <div>
                    <span className="font-medium">Asignada:</span>{" "}
                    {prueba.fechaAsignacion ? formatearFecha(prueba.fechaAsignacion) : "N/A"}
                  </div>
                </div>
                
                {prueba.fechaLimite && (
                  <div className={`flex items-center gap-2 ${estaVencida ? 'text-red-600' : 'text-gray-600'}`}>
                    <Calendar className="h-4 w-4" />
                    <div>
                      <span className="font-medium">Límite:</span>{" "}
                      {formatearFecha(prueba.fechaLimite)}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de acción */}
              {puedeIniciar ? (
                <Button 
                  className="w-full sm:w-auto gap-2"
                  onClick={() => {
                    // TODO: Redirigir a la prueba
                    window.location.href = `/prueba/${prueba.aspId}?token=${token}`
                  }}
                >
                  <PlayCircle className="h-4 w-4" />
                  {prueba.iniciado ? 'Continuar prueba' : 'Iniciar prueba'}
                </Button>
              ) : prueba.completado ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Completaste esta prueba el {prueba.fechaFinalizacion ? formatearFecha(prueba.fechaFinalizacion) : ''}</span>
                </div>
              ) : estaVencida ? (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>El tiempo límite para esta prueba ha expirado</span>
                </div>
              ) : null}
            </div>
          )
        })}

        {/* Nota informativa */}
        <Alert className="rounded-xl border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-sm text-blue-900">
            <strong>Importante:</strong> Completa tus pruebas antes de la fecha límite. 
            Una vez iniciada una prueba, debes completarla en una sola sesión.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
