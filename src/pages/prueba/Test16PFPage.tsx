import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  LayoutGrid 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCandidatoPublico } from '@/lib/hooks/useCandidatePublic'
import { useToast } from '@/hooks/use-toast'
import { test16pfService } from '@/lib/services/test16pfService'
import type { Respuesta16PFItem, Pregunta16PF } from '@/types/test16pf.types'
import { useQuery } from '@tanstack/react-query'

const PREGUNTAS_POR_PAGINA = 10

export default function Test16PFPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Estado
  const [paginaActual, setPaginaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Map<number, 1 | 2 | 3>>(new Map())
  const [testCompletado, setTestCompletado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  // Hooks de API
  const { data: candidato, isLoading: loadingCandidato, error: errorCandidato } = useCandidatoPublico(token!)
  const { data: preguntasData, isLoading: loadingPreguntas, error: errorPreguntas } = useQuery({
    queryKey: ['test16pf-preguntas', token],
    queryFn: () => test16pfService.getPreguntas(token!),
    enabled: !!token,
  })

  const preguntas: Pregunta16PF[] = preguntasData?.preguntas ?? []
  const totalPaginas = Math.ceil(preguntas.length / PREGUNTAS_POR_PAGINA)

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
  }, [token])

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (respuestas.size > 0) {
      const obj = Object.fromEntries(respuestas)
      localStorage.setItem(`16pf_respuestas_${token}`, JSON.stringify(obj))
    }
  }, [respuestas, token])

  // Manejar respuesta de pregunta
  const handleResponder = (preguntaId: number, valor: 1 | 2 | 3) => {
    setRespuestas(new Map(respuestas).set(preguntaId, valor))
  }

  // Enviar todas las respuestas
  const handleEnviar = async () => {
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
      const respuestasArray: Respuesta16PFItem[] = Array.from(respuestas.entries()).map(
        ([preguntaId, valorRespuesta]) => ({
          preguntaId,
          valorRespuesta,
        })
      )

      // Obtener candidatoId del candidato
      const candidatoId = candidato?.canId || 0

      await test16pfService.guardarRespuestas(token!, candidatoId, respuestasArray)

      // Limpiar localStorage
      localStorage.removeItem(`16pf_respuestas_${token}`)

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

  // Componente de mapa de preguntas
  const QuestionMap = ({ mobile = false }: { mobile?: boolean }) => {
    const gruposPorPagina = Array.from({ length: totalPaginas }, (_, i) => {
      const start = i * PREGUNTAS_POR_PAGINA
      const end = Math.min(start + PREGUNTAS_POR_PAGINA, preguntas.length)
      return { pagina: i, preguntas: preguntas.slice(start, end) }
    })

    return (
      <div className="space-y-4 overflow-y-auto max-h-full">
        <h3 className="font-semibold text-sm text-slate-700">Navegación de Preguntas</h3>
        <div className="space-y-3">
          {gruposPorPagina.map(({ pagina, preguntas: preguntasPagina }) => (
            <div key={pagina} className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                Página {pagina + 1} ({preguntasPagina[0].pfpNumeroPregunta}-
                {preguntasPagina[preguntasPagina.length - 1].pfpNumeroPregunta})
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {preguntasPagina.map((p: Pregunta16PF) => {
                  const respondida = respuestas.has(p.pfpIdPregunta)
                  return (
                    <Button
                      key={p.pfpIdPregunta}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-9 w-full text-xs font-medium transition-all',
                        respondida
                          ? 'bg-green-100 border-green-400 text-green-700 hover:bg-green-200'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100',
                        paginaActual === pagina && 'ring-2 ring-purple-400 ring-offset-1'
                      )}
                      onClick={() => {
                        setPaginaActual(pagina)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                    >
                      {p.pfpNumeroPregunta}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Validaciones de carga y errores
  if (loadingCandidato || loadingPreguntas) {
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

  if (errorCandidato || errorPreguntas) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto" />
              <h2 className="text-xl font-bold text-red-700">Error de Acceso</h2>
              <p className="text-slate-600">
                {errorCandidato ? 'No se pudo verificar tu identidad.' : String(errorPreguntas)}
              </p>
              <Button onClick={() => navigate(`/candidato/${token}`)} variant="outline" className="w-full">
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Fijo */}
      <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800 text-sm md:text-base">Test de Personalidad 16PF</h1>
                <p className="text-xs text-slate-500 hidden md:block">Candidato: {candidato?.nombreCompleto}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <span className="text-sm font-medium text-purple-700">
                  {respuestas.size} / 185
                </span>
                <p className="text-xs text-slate-500">Preguntas respondidas</p>
              </div>

              {/* Mobile Menu Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden">
                    <LayoutGrid className="h-5 w-5 text-slate-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Navegación de Preguntas</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <QuestionMap mobile />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>
      </header>

      {/* Contenido Principal con Sidebar */}
      <div className="max-w-7xl mx-auto flex items-start gap-8 px-4 py-6">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-72 sticky top-28 bg-white p-4 rounded-xl border shadow-sm h-[calc(100vh-140px)]">
          <QuestionMap />
        </aside>

        {/* Área de Preguntas */}
        <main className="flex-1 space-y-6 min-w-0">
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
          <div className="space-y-4">
            {preguntasActuales.map((pregunta: Pregunta16PF) => {
              const respondida = respuestas.has(pregunta.pfpIdPregunta)
              const valorActual = respuestas.get(pregunta.pfpIdPregunta)

              return (
                <motion.div
                  key={pregunta.pfpIdPregunta}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    className={cn(
                      'transition-all duration-200 border-l-4',
                      respondida ? 'border-l-green-500 bg-white' : 'border-l-slate-300 bg-slate-50/50'
                    )}
                  >
                    <CardContent className="pt-6 pb-4">
                      <div className="flex gap-4">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                          {pregunta.pfpNumeroPregunta}
                        </span>
                        <div className="flex-1 space-y-4">
                          <p className="text-slate-800 font-medium text-lg leading-snug">
                            {pregunta.pfpTextoPregunta}
                          </p>

                          <RadioGroup
                            value={valorActual?.toString()}
                            onValueChange={(val) => handleResponder(pregunta.pfpIdPregunta, parseInt(val) as 1 | 2 | 3)}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2"
                          >
                            {[
                              { valor: 1, letra: 'A', texto: pregunta.pfpOpcionA },
                              { valor: 2, letra: 'B', texto: pregunta.pfpOpcionB },
                              { valor: 3, letra: 'C', texto: pregunta.pfpOpcionC },
                            ].map(({ valor, letra, texto }) => (
                              <div
                                key={valor}
                                onClick={() => handleResponder(pregunta.pfpIdPregunta, valor as 1 | 2 | 3)}
                                className={cn(
                                  'flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors hover:bg-slate-50',
                                  valorActual === valor && 'border-purple-500 bg-purple-50 ring-1 ring-purple-500'
                                )}
                              >
                                <RadioGroupItem value={valor.toString()} id={`p${pregunta.pfpIdPregunta}-${valor}`} />
                                <Label
                                  htmlFor={`p${pregunta.pfpIdPregunta}-${valor}`}
                                  className="flex-1 cursor-pointer font-normal pointer-events-none"
                                >
                                  {letra}. {texto}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-between pt-6 pb-10">
            <Button
              variant="outline"
              onClick={() => {
                setPaginaActual((p) => Math.max(0, p - 1))
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              disabled={paginaActual === 0}
              className="w-32"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>

            <span className="text-sm text-slate-500 font-medium lg:hidden">
              Página {paginaActual + 1} de {totalPaginas}
            </span>

            {paginaActual < totalPaginas - 1 ? (
              <Button
                onClick={() => {
                  setPaginaActual((p) => Math.min(totalPaginas - 1, p + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-32 bg-slate-900 hover:bg-slate-800"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleEnviar}
                disabled={enviando || respuestas.size !== 185}
                className={cn(
                  'w-40 font-semibold',
                  respuestas.size === 185
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200'
                    : 'bg-slate-300 text-slate-500'
                )}
              >
                {enviando ? (
                  'Enviando...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Finalizar Test
                  </>
                )}
              </Button>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
