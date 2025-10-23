"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { selectionApiService } from "@/lib/services/selectionApiService"
import { Plus, FileQuestion, List, Upload } from "lucide-react"
import Link from "next/link"

export default function VersionItemsPage() {
  const params = useParams()
  const pruebaId = Number(params.id)
  const versionId = Number(params.versionId)

  const { data: version, isLoading: loadingVersion } = useQuery({
    queryKey: ['version', pruebaId, versionId],
    queryFn: async () => {
      const versiones = await selectionApiService.getVersionesPrueba(pruebaId)
      return versiones.find(v => v.vprId === versionId)
    },
    enabled: !!pruebaId && !!versionId,
  })

  // TODO: Implementar endpoint para obtener items de una versión
  // const { data: items, isLoading: loadingItems } = useQuery({
  //   queryKey: ['items', versionId],
  //   queryFn: () => selectionApiService.getItemsPorVersion(versionId),
  //   enabled: !!versionId,
  // })

  if (loadingVersion || !version) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/dashboard/selection/pruebas/${pruebaId}`}>
              <Button variant="ghost" size="sm">← Volver</Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {version.nombrePrueba} - Versión {version.codigoVersion}
          </h1>
          <p className="text-muted-foreground mt-1">{version.descripcion}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Importar Items
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <FileQuestion className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-2xl font-bold mt-1">
                  {version.publicado ? "Publicada" : "Borrador"}
                </p>
              </div>
              <List className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activa</p>
                <p className="text-2xl font-bold mt-1">
                  {version.activo ? "Sí" : "No"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5" />
            Items de la Prueba
          </CardTitle>
          <CardDescription>
            Preguntas y opciones de respuesta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* TODO: Mostrar lista de items cuando se implemente el endpoint */}
          <div className="text-center py-12">
            <FileQuestion className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              No hay items creados para esta versión
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" /> 
                Importar desde archivo
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> 
                Crear primer item
              </Button>
            </div>
            
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <p className="text-sm font-medium mb-2">💡 Tip para importación masiva</p>
                <p className="text-xs text-muted-foreground">
                  Puede importar múltiples items desde un archivo JSON o CSV. 
                  Ideal para pruebas con muchas preguntas (ej: 186 items de Wartegg).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de la Versión</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button variant="outline" disabled={!version.activo}>
            Publicar Versión
          </Button>
          <Button variant="outline">
            Duplicar Versión
          </Button>
          <Button variant="outline">
            Exportar Items
          </Button>
          <Button variant="destructive" className="ml-auto">
            Eliminar Versión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
