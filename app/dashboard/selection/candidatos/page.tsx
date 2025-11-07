"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useCandidatos, useRequerimientos } from "@/lib/hooks/useSelection"
import { Search, Filter, Users, Briefcase, Eye, Plus, FileText } from "lucide-react"
import { parseISO, format, subHours } from "date-fns"
import { es } from "date-fns/locale"
import { AgregarCandidatoDialog } from "@/components/selection/AgregarCandidatoDialog"
import { AsignarPruebaDialog } from "@/components/selection/AsignarPruebaDialog"

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

export default function CandidatosPage() {
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()
  const { data: requerimientos, isLoading: loadingReqs } = useRequerimientos()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterReqId, setFilterReqId] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null)
  const [isAsignarPruebaOpen, setIsAsignarPruebaOpen] = useState(false)
  const [selectedCandidato, setSelectedCandidato] = useState<any>(null)

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>()
    candidatos?.forEach(c => {
      if (c?.estado?.estCodigo) {
        set.add(c.estado.estCodigo)
      }
    })
    return Array.from(set)
  }, [candidatos])

  const reqMap = useMemo(() => {
    const map = new Map<number, string>()
    requerimientos?.forEach(r => map.set(r.reqId, r.rolObjetivo))
    return map
  }, [requerimientos])

  const filtered = useMemo(() => {
    return (candidatos || []).filter((c) => {
      const matchesSearch = c.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesReq = filterReqId === "ALL" || !filterReqId || String(c.requerimientoId) === filterReqId
      const matchesEstado = filterEstado === "ALL" || !filterEstado || c?.estado?.estCodigo === filterEstado
      return matchesSearch && matchesReq && matchesEstado
    })
  }, [candidatos, searchQuery, filterReqId, filterEstado])

  const handleOpenCreateDialog = () => {
    // Si hay un requerimiento filtrado, usarlo por defecto
    if (filterReqId && filterReqId !== "ALL") {
      setSelectedReqId(Number(filterReqId))
    } else if (requerimientos && requerimientos.length > 0) {
      // Si no, usar el primer requerimiento activo
      const activo = requerimientos.find(r => r?.estado?.estCodigo === "ACTIVO")
      setSelectedReqId(activo?.reqId || requerimientos[0].reqId)
    }
    setIsCreateDialogOpen(true)
  }

  const handleAsignarPrueba = (candidato: any) => {
    setSelectedCandidato(candidato)
    setIsAsignarPruebaOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
          <p className="text-muted-foreground mt-1">Lista de todos los candidatos</p>
        </div>
        <Button 
          onClick={handleOpenCreateDialog}
          disabled={!requerimientos || requerimientos.length === 0}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Candidato
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterReqId} onValueChange={setFilterReqId}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por requerimiento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {(requerimientos || []).map((r) => (
                  <SelectItem key={r.reqId} value={String(r.reqId)}>
                    {r.rolObjetivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {estadosDisponibles.map((e) => (
                  <SelectItem key={e} value={e}>{e.replaceAll("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {(filtered?.length || 0)} Candidatos
          </CardTitle>
          <CardDescription>
            Filtro por requerimiento y estado, búsqueda por nombre/email
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCandidatos ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Requerimiento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Formulario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.canId}>
                      <TableCell className="font-medium">{c.nombreCompleto}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.cedulaCiudadania}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {c.requerimientoId ? reqMap.get(c.requerimientoId) || `Req #${c.requerimientoId}` : "Sin requerimiento"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{c.email}</div>
                          <div className="text-muted-foreground">{c.telefono}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {c.linkEnviado ? (
                          <Badge variant="outline">Enviado</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {c.formularioCompletado ? (
                          <Badge>Completo</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c?.estado?.estDescripcion || "Desconocido"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {c.fechaCreacion ? formatearFecha(c.fechaCreacion) : "Desconocida"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/selection/candidatos/${c.canId}`}>
                            <Button variant="ghost" size="icon" aria-label="Ver Detalle">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {c.formularioCompletado && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Asignar Prueba"
                              onClick={() => handleAsignarPrueba(c)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Candidato Dialog */}
      {selectedReqId && (
        <AgregarCandidatoDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          requerimientoId={selectedReqId}
        />
      )}

      {/* Asignar Prueba Dialog */}
      {selectedCandidato && (
        <AsignarPruebaDialog
          open={isAsignarPruebaOpen}
          onOpenChange={setIsAsignarPruebaOpen}
          candidato={selectedCandidato}
          publicacionesPrueba={[]} // TODO: Cargar pruebas disponibles
          onAsignado={() => {
            // Refrescar lista si es necesario
            setIsAsignarPruebaOpen(false)
          }}
        />
      )}
    </div>
  )
}
