import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useRequerimientos, useEliminarRequerimiento } from '@/lib/hooks/useSelection'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, MoreVertical, Eye, Trash2, FileText, AlertCircle, Filter } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow, parseISO, format, subHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { CrearRequerimientoDialog } from '@/components/selection/CrearRequerimientoDialog'

// Función helper para formatear fechas UTC a hora de Bogotá (UTC-5)
const formatearFecha = (fechaUTC: string): string => {
  try {
    const fechaUTCParsed = parseISO(fechaUTC)
    const fechaBogota = subHours(fechaUTCParsed, 5)
    return format(fechaBogota, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'Fecha inválida'
  }
}

export default function RequerimientosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { data: requerimientos, isLoading } = useRequerimientos()
  const eliminarMutation = useEliminarRequerimiento()

  const [searchQuery, setSearchQuery] = useState('')
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
    if (!confirm('¿Estás seguro de eliminar este requerimiento? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await eliminarMutation.mutateAsync(reqId)
      toast({
        title: 'Requerimiento eliminado',
        description: 'El requerimiento ha sido eliminado exitosamente.',
        duration: 3000,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo eliminar el requerimiento. Por favor intenta nuevamente.',
        duration: 5000,
      })
    }
  }

  const getEstadoVariant = (estActivo: boolean): 'default' | 'secondary' => {
    return estActivo ? 'default' : 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Requerimientos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los procesos de selección</p>
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
                  {filterEstado !== null ? 'Filtrado' : 'Estado'}
                  {filterEstado !== null && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterEstado(null)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterEstado(true)}>Activos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterEstado(false)}>Inactivos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !filteredRequerimientos || filteredRequerimientos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay requerimientos</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterEstado !== null
                  ? 'No se encontraron resultados con los filtros aplicados.'
                  : 'Comienza creando tu primer requerimiento.'}
              </p>
              {!searchQuery && filterEstado === null && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Requerimiento
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead>Psicólogo</TableHead>
                    <TableHead>Candidatos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequerimientos.map((req) => (
                    <TableRow key={req.reqId} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{req.rolObjetivo}</TableCell>
                      <TableCell>{req.areaObjetivo}</TableCell>
                      <TableCell className="text-muted-foreground">{req.psicologoNombre}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{req.totalCandidatos || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoVariant(req.estado.estActivo)}>
                          {req.estado.estActivo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatearFecha(req.fechaCreacion)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Abrir menú</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate(`/panel/seleccion/requerimientos/${req.reqId}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(req.reqId)}
                              className="text-destructive focus:text-destructive"
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
          )}
        </CardContent>
      </Card>

      <CrearRequerimientoDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
