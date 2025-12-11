"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCandidato, useDocumentosCandidato, useSubirDocumento, useEliminarDocumento, useAsignaciones, useResultadosCandidato, useResultadoCMTPorCandidato, useResultado16PFPorCandidato, useTiposNormativa, useAsignarCmtManual, useAsignar16pf } from "@/lib/hooks/useSelection"
import { useState } from "react"
import { Upload, Trash2, FileText, User, Mail, Phone, Calendar, CheckCircle2, Clock, AlertCircle, ClipboardCheck, XCircle, BarChart3, Loader2, Brain } from "lucide-react"
import { Resultado16PF } from '@/components/test16pf/Resultado16PF'
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
import { parseISO, format, subHours } from "date-fns"
import { es } from "date-fns/locale"
import { TiposDocumento, EstadosCandidato } from "@/types/selection.types"
import { CmtResultadoChart } from "@/components/selection/CmtResultadoChart"

// Función helper para formatear fechas UTC a hora de Bogotá (UTC-5)
const formatearFecha = (fechaUTC: string): string => {
  try {
    // 1. Parsear la fecha UTC
    const fechaUTCParsed = parseISO(fechaUTC)
    
    // 2. Restar 5 horas para convertir a hora de Bogotá (UTC-5)
    const fechaBogota = subHours(fechaUTCParsed, 5)
    
    // 3. Formatear como fecha y hora legible
    return format(fechaBogota, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })
  } catch (error) {
    return "Fecha inválida"
  }
}

export default function CandidatoDetallePage() {
  const params = useParams()
  const id = Number(params.id)

  const { data: candidato, isLoading } = useCandidato(id)
  const { data: documentos, isLoading: loadingDocs } = useDocumentosCandidato(id)
  const { data: asignaciones, isLoading: loadingAsign } = useAsignaciones(id)
  const { data: resultados, isLoading: loadingRes } = useResultadosCandidato(id)
  const { data: resultadoCMT, isLoading: loadingCMT, refetch: refetchCMT } = useResultadoCMTPorCandidato(candidato?.token)
  const { data: resultado16PF, isLoading: loading16PF } = useResultado16PFPorCandidato(candidato?.token)
  const { data: tiposNormativa } = useTiposNormativa()
  const subirDoc = useSubirDocumento()
  const eliminarDoc = useEliminarDocumento()
  const asignarCmt = useAsignarCmtManual()
  const asignar16pf = useAsignar16pf()
  const toast = useModernToast()

  const [file, setFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>(TiposDocumento.CEDULA)
  const [showAsignarCmtDialog, setShowAsignarCmtDialog] = useState(false)
  const [showAsignar16pfDialog, setShowAsignar16pfDialog] = useState(false)
  const [selectedNormativaId, setSelectedNormativaId] = useState<string>("")
  const [recalcularCMT, setRecalcularCMT] = useState(false)

  const onUpload = async () => {
    if (!file) return
    await subirDoc.mutateAsync({ candidatoId: id, file, tipoDocumento })
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
        candidatoId: id,
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
      await asignar16pf.mutateAsync(id)
      
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

  // Verificar si es candidato público y aún no tiene CMT asignada
  const puedeAsignarCmt = candidato?.requerimientoId === null && !candidato?.asignacionCmt

  // Verificar si puede asignar 16PF: tiene formulario completo y no tiene asignación 16PF
  const asignacion16pf = asignaciones?.find(a => a.nombrePrueba?.toLowerCase().includes('16pf'))
  const puedeAsignar16pf = candidato?.formularioCompletado && !asignacion16pf

  // Verificar si ya tiene resultado registrado
  const tieneResultado = candidato?.resultadoSeleccion !== null

  if (isLoading || !candidato) {
    return <FullPageLoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{candidato.nombreCompleto}</h1>
          <p className="text-muted-foreground mt-1">Gestión y seguimiento del candidato</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón Asignar CMT (solo para candidatos públicos sin CMT asignada) */}
          {puedeAsignarCmt && (
            <Button 
              onClick={() => setShowAsignarCmtDialog(true)}
              className="gap-2"
            >
              <Brain className="h-4 w-4" />
              Asignar CMT
            </Button>
          )}
          {/* Botón Asignar 16PF (solo si tiene formulario y no tiene 16PF asignado) */}
          {puedeAsignar16pf && (
            <Button 
              onClick={() => setShowAsignar16pfDialog(true)}
              className="gap-2"
              variant="outline"
            >
              <BarChart3 className="h-4 w-4" />
              Asignar 16PF
            </Button>
          )}
        </div>
      </div>

      {/* Información del Candidato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Candidato
          </CardTitle>
          <CardDescription>
            Datos de contacto y estado del proceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Contacto</p>
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Estado del Proceso</p>
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
                <p className="text-sm font-medium text-muted-foreground mb-2">Evaluaciones</p>
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
                    {/* Determinar estado vía asignaciones genéricas */}
                    {(() => {
                      const asign16pf = asignaciones?.find(a => a.nombrePrueba?.toLowerCase().includes('16pf'))
                      if (!asign16pf) return <Badge variant="outline">Sin asignar</Badge>
                      if (asign16pf.completado) return (
                        <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          Completado
                        </Badge>
                      )
                      if (asign16pf.iniciado) return (
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

      {/* Información Demográfica */}
      {candidato.formularioCompletado && candidato.formulario && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Información Demográfica
            </CardTitle>
            <CardDescription>
              Datos demográficos y personales del candidato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-x-8 gap-y-4">
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
                        onClick={async () => {
                          try {
                            const url = candidato.formulario?.urlHojaVida!
                            const safeName = `CV_${candidato.nombreCompleto.replace(/\s+/g, '_')}.pdf`
                            const resp = await fetch(`/api/cv?file=${encodeURIComponent(url)}&filename=${encodeURIComponent(safeName)}`)
                            if (!resp.ok) throw new Error('Error al descargar CV')
                            const blob = await resp.blob()
                            const objectUrl = window.URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = objectUrl
                            a.download = safeName
                            document.body.appendChild(a)
                            a.click()
                            window.URL.revokeObjectURL(objectUrl)
                            document.body.removeChild(a)
                          } catch (error) {
                            toast.error({
                              title: 'Error',
                              description: 'No se pudo descargar la hoja de vida'
                            })
                          }
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

      {/* Gestión de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Documentos
          </CardTitle>
          <CardDescription>
            Subir y administrar documentos del candidato (cédula, certificados, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

      {/* Resultados de Prueba CMT */}
      {(loadingCMT || (resultadoCMT && resultadoCMT.dimensiones && resultadoCMT.dimensiones.length > 0)) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Resultados de la Prueba CMT
                </CardTitle>
                <CardDescription className="mt-1">
                  Análisis detallado de competencias por dimensiones
                </CardDescription>
              </div>
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
            </div>
          </CardHeader>
          <CardContent>
            {loadingCMT ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-semibold text-gray-900">Cargando resultados CMT</p>
                  <p className="text-sm text-gray-600 mt-1">Por favor espera mientras procesamos los datos...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Información general del resultado */}
                {resultadoCMT && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-blue-900">
                          Prueba completada exitosamente
                        </p>
                        <p className="text-xs text-blue-700">
                          {resultadoCMT.fechaResultado && `Fecha: ${formatearFecha(resultadoCMT.fechaResultado)}`}
                        </p>
                      </div>
                      {resultadoCMT.tipoNormativa && (
                        <Badge variant="outline" className="bg-white">
                          {resultadoCMT.tipoNormativa}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Gráficas por categoría */}
                <CmtResultadoChart
                  dimensiones={resultadoCMT?.dimensiones || []}
                  nombreCandidato={resultadoCMT?.nombreCandidato || ""}
                  fechaResultado={resultadoCMT?.fechaResultado || ""}
                  tipoNormativa={resultadoCMT?.tipoNormativa || ""}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resultados Test 16PF */}
      {(loading16PF || resultado16PF) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Resultados Test 16PF
            </CardTitle>
            <CardDescription>
              Perfil de factores de personalidad (decatipos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading16PF ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Cargando resultados 16PF…</p>
              </div>
            ) : resultado16PF ? (
              <Resultado16PF resultado={resultado16PF} />
            ) : (
              <div className="text-sm text-muted-foreground py-6">No hay resultados disponibles aún.</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog Asignar CMT */}
      <Dialog open={showAsignarCmtDialog} onOpenChange={setShowAsignarCmtDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Asignar Prueba CMT
            </DialogTitle>
            <DialogDescription>
              Selecciona el tipo de normativa CMT que se aplicará a este candidato público.
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
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Asignar Test 16PF
            </DialogTitle>
            <DialogDescription>
              El test 16PF será asignado al candidato con normativa automática según su género.
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
                    basándose en el género registrado en su formulario:
                  </p>
                  <ul className="text-sm text-amber-800 list-disc list-inside space-y-1 mt-2">
                    {candidato?.formulario?.genero?.toLowerCase().includes('masculino') && (
                      <li>Se aplicará normativa <strong>Masculino - 16PF</strong></li>
                    )}
                    {candidato?.formulario?.genero?.toLowerCase().includes('femenino') && (
                      <li>Se aplicará normativa <strong>Femenino - 16PF</strong></li>
                    )}
                    {!candidato?.formulario?.genero && (
                      <li>⚠ Se usará normativa masculina por defecto (género no especificado)</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
              <p className="text-sm text-green-800">
                Se asignará automáticamente con fecha límite de 30 días.
              </p>
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
    </div>
  )
}
