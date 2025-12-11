"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { test16pfService } from "@/lib/services/test16pfService"
import { useCandidatoPublico } from "@/lib/hooks/useCandidatePublic"
import { Pregunta16PF, Respuesta16PFItem } from "@/types/test16pf.types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useModernToast } from "@/lib/toast"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Save, Timer, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

const PREGUNTAS_POR_PAGINA = 10

export default function Prueba16PFPage({ params }: { params: { token: string } }) {
  const { token } = params
  const router = useRouter()
  const toast = useModernToast()
  
  // Estado de datos
  const { data: candidato, isLoading: loadingCandidato, error: errorCandidato } = useCandidatoPublico(token)
  const [preguntas, setPreguntas] = useState<Pregunta16PF[]>([])
  const [loadingPreguntas, setLoadingPreguntas] = useState(true)
  const [errorPreguntas, setErrorPreguntas] = useState<string | null>(null)
  
  // Estado del test
  const [respuestas, setRespuestas] = useState<Map<number, 1 | 2 | 3>>(new Map())
  const [paginaActual, setPaginaActual] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [testCompletado, setTestCompletado] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  
  // Cargar preguntas
  useEffect(() => {
    async function loadPreguntas() {
      try {
        const data = await test16pfService.getPreguntas(token)
        setPreguntas(data.preguntas)
        
        // Recuperar respuestas guardadas localmente
        const savedRespuestas = localStorage.getItem(`16pf_respuestas_${token}`)
        if (savedRespuestas) {
          try {
            const parsed = JSON.parse(savedRespuestas)
            const map = new Map<number, 1 | 2 | 3>(parsed)
            setRespuestas(map)
          } catch (e) {
            console.error("Error recuperando respuestas locales", e)
          }
        }
      } catch (err: any) {
        console.error(err)
        // Si el error indica que ya completó, marcar como completado
        if (err.message?.includes("completado") || err.message?.includes("respondido")) {
          setTestCompletado(true)
        } else {
          setErrorPreguntas(err.message || "Error al cargar las preguntas del test")
        }
      } finally {
        setLoadingPreguntas(false)
      }
    }
    
    if (token) {
      loadPreguntas()
    }
  }, [token])

  // Guardar respuestas localmente cada vez que cambian
  useEffect(() => {
    if (respuestas.size > 0) {
      localStorage.setItem(`16pf_respuestas_${token}`, JSON.stringify(Array.from(respuestas.entries())))
    }
  }, [respuestas, token])

  // Manejar respuesta
  const handleResponder = useCallback((preguntaId: number, valor: 1 | 2 | 3) => {
    setRespuestas(prev => {
      const newMap = new Map(prev)
      newMap.set(preguntaId, valor)
      return newMap
    })
    // Si el usuario responde, ocultamos los errores visuales si ya completó todo (opcional)
  }, [])

  // Navegación rápida
  const jumpToQuestion = (index: number) => {
    const page = Math.floor(index / PREGUNTAS_POR_PAGINA)
    setPaginaActual(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Componente de Mapa de Preguntas
  const QuestionMap = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Mapa de Preguntas</h3>
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", 
          respuestas.size === 185 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
        )}>
          {respuestas.size} / 185
        </span>
      </div>
      
      <div className="flex gap-2 text-xs text-slate-500 mb-2">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Respondida</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded"></div> Pendiente</div>
      </div>

      <ScrollArea className={cn("pr-4", mobile ? "h-[calc(100vh-180px)]" : "h-[calc(100vh-250px)]")}>
        <div className="grid grid-cols-5 gap-2 pb-4">
          {preguntas.map((p, i) => {
            const isAnswered = respuestas.has(p.pfpIdPregunta)
            const isCurrentPage = Math.floor(i / PREGUNTAS_POR_PAGINA) === paginaActual
            
            return (
              <button
                key={p.pfpIdPregunta}
                onClick={() => jumpToQuestion(i)}
                className={cn(
                  "h-9 w-full text-xs font-medium rounded-md transition-all flex items-center justify-center relative",
                  isAnswered 
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200" 
                    : showErrors 
                      ? "bg-red-50 text-red-700 border border-red-200 animate-pulse" 
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200",
                  isCurrentPage && "ring-2 ring-purple-500 ring-offset-1 z-10"
                )}
              >
                {p.pfpNumeroPregunta}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  // Enviar test
  const handleEnviar = async () => {
    if (!candidato) return
    
    if (respuestas.size !== 185) {
      setShowErrors(true)
      toast.error({
        title: "Test incompleto",
        description: `Has respondido ${respuestas.size} de 185 preguntas. Revisa el mapa de preguntas para ver las pendientes (en rojo).`
      })
      return
    }

    if (!confirm("¿Estás seguro de que deseas finalizar el test? Una vez enviado no podrás modificar tus respuestas.")) {
      return
    }

    setEnviando(true)
    try {
      const respuestasArray: Respuesta16PFItem[] = Array.from(respuestas.entries()).map(([id, val]) => ({
        preguntaId: id,
        valorRespuesta: val
      }))

      await test16pfService.guardarRespuestas(token, candidato.canId, respuestasArray)
      
      // Limpiar storage
      localStorage.removeItem(`16pf_respuestas_${token}`)
      
      setTestCompletado(true)
      toast.success({
        title: "¡Test completado!",
        description: "Tus respuestas han sido guardadas exitosamente."
      })
      
      // Redirigir después de unos segundos
      setTimeout(() => {
        router.push(`/candidato/${token}`)
      }, 3000)
      
    } catch (err: any) {
      toast.error({
        title: "Error al enviar",
        description: err.message || "Ocurrió un error al guardar tus respuestas. Intenta nuevamente."
      })
    } finally {
      setEnviando(false)
    }
  }

  // Paginación
  const totalPaginas = Math.ceil(preguntas.length / PREGUNTAS_POR_PAGINA)
  const preguntasActuales = preguntas.slice(
    paginaActual * PREGUNTAS_POR_PAGINA, 
    (paginaActual + 1) * PREGUNTAS_POR_PAGINA
  )

  // Validaciones de carga y errores
  if (loadingCandidato || loadingPreguntas) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center space-y-4">
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-6 mt-8">
            {[1, 2, 3].map(i => (
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
          <CardHeader className="bg-red-50 rounded-t-xl">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">
              {errorCandidato ? "No se pudo verificar tu identidad." : errorPreguntas}
            </p>
            <Button onClick={() => router.push(`/candidato/${token}`)} variant="outline" className="w-full">
              Volver al inicio
            </Button>
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
          <CardHeader className="bg-green-50 rounded-t-xl">
            <CardTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              ¡Test Completado!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-slate-600">
              Gracias por completar el Test 16PF. Tus respuestas han sido registradas correctamente.
            </p>
            <p className="text-sm text-slate-500">
              Serás redirigido al panel principal en unos segundos...
            </p>
            <Button onClick={() => router.push(`/candidato/${token}`)} className="w-full bg-green-600 hover:bg-green-700">
              Volver al inicio ahora
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progreso = (respuestas.size / 185) * 100

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
                <span className="text-sm font-medium text-purple-700">{respuestas.size} / 185</span>
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
            {preguntasActuales.map((pregunta) => {
              const respondida = respuestas.has(pregunta.pfpIdPregunta)
              const valorActual = respuestas.get(pregunta.pfpIdPregunta)

              return (
                <Card key={pregunta.pfpIdPregunta} className={cn(
                  "transition-all duration-200 border-l-4",
                  respondida ? "border-l-green-500 bg-white" : "border-l-slate-300 bg-slate-50/50"
                )}>
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
                          onValueChange={(val) => handleResponder(pregunta.pfpIdPregunta, parseInt(val) as 1|2|3)}
                          className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2"
                        >
                          <div 
                            onClick={() => handleResponder(pregunta.pfpIdPregunta, 1)}
                            className={cn(
                              "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors hover:bg-slate-50",
                              valorActual === 1 && "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                            )}
                          >
                            <RadioGroupItem value="1" id={`p${pregunta.pfpIdPregunta}-1`} />
                            <Label htmlFor={`p${pregunta.pfpIdPregunta}-1`} className="flex-1 cursor-pointer font-normal pointer-events-none">
                              A. {pregunta.pfpOpcionA}
                            </Label>
                          </div>

                          <div 
                            onClick={() => handleResponder(pregunta.pfpIdPregunta, 2)}
                            className={cn(
                              "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors hover:bg-slate-50",
                              valorActual === 2 && "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                            )}
                          >
                            <RadioGroupItem value="2" id={`p${pregunta.pfpIdPregunta}-2`} />
                            <Label htmlFor={`p${pregunta.pfpIdPregunta}-2`} className="flex-1 cursor-pointer font-normal pointer-events-none">
                              B. {pregunta.pfpOpcionB}
                            </Label>
                          </div>

                          <div 
                            onClick={() => handleResponder(pregunta.pfpIdPregunta, 3)}
                            className={cn(
                              "flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors hover:bg-slate-50",
                              valorActual === 3 && "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                            )}
                          >
                            <RadioGroupItem value="3" id={`p${pregunta.pfpIdPregunta}-3`} />
                            <Label htmlFor={`p${pregunta.pfpIdPregunta}-3`} className="flex-1 cursor-pointer font-normal pointer-events-none">
                              C. {pregunta.pfpOpcionC}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Navegación */}
          <div className="flex items-center justify-between pt-6 pb-10">
            <Button
              variant="outline"
              onClick={() => {
                setPaginaActual(p => Math.max(0, p - 1))
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
                  setPaginaActual(p => Math.min(totalPaginas - 1, p + 1))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-32 bg-slate-900 hover:bg-slate-800"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleEnviar}
                disabled={enviando}
                className={cn(
                  "w-40 font-semibold",
                  respuestas.size === 185 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200" 
                    : "bg-slate-300 text-slate-500"
                )}
              >
                {enviando ? (
                  "Enviando..."
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
