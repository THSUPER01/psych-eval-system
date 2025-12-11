"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { selectionApiService } from "@/lib/services/selectionApiService"
import { Calendar, FileText, Code, CheckCircle2, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function PruebaDetallePage() {
  const params = useParams()
  const id = Number(params.id)

  const { data: prueba, isLoading } = useQuery({
    queryKey: ['prueba', id],
    queryFn: async () => {
      const pruebas = await selectionApiService.getPruebasPsicotecnicas()
      return pruebas.find(p => p.ppsId === id)
    },
    enabled: !!id && id > 0,
  })

  const { data: versiones, isLoading: loadingVersiones } = useQuery({
    queryKey: ['versiones', id],
    queryFn: () => selectionApiService.getVersionesPrueba(id),
    enabled: !!id && id > 0,
  })

  if (isLoading || !prueba) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{prueba.nombrePrueba}</h1>
            {prueba.activo ? (
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Activa
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" /> Inactiva
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Prueba #{prueba.ppsId}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Editar Prueba</Button>
          <Button>Nueva Versión</Button>
        </div>
      </div>

      {/* Información General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Código de Prueba</dt>
              <dd className="text-base font-mono mt-1">{prueba.codigoPrueba}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Estado</dt>
              <dd className="text-base mt-1">
                {prueba.activo ? "Activa" : "Inactiva"}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Descripción</dt>
              <dd className="text-base mt-1">{prueba.descripcion}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Fecha de Creación</dt>
              <dd className="text-base mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDistanceToNow(new Date(prueba.fechaCreacion), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </dd>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versiones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Versiones de la Prueba
          </CardTitle>
          <CardDescription>
            Gestione las diferentes versiones y sus items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingVersiones ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : versiones && versiones.length > 0 ? (
            <div className="space-y-3">
              {versiones.map((version) => (
                <div key={version.vprId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">
                          {version.nombrePrueba} - Versión {version.codigoVersion}
                        </h4>
                        {version.publicado && (
                          <Badge variant="outline">Publicada</Badge>
                        )}
                        {version.activo ? (
                          <Badge className="gap-1">Activa</Badge>
                        ) : (
                          <Badge variant="secondary">Inactiva</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.descripcion}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Creada {formatDistanceToNow(new Date(version.fechaCreacion), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/panel/seleccion/pruebas/${id}/versiones/${version.vprId}/items`}>
                        <Button variant="outline" size="sm">
                          Ver Items
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay versiones creadas para esta prueba.</p>
              <Button className="mt-4">Crear Primera Versión</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
