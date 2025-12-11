"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequerimientos, useEliminarRequerimiento } from "@/lib/hooks/useSelection"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Trash2,
  FileText,
  AlertCircle,
  Filter
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow, parseISO, format, subHours } from "date-fns"
import { es } from "date-fns/locale"
import { CrearRequerimientoDialog } from "@/components/selection/CrearRequerimientoDialog"
import { NavigationLink } from "@/components/ui/navigation-link"

// Función helper para formatear fechas UTC a hora de Bogotá (UTC-5)
const formatearFecha = (fechaUTC: string): string => {
  try {
    const fechaUTCParsed = parseISO(fechaUTC)
    const fechaBogota = subHours(fechaUTCParsed, 5)
    return format(fechaBogota, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formateando fecha:", error)
    return "Fecha inválida"
  }
}

export default function RequerimientosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { data: requerimientos, isLoading } = useRequerimientos()
  const eliminarMutation = useEliminarRequerimiento()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterEstado, setFilterEstado] = useState<boolean | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter requerimientos
  const filteredRequerimientos = requerimientos?.filter((req) => {
    const matchesSearch = 
      req.rolObjetivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.areaObjetivo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.psicologoNombre.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterEstado === null || req.estado.estActivo === filterEstado

    return matchesSearch && matchesFilter
  })

  const handleDelete = async (reqId: number) => {
    if (!confirm("¿Estás seguro de eliminar este requerimiento? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      await eliminarMutation.mutateAsync(reqId)
      toast({
        title: "Requerimiento eliminado",
        description: "El requerimiento ha sido eliminado exitosamente.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el requerimiento. Por favor intenta nuevamente.",
        duration: 5000,
      })
    }
  }

  const getEstadoVariant = (estActivo: boolean): "default" | "secondary" => {
    return estActivo ? "default" : "secondary"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los procesos de selección
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Requerimiento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cargo, área o psicólogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0">
                  <Filter className="mr-2 h-4 w-4" />
                  {filterEstado ? "Filtrado" : "Estado"}
                  {filterEstado && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterEstado(null)}>
                  Todos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterEstado(true)}>
                  Activos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterEstado(false)}>
                  Inactivos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredRequerimientos?.length || 0} Requerimientos
          </CardTitle>
          <CardDescription>
            Lista de todos los procesos de selección
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : filteredRequerimientos && filteredRequerimientos.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rol</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequerimientos.map((req) => (
                    <TableRow key={req.reqId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {req.rolObjetivo}
                        </div>
                      </TableCell>
                      <TableCell>{req.areaObjetivo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{req.psicologoNombre}</p>
                          <p className="text-xs text-muted-foreground">{req.psicologoEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {req.totalCandidatos || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoVariant(req.estado.estActivo)}>
                          {req.estado.estActivo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatearFecha(req.fechaCreacion)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <NavigationLink href={`/panel/seleccion/requerimientos/${req.reqId}`} className="flex items-center cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </NavigationLink>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(req.reqId)}
                              className="text-destructive focus:text-destructive"
                              disabled={eliminarMutation.isPending}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterEstado ? "No se encontraron requerimientos" : "No hay requerimientos"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {searchQuery || filterEstado
                  ? "Intenta ajustar los filtros de búsqueda."
                  : "Crea tu primer requerimiento para comenzar un proceso de selección."}
              </p>
              {!searchQuery && !filterEstado && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Requerimiento
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <CrearRequerimientoDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
