import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PredictWidget from "@/components/PredictWidget"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  useCandidato, 
  useDocumentosCandidato, 
  useSubirDocumento, 
  useEliminarDocumento, 
  useResultadosCandidato, 
  useResultadoCMTPorCandidato, 
  useResultado16PFPorCandidato, 
  useTiposNormativa, 
  useAsignarCmtManual, 
  useAsignar16pf,
  useRegistrarResultado,
} from "@/lib/hooks/useSelection"
import { 
  Upload, 
  Trash2, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ClipboardCheck, 
  XCircle, 
  BarChart3, 
  Loader2, 
  Brain,
  Printer,
} from "lucide-react"
// import { Resultado16PF } from '@/components/test16pf/Resultado16PF'
import { CmtResultadoChart } from "@/components/selection/CmtResultadoChart"
import { Resultado16PFChart } from "@/components/selection/Resultado16PFChart"
import { useModernToast } from "@/lib/toast"
import { FullPageLoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { es } from "date-fns/locale"
import { formatUtcToLocal } from "@/lib/date"
import { TiposDocumento } from "@/types/selection.types"
import type { Candidato, CmtResultadoDto } from "@/types/selection.types"
import type { Resultado16PFDto } from "@/types/test16pf.types"

// Helper para formatear fechas UTC a hora local
const formatearFecha = (fechaUTC: string): string =>
  formatUtcToLocal(fechaUTC, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })

export default function CandidatoDetallePage() {
  const { id } = useParams()
  const candidatoId = Number(id)

  const { data: candidato, isLoading } = useCandidato(candidatoId)
  const { data: documentos, isLoading: loadingDocs } = useDocumentosCandidato(candidatoId)
  const { data: resultados, isLoading: loadingRes } = useResultadosCandidato(candidatoId)
  const { data: resultadoCMT, isLoading: loadingCMT, refetch: refetchCMT } = useResultadoCMTPorCandidato(candidato?.token)
  const { data: resultado16PF, isLoading: loading16PF } = useResultado16PFPorCandidato(candidato?.token)
  const { data: tiposNormativa } = useTiposNormativa()
  const subirDoc = useSubirDocumento()
  const eliminarDoc = useEliminarDocumento()
  const asignarCmt = useAsignarCmtManual()
  const asignar16pf = useAsignar16pf()
  const registrarResultado = useRegistrarResultado()
  const toast = useModernToast()

  const [file, setFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>(TiposDocumento.CEDULA)
  const [showAsignarCmtDialog, setShowAsignarCmtDialog] = useState(false)
  const [showAsignar16pfDialog, setShowAsignar16pfDialog] = useState(false)
  const [selectedNormativaId, setSelectedNormativaId] = useState<string>("")
  const [recalcularCMT, setRecalcularCMT] = useState(false)
  const [showAprobarDialog, setShowAprobarDialog] = useState(false)
  const [showRechazarDialog, setShowRechazarDialog] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState("")
  const [printTarget, setPrintTarget] = useState<"16pf" | "cmt" | null>(null)

  useEffect(() => {
    const handleAfterPrint = () => setPrintTarget(null)
    window.addEventListener("afterprint", handleAfterPrint)
    return () => window.removeEventListener("afterprint", handleAfterPrint)
  }, [])

  const onUpload = async () => {
    if (!file) return
    await subirDoc.mutateAsync({ candidatoId, file, tipoDocumento })
    setFile(null)
  }

  const handleAsignarCmt = async () => {
    if (!selectedNormativaId) {
      toast.error({
        title: "Selecciona una normativa",
        description: "Debes seleccionar un tipo de normativa CMT para continuar.",
      })
      return
    }

    try {
      await asignarCmt.mutateAsync({
        candidatoId,
        tipoNormativaId: Number(selectedNormativaId),
      })
      
      toast.success({
        title: "CMT asignada exitosamente",
        description: "La prueba CMT ha sido asignada al candidato.",
      })
      
      setShowAsignarCmtDialog(false)
      setSelectedNormativaId("")
    } catch (error: any) {
      toast.error({
        title: "Error al asignar CMT",
        description: error?.message || "No se pudo asignar la prueba CMT.",
      })
    }
  }

  const handleAsignar16pf = async () => {
    try {
      await asignar16pf.mutateAsync(candidatoId)
      
      toast.success({
        title: "Test 16PF asignado exitosamente",
        description: "La prueba 16PF ha sido asignada. La normativa se aplicará automáticamente según el género del candidato.",
      })
      
      setShowAsignar16pfDialog(false)
    } catch (error: any) {
      toast.error({
        title: "Error al asignar test 16PF",
        description: error?.message || "No se pudo asignar la prueba 16PF.",
      })
    }
  }

  const triggerPrint = (target: "16pf" | "cmt") => {
    setPrintTarget(target)
    setTimeout(() => {
      window.print()
    }, 400)
  }

  // Verificar si es candidato público y aún no tiene CMT asignada
  const puedeAsignarCmt = candidato?.requerimientoId === null && !candidato?.asignacionCmt

  // Verificar si puede asignar 16PF: tiene formulario completo y no tiene asignación 16PF
  const asignacion16pf = candidato?.asignacion16pf
  const puedeAsignar16pf = candidato?.formularioCompletado && !asignacion16pf

  // Verificar si ya tiene resultado registrado
  const tieneResultado = candidato?.resultadoSeleccion !== null
  const cmtCompletada = candidato?.asignacionCmt?.pruebaCompletada || false
  const test16pfCompletado = candidato?.asignacion16pf?.pruebaCompletada || false
  const tieneResultadoCMT = Boolean(resultadoCMT?.dimensiones?.length)
  const tieneResultado16PF = Boolean(resultado16PF?.escalas?.length)
  const tieneAsignaciones = Boolean(candidato?.asignacionCmt || candidato?.asignacion16pf)
  const mostrarResultados = Boolean(tieneAsignaciones || tieneResultadoCMT || tieneResultado16PF)
  const defaultTab = candidato?.asignacion16pf || tieneResultado16PF ? "16pf" : "cmt"
  const puedeRecalcularCMT = Boolean(tieneResultadoCMT)
  const puedeDecidir = Boolean(candidato?.formularioCompletado && candidato?.resultadoSeleccion === null)
  const puedeImprimir = Boolean(tieneResultado16PF || tieneResultadoCMT)

  if (isLoading || !candidato) {
    return <FullPageLoadingSpinner />
  }

  return (
    <div className="space-y-6 pb-32 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{candidato.nombreCompleto}</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión y seguimiento del candidato</p>
      </div>

      {/* Sticky Action Bar (Mobile Bottom, Desktop Inline) */}
      {(puedeAsignarCmt || puedeAsignar16pf || puedeDecidir) && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 md:relative md:bottom-auto md:right-auto md:z-auto md:flex-row md:justify-end md:gap-3 md:p-0">
          {puedeAsignarCmt && (
            <Button 
              onClick={() => setShowAsignarCmtDialog(true)}
              className="gap-2 w-full md:w-auto shadow-lg md:shadow-none"
              aria-label="Asignar prueba CMT al candidato"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">CMT</span>
            </Button>
          )}
          {puedeAsignar16pf && (
            <Button 
              onClick={() => setShowAsignar16pfDialog(true)}
              className="gap-2 w-full md:w-auto shadow-lg md:shadow-none"
              variant="outline"
              aria-label="Asignar test 16PF al candidato"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">16PF</span>
            </Button>
          )}
          {puedeDecidir && (
            <div className="flex gap-2">
              <Button
                className="gap-2 w-full md:w-auto shadow-lg md:shadow-none"
                onClick={() => setShowAprobarDialog(true)}
                aria-label="Aprobar candidato"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Aprobar</span>
              </Button>
              <Button
                variant="destructive"
                className="gap-2 w-full md:w-auto shadow-lg md:shadow-none"
                onClick={() => setShowRechazarDialog(true)}
                aria-label="Rechazar candidato"
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Rechazar</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Información del Candidato */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Candidato
          </CardTitle>
          <CardDescription className="text-xs">
            Datos de contacto y estado del proceso
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Contacto</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{candidato.email || "No especificado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{candidato.telefono || "No especificado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Registrado {candidato.fechaCreacion ? formatearFecha(candidato.fechaCreacion) : "recientemente"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estado del Proceso */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Estado del Proceso</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Tipo:</span>
                    {candidato.requerimientoId === null ? (
                      <Badge variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        Candidato Público
                      </Badge>
                    ) : (
                      <Badge variant="outline">Requerimiento</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Estado:</span>
                    <Badge variant="outline">{candidato.estado?.estDescripcion || "Sin estado"}</Badge>
                  </div>
                  {tieneResultado && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Resultado:</span>
                      {candidato.resultadoSeleccion ? (
                        <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Aprobado
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Rechazado
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Estado de Evaluaciones */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Evaluaciones</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Link de acceso:</span>
                    {candidato.linkEnviado ? (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Enviado
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Formulario:</span>
                    {candidato.formularioCompletado ? (
                      <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Completo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Prueba CMT:</span>
                    {candidato.asignacionCmt ? (
                      candidato.asignacionCmt.pruebaCompletada ? (
                        <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Completada
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Asignada
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">Sin asignar</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Test 16PF:</span>
                    {(() => {
                      if (!asignacion16pf) return <Badge variant="outline">Sin asignar</Badge>
                      if (asignacion16pf.pruebaCompletada) return (
                        <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Completado
                        </Badge>
                      )
                      if (asignacion16pf.estadoAsignacion === 'INICIADA' || asignacion16pf.estadoAsignacion === 'EN_PROGRESO') return (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          En progreso
                        </Badge>
                      )
                      return (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Asignado
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Token de acceso */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Token de Acceso:</span>
              <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                {candidato.token
                  ? `${"•".repeat(Math.max(0, String(candidato.token).length - 4))}${String(candidato.token).slice(-4)}`
                  : "N/A"}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicción de permanencia (calculada por backend) */}
      {candidato.prediccionPermanencia !== null && (
        <PredictWidget candidato={candidato} />
      )}
      {/* Información Demográfica */}
      {candidato.formularioCompletado && candidato.formulario && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Información Demográfica
            </CardTitle>
            <CardDescription className="text-xs">
              Datos demográficos y personales del candidato
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-x-6 gap-y-3">
              {/* Datos Personales */}
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Estado Civil</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.estadoCivil || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Género</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.genero || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Edad al Ingresar</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.edadIngreso || "N/A"} años</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Estrato</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.estrato || "N/A"}</dd>
              </div>

              {/* Ubicación */}
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Municipio</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.municipio || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Comuna</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.comuna || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Barrio</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.barrio || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Dirección</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.direccion || "N/A"}</dd>
              </div>

              {/* Información Familiar */}
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Tiene Hijos</dt>
                <dd className="text-sm font-semibold">
                  {candidato.formulario.tieneHijo ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Sí
                    </Badge>
                  ) : (
                    <span>No</span>
                  )}
                </dd>
              </div>
              {candidato.formulario.cantidadHijo && (
                <div className="space-y-1">
                  <dt className="text-xs font-medium text-muted-foreground">Cantidad de Hijos</dt>
                  <dd className="text-sm font-semibold">{candidato.formulario.cantidadHijo}</dd>
                </div>
              )}
              {candidato.formulario.edadesHijos?.length ? (
                <div className="space-y-1 md:col-span-2">
                  <dt className="text-xs font-medium text-muted-foreground">Edades de los Hijos</dt>
                  <dd className="text-sm font-semibold">{candidato.formulario.edadesHijos.join(", ")} años</dd>
                </div>
              ) : null}

              {/* Tallas */}
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Talla Camisa</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.tallaCamisa || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Talla Pantalón</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.tallaPantalon || "N/A"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium text-muted-foreground">Talla Zapato</dt>
                <dd className="text-sm font-semibold">{candidato.formulario.tallaZapato || "N/A"}</dd>
              </div>
            </div>

            {/* Información Adicional para Candidatos Públicos */}
            {candidato.requerimientoId === null && (candidato.formulario.habilidades || candidato.formulario.urlHojaVida) && (
              <div className="mt-6 pt-6 border-t space-y-4">
                <h4 className="font-semibold text-sm">Información Adicional (Aplicación Pública)</h4>
                
                {candidato.formulario.habilidades && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Habilidades y Experiencia</Label>
                    <div className="mt-2 p-4 rounded-lg bg-muted/30 border">
                      <p className="text-sm whitespace-pre-wrap">{candidato.formulario.habilidades}</p>
                    </div>
                  </div>
                )}
                
                {candidato.formulario.urlHojaVida && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Hoja de Vida</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-blue-50 border border-blue-200 flex-1">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-900 font-medium">Documento adjunto disponible</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          toast.error({
                            title: 'Funcionalidad pendiente',
                            description: 'La descarga de CV será implementada próximamente'
                          })
                        }}
                        className="gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Descargar CV
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!candidato.formularioCompletado && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                El candidato aún no ha completado su formulario demográfico.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado de Selección */}
      {tieneResultado && (
        <Card className={candidato.resultadoSeleccion ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {candidato.resultadoSeleccion ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado del Proceso de Selección
            </CardTitle>
            <CardDescription>
              Decisión final registrada en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium">Estado Final:</span>
                  {candidato.resultadoSeleccion ? (
                    <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Candidato Aprobado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Candidato Rechazado
                    </Badge>
                  )}
                </div>

                {candidato.motivoRechazo && (
                  <div className="rounded-lg bg-white border border-red-300 p-4 mb-4">
                    <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Motivo del Rechazo
                    </p>
                    <p className="text-sm text-red-800">{candidato.motivoRechazo}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {candidato.fechaResultado && (
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground">Fecha de Registro</dt>
                      <dd className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatearFecha(candidato.fechaResultado)}
                      </dd>
                    </div>
                  )}
                  {candidato.usuarioResultado && (
                    <div className="space-y-1">
                      <dt className="text-xs font-medium text-muted-foreground">Registrado por</dt>
                      <dd className="text-sm font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {candidato.usuarioResultado}
                      </dd>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decisión de Selección (pendiente) */}
      {puedeDecidir && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Registrar decisión del proceso
            </CardTitle>
            <CardDescription>
              Aprueba o rechaza al candidato. El motivo de rechazo es obligatorio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button onClick={() => setShowAprobarDialog(true)} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Aprobar
            </Button>
            <Button onClick={() => setShowRechazarDialog(true)} variant="destructive" className="gap-2">
              <XCircle className="h-4 w-4" /> Rechazar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gestión de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Documentos
          </CardTitle>
          <CardDescription className="text-xs">
            Subir y administrar documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          {/* Formulario de subida */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-semibold mb-4">Subir Nuevo Documento</h4>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="file" className="text-xs">Seleccionar Archivo</Label>
                <Input 
                  id="file" 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1"
                />
              </div>
              <div className="w-full md:w-64">
                <Label className="text-xs">Tipo de Documento</Label>
                <select 
                  className="w-full border rounded-md h-10 px-3 mt-1 text-sm" 
                  value={tipoDocumento} 
                  onChange={(e) => setTipoDocumento(e.target.value)}
                >
                  {Object.values(TiposDocumento).map((t) => (
                    <option key={t} value={t}>{t.replaceAll('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div className="self-end">
                <Button 
                  onClick={onUpload} 
                  disabled={!file || subirDoc.isPending}
                  className="w-full md:w-auto"
                >
                  {subirDoc.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Subir
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de documentos */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Documentos Registrados</h4>
            {loadingDocs ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : documentos && documentos.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Archivo</th>
                      <th className="text-left p-3 font-medium">Tipo</th>
                      <th className="text-left p-3 font-medium">Tamaño</th>
                      <th className="text-left p-3 font-medium">Fecha de Subida</th>
                      <th className="w-20 p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentos.map((d) => (
                      <tr key={d.docId} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{d.nombreArchivo || "Sin nombre"}</td>
                        <td className="p-3">
                          <Badge variant="outline">{d.tipoDocumento?.replaceAll('_', ' ') || "Desconocido"}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {d.tamanioBytes ? (d.tamanioBytes/1024).toFixed(1) + " KB" : "N/A"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {d.fechaSubida ? formatearFecha(d.fechaSubida) : "Desconocida"}
                        </td>
                        <td className="p-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => eliminarDoc.mutate(d.docId)}
                            disabled={eliminarDoc.isPending}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 text-muted-foreground opacity-50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay documentos registrados para este candidato
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados psicometricos */}
      {mostrarResultados && (
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Resultados psicometricos
                </CardTitle>
                <CardDescription className="text-xs">
                  Visualizacion conjunta de CMT y 16PF
                </CardDescription>
              </div>
              {puedeImprimir && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => triggerPrint("16pf")}
                    disabled={!tieneResultado16PF}
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir 16PF
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => triggerPrint("cmt")}
                    disabled={!tieneResultadoCMT}
                  >
                    <Printer className="h-4 w-4" />
                    Imprimir CMT
                  </Button>
                </div>
              )}
            </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-muted-foreground">Analisis de competencias y motivacion</p>
                  {puedeRecalcularCMT && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRecalcularCMT(true)
                        refetchCMT().finally(() => setRecalcularCMT(false))
                      }}
                      disabled={recalcularCMT || loadingCMT}
                    >
                      {recalcularCMT ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Recalculando...
                        </>
                      ) : (
                        "Recalcular"
                      )}
                    </Button>
                  )}
                </div>

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
                  <div className="space-y-4">
                    {resultadoCMT && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {resultadoCMT.tipoNormativa && (
                          <Badge variant="outline">Normativa: {resultadoCMT.tipoNormativa}</Badge>
                        )}
                        {resultadoCMT.fechaResultado && (
                          <span>Fecha: {formatearFecha(resultadoCMT.fechaResultado)}</span>
                        )}
                      </div>
                    )}

                    <CmtResultadoChart
                      dimensiones={resultadoCMT?.dimensiones || []}
                      nombreCandidato={resultadoCMT?.nombreCandidato || ""}
                      fechaResultado={resultadoCMT?.fechaResultado || ""}
                      tipoNormativa={resultadoCMT?.tipoNormativa || ""}
                    />
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

      {printTarget && (
        <div id="print-area" className="print-area">
          {printTarget === "16pf" && (
            <PrintResultados16PF candidato={candidato} resultado={resultado16PF} />
          )}
          {printTarget === "cmt" && (
            <PrintResultadosCmt candidato={candidato} resultado={resultadoCMT} />
          )}
        </div>
      )}

      <style>{`
        @media print {
          @page { size: letter; margin: 12mm; }
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          #print-area { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; border-bottom: 2px solid #111827; padding-bottom: 8px; margin-bottom: 12px; }
          .print-title { font-size: 18px; font-weight: 700; }
          .print-subtitle { font-size: 12px; color: #4b5563; }
          .print-meta { font-size: 12px; color: #374151; }
          .print-meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; margin-bottom: 12px; }
          .print-meta-label { font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.04em; }
          .print-meta-value { font-size: 12px; font-weight: 600; color: #111827; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 11px; }
          .print-table th, .print-table td { border: 1px solid #d1d5db; padding: 6px 8px; vertical-align: top; }
          .print-table th { background: #f3f4f6; text-align: left; }
          .print-section { margin-bottom: 16px; break-inside: avoid; page-break-inside: avoid; }
          .print-section-title { font-size: 13px; font-weight: 700; margin: 8px 0; }
          .print-muted { color: #6b7280; font-size: 11px; }
          .print-chart .card:first-of-type { display: none; }
          .print-chart canvas { max-width: 100% !important; }
          .print-area .card { box-shadow: none; border-color: #d1d5db; }
        }
        @media screen {
          #print-area { position: fixed; left: -9999px; top: 0; width: 8.5in; }
        }
      `}</style>

      {/* Dialog Asignar CMT */}
      <Dialog open={showAsignarCmtDialog} onOpenChange={setShowAsignarCmtDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Asignar Prueba CMT
            </DialogTitle>
            <DialogDescription className="text-sm">
              Selecciona la normativa CMT para este candidato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="normativa">Tipo de Normativa</Label>
              <Select value={selectedNormativaId} onValueChange={setSelectedNormativaId}>
                <SelectTrigger id="normativa">
                  <SelectValue placeholder="Selecciona una normativa..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposNormativa
                    ?.filter(t => t.tipActivo)
                    .map((tipo) => (
                      <SelectItem key={tipo.tipTipoNormativaId} value={String(tipo.tipTipoNormativaId)}>
                        {tipo.tipNombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                La normativa determina los baremos de evaluación para la prueba CMT.
              </p>
            </div>

            {candidato && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                <p className="text-sm text-blue-900">
                  <strong>Candidato:</strong> {candidato.nombreCompleto}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Se enviará automáticamente un correo con el enlace para completar la prueba.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAsignarCmtDialog(false)
                setSelectedNormativaId("")
              }}
              disabled={asignarCmt.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAsignarCmt}
              disabled={!selectedNormativaId || asignarCmt.isPending}
            >
              {asignarCmt.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asignando...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Asignar CMT
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Asignar 16PF */}
      <Dialog open={showAsignar16pfDialog} onOpenChange={setShowAsignar16pfDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Asignar Test 16PF
            </DialogTitle>
            <DialogDescription className="text-sm">
              Se asignará con normativa automática según el género del candidato.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="space-y-2">
                <p className="text-sm text-blue-900">
                  <strong>Candidato:</strong> {candidato?.nombreCompleto}
                </p>
                <p className="text-sm text-blue-900">
                  <strong>Género:</strong> {candidato?.formulario?.genero || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-900">
                    Normativa Automática
                  </p>
                  <p className="text-sm text-amber-800">
                    La normativa del test 16PF se aplicará automáticamente cuando el candidato responda, 
                    basándose en el género registrado en su formulario.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAsignar16pfDialog(false)}
              disabled={asignar16pf.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAsignar16pf}
              disabled={asignar16pf.isPending}
            >
              {asignar16pf.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asignando...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Asignar Test 16PF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog Aprobar */}
      <Dialog open={showAprobarDialog} onOpenChange={setShowAprobarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Confirmar aprobación
            </DialogTitle>
            <DialogDescription>¿Seguro que deseas aprobar a este candidato?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAprobarDialog(false)} disabled={registrarResultado.isPending}>Cancelar</Button>
            <Button
              onClick={() => {
                registrarResultado.mutate(
                  { candidatoId, dto: { resultadoSeleccion: true } },
                  {
                    onSuccess: () => {
                      toast.success({ title: 'Candidato aprobado', description: 'Se registró el resultado exitosamente.' })
                      setShowAprobarDialog(false)
                    },
                    onError: (err: any) => {
                      toast.error({ title: 'Error al aprobar', description: err?.message || 'No se pudo registrar el resultado.' })
                    },
                  }
                )
              }}
              disabled={registrarResultado.isPending}
            >
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rechazar */}
      <Dialog open={showRechazarDialog} onOpenChange={setShowRechazarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Confirmar rechazo
            </DialogTitle>
            <DialogDescription>Debes especificar el motivo del rechazo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Textarea id="motivo" rows={4} value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRechazarDialog(false)} disabled={registrarResultado.isPending}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!motivoRechazo.trim()) {
                  toast.warning({ title: 'Motivo requerido', description: 'Incluye el motivo para continuar.' })
                  return
                }
                registrarResultado.mutate(
                  { candidatoId, dto: { resultadoSeleccion: false, motivoRechazo: motivoRechazo.trim() } },
                  {
                    onSuccess: () => {
                      toast.info({ title: 'Candidato rechazado', description: 'Se registró el resultado exitosamente.' })
                      setShowRechazarDialog(false)
                      setMotivoRechazo('')
                    },
                    onError: (err: any) => {
                      toast.error({ title: 'Error al rechazar', description: err?.message || 'No se pudo registrar el rechazo.' })
                    },
                  }
                )
              }}
              disabled={registrarResultado.isPending}
            >
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type PrintMetaItem = { label: string; value?: string | number | null }

function PrintMetaGrid({ items }: { items: PrintMetaItem[] }) {
  return (
    <div className="print-meta-grid">
      {items.map((item) => (
        <div key={item.label}>
          <div className="print-meta-label">{item.label}</div>
          <div className="print-meta-value">{item.value ?? "-"}</div>
        </div>
      ))}
    </div>
  )
}

function PrintResultados16PF({
  candidato,
  resultado,
}: {
  candidato: Candidato
  resultado: Resultado16PFDto | undefined
}) {
  const printDate = new Date().toLocaleString("es-CO")

  if (!resultado) {
    return (
      <section className="print-section">
        <div className="print-header">
          <div>
            <div className="print-title">Resultados 16PF</div>
            <div className="print-subtitle">Perfil de escalas primarias y dimensiones globales</div>
          </div>
          <div className="print-meta">Fecha impresion: {printDate}</div>
        </div>
        <p className="print-muted">No hay resultados 16PF disponibles.</p>
      </section>
    )
  }

  const metaItems: PrintMetaItem[] = [
    { label: "Candidato", value: resultado.nombreCandidato || candidato.nombreCompleto },
    { label: "Documento", value: candidato.cedulaCiudadania || "-" },
    { label: "Normativa", value: resultado.tipoNormativa || "-" },
    { label: "Genero aplicado", value: resultado.generoAplicado || "-" },
    { label: "Fecha aplicacion", value: resultado.fechaAplicacion ? formatearFecha(resultado.fechaAplicacion) : "-" },
    { label: "Total respuestas", value: resultado.totalRespuestas ?? "-" },
  ]

  return (
    <section className="print-section">
      <div className="print-header">
        <div>
          <div className="print-title">Resultados 16PF</div>
          <div className="print-subtitle">Perfil de escalas primarias y dimensiones globales</div>
        </div>
        <div className="print-meta">Fecha impresion: {printDate}</div>
      </div>

      <PrintMetaGrid items={metaItems} />

      <div className="print-section">
        <div className="print-section-title">Escalas primarias</div>
        <table className="print-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Escala</th>
              <th>PD</th>
              <th>Decatipo</th>
              <th>Interpretacion</th>
              <th>Polo bajo</th>
              <th>Polo alto</th>
            </tr>
          </thead>
          <tbody>
            {resultado.escalas.map((escala) => (
              <tr key={escala.codigoEscala}>
                <td>{escala.codigoEscala}</td>
                <td>{escala.nombreEscala}</td>
                <td>{escala.puntuacionDirecta}</td>
                <td>{escala.decatipo}</td>
                <td>{escala.interpretacion || "-"}</td>
                <td>{escala.poloBajo || "-"}</td>
                <td>{escala.poloAlto || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <div className="print-section-title">Dimensiones globales</div>
        {resultado.dimensiones && resultado.dimensiones.length > 0 ? (
          <table className="print-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>Puntaje bruto</th>
                <th>Decatipo</th>
              </tr>
            </thead>
            <tbody>
              {resultado.dimensiones.map((dimension) => (
                <tr key={dimension.codigoDimension}>
                  <td>{dimension.nombreDimension}</td>
                  <td>{dimension.puntuacionBruta}</td>
                  <td>{dimension.decatipoDimension}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="print-muted">No hay dimensiones globales disponibles.</p>
        )}
      </div>

      <div className="print-section print-chart">
        <Resultado16PFChart
          escalas={resultado.escalas}
          dimensiones={resultado.dimensiones || []}
          nombreCandidato={resultado.nombreCandidato || candidato.nombreCompleto}
          fechaAplicacion={resultado.fechaAplicacion}
          tipoNormativa={resultado.tipoNormativa}
          generoAplicado={resultado.generoAplicado}
          totalRespuestas={resultado.totalRespuestas}
          compact
        />
      </div>
    </section>
  )
}

function PrintResultadosCmt({
  candidato,
  resultado,
}: {
  candidato: Candidato
  resultado: CmtResultadoDto | undefined
}) {
  const printDate = new Date().toLocaleString("es-CO")

  if (!resultado) {
    return (
      <section className="print-section">
        <div className="print-header">
          <div>
            <div className="print-title">Resultados CMT</div>
            <div className="print-subtitle">Cuestionario de Motivacion para el Trabajo</div>
          </div>
          <div className="print-meta">Fecha impresion: {printDate}</div>
        </div>
        <p className="print-muted">No hay resultados CMT disponibles.</p>
      </section>
    )
  }

  const metaItems: PrintMetaItem[] = [
    { label: "Candidato", value: resultado.nombreCandidato || candidato.nombreCompleto },
    { label: "Documento", value: candidato.cedulaCiudadania || "-" },
    { label: "Normativa", value: resultado.tipoNormativa || "-" },
    { label: "Genero", value: resultado.genero || "-" },
    { label: "Fecha resultado", value: resultado.fechaResultado ? formatearFecha(resultado.fechaResultado) : "-" },
    { label: "Dimensiones", value: resultado.dimensiones?.length ?? 0 },
  ]

  const grupos = (resultado.dimensiones || []).reduce<Record<string, CmtResultadoDto["dimensiones"]>>(
    (acc, dimension) => {
      const categoria = dimension.categoria || "Sin categoria"
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(dimension)
      return acc
    },
    {}
  )

  return (
    <section className="print-section">
      <div className="print-header">
        <div>
          <div className="print-title">Resultados CMT</div>
          <div className="print-subtitle">Cuestionario de Motivacion para el Trabajo</div>
        </div>
        <div className="print-meta">Fecha impresion: {printDate}</div>
      </div>

      <PrintMetaGrid items={metaItems} />

      {Object.entries(grupos).map(([categoria, dimensiones]) => (
        <div key={categoria} className="print-section">
          <div className="print-section-title">{categoria}</div>
          <table className="print-table">
            <thead>
              <tr>
                <th>Dimension</th>
                <th>PD</th>
                <th>PB</th>
                <th>Percentil</th>
                <th>Interpretacion</th>
              </tr>
            </thead>
            <tbody>
              {dimensiones.map((dimension) => (
                <tr key={dimension.codigoDimension}>
                  <td>{dimension.nombreDimension}</td>
                  <td>{dimension.puntajeDirecto}</td>
                  <td>{dimension.puntajeBruto}</td>
                  <td>{dimension.percentil ?? "-"}</td>
                  <td>{dimension.interpretacion || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="print-section print-chart">
        <CmtResultadoChart
          dimensiones={resultado.dimensiones || []}
          nombreCandidato={resultado.nombreCandidato || candidato.nombreCompleto}
          fechaResultado={resultado.fechaResultado}
          tipoNormativa={resultado.tipoNormativa}
          compact
        />
      </div>
    </section>
  )
}
