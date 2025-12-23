import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { usePruebasPsicotecnicas } from "@/lib/hooks/useSelection"
import { Plus, Search, FileText, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { parseUtcDate } from "@/lib/date"
import { es } from "date-fns/locale"
import { Link } from "react-router-dom"

export default function PruebasPage() {
  const { data: pruebas, isLoading } = usePruebasPsicotecnicas()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPruebas = pruebas?.filter(prueba => 
    prueba.nombrePrueba.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prueba.codigoPrueba.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pruebas Psicotécnicas</h1>
          <p className="text-muted-foreground mt-1">Gestión de pruebas y versiones</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Nueva Prueba
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : filteredPruebas && filteredPruebas.length > 0 ? (
          filteredPruebas.map((prueba) => (
            <Card key={prueba.ppsId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prueba.nombrePrueba}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            {prueba.codigoPrueba}
                          </Badge>
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
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {prueba.descripcion}
                    </p>

                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Creada {(() => {
                            const createdAt = parseUtcDate(prueba.fechaCreacion)
                            return createdAt ? formatDistanceToNow(createdAt, {
                              addSuffix: true,
                              locale: es
                            }) : "Fecha invalida"
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link to={`/panel/seleccion/pruebas/${prueba.ppsId}/versiones`}>
                      <Button variant="outline" size="sm">
                        Ver Versiones
                      </Button>
                    </Link>
                    <Link to={`/panel/seleccion/pruebas/${prueba.ppsId}`}>
                      <Button size="sm">
                        Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery 
                  ? "No se encontraron pruebas con ese criterio"
                  : "No hay pruebas registradas. Cree una nueva prueba para comenzar."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
