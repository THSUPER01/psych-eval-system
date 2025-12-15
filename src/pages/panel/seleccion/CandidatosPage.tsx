import { useMemo, useState } from 'react'
import { useCandidatos, useAsignaciones } from '@/lib/hooks/useSelection'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Users,
  UserPlus,
  Filter,
  CheckCircle2,
  Clock,
  Brain,
  BarChart3,
  ClipboardList,
} from 'lucide-react'
import { CrearCandidatoDialog } from '@/components/selection/CrearCandidatoDialog'

export default function CandidatosPage() {
  const navigate = useNavigate()
  const { data: candidatos, isLoading } = useCandidatos()
  const { data: asignaciones } = useAsignaciones()
  const [search, setSearch] = useState('')
  const [soloPublicos, setSoloPublicos] = useState(false)
  const [showCrearDialog, setShowCrearDialog] = useState(false)

  const stats = useMemo(() => {
    const total = candidatos?.length || 0
    const publicos = candidatos?.filter((c) => c.requerimientoId === null).length || 0
    const conFormulario = candidatos?.filter((c) => c.formularioCompletado).length || 0
    const cmtCompletado = candidatos?.filter((c) => c.asignacionCmt?.pruebaCompletada).length || 0
    const asign16pf = asignaciones?.filter((a) => a.nombrePrueba?.toLowerCase().includes('16pf')) || []
    const seisTeenPfCompletado = asign16pf.filter((a) => a.completado).length
    return { total, publicos, conFormulario, cmtCompletado, seisTeenPfCompletado }
  }, [candidatos, asignaciones])

  const filtrados = useMemo(() => {
    return (candidatos || [])
      .filter((c) => !soloPublicos || c.requerimientoId === null)
      .filter((c) => {
        const q = search.trim().toLowerCase()
        if (!q) return true
        return (
          c.nombreCompleto.toLowerCase().includes(q) ||
          c.cedulaCiudadania.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
        )
      })
  }, [candidatos, soloPublicos, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidatos</h1>
          <p className="text-muted-foreground mt-1">Listado general de candidatos y su progreso</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCrearDialog(true)} className="gap-2">
            <UserPlus className="h-4 w-4" /> Crear Candidato
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Total
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> Públicos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.publicos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" /> Formulario
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.conFormulario}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" /> CMT
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.cmtCompletado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> 16PF
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.seisTeenPfCompletado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtro */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cédula o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              type="button"
              variant={soloPublicos ? 'default' : 'outline'}
              onClick={() => setSoloPublicos((p) => !p)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" /> {soloPublicos ? 'Mostrando Públicos' : 'Solo Públicos'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </Card>
          ))
        ) : filtrados.length === 0 ? (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No se encontraron candidatos con ese criterio.</p>
            </CardContent>
          </Card>
        ) : (
          filtrados.map((c) => {
            const asign16pf = asignaciones?.find(
              (a) => a.candidatoId === c.canId && a.nombrePrueba?.toLowerCase().includes('16pf')
            )
            return (
              <div
                key={c.canId}
                className="group cursor-pointer"
                onClick={() => navigate(`/panel/seleccion/candidatos/${c.canId}`)}
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm leading-tight line-clamp-2">{c.nombreCompleto}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{c.cedulaCiudadania}</p>
                      </div>
                      {c.requerimientoId === null ? (
                        <Badge variant="secondary" className="text-[10px] h-5 px-2">
                          Público
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5 px-2">
                          Req
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{c.email}</p>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {/* Formulario */}
                      {c.formularioCompletado ? (
                        <Badge className="gap-1 px-2 py-0 h-5">
                          <CheckCircle2 className="h-3 w-3" /> Formulario
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 px-2 py-0 h-5">
                          <Clock className="h-3 w-3" /> Formulario
                        </Badge>
                      )}
                      {/* CMT */}
                      {c.asignacionCmt?.pruebaCompletada ? (
                        <Badge className="gap-1 px-2 py-0 h-5">
                          <Brain className="h-3 w-3" /> CMT
                        </Badge>
                      ) : c.asignacionCmt ? (
                        <Badge variant="secondary" className="gap-1 px-2 py-0 h-5">
                          <Clock className="h-3 w-3" /> CMT
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 px-2 py-0 h-5">
                          CMT
                        </Badge>
                      )}
                      {/* 16PF */}
                      {asign16pf ? (
                        asign16pf.completado ? (
                          <Badge className="gap-1 px-2 py-0 h-5">
                            <BarChart3 className="h-3 w-3" /> 16PF
                          </Badge>
                        ) : asign16pf.iniciado ? (
                          <Badge variant="secondary" className="gap-1 px-2 py-0 h-5">
                            <Clock className="h-3 w-3" /> 16PF
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 px-2 py-0 h-5">
                            <Clock className="h-3 w-3" /> 16PF
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="gap-1 px-2 py-0 h-5">
                          16PF
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })
        )}
      </div>

      <CrearCandidatoDialog open={showCrearDialog} onOpenChange={setShowCrearDialog} />
    </div>
  )
}
