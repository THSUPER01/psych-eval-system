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
import { Upload, Trash2, FileText, User, Mail, Phone, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { TiposDocumento } from "@/types/selection.types"

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

  const onUpload = async () => {
    if (!file) return
    await subirDoc.mutateAsync({ candidatoId: id, file, tipoDocumento })
    setFile(null)
  }

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
        <Badge variant="outline">{candidato.estado.estDescripcion}</Badge>
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
              {candidato.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4"/>
              {candidato.telefono}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4"/>
              Creado {formatDistanceToNow(new Date(candidato.fechaCreacion), { addSuffix: true, locale: es })}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Token de Acceso:</span> <span className="font-mono">{candidato.tokenAcceso}</span>
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
            {candidato.formularioCompleto ? "Datos completados por el candidato" : "El candidato aún no ha completado su formulario"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {candidato.formularioCompleto && candidato.formulario ? (
            <dl className="grid md:grid-cols-3 gap-4 text-sm">
              <div><dt className="text-muted-foreground">Estado Civil</dt><dd className="font-medium">{candidato.formulario.estadoCivil}</dd></div>
              <div><dt className="text-muted-foreground">Género</dt><dd className="font-medium">{candidato.formulario.genero}</dd></div>
              <div><dt className="text-muted-foreground">Edad Ingreso</dt><dd className="font-medium">{candidato.formulario.edadIngreso}</dd></div>
              <div><dt className="text-muted-foreground">Municipio</dt><dd className="font-medium">{candidato.formulario.municipio}</dd></div>
              <div><dt className="text-muted-foreground">Comuna</dt><dd className="font-medium">{candidato.formulario.comuna}</dd></div>
              <div><dt className="text-muted-foreground">Barrio</dt><dd className="font-medium">{candidato.formulario.barrio}</dd></div>
              <div><dt className="text-muted-foreground">Estrato</dt><dd className="font-medium">{candidato.formulario.estrato}</dd></div>
              <div><dt className="text-muted-foreground">Dirección</dt><dd className="font-medium">{candidato.formulario.direccion}</dd></div>
              <div><dt className="text-muted-foreground">Hijos</dt><dd className="font-medium">{candidato.formulario.hijos}</dd></div>
              {candidato.formulario.numeroHijos ? (
                <div><dt className="text-muted-foreground">Número de Hijos</dt><dd className="font-medium">{candidato.formulario.numeroHijos}</dd></div>
              ) : null}
              {candidato.formulario.edadesHijos?.length ? (
                <div className="md:col-span-2"><dt className="text-muted-foreground">Edades Hijos</dt><dd className="font-medium">{candidato.formulario.edadesHijos.join(", ")}</dd></div>
              ) : null}
              <div><dt className="text-muted-foreground">Talla Camisa</dt><dd className="font-medium">{candidato.formulario.tallaCamisa}</dd></div>
              <div><dt className="text-muted-foreground">Talla Pantalón</dt><dd className="font-medium">{candidato.formulario.tallaPantalon}</dd></div>
              <div><dt className="text-muted-foreground">Talla Zapatos</dt><dd className="font-medium">{candidato.formulario.tallaZapatos}</dd></div>
            </dl>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <AlertCircle className="h-4 w-4"/> El candidato no ha completado el formulario.
            </div>
          )}
        </CardContent>
      </Card>

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
                      <td className="p-3">{d.nombreArchivo}</td>
                      <td className="p-3"><Badge variant="outline">{d.tipoDocumento}</Badge></td>
                      <td className="p-3">{(d.tamanioBytes/1024).toFixed(1)} KB</td>
                      <td className="p-3">{formatDistanceToNow(new Date(d.fechaSubida), { addSuffix: true, locale: es })}</td>
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
                      <div className="font-medium">{a.nombrePrueba} <span className="text-muted-foreground">(v{a.codigoVersion})</span></div>
                      <div className="text-muted-foreground">Asignado {formatDistanceToNow(new Date(a.fechaAsignacion), { addSuffix: true, locale: es })}{a.fechaLimite ? ` · Límite ${formatDistanceToNow(new Date(a.fechaLimite), { addSuffix: true, locale: es })}` : ''}</div>
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
                      <div className="font-medium">{r.nombrePrueba} <span className="text-muted-foreground">(v{r.codigoVersion})</span></div>
                      <div className="text-muted-foreground">Finalizado {formatDistanceToNow(new Date(r.fechaFinalizacion), { addSuffix: true, locale: es })}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-primary font-semibold text-lg">{r.puntajeTotal}</div>
                      <div className="text-xs text-muted-foreground">{r.porcentajeAcierto}% acierto</div>
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
    </div>
  )
}
