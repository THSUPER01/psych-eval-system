"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCandidatos, useRequerimientos } from "@/lib/hooks/useSelection"
import { Search, BarChart3, TrendingUp, Award, FileText, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function ResultadosPage() {
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()
  const { data: requerimientos } = useRequerimientos()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterReqId, setFilterReqId] = useState<string>("")

  // Filtrar solo candidatos que tengan el formulario completo
  const candidatosConFormulario = useMemo(() => {
    return (candidatos || []).filter(c => c.formularioCompleto)
  }, [candidatos])

  const filtered = useMemo(() => {
    return candidatosConFormulario.filter((c) => {
      const matchesSearch = c.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesReq = filterReqId === "ALL" || !filterReqId || String(c.requerimientoId) === filterReqId
      return matchesSearch && matchesReq
    })
  }, [candidatosConFormulario, searchQuery, filterReqId])

  const reqMap = useMemo(() => {
    const map = new Map<number, string>()
    requerimientos?.forEach(r => map.set(r.reqId, r.cargoObjetivo))
    return map
  }, [requerimientos])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resultados de Pruebas</h1>
          <p className="text-muted-foreground mt-1">Visualización de resultados y análisis de candidatos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidatos Evaluados</p>
                <p className="text-2xl font-bold mt-1">{candidatosConFormulario.length}</p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pruebas Completadas</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio Puntaje</p>
                <p className="text-2xl font-bold mt-1">--</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold mt-1">0</p>
              </div>
              <FileText className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar candidato..."
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
                <SelectItem value="ALL">Todos los requerimientos</SelectItem>
                {(requerimientos || []).map((r) => (
                  <SelectItem key={r.reqId} value={String(r.reqId)}>
                    {r.cargoObjetivo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidatos con Resultados</CardTitle>
          <CardDescription>
            {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCandidatos ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-4 w-64 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((candidato) => (
                <div key={candidato.canId} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {candidato.nombreCompleto.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{candidato.nombreCompleto}</h4>
                          <p className="text-sm text-muted-foreground">{candidato.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {reqMap.get(candidato.requerimientoId) || `Req #${candidato.requerimientoId}`}
                        </div>
                        <Badge variant="outline">{candidato.estado.estDescripcion}</Badge>
                        <span>
                          Registrado {formatDistanceToNow(new Date(candidato.fechaCreacion), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>

                      {/* TODO: Mostrar resumen de resultados cuando esté disponible */}
                      <div className="mt-3 flex gap-2">
                        <Badge variant="secondary">0 pruebas completadas</Badge>
                      </div>
                    </div>

                    <Link href={`/dashboard/selection/candidatos/${candidato.canId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Resultados
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || filterReqId
                  ? "No se encontraron candidatos con ese criterio"
                  : "No hay candidatos con formulario completo aún"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
