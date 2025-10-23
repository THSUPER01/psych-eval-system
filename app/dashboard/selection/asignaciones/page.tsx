"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCandidatos, usePublicacionesActivas, useAsignaciones, useCrearAsignacion, useEliminarAsignacion } from "@/lib/hooks/useSelection"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Plus, ClipboardList, CalendarIcon, Trash2, CheckCircle2, Clock, Play } from "lucide-react"

export default function AsignacionesPage() {
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()
  const { data: publicaciones, isLoading: loadingPubs } = usePublicacionesActivas()
  const { data: asignaciones, isLoading: loadingAsignaciones } = useAsignaciones()
  const crearAsignacion = useCrearAsignacion()
  const eliminarAsignacion = useEliminarAsignacion()
  const { toast } = useToast()

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCandidato, setSelectedCandidato] = useState<string>("")
  const [selectedPublicacion, setSelectedPublicacion] = useState<string>("")
  const [fechaLimite, setFechaLimite] = useState<Date>()
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const candidatosMap = useMemo(() => {
    const map = new Map<number, string>()
    candidatos?.forEach(c => map.set(c.canId, c.nombreCompleto))
    return map
  }, [candidatos])

  const handleCrearAsignacion = async () => {
    if (!selectedCandidato || !selectedPublicacion) {
      toast({
        title: "Error",
        description: "Debe seleccionar candidato y publicación",
        variant: "destructive",
      })
      return
    }

    try {
      await crearAsignacion.mutateAsync({
        candidatoId: Number(selectedCandidato),
        publicacionPruebaId: Number(selectedPublicacion),
        fechaLimite: fechaLimite ? fechaLimite.toISOString() : undefined,
      })
      toast({
        title: "Asignación creada",
        description: "La prueba ha sido asignada correctamente",
      })
      setOpenDialog(false)
      setSelectedCandidato("")
      setSelectedPublicacion("")
      setFechaLimite(undefined)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la asignación",
        variant: "destructive",
      })
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await eliminarAsignacion.mutateAsync(id)
      toast({
        title: "Asignación eliminada",
        description: "La asignación ha sido eliminada correctamente",
      })
      setDeleteId(null)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la asignación",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignaciones de Pruebas</h1>
          <p className="text-muted-foreground mt-1">Asignar pruebas psicotécnicas a candidatos</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nueva Asignación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar Prueba</DialogTitle>
              <DialogDescription>
                Seleccione el candidato y la prueba a asignar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Candidato</Label>
                <Select value={selectedCandidato} onValueChange={setSelectedCandidato}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCandidatos ? (
                      <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
                    ) : (
                      (candidatos || []).map((c) => (
                        <SelectItem key={c.canId} value={String(c.canId)}>
                          {c.nombreCompleto} - {c.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prueba Psicotécnica</Label>
                <Select value={selectedPublicacion} onValueChange={setSelectedPublicacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prueba" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingPubs ? (
                      <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
                    ) : (
                      (publicaciones || []).map((p) => (
                        <SelectItem key={p.pubId} value={String(p.pubId)}>
                          {p.nombrePrueba} (v{p.codigoVersion})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha Límite (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaLimite && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaLimite ? format(fechaLimite, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaLimite}
                      onSelect={setFechaLimite}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCrearAsignacion} disabled={crearAsignacion.isPending}>
                {crearAsignacion.isPending ? "Creando..." : "Crear Asignación"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Asignaciones Activas
          </CardTitle>
          <CardDescription>
            {(asignaciones?.length || 0)} asignaciones en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAsignaciones ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : asignaciones && asignaciones.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Prueba</TableHead>
                    <TableHead>Asignada</TableHead>
                    <TableHead>Límite</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asignaciones.map((a) => (
                    <TableRow key={a.aspId}>
                      <TableCell>
                        <div className="font-medium">{candidatosMap.get(a.candidatoId) || a.nombreCandidato}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{a.nombrePrueba}</div>
                          <div className="text-sm text-muted-foreground">Versión {a.codigoVersion}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(a.fechaAsignacion), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.fechaLimite ? (
                          <div className={cn(
                            new Date(a.fechaLimite) < new Date() && !a.completado && "text-destructive font-medium"
                          )}>
                            {format(new Date(a.fechaLimite), "PP", { locale: es })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin límite</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {a.completado ? (
                          <Badge className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completado
                          </Badge>
                        ) : a.iniciado ? (
                          <Badge variant="outline" className="gap-1">
                            <Play className="h-3 w-3" /> En curso
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" /> Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(a.aspId)}
                          disabled={eliminarAsignacion.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay asignaciones. Cree una nueva asignación para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar asignación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La asignación será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleEliminar(deleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
