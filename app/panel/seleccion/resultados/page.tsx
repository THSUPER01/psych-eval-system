"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCandidatos, useRequerimientos } from "@/lib/hooks/useSelection"
import { Search, BarChart3, TrendingUp, Award, FileText, Eye, Brain, CheckCircle2 } from "lucide-react"
import { formatDistanceToNow, isWithinInterval, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { NavigationLink } from "@/components/ui/navigation-link"

export default function ResultadosPage() {
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()
  const { data: requerimientos } = useRequerimientos()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [filterReqId, setFilterReqId] = useState<string>("")

  // Filtrar solo candidatos que tengan el formulario completo
  const candidatosConFormulario = useMemo(() => {
    return (candidatos || []).filter(c => c.formularioCompletado)
  }, [candidatos])

  // Calcular KPIs basados en datos reales
  const kpis = useMemo(() => {
    const total = candidatosConFormulario.length
    const conPruebaAsignada = candidatosConFormulario.filter(c => c.asignacionCmt !== null).length
    const pruebasCompletadas = candidatosConFormulario.filter(c => c.asignacionCmt?.pruebaCompletada === true).length
    
    // Candidatos de la última semana
    const haceUnaSemana = subDays(new Date(), 7)
    const candidatosEstaSemana = candidatosConFormulario.filter(c => {
      try {
        const fechaCreacion = new Date(c.fechaCreacion)
        return fechaCreacion >= haceUnaSemana
      } catch {
        return false
      }
    }).length

    // Calcular tasa de completitud (porcentaje de pruebas completadas vs asignadas)
    const tasaCompletitud = conPruebaAsignada > 0 
      ? Math.round((pruebasCompletadas / conPruebaAsignada) * 100) 
      : 0

    return {
      candidatosEvaluados: total,
      pruebasCompletadas,
      conPruebaAsignada,
      tasaCompletitud,
      candidatosEstaSemana,
    }
  }, [candidatosConFormulario])

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
    requerimientos?.forEach(r => map.set(r.reqId, r.rolObjetivo))
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
                <p className="text-2xl font-bold mt-1">{kpis.candidatosEvaluados}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Con formulario completo
                </p>
              </div>
              <Award className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pruebas CMT Completadas</p>
                <p className="text-2xl font-bold mt-1">{kpis.pruebasCompletadas}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  de {kpis.conPruebaAsignada} asignadas
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa de Completitud</p>
                <p className="text-2xl font-bold mt-1">{kpis.tasaCompletitud}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pruebas finalizadas
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 opacity-50 ${kpis.tasaCompletitud >= 70 ? 'text-green-600' : kpis.tasaCompletitud >= 40 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold mt-1">{kpis.candidatosEstaSemana}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Nuevos candidatos
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-50" />
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
                    {r.rolObjetivo}
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
                          {candidato.requerimientoId ? reqMap.get(candidato.requerimientoId) || `Req #${candidato.requerimientoId}` : "Sin requerimiento"}
                        </div>
                        <Badge variant="outline">{candidato.estado.estDescripcion}</Badge>
                        <span>
                          Registrado {formatDistanceToNow(new Date(candidato.fechaCreacion), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                      </div>

                      {/* Mostrar estado de pruebas */}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {candidato.asignacionCmt ? (
                          candidato.asignacionCmt.pruebaCompletada ? (
                            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              CMT Completada
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Brain className="h-3 w-3" />
                              CMT Asignada - Pendiente
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline">Sin pruebas asignadas</Badge>
                        )}
                        
                        {candidato.asignacionCmt?.tipoNormativa && (
                          <Badge variant="outline" className="text-xs">
                            {candidato.asignacionCmt.tipoNormativa.tipNombre}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <NavigationLink href={`/panel/seleccion/resultados/${candidato.canId}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Resultados
                      </Button>
                    </NavigationLink>
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
