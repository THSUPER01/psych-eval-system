import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  LayoutGrid,
  Clock,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCandidatoPublico } from '@/lib/hooks/useCandidatePublic'
import { useToast } from '@/hooks/use-toast'
import { test16pfService } from '@/lib/services/test16pfService'
import type { Respuesta16PFItem, Pregunta16PF } from '@/types/test16pf.types'
import { useQuery } from '@tanstack/react-query'
import Instructions16PF from '@/components/test16pf/Instructions16PF'
import type { PruebaEstadoDto } from '@/types/pruebasEstado.types'

const PREGUNTAS_POR_PAGINA = 10

type QuestionMap16PFProps = {
  preguntas: Pregunta16PF[]
  totalPaginas: number
  paginaActual: number
  respuestas: Map<number, 1 | 2 | 3>
  onPaginaChange: (pagina: number) => void
  compact?: boolean
}

function QuestionMap16PF({
  preguntas,
  totalPaginas,
  paginaActual,
  respuestas,
  onPaginaChange,
  compact = false,
}: QuestionMap16PFProps) {
  const paginas = useMemo(() => Array.from({ length: totalPaginas }, (_, i) => i), [totalPaginas])
  const start = paginaActual * PREGUNTAS_POR_PAGINA
  const end = Math.min(start + PREGUNTAS_POR_PAGINA, preguntas.length)
  const preguntasPagina = useMemo(() => preguntas.slice(start, end), [preguntas, start, end])
  const tabsScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const scrollEl = tabsScrollRef.current
    if (!scrollEl) return
    const active = scrollEl.querySelector(`[data-page="${paginaActual}"]`) as HTMLElement | null
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [paginaActual])

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-slate-800">Navegación</h3>
          <p className="text-xs text-slate-500">
            Página {paginaActual + 1} · {start + 1}-{end}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-semibold text-slate-800 tabular-nums">{respuestas.size}/185</p>
          <p className="text-[11px] text-slate-500">respondidas</p>
        </div>
      </div>

      <Tabs value={String(paginaActual)} onValueChange={(v) => onPaginaChange(Number(v))} className="gap-3">
        <div ref={tabsScrollRef} className="overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="w-full min-w-max">
            {paginas.map((p) => (
              <TabsTrigger
                key={p}
                value={String(p)}
                data-page={p}
                className={cn(
                  'min-w-9 tabular-nums hover:bg-slate-100',
                  'data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm',
                  'data-[state=active]:hover:bg-slate-800 data-[state=active]:ring-2 data-[state=active]:ring-slate-900/20 data-[state=active]:ring-offset-2',
                )}
              >
                {p + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={String(paginaActual)}>
          <div className={cn('grid grid-cols-5 gap-1.5', compact && 'grid-cols-6')}>
            {preguntasPagina.map((p: Pregunta16PF) => {
              const respondida = respuestas.has(p.pfpIdPregunta)
              return (
                <Button
                  key={p.pfpIdPregunta}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 w-full text-xs font-semibold transition-all tabular-nums',
                    respondida
                      ? 'bg-green-100 border-green-400 text-green-800 hover:bg-green-200'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                  )}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {p.pfpNumeroPregunta}
                </Button>
              )
            })}
          </div>

          <div className="flex items-center justify-between gap-2 mt-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-green-200 border border-green-400" />
                Respondida
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm bg-white border border-slate-200" />
                Pendiente
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Desliza para ver páginas</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatSeconds(total: number | null | undefined) {
  if (total === null || total === undefined) return '--:--'
  const totalSec = Math.max(0, Math.floor(total))
  const hh = Math.floor(totalSec / 3600)
  const mm = Math.floor((totalSec % 3600) / 60)
  const ss = totalSec % 60
  if (hh > 0) return `${hh}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
  return `${mm}:${ss.toString().padStart(2, '0')}`
}

export default function Test16PFPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Estado
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(true)
  const [paginaActual, setPaginaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Map<number, 1 | 2 | 3>>(new Map())
  const [localRespuestasLoaded, setLocalRespuestasLoaded] = useState(false)
  const [scrollToPreguntaId, setScrollToPreguntaId] = useState<number | null>(null)
  const [testCompletado, setTestCompletado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [iniciando, setIniciando] = useState(false)
  const [autosaving, setAutosaving] = useState(false)
  const [lastAutosaveAt, setLastAutosaveAt] = useState<number | null>(null)
  const [autosaveError, setAutosaveError] = useState<string | null>(null)
  const [segundosRestantesUi, setSegundosRestantesUi] = useState<number | null>(null)
  const [segundosConsumidosCliente, setSegundosConsumidosCliente] = useState(0)
  const dirtyPagesRef = useRef<Set<number>>(new Set())
  const [dirtyTick, setDirtyTick] = useState(0)
  const segundosConsumidosRef = useRef(0)
  const respuestasRef = useRef(respuestas)
  const preguntasRef = useRef<Pregunta16PF[]>([])
  const didRestorePositionRef = useRef(false)

  // Hooks de API
  const { data: candidato, isLoading: loadingCandidato, error: errorCandidato } = useCandidatoPublico(token!)
  const { data: estadoPreview } = useQuery<PruebaEstadoDto | null>({
    queryKey: ['test16pf-estado-preview', token],
    queryFn: async () => {
      if (!token) return null
      try {
        return await test16pfService.getEstado(token)
      } catch {
        return null
      }
    },
    enabled: !!token && mostrarInstrucciones,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
  const { data: preguntasData, isLoading: loadingPreguntas, error: errorPreguntas } = useQuery({
    queryKey: ['test16pf-preguntas', token],
    queryFn: () => test16pfService.getPreguntas(token!),
    enabled: !!token && !mostrarInstrucciones,
  })
  const {
    data: estadoPrueba,
    isLoading: loadingEstado,
    error: errorEstado,
    refetch: refetchEstado,
  } = useQuery<PruebaEstadoDto>({
    queryKey: ['test16pf-estado', token],
    queryFn: () => test16pfService.getEstado(token!),
    enabled: !!token && !mostrarInstrucciones,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  })

  const preguntas: Pregunta16PF[] = preguntasData?.preguntas ?? []
  const totalPaginas = Math.ceil(preguntas.length / PREGUNTAS_POR_PAGINA)
  const isBloqueada =
    Boolean(estadoPrueba?.bloqueada) || estadoPrueba?.estado === 'EXPIRADA' || (segundosRestantesUi ?? 1) <= 0

  useEffect(() => {
    segundosConsumidosRef.current = segundosConsumidosCliente
  }, [segundosConsumidosCliente])

  useEffect(() => {
    respuestasRef.current = respuestas
  }, [respuestas])

  useEffect(() => {
    preguntasRef.current = preguntas
  }, [preguntas])

  // Verificar si ya aceptó instrucciones previamente
  useEffect(() => {
    const instructionsAccepted = localStorage.getItem(`16pf_instructions_accepted_${token}`)
    if (instructionsAccepted === 'true') {
      setMostrarInstrucciones(false)
    }
  }, [token])

  // Iniciar sesión (idempotente) al entrar al test
  // Si ya existe sesión INICIADA y tiempo vigente, saltar instrucciones
  useEffect(() => {
    if (!token || !mostrarInstrucciones || !estadoPreview) return
    if (estadoPreview.estado !== 'INICIADA') return
    if (estadoPreview.bloqueada) return
    if ((estadoPreview.segundosRestantes ?? 0) <= 0) return

    localStorage.setItem(`16pf_instructions_accepted_${token}`, 'true')
    setMostrarInstrucciones(false)
  }, [estadoPreview, mostrarInstrucciones, token])

  const didStartRef = useRef(false)
  useEffect(() => {
    if (!token || mostrarInstrucciones || didStartRef.current) return
    didStartRef.current = true

    setIniciando(true)
    test16pfService
      .iniciar(token)
      .then(() => refetchEstado())
      .catch((e: any) => {
        toast({
          title: 'No se pudo iniciar la prueba',
          description: e?.message || 'Intenta nuevamente.',
          variant: 'destructive',
        })
      })
      .finally(() => setIniciando(false))
  }, [mostrarInstrucciones, refetchEstado, toast, token])

  // Cargar respuestas guardadas del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`16pf_respuestas_${token}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const map = new Map(Object.entries(parsed).map(([k, v]) => [Number(k), v as 1 | 2 | 3]))
        setRespuestas(map)
      } catch (e) {
        console.error('Error al cargar respuestas guardadas:', e)
      }
    }
    setLocalRespuestasLoaded(true)
  }, [token])

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (respuestas.size > 0) {
      const obj = Object.fromEntries(respuestas)
      localStorage.setItem(`16pf_respuestas_${token}`, JSON.stringify(obj))
    }
  }, [respuestas, token])

  // Manejar aceptación de instrucciones
  const handleAcceptInstructions = () => {
    localStorage.setItem(`16pf_instructions_accepted_${token}`, 'true')
    setMostrarInstrucciones(false)
  }

  // Sincronizar reloj con el estado del servidor
  useEffect(() => {
    if (!estadoPrueba) return
    setSegundosRestantesUi(estadoPrueba.segundosRestantes)
    setSegundosConsumidosCliente(estadoPrueba.segundosConsumidos)
  }, [estadoPrueba])

  // Reloj cliente: decrementa solo si la pestaña está visible
  useEffect(() => {
    if (mostrarInstrucciones || isBloqueada) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setSegundosRestantesUi((s) => {
        if (s === null) return s
        return Math.max(0, s - 1)
      })
      setSegundosConsumidosCliente((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [isBloqueada, mostrarInstrucciones])

  const questionPageById = useMemo(() => {
    const map = new Map<number, number>()
    preguntas.forEach((p, idx) => map.set(p.pfpIdPregunta, Math.floor(idx / PREGUNTAS_POR_PAGINA)))
    return map
  }, [preguntas])

  // Reanudar en la *última* pregunta contestada (sin volver a la primera página)
  useEffect(() => {
    if (didRestorePositionRef.current) return
    if (mostrarInstrucciones) return
    if (!localRespuestasLoaded) return
    if (!preguntas.length) return

    let lastIndex = -1
    let lastId: number | null = null

    if (respuestas.size > 0) {
      preguntas.forEach((p, idx) => {
        if (!respuestas.has(p.pfpIdPregunta)) return
        if (idx > lastIndex) {
          lastIndex = idx
          lastId = p.pfpIdPregunta
        }
      })
    } else if ((estadoPrueba?.preguntasRespondidas ?? 0) > 0) {
      lastIndex = Math.min(preguntas.length - 1, (estadoPrueba?.preguntasRespondidas ?? 1) - 1)
      lastId = preguntas[lastIndex]?.pfpIdPregunta ?? null
    }

    if (lastIndex >= 0) {
      setPaginaActual(Math.floor(lastIndex / PREGUNTAS_POR_PAGINA))
      setScrollToPreguntaId(lastId)
    }

    didRestorePositionRef.current = true
  }, [estadoPrueba?.preguntasRespondidas, localRespuestasLoaded, mostrarInstrucciones, preguntas, respuestas])

  // Scroll suave a la última pregunta respondida (en la página restaurada)
  useEffect(() => {
    if (scrollToPreguntaId === null) return
    const page = questionPageById.get(scrollToPreguntaId)
    if (page === undefined || page !== paginaActual) return

    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(`q-${scrollToPreguntaId}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [paginaActual, questionPageById, scrollToPreguntaId])

  const markPageDirty = (pageIndex: number) => {
    dirtyPagesRef.current.add(pageIndex)
    setDirtyTick((t) => t + 1)
  }

  const clearPageDirty = (pageIndex: number) => {
    if (!dirtyPagesRef.current.has(pageIndex)) return
    dirtyPagesRef.current.delete(pageIndex)
    setDirtyTick((t) => t + 1)
  }

  const autosavePagina = async (pageIndex: number, force = false) => {
    if (!token || isBloqueada) return
    if (!force && !dirtyPagesRef.current.has(pageIndex)) return

    const allPreguntas = preguntasRef.current
    if (!allPreguntas.length) return

    const start = pageIndex * PREGUNTAS_POR_PAGINA
    const end = Math.min(start + PREGUNTAS_POR_PAGINA, allPreguntas.length)
    const preguntasPagina = allPreguntas.slice(start, end)

    const map = respuestasRef.current
    const respuestasPayload: Respuesta16PFItem[] = preguntasPagina
      .map((p) => {
        const valor = map.get(p.pfpIdPregunta)
        if (!valor) return null
        return { preguntaId: p.pfpIdPregunta, valorRespuesta: valor } as Respuesta16PFItem
      })
      .filter(Boolean) as Respuesta16PFItem[]

    if (respuestasPayload.length === 0) {
      clearPageDirty(pageIndex)
      return
    }

    setAutosaving(true)
    setAutosaveError(null)
    try {
      await test16pfService.autosave(token, respuestasPayload, segundosConsumidosRef.current)
      setLastAutosaveAt(Date.now())
      clearPageDirty(pageIndex)
    } catch (e: any) {
      setAutosaveError(e?.message || 'Error de autosave')
    } finally {
      setAutosaving(false)
    }
  }

  // Autosave periódico en la página actual si hubo cambios
  useEffect(() => {
    if (mostrarInstrucciones || isBloqueada) return
    const id = window.setInterval(() => {
      autosavePagina(paginaActual).catch(() => {})
    }, 1000 * 30)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaActual, isBloqueada, mostrarInstrucciones, dirtyTick])

  // Manejar respuesta de pregunta
  const handleResponder = (preguntaId: number, valor: 1 | 2 | 3) => {
    if (isBloqueada) return
    const pageIndex = questionPageById.get(preguntaId) ?? paginaActual
    markPageDirty(pageIndex)
    setRespuestas(new Map(respuestas).set(preguntaId, valor))
  }

  // Enviar todas las respuestas
  const handleEnviar = async () => {
    if (isBloqueada) {
      toast({
        title: 'Prueba no disponible',
        description: 'La prueba está bloqueada o el tiempo se agotó.',
        variant: 'destructive',
      })
      return
    }
    if (respuestas.size !== 185) {
      toast({
        title: 'Faltan preguntas por responder',
        description: `Has respondido ${respuestas.size} de 185 preguntas. Por favor completa todas.`,
        variant: 'destructive',
      })
      return
    }

    setEnviando(true)
    try {
      // Asegurar que el servidor tenga todos los parciales antes de finalizar
      for (let page = 0; page < totalPaginas; page += 1) {
        // eslint-disable-next-line no-await-in-loop
        await autosavePagina(page, true)
      }

      await test16pfService.finalizarParcial(token!, segundosConsumidosRef.current)

      // Limpiar localStorage
      localStorage.removeItem(`16pf_respuestas_${token}`)
      localStorage.removeItem(`16pf_instructions_accepted_${token}`)

      toast({
        title: '¡Test completado!',
        description: 'Tus respuestas han sido guardadas correctamente.',
      })

      // Redirigir a página de éxito
      navigate(`/prueba/16pf/${token}/exito`)
    } catch (error: any) {
      toast({
        title: 'Error al enviar respuestas',
        description: error.message || 'Por favor intenta nuevamente.',
        variant: 'destructive',
      })
      setEnviando(false)
    }
  }

  const handleCambiarPagina = (pagina: number) => {
    if (Number.isNaN(pagina)) return
    const paginaAnterior = paginaActual
    setPaginaActual(() => Math.max(0, Math.min(totalPaginas - 1, pagina)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
    autosavePagina(paginaAnterior).catch(() => {})
  }

  // Mostrar instrucciones primero si no han sido aceptadas
  if (mostrarInstrucciones) {
    return <Instructions16PF onAccept={handleAcceptInstructions} />
  }

  // Validaciones de carga y errores
  if (iniciando || loadingCandidato || loadingPreguntas || loadingEstado) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-6 mt-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (errorCandidato || errorPreguntas || errorEstado) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-red-700">Error de Acceso</h2>
              <p className="text-slate-600">
                {errorCandidato
                  ? 'No se pudo verificar tu identidad.'
                  : errorPreguntas
                  ? String(errorPreguntas)
                  : 'No se pudo obtener el estado de la prueba.'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => refetchEstado()} className="w-full">
                  Reintentar
                </Button>
                <Button onClick={() => navigate(`/candidato/${token}`)} variant="outline" className="w-full">
                  Volver al inicio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isBloqueada) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-lg border-amber-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <WifiOff className="h-12 w-12 text-amber-600 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Prueba bloqueada o expirada</h2>
              <p className="text-slate-600">
                {estadoPrueba?.motivoBloqueo ||
                  'El tiempo disponible para diligenciar esta prueba se agotó o la fecha límite venció.'}
              </p>
              <Button onClick={() => navigate(`/candidato/${token}`)} className="w-full">
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si ya completó
  if (testCompletado) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-green-200 shadow-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">¡Test Completado!</h2>
            <p className="text-slate-600">
              Gracias por completar el Test 16PF. Tus respuestas han sido registradas correctamente.
            </p>
            <p className="text-sm text-slate-500">Serás redirigido al panel principal en unos segundos...</p>
            <Button onClick={() => navigate(`/candidato/${token}`)} className="w-full bg-green-600 hover:bg-green-700">
              Volver al inicio ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progreso = (respuestas.size / 185) * 100
  const preguntasActuales = preguntas.slice(
    paginaActual * PREGUNTAS_POR_PAGINA,
    (paginaActual + 1) * PREGUNTAS_POR_PAGINA
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-28">
      {/* Header Fijo */}
      <header className="bg-white/90 border-b sticky top-0 z-20 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
          <div className="flex items-center justify-between mb-2 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-2xl flex-shrink-0">
                <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-purple-700" />
              </div>
              <div className="min-w-0">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base truncate">Test 16PF</h1>
                <p className="text-xs text-slate-500 truncate">{candidato?.nombreCompleto}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs sm:text-sm font-semibold text-purple-700 block tabular-nums">
                    {respuestas.size} / 185
                  </span>
                  <p className="text-xs text-slate-500 hidden md:block">respondidas</p>
                </div>

                <div
                  className={cn(
                    'flex items-center gap-2 rounded-2xl border px-3 py-1.5',
                    (segundosRestantesUi ?? 0) <= 300
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700',
                  )}
                >
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-semibold tabular-nums">{formatSeconds(segundosRestantesUi)}</span>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                  {autosaving ? (
                    <span>Guardando…</span>
                  ) : autosaveError ? (
                    <span className="text-rose-600">Sin sincronizar</span>
                  ) : lastAutosaveAt ? (
                    <span>Guardado</span>
                  ) : (
                    <span>Sin guardar</span>
                  )}
                </div>
              </div>

              {/* Mobile Menu Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden h-8 w-8 sm:h-9 sm:w-9">
                    <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle className="text-base">Navegación</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <QuestionMap16PF
                      preguntas={preguntas}
                      totalPaginas={totalPaginas}
                      paginaActual={paginaActual}
                      respuestas={respuestas}
                      onPaginaChange={handleCambiarPagina}
                      compact
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>
      </header>

      {/* Contenido Principal con Sidebar */}
      <div className="max-w-7xl mx-auto flex items-start gap-4 md:gap-6 lg:gap-8 px-3 sm:px-4 md:px-6 py-4 md:py-6">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 xl:w-72 sticky top-24 bg-white p-4 rounded-2xl border shadow-sm h-[calc(100vh-120px)] overflow-y-auto">
          <QuestionMap16PF
            preguntas={preguntas}
            totalPaginas={totalPaginas}
            paginaActual={paginaActual}
            respuestas={respuestas}
            onPaginaChange={handleCambiarPagina}
          />
        </aside>

        {/* Área de Preguntas */}
        <main className="flex-1 space-y-4 md:space-y-6 min-w-0 pb-6">
          {/* Instrucciones (solo en primera página) */}
          {paginaActual === 0 && (
            <Alert className="bg-blue-50 border-blue-200 mb-6">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 font-semibold">Instrucciones Importantes</AlertTitle>
              <AlertDescription className="text-blue-700 text-sm mt-1 space-y-1">
                <p>• Este cuestionario tiene 185 preguntas. No hay respuestas correctas o incorrectas.</p>
                <p>• Responde con sinceridad y espontaneidad. No pienses demasiado tus respuestas.</p>
                <p>• Trata de evitar la opción "B" (Intermedio/?) a menos que sea estrictamente necesario.</p>
                <p>• Asegúrate de responder todas las preguntas para poder finalizar.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de Preguntas */}
          <div className="space-y-3 md:space-y-4">
            {preguntasActuales.map((pregunta: Pregunta16PF) => {
              const respondida = respuestas.has(pregunta.pfpIdPregunta)
              const valorActual = respuestas.get(pregunta.pfpIdPregunta)

              return (
                <motion.div
                  key={pregunta.pfpIdPregunta}
                  id={`q-${pregunta.pfpIdPregunta}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={cn(
                      'transition-all duration-200 border-l-4 shadow-sm hover:shadow-md rounded-2xl',
                      respondida ? 'border-l-green-500 bg-white' : 'border-l-slate-300 bg-white'
                    )}
                  >
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="flex gap-2 sm:gap-3 md:gap-4">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm md:text-base tabular-nums">
                          {pregunta.pfpNumeroPregunta}
                        </span>
                        <div className="flex-1 space-y-3 md:space-y-4 min-w-0">
                          <p className="text-slate-900 font-semibold text-sm sm:text-base md:text-lg leading-snug">
                            {pregunta.pfpTextoPregunta}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pt-2">
                            {[
                              { valor: 1, letra: 'A', texto: pregunta.pfpOpcionA },
                              { valor: 2, letra: 'B', texto: pregunta.pfpOpcionB },
                              { valor: 3, letra: 'C', texto: pregunta.pfpOpcionC },
                            ].map(({ valor, letra, texto }) => (
                              <motion.button
                                key={valor}
                                onClick={() => handleResponder(pregunta.pfpIdPregunta, valor as 1 | 2 | 3)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  'group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border-2 rounded-xl p-3 sm:p-4 cursor-pointer font-semibold transition-all duration-200 text-sm sm:text-base leading-snug',
                                  valorActual === valor
                                    ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 shadow-lg shadow-blue-300 ring-2 ring-blue-400'
                                    : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                                )}
                              >
                                <div className={cn(
                                  'flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-sm sm:text-base flex-shrink-0 transition-all',
                                  valorActual === valor
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-slate-200 text-slate-700 group-hover:bg-blue-200'
                                )}>
                                  {letra}
                                </div>
                                <span className="flex-1 text-left leading-tight">{texto}</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

        </main>
      </div>

      {/* Barra inferior fija de navegación */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <Button
                variant="outline"
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 0 || isBloqueada}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>

              <div className="hidden sm:block text-sm text-slate-600 font-medium">
                Página <span className="tabular-nums">{paginaActual + 1}</span> de{' '}
                <span className="tabular-nums">{totalPaginas}</span>
              </div>
            </div>

            {paginaActual < totalPaginas - 1 ? (
              <Button
                variant="default"
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                disabled={isBloqueada}
                className="w-full sm:w-44 !bg-slate-900 !text-white hover:!bg-slate-800"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                onClick={handleEnviar}
                disabled={isBloqueada || enviando || respuestas.size !== 185}
                className={cn(
                  'w-full sm:w-52 font-semibold transition-all',
                  respuestas.size === 185
                    ? '!bg-green-600 !text-white hover:!bg-green-700 shadow-lg shadow-green-200'
                    : '!bg-slate-300 !text-slate-500 cursor-not-allowed hover:!bg-slate-300'
                )}
              >
                {enviando ? (
                  'Enviando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Finalizar
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="sm:hidden mt-2 text-center text-xs text-slate-500">
            Página <span className="tabular-nums">{paginaActual + 1}</span> de{' '}
            <span className="tabular-nums">{totalPaginas}</span> ·{' '}
            <span className="tabular-nums">{respuestas.size}</span>/185 respondidas
          </div>
        </div>
      </div>
    </div>
  )
}
