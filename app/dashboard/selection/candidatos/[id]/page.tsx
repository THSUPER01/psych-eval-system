"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useCandidato, useDocumentosCandidato, useSubirDocumento, useEliminarDocumento, useAsignaciones, useResultadosCandidato } from "@/lib/hooks/useSelection"
import { useState } from "react"
import { Upload, Trash2, FileText, User, Mail, Phone, Calendar, CheckCircle2, Clock, AlertCircle, ClipboardCheck, XCircle } from "lucide-react"
import { parseISO, format, subHours } from "date-fns"
import { es } from "date-fns/locale"
import { TiposDocumento, EstadosCandidato } from "@/types/selection.types"
import { RegistrarResultadoDialog } from "@/components/selection/RegistrarResultadoDialog"

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
  const subirDoc = useSubirDocumento()
  const eliminarDoc = useEliminarDocumento()

  const [file, setFile] = useState<File | null>(null)
  const [tipoDocumento, setTipoDocumento] = useState<string>(TiposDocumento.CEDULA)
  const [showResultadoDialog, setShowResultadoDialog] = useState(false)

  const onUpload = async () => {
    if (!file) return
    await subirDoc.mutateAsync({ candidatoId: id, file, tipoDocumento })
    setFile(null)
  }

  // Verificar si se puede registrar resultado
  const puedeRegistrarResultado = candidato && (
    candidato.estado.estCodigo === EstadosCandidato.CAND_FORMULARIO_COMPLETO ||
    candidato.estado.estCodigo === EstadosCandidato.CAND_EN_EVALUACION
  )

  // Verificar si ya tiene resultado registrado
  const tieneResultado = candidato?.resultadoSeleccion !== null

  if (isLoading || !candidato) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{candidato.nombreCompleto}</h1>
          <p className="text-muted-foreground mt-1">Candidato #{candidato.canId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{candidato.estado?.estDescripcion || "Sin estado"}</Badge>
          
          {/* Badge de Resultado */}
          {tieneResultado && (
            candidato.resultadoSeleccion ? (
              <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="h-3 w-3" />
                Aprobado
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Rechazado
              </Badge>
            )
          )}
          
          {/* Botón Registrar Resultado */}
          {puedeRegistrarResultado && !tieneResultado && (
            <Button 
              onClick={() => setShowResultadoDialog(true)}
              className="gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />
              Registrar Resultado
            </Button>
          )}
        </div>
      </div>

      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5"/>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground"/>
                {candidato.email || "No especificado"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4"/>
                {candidato.telefono || "No especificado"}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4"/>
                Creado {candidato.fechaCreacion ? formatearFecha(candidato.fechaCreacion) : "recientemente"}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Token de Acceso:</span>{" "}
              <span className="font-mono">
                {candidato.token
                  ? `${"•".repeat(Math.max(0, String(candidato.token).length - 4))}${String(candidato.token).slice(-4)}`
                  : "N/A"}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Link:</span> {candidato.linkEnviado ? (
                <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3"/> Enviado</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3"/> Pendiente</Badge>
              )}
            </div>
            <div className="text-sm">
              <span className="font-medium">Formulario:</span> {candidato.formularioCompleto ? (
                <Badge className="gap-1"><CheckCircle2 className="h-3 w-3"/> Completo</Badge>
              ) : (
                <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3"/> Pendiente</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario Demográfico */}
      <Card>
        <CardHeader>
          <CardTitle>Formulario Demográfico</CardTitle>
          <CardDescription>
            {candidato.formularioCompletado ? "Datos completados por el candidato" : "El candidato aún no ha completado su formulario"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDocs ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : candidato.formularioCompletado && candidato.formulario ? (
            <dl className="grid md:grid-cols-3 gap-4 text-sm">
                <div><dt className="text-muted-foreground">Estado Civil</dt><dd className="font-medium">{candidato.formulario.estadoCivil || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Género</dt><dd className="font-medium">{candidato.formulario.genero || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Edad Ingreso</dt><dd className="font-medium">{candidato.formulario.edadIngreso || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Municipio</dt><dd className="font-medium">{candidato.formulario.municipio || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Comuna</dt><dd className="font-medium">{candidato.formulario.comuna || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Barrio</dt><dd className="font-medium">{candidato.formulario.barrio || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Estrato</dt><dd className="font-medium">{candidato.formulario.estrato || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Dirección</dt><dd className="font-medium">{candidato.formulario.direccion || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Tiene Hijos</dt><dd className="font-medium">{candidato.formulario.tieneHijo ? "Sí" : "No"}</dd></div>
              {candidato.formulario.cantidadHijo ? (
                <div><dt className="text-muted-foreground">Cantidad de Hijos</dt><dd className="font-medium">{candidato.formulario.cantidadHijo}</dd></div>
              ) : null}
              {candidato.formulario.edadesHijos?.length ? (
                <div className="md:col-span-2"><dt className="text-muted-foreground">Edades Hijos</dt><dd className="font-medium">{candidato.formulario.edadesHijos.join(", ")} años</dd></div>
              ) : null}
                <div><dt className="text-muted-foreground">Talla Camisa</dt><dd className="font-medium">{candidato.formulario.tallaCamisa || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Talla Pantalón</dt><dd className="font-medium">{candidato.formulario.tallaPantalon || "N/A"}</dd></div>
                <div><dt className="text-muted-foreground">Talla Zapato</dt><dd className="font-medium">{candidato.formulario.tallaZapato || "N/A"}</dd></div>
            </dl>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="h-4 w-4"/> El candidato no ha completado el formulario.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado de Selección */}
      {tieneResultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {candidato.resultadoSeleccion ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Resultado de Selección
            </CardTitle>
            <CardDescription>
              Decisión final del proceso de evaluación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Estado:</span>
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
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-semibold text-red-900 mb-2">Motivo del rechazo:</p>
                <p className="text-sm text-red-700">{candidato.motivoRechazo}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {candidato.fechaResultado && (
                <div>
                  <dt className="text-muted-foreground">Fecha de Resultado</dt>
                  <dd className="font-medium">
                    {formatearFecha(candidato.fechaResultado)}
                  </dd>
                </div>
              )}
              {candidato.usuarioResultado && (
                <div>
                  <dt className="text-muted-foreground">Registrado por</dt>
                  <dd className="font-medium">{candidato.usuarioResultado}</dd>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Label htmlFor="file">Archivo</Label>
              <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="w-full md:w-64">
              <Label>Tipo de Documento</Label>
              <select className="w-full border rounded-md h-10 px-3" value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                {Object.values(TiposDocumento).map((t) => (
                  <option key={t} value={t}>{t.replaceAll('_',' ')}</option>
                ))}
              </select>
            </div>
            <div className="self-end">
              <Button onClick={onUpload} disabled={!file || subirDoc.isPending}>
                <Upload className="mr-2 h-4 w-4"/> Subir
              </Button>
            </div>
          </div>

          {loadingDocs ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          ) : documentos && documentos.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Archivo</th>
                    <th className="text-left p-3">Tipo</th>
                    <th className="text-left p-3">Tamaño</th>
                    <th className="text-left p-3">Fecha</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((d) => (
                    <tr key={d.docId} className="border-t">
                        <td className="p-3">{d.nombreArchivo || "Sin nombre"}</td>
                        <td className="p-3"><Badge variant="outline">{d.tipoDocumento || "Desconocido"}</Badge></td>
                        <td className="p-3">{d.tamanioBytes ? (d.tamanioBytes/1024).toFixed(1) + " KB" : "N/A"}</td>
                        <td className="p-3">{d.fechaSubida ? formatearFecha(d.fechaSubida) : "Desconocida"}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => eliminarDoc.mutate(d.docId)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay documentos</div>
          )}
        </CardContent>
      </Card>

      {/* Asignaciones y Resultados */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAsign ? (
              <Skeleton className="h-4 w-40" />
            ) : asignaciones && asignaciones.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {asignaciones.map(a => (
                  <li key={a.aspId} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                        <div className="font-medium">{a.nombrePrueba || "Prueba sin nombre"} {a.codigoVersion && <span className="text-muted-foreground">(v{a.codigoVersion})</span>}</div>
                        <div className="text-muted-foreground">
                          {a.fechaAsignacion ? `Asignado ${formatearFecha(a.fechaAsignacion)}` : "Fecha desconocida"}
                          {a.fechaLimite ? ` · Límite ${formatearFecha(a.fechaLimite)}` : ''}
                        </div>
                    </div>
                    <Badge variant={a.completado ? 'default' : a.iniciado ? 'outline' : 'secondary'}>
                      {a.completado ? 'Completado' : a.iniciado ? 'En curso' : 'Pendiente'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No hay asignaciones</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRes ? (
              <Skeleton className="h-4 w-40" />
            ) : resultados && resultados.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {resultados.map(r => (
                  <li key={r.rprId} className="flex items-center justify-between border rounded-md p-3">
                    <div>
                        <div className="font-medium">{r.nombrePrueba || "Prueba sin nombre"} {r.codigoVersion && <span className="text-muted-foreground">(v{r.codigoVersion})</span>}</div>
                        <div className="text-muted-foreground">
                          {r.fechaFinalizacion ? `Finalizado ${formatearFecha(r.fechaFinalizacion)}` : "Fecha desconocida"}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-primary font-semibold text-lg">{r.puntajeTotal ?? "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{r.porcentajeAcierto != null ? `${r.porcentajeAcierto}% acierto` : "N/A"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground">No hay resultados</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Registrar Resultado */}
      {candidato && (
        <RegistrarResultadoDialog
          open={showResultadoDialog}
          onOpenChange={setShowResultadoDialog}
          candidatoId={candidato.canId}
          nombreCandidato={candidato.nombreCompleto}
        />
      )}
    </div>
  )
}
