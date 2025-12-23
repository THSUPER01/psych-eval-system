import { useParams, Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCandidato, useResultadoCMTPorCandidato, useResultado16PFPorCandidato } from "@/lib/hooks/useSelection"
import { ArrowLeft, User, Mail, Phone, Calendar, CheckCircle2, Clock, Brain, BarChart3, AlertCircle, FileText, Award } from "lucide-react"
import { es } from "date-fns/locale"
import { formatUtcToLocal } from "@/lib/date"
import { CmtResultadoChart } from "@/components/selection/CmtResultadoChart"
import { Resultado16PFChart } from "@/components/selection/Resultado16PFChart"

// Helper para formatear fechas UTC a hora local
const formatearFecha = (fechaUTC: string): string =>
  formatUtcToLocal(fechaUTC, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })

export default function ResultadoDetallePage() {
  const { id } = useParams()
  const candidatoId = Number(id)

  const { data: candidato, isLoading } = useCandidato(candidatoId)
  const { data: resultadoCMT, isLoading: loadingCMT } = useResultadoCMTPorCandidato(candidato?.token)
  const { data: resultado16PF, isLoading: loading16PF } = useResultado16PFPorCandidato(candidato?.token)

  if (isLoading || !candidato) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const cmtCompletada = candidato.asignacionCmt?.pruebaCompletada || false
  const test16pfCompletado = candidato.asignacion16pf?.pruebaCompletada || false
  const tieneResultadoCMT = resultadoCMT && resultadoCMT.dimensiones && resultadoCMT.dimensiones.length > 0
  const tieneResultado16PF = Boolean(resultado16PF?.escalas?.length)
  const tieneAsignaciones = Boolean(candidato.asignacionCmt || candidato.asignacion16pf)
  const mostrarResultados = tieneAsignaciones || tieneResultadoCMT || tieneResultado16PF
  const defaultTab = candidato.asignacion16pf || tieneResultado16PF ? "16pf" : "cmt"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/panel/seleccion/resultados">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{candidato.nombreCompleto}</h1>
            <p className="text-muted-foreground mt-1">Resultados de Evaluación</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {candidato.requerimientoId === null && (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              Candidato Público
            </Badge>
          )}
          <Badge variant="outline">{candidato.estado?.estDescripcion || "Sin estado"}</Badge>
        </div>
      </div>

      {/* Información del Candidato */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Candidato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{candidato.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{candidato.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Registrado:</span>
                  <span>{formatearFecha(candidato.fechaCreacion)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Cédula:</span> {candidato.cedulaCiudadania || "No especificada"}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Formulario:</span>
                  {candidato.formularioCompletado ? (
                    <Badge className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completado {candidato.fechaCompletado && `- ${formatearFecha(candidato.fechaCompletado)}`}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
  
        {/* Estado de Pruebas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estado de Evaluaciones
            </CardTitle>
            <CardDescription>Resumen del progreso en las pruebas psicométricas</CardDescription>
          </CardHeader>
          <CardContent>
            {candidato.asignacionCmt ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cmtCompletada ? 'bg-green-100' : 'bg-blue-100'}`}>
                      <Brain className={`h-5 w-5 ${cmtCompletada ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Cuestionario de Motivación para el Trabajo (CMT)</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {candidato.asignacionCmt.tipoNormativa 
                          ? `Normativa: ${candidato.asignacionCmt.tipoNormativa.tipNombre}`
                          : "Normativa no especificada"}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Asignada:</span>
                          <span>{formatearFecha(candidato.asignacionCmt.fechaAsignacion)}</span>
                        </div>
                        {candidato.asignacionCmt.fechaLimite && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Límite:</span>
                            <span>{formatearFecha(candidato.asignacionCmt.fechaLimite)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    {cmtCompletada ? (
                      <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Completada
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                </div>
  
                {!cmtCompletada && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-900">
                      El candidato aún no ha completado la prueba CMT. Los resultados estarán disponibles una vez finalice la evaluación.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No hay pruebas asignadas a este candidato.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultados Psicometricos */}
      {mostrarResultados && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resultados psicometricos
            </CardTitle>
            <CardDescription>
              Visualizacion integrada de CMT y 16PF para el candidato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="16pf">16PF</TabsTrigger>
                <TabsTrigger value="cmt">CMT</TabsTrigger>
              </TabsList>

              <TabsContent value="16pf" className="space-y-6">
                {loading16PF ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : !candidato.asignacion16pf ? (
                  <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>La prueba 16PF no esta asignada a este candidato.</span>
                  </div>
                ) : !test16pfCompletado ? (
                  <div className="flex items-start gap-2 rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>El candidato aun no ha completado el test 16PF.</span>
                  </div>
                ) : tieneResultado16PF ? (
                  <Resultado16PFChart
                    escalas={resultado16PF?.escalas || []}
                    dimensiones={resultado16PF?.dimensiones || []}
                    nombreCandidato={resultado16PF?.nombreCandidato || ""}
                    fechaAplicacion={resultado16PF?.fechaAplicacion || ""}
                    tipoNormativa={resultado16PF?.tipoNormativa || ""}
                    generoAplicado={resultado16PF?.generoAplicado || ""}
                    totalRespuestas={resultado16PF?.totalRespuestas}
                  />
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>Los resultados 16PF aun estan en procesamiento.</span>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="cmt" className="space-y-6">
                {loadingCMT ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : !candidato.asignacionCmt ? (
                  <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>La prueba CMT no esta asignada a este candidato.</span>
                  </div>
                ) : !cmtCompletada ? (
                  <div className="flex items-start gap-2 rounded-lg border bg-blue-50 p-4 text-sm text-blue-900">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>El candidato aun no ha completado la prueba CMT.</span>
                  </div>
                ) : tieneResultadoCMT ? (
                  <div className="space-y-6">
                    <CmtResultadoChart
                      dimensiones={resultadoCMT?.dimensiones || []}
                      nombreCandidato={resultadoCMT?.nombreCandidato || ""}
                      fechaResultado={resultadoCMT?.fechaResultado || ""}
                      tipoNormativa={resultadoCMT?.tipoNormativa || ""}
                    />

                    <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
                      <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2">Normativa aplicada</h4>
                        <p className="text-sm text-purple-700">
                          {candidato.asignacionCmt?.tipoNormativa?.tipNombre || "No especificada"}
                        </p>
                        {candidato.asignacionCmt?.tipoNormativa?.tipDescripcion && (
                          <p className="text-xs text-purple-600 mt-1">
                            {candidato.asignacionCmt.tipoNormativa.tipDescripcion}
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2">Informacion del resultado</h4>
                        <p className="text-sm text-blue-700">
                          Genero: {candidato.formulario?.genero || "No especificado"}
                        </p>
                        <p className="text-sm text-blue-700">
                          Total de dimensiones evaluadas: 15
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 mt-0.5" />
                    <span>Los resultados CMT aun estan en procesamiento.</span>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Datos Demográficos Resumidos */}
      {candidato.formulario && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Demográfica
            </CardTitle>
            <CardDescription>Datos proporcionados por el candidato</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Estado Civil</dt>
                <dd className="font-medium">{candidato.formulario.estadoCivil || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Género</dt>
                <dd className="font-medium">{candidato.formulario.genero || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Edad al Ingreso</dt>
                <dd className="font-medium">{candidato.formulario.edadIngreso || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Municipio</dt>
                <dd className="font-medium">{candidato.formulario.municipio || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Barrio</dt>
                <dd className="font-medium">{candidato.formulario.barrio || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estrato</dt>
                <dd className="font-medium">{candidato.formulario.estrato || "N/A"}</dd>
              </div>
            </dl>

            {candidato.formulario.habilidades && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-2">Habilidades y Experiencia</h4>
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm whitespace-pre-wrap">{candidato.formulario.habilidades}</p>
                </div>
              </div>
            )}

            {candidato.formulario.urlHojaVida && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = candidato.formulario?.urlHojaVida!
                    window.open(url, '_blank')
                  }}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Ver Hoja de Vida
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
