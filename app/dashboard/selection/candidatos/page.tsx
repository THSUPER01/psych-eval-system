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
import { Search, Filter, Users, Briefcase, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function CandidatosPage() {
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()
  const { data: requerimientos, isLoading: loadingReqs } = useRequerimientos()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterReqId, setFilterReqId] = useState<string>("")
  const [filterEstado, setFilterEstado] = useState<string>("")

  const estadosDisponibles = useMemo(() => {
    const set = new Set<string>()
    candidatos?.forEach(c => set.add(c.estado.estCodigo))
    return Array.from(set)
  }, [candidatos])

  const reqMap = useMemo(() => {
    const map = new Map<number, string>()
    requerimientos?.forEach(r => map.set(r.reqId, r.cargoObjetivo))
    return map
  }, [requerimientos])

  const filtered = useMemo(() => {
    return (candidatos || []).filter((c) => {
      const matchesSearch = c.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesReq = filterReqId === "ALL" || !filterReqId || String(c.requerimientoId) === filterReqId
      const matchesEstado = filterEstado === "ALL" || !filterEstado || c.estado.estCodigo === filterEstado
      return matchesSearch && matchesReq && matchesEstado
    })
  }, [candidatos, searchQuery, filterReqId, filterEstado])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
          <p className="text-muted-foreground mt-1">Lista de todos los candidatos</p>
        </div>
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
                    {r.cargoObjetivo}
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
                    <TableHead>Requerimiento</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Formulario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.canId}>
                      <TableCell className="font-medium">{c.nombreCompleto}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {reqMap.get(c.requerimientoId) || `Req #${c.requerimientoId}`}
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
                        {c.formularioCompleto ? (
                          <Badge>Completo</Badge>
                        ) : (
                          <Badge variant="secondary">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.estado.estDescripcion}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(c.fechaCreacion), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/selection/candidatos/${c.canId}`}>
                          <Button variant="ghost" size="icon" aria-label="Ver Detalle">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
