import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Check, ChevronDown } from 'lucide-react'
import { usePreguntasCMT, useEnviarRespuestasCMT } from '@/lib/hooks/useCandidatePublic'
import { crearRelojSesion } from '@/lib/cmt-session'
import { useToast } from '@/hooks/use-toast'
import LoadingScreen from '@/components/ui/loading-screen'
import type { CmtResponderPreguntaDto } from '@/types/selection.types'

// Componente de Instructivo
function InstructivoCMT({ onStart }: { onStart: () => void }) {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-x-hidden">
      {/* Decoración de fondo */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img src="/images/Recurso 7.png" alt="" className="w-full h-full object-contain" />
      </motion.div>

      {/* Sección 1: Hero */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 py-16 md:py-20 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-8 md:p-12 relative z-10 border border-gray-100"
        >
          <div className="flex justify-center mb-6">
            <img src="/images/Logo.png" alt="Super de Alimentos" className="h-14 object-contain" />
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 text-center leading-tight">
            Cuestionario de Motivación para el Trabajo
          </h1>
          <p className="text-xl md:text-2xl text-primary font-semibold mb-8 text-center">CMT</p>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p className="text-base md:text-lg text-center">
              Este cuestionario <strong>no es un examen</strong>. No hay respuestas correctas o incorrectas. Queremos
              conocer qué te motiva en el trabajo para ubicarte mejor en el cargo.
            </p>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
              <p className="text-sm md:text-base text-blue-900 text-center">
                <strong>🔒 Confidencialidad:</strong> Tus respuestas se usan únicamente para este proceso de selección
                y son completamente privadas.
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="mt-10 text-center"
          >
            <p className="text-sm md:text-base text-gray-500 flex items-center justify-center gap-2 font-medium">
              Desplázate para ver las instrucciones
              <ChevronDown className="h-5 w-5 text-primary" />
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Sección 2: Instrucciones detalladas */}
      <section className="min-h-screen flex items-center py-16 md:py-20 px-4 relative">
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">¿Cómo funciona el CMT?</h2>

            <div className="space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
              <p>
                El cuestionario consta de <strong>15 grupos de frases</strong>. Cada grupo tiene{' '}
                <strong>5 frases (a, b, c, d, e)</strong>.
              </p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-3">
                  📋 Tu tarea es ordenar las 5 frases según tu preferencia:
                </p>
                <ul className="space-y-2 ml-2">
                  {[
                    {
                      val: 5,
                      text: 'La frase que te produce MAYOR satisfacción o que MÁS te representa en el trabajo.',
                    },
                    { val: 4, text: 'La que te satisface bastante.' },
                    { val: 3, text: 'La que te satisface moderadamente.' },
                    { val: 2, text: 'La que te satisface poco.' },
                    {
                      val: 1,
                      text: 'La frase que te produce MENOR satisfacción o que MENOS te representa.',
                    },
                  ].map(({ val, text }) => (
                    <li key={val} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                        {val}
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Reglas importantes:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2 text-amber-800">
                  <li>
                    <strong>Debes usar todos los números del 5 al 1</strong> en cada grupo (uno por cada frase).
                  </li>
                  <li>
                    <strong>No puedes repetir números</strong> dentro del mismo grupo.
                  </li>
                  <li>Cada grupo es independiente, puedes usar el mismo número para frases similares en grupos diferentes.</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="font-semibold text-green-900 mb-2">💡 Consejos:</p>
                <ul className="list-disc list-inside space-y-1.5 ml-2 text-green-800">
                  <li>Responde con sinceridad según tus verdaderas preferencias.</li>
                  <li>No pienses demasiado, tu primera impresión suele ser la más acertada.</li>
                  <li>
                    Tiempo estimado: <strong>20-35 minutos</strong>
                  </li>
                  <li>Puedes navegar entre preguntas usando los botones o la cuadrícula de navegación.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección 3: CTA Final */}
      <section className="min-h-screen flex items-center py-16 md:py-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl p-8 md:p-12 text-center relative z-10 border border-gray-100 w-full"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Listo(a) para comenzar?</h2>
          <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
            Ahora que comprendes cómo funciona, puedes iniciar la prueba. Recuerda responder con sinceridad.
          </p>

          <Button type="button" onClick={onStart} size="lg" className="w-full sm:w-auto px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
            Comenzar Prueba CMT
          </Button>

          <p className="text-xs text-gray-500 mt-6">
            ¿Problemas técnicos? Escríbenos a{' '}
            <a href="mailto:seleccion@super.com.co" className="text-primary underline">
              seleccion@super.com.co
            </a>
          </p>
        </motion.div>
      </section>
    </main>
  )
}

export default function TestCMTPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // Estado de la prueba
  const [mostrarInstructivo, setMostrarInstructivo] = useState(true)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestas, setRespuestas] = useState<Map<number, CmtResponderPreguntaDto>>(new Map())
  const [rankingTemporal, setRankingTemporal] = useState<Record<string, number>>({})
  const [tiempoInicio, setTiempoInicio] = useState<number>(Date.now())
  const [tiempoTotal, setTiempoTotal] = useState(0)
  const [enviandoRespuestas, setEnviandoRespuestas] = useState(false)

  // Sesión CMT (tiempo límite y anti‑fraude)
  const [sesionLabel, setSesionLabel] = useState<string>('--:--')
  const [sesionExpirada, setSesionExpirada] = useState<boolean>(false)
  const [estadoAsignacion, setEstadoAsignacion] = useState<'PENDIENTE' | 'INICIADA' | 'COMPLETADA' | 'EXPIRADA'>(
    'PENDIENTE'
  )

  // Hooks de API
  const { data: preguntasData, isLoading, error } = usePreguntasCMT(token!)
  const enviarRespuestas = useEnviarRespuestasCMT()

  // Timer para tracking de tiempo total
  useEffect(() => {
    if (mostrarInstructivo) return

    const timer = setInterval(() => {
      setTiempoTotal(Math.floor((Date.now() - tiempoInicio) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [tiempoInicio, mostrarInstructivo])

  // Cargar respuestas guardadas del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`cmt_respuestas_${token}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const map = new Map(Object.entries(parsed).map(([k, v]) => [Number(k), v as CmtResponderPreguntaDto]))
        setRespuestas(map)

        // Si hay respuesta para la pregunta actual, cargar el ranking
        const preguntaNum = preguntaActual + 1
        const respuestaActual = map.get(preguntaNum)
        if (respuestaActual) {
          setRankingTemporal(respuestaActual.ranking)
        }
      } catch (e) {
        console.error('Error al cargar respuestas guardadas:', e)
      }
    }
  }, [token, preguntaActual])

  // Guardar respuestas en localStorage cuando cambien
  useEffect(() => {
    if (respuestas.size > 0) {
      const obj = Object.fromEntries(respuestas)
      localStorage.setItem(`cmt_respuestas_${token}`, JSON.stringify(obj))
    }
  }, [respuestas, token])

  // Reloj de sesión basado en hora del servidor
  useEffect(() => {
    if (!preguntasData?.asignacion) return

    const asign = preguntasData.asignacion as any
    const fechaLimiteUtc: string | null = asign.fechaLimiteUtc ?? asign.fechaLimite ?? null
    const estado: typeof estadoAsignacion = asign.estado ?? (fechaLimiteUtc ? 'INICIADA' : 'PENDIENTE')
    const tiempoMaxMinutos: number = asign.tiempoMaxMinutos ?? 35
    const serverNowUtc: string = asign.serverNowUtc ?? new Date().toISOString()

    setEstadoAsignacion(estado)

    if (!fechaLimiteUtc) return

    const getTime = crearRelojSesion({
      estado,
      serverNowUtc,
      fechaLimiteUtc,
      tiempoMaxMinutos,
    })

    const first = getTime()
    setSesionLabel(first.label)
    setSesionExpirada(first.remainingMs === 0)

    const id = setInterval(() => {
      const t = getTime()
      setSesionLabel(t.label)
      if (t.remainingMs === 0) {
        setSesionExpirada(true)
      }
    }, 1000)

    return () => clearInterval(id)
  }, [preguntasData])

  // Señales anti‑fraude (no pausan tiempo): beforeunload y visibilitychange
  useEffect(() => {
    if (estadoAsignacion !== 'INICIADA') return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        console.warn('La pestaña quedó en segundo plano durante la prueba.')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [estadoAsignacion])

  // Manejar selección de valor para una opción
  const handleSeleccionarValor = (letra: string, valor: number) => {
    if (sesionExpirada) {
      toast({
        title: 'Tiempo excedido',
        description: 'La prueba ha expirado. No puedes cambiar el ranking.',
        variant: 'destructive',
      })
      return
    }
    const nuevoRanking = { ...rankingTemporal }

    // Si el valor ya está asignado a otra letra, intercambiar
    const letraAnterior = Object.keys(nuevoRanking).find((k) => nuevoRanking[k] === valor)
    if (letraAnterior && letraAnterior !== letra) {
      const valorAnterior = nuevoRanking[letra]
      if (valorAnterior) {
        nuevoRanking[letraAnterior] = valorAnterior
      } else {
        delete nuevoRanking[letraAnterior]
      }
    }

    nuevoRanking[letra] = valor
    setRankingTemporal(nuevoRanking)

    // Auto-guardar o desmarcar como respondida según estado de completitud
    const numeroEnunciado = preguntaActual + 1
    if (validarRanking(nuevoRanking)) {
      const tiempoRespuesta = Date.now() - tiempoInicio
      setRespuestas((prev) => {
        const nueva = new Map(prev)
        nueva.set(numeroEnunciado, {
          numeroEnunciado,
          ranking: nuevoRanking,
          tiempoRespuestaMs: tiempoRespuesta,
        })
        return nueva
      })
    } else {
      setRespuestas((prev) => {
        const nueva = new Map(prev)
        nueva.delete(numeroEnunciado)
        return nueva
      })
    }
  }

  // Validar que el ranking esté completo
  const validarRanking = (ranking: Record<string, number> | undefined): boolean => {
    if (!ranking) return false

    const letras = Object.keys(ranking)
    const valores = Object.values(ranking)

    if (letras.length !== 5) return false

    const valoresUnicos = new Set(valores)
    if (valoresUnicos.size !== 5) return false

    for (let i = 1; i <= 5; i++) {
      if (!valores.includes(i)) return false
    }

    return true
  }

  // Guardar ranking y avanzar
  const handleGuardarRanking = () => {
    if (validarRanking(rankingTemporal)) {
      const numeroEnunciado = preguntaActual + 1
      const tiempoRespuesta = Date.now() - tiempoInicio

      setRespuestas((prev) => {
        const nueva = new Map(prev)
        nueva.set(numeroEnunciado, {
          numeroEnunciado,
          ranking: rankingTemporal,
          tiempoRespuestaMs: tiempoRespuesta,
        })
        return nueva
      })

      toast({
        title: 'Respuesta guardada',
        description: `Pregunta ${numeroEnunciado} guardada exitosamente.`,
        duration: 2000,
      })
    }
  }

  // Limpiar ranking actual
  const limpiarRankingActual = () => {
    setRankingTemporal({})
    const numeroEnunciado = preguntaActual + 1
    setRespuestas((prev) => {
      const nueva = new Map(prev)
      nueva.delete(numeroEnunciado)
      return nueva
    })
  }

  // Cambiar pregunta (navegación manual)
  const cambiarPregunta = (nuevaPregunta: number) => {
    handleGuardarRanking()

    const respuestaExistente = respuestas.get(nuevaPregunta + 1)
    setRankingTemporal(respuestaExistente?.ranking || {})
    setPreguntaActual(nuevaPregunta)
    setTiempoInicio(Date.now())
  }

  // Enviar respuestas al backend
  const handleEnviarRespuestas = async () => {
    if (sesionExpirada) {
      toast({
        title: 'Tiempo excedido',
        description: 'No es posible enviar respuestas porque la sesión expiró.',
        variant: 'destructive',
      })
      return
    }

    let respuestasFinales = new Map(respuestas)

    if (validarRanking(rankingTemporal)) {
      const numeroEnunciado = preguntaActual + 1
      respuestasFinales.set(numeroEnunciado, {
        numeroEnunciado,
        ranking: rankingTemporal,
        tiempoRespuestaMs: Date.now() - tiempoInicio,
      })
    }

    if (respuestasFinales.size < 15) {
      toast({
        title: 'Prueba incompleta',
        description: `Has respondido ${respuestasFinales.size} de 15 preguntas. Por favor completa todas las preguntas.`,
        variant: 'destructive',
      })
      return
    }

    const respuestasInvalidas: number[] = []
    for (let i = 1; i <= 15; i++) {
      const respuesta = respuestasFinales.get(i)
      if (!respuesta || !validarRanking(respuesta?.ranking)) {
        respuestasInvalidas.push(i)
      }
    }

    if (respuestasInvalidas.length > 0) {
      toast({
        title: 'Respuestas incompletas',
        description: `Las siguientes preguntas tienen rankings incompletos: ${respuestasInvalidas.join(', ')}. Por favor revísalas.`,
        variant: 'destructive',
      })
      return
    }

    const respuestasArray = Array.from(respuestasFinales.values()).sort((a, b) => a.numeroEnunciado - b.numeroEnunciado)

    try {
      setEnviandoRespuestas(true)

      const result = await enviarRespuestas.mutateAsync({
        token: token!,
        respuestas: respuestasArray as CmtResponderPreguntaDto[],
      })

      if (result.success) {
        localStorage.removeItem(`cmt_respuestas_${token}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const psicologoEmail = result.data?.psicologoEmail
        if (psicologoEmail) {
          localStorage.setItem(`cmt_psicologo_email_${token}`, psicologoEmail)
          navigate(`/prueba/cmt/${token}/exito?psicologoEmail=${encodeURIComponent(psicologoEmail)}`)
        } else {
          navigate(`/prueba/cmt/${token}/exito`)
        }
      }
    } catch (error) {
      setEnviandoRespuestas(false)
      toast({
        title: 'Error al enviar respuestas',
        description: error instanceof Error ? error.message : 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    }
  }

  // Mostrar instructivo
  if (mostrarInstructivo) {
    return <InstructivoCMT onStart={() => setMostrarInstructivo(false)} />
  }

  // Mostrar loading screen al enviar respuestas
  if (enviandoRespuestas) {
    return <LoadingScreen message="Enviando tus respuestas..." showProgress={true} />
  }

  // Estados de carga y error
  if (isLoading) {
    return <LoadingScreen message="Cargando prueba CMT..." showProgress={true} />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error al cargar la prueba
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {error instanceof Error ? error.message : 'No se pudo cargar la prueba CMT'}
            </p>
            <Button onClick={() => navigate(`/candidato/${token}`)} variant="outline" className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!preguntasData?.data || preguntasData.data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700">No se encontraron preguntas para esta prueba.</p>
      </div>
    )
  }

  const preguntas = preguntasData.data
  const pregunta = preguntas[preguntaActual]
  const progreso = (respuestas.size / 15) * 100
  const rankingActual = rankingTemporal || {}
  const rankingCompleto = validarRanking(rankingActual)

  // Obtener color según el valor del ranking
  const getColorPorValor = (valor: number): string => {
    const colores = {
      5: 'bg-blue-600 border-blue-600 text-white',
      4: 'bg-blue-500 border-blue-500 text-white',
      3: 'bg-blue-400 border-blue-400 text-white',
      2: 'bg-blue-300 border-blue-300 text-gray-700',
      1: 'bg-blue-200 border-blue-200 text-gray-700',
    }
    return colores[valor as keyof typeof colores] || 'bg-gray-100 border-gray-300 text-gray-500'
  }

  return (
    <main className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decoración de fondo - astronauta flotante */}
      <motion.div
        className="absolute top-10 right-10 w-48 h-48 opacity-5 pointer-events-none hidden lg:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <img src="/images/Recurso 7.png" alt="" className="w-full h-full object-contain" />
      </motion.div>

      <div className="max-w-5xl mx-auto px-2 py-2 md:px-4 md:py-4">
        {/* Header con progreso */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <img src="/images/Logo.png" alt="Super de Alimentos" className="h-9 object-contain" />
          </div>

          <div className="bg-white rounded-lg shadow-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-base font-bold text-gray-900">Cuestionario de Motivación para el Trabajo (CMT)</h1>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                {sesionLabel}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>
                  Progreso: {respuestas.size} de 15 preguntas
                </span>
                <span>{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>
          </div>
        </motion.div>

        {/* Tarjeta de pregunta */}
        <AnimatePresence mode="wait">
          <motion.div
            key={preguntaActual}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 py-2 px-3">
                <div className="flex justify-between items-start mb-1.5">
                  <span className="text-xs font-semibold text-blue-700">Pregunta {pregunta.numeroEnunciado} de 15</span>
                  {respuestas.has(pregunta.numeroEnunciado) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Check className="h-3 w-3" /> Completada
                    </span>
                  )}
                </div>
                <CardTitle className="text-base md:text-lg font-bold text-gray-900 uppercase leading-tight">
                  {pregunta.textoEnunciado}
                </CardTitle>
                <p className="text-xs md:text-sm text-blue-700 mt-2 font-semibold">
                  Ordena las opciones del 5 (mayor satisfacción) al 1 (menor satisfacción)
                </p>
              </CardHeader>

              <CardContent className="pt-3 pb-2.5 px-3 space-y-1.5">
                {pregunta.opciones.map((opcion: any, index: number) => {
                  const letra = opcion.letraOpcion
                  const valorAsignado = rankingActual[letra]
                  const tieneValor = valorAsignado !== undefined

                  return (
                    <motion.div
                      key={opcion.letraOpcion}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: 'easeOut',
                      }}
                      className={`border rounded-lg p-2.5 transition-all ${
                        tieneValor ? 'border-blue-300 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {/* Contenedor con scroll horizontal en móviles */}
                      <div className="overflow-x-auto md:overflow-visible -mx-2.5 px-2.5 md:mx-0 md:px-0">
                        <div className="flex items-center gap-2 min-w-max md:min-w-0">
                          {/* Letra de la opción */}
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-sm">
                            {letra}
                          </div>

                          {/* Texto de la opción */}
                          <p className="flex-1 text-xs md:text-sm text-gray-800 leading-tight min-w-[180px] md:min-w-0">
                            {opcion.textoOpcion}
                          </p>

                          {/* Selectores de ranking */}
                          <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                            {[5, 4, 3, 2, 1].map((valor) => {
                              const estaSeleccionado = valorAsignado === valor
                              const estaUsado = Object.values(rankingActual).includes(valor) && !estaSeleccionado

                              return (
                                <motion.button
                                  key={valor}
                                  type="button"
                                  onClick={() => handleSeleccionarValor(letra, valor)}
                                  disabled={estaUsado || sesionExpirada}
                                  whileHover={!estaUsado ? { scale: 1.1 } : {}}
                                  whileTap={!estaUsado ? { scale: 0.95 } : {}}
                                  animate={estaSeleccionado ? { scale: 1.08 } : {}}
                                  transition={{ type: 'tween', duration: 0.18, ease: 'easeOut' }}
                                  className={`w-10 h-10 rounded-full border font-bold text-sm transition-all flex-shrink-0 ${
                                    estaSeleccionado
                                      ? getColorPorValor(valor) + ' shadow-sm ring-1 ring-blue-300'
                                      : estaUsado
                                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-40'
                                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                  }`}
                                >
                                  {valor}
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Indicador de progreso del ranking */}
                {Object.keys(rankingActual).length > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      {rankingCompleto ? (
                        <>
                          <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-green-700">✓ Ranking completo - Puedes continuar</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={limpiarRankingActual} className="h-7 text-xs px-2">
                            Limpiar
                          </Button>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-700">
                              {Object.keys(rankingActual).length} de 5 opciones ordenadas
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={limpiarRankingActual} className="h-7 text-xs px-2">
                            Limpiar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navegación */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 flex justify-between items-center gap-4"
        >
          <Button
            onClick={() => cambiarPregunta(Math.max(0, preguntaActual - 1))}
            disabled={preguntaActual === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {preguntaActual === 14 && rankingCompleto ? (
            <Button
              onClick={handleEnviarRespuestas}
              disabled={enviarRespuestas.isPending || sesionExpirada}
              size="sm"
              className="flex items-center gap-1.5 px-6 text-sm font-semibold"
            >
              {sesionExpirada ? 'Tiempo excedido' : enviarRespuestas.isPending ? 'Enviando...' : 'Finalizar Prueba'}
            </Button>
          ) : (
            <Button
              onClick={() => {
                cambiarPregunta(Math.min(14, preguntaActual + 1))
              }}
              disabled={preguntaActual === 14 || !rankingCompleto || sesionExpirada}
              size="sm"
              className="flex items-center gap-1.5 text-sm"
            >
              {sesionExpirada ? 'Tiempo excedido' : rankingCompleto ? 'Siguiente' : 'Completa el ranking'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>

        {/* Indicador de preguntas sin responder */}
        {respuestas.size < 15 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
            <p className="text-xs text-amber-800">
              <strong>Nota:</strong> Faltan {15 - respuestas.size} pregunta(s) por responder.
            </p>
          </motion.div>
        )}

        {/* Alerta de sesión expirada */}
        {sesionExpirada && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 bg-red-50 border border-red-200 rounded-lg p-2">
            <p className="text-xs text-red-800">
              <strong>Tiempo excedido:</strong> La prueba ha expirado. Por favor contacta al psicólogo para re‑habilitarla.
            </p>
          </motion.div>
        )}

        {/* Mapa de navegación de preguntas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 bg-white rounded-lg shadow-md p-2"
        >
          <h3 className="text-xs font-semibold text-gray-700 mb-1.5">Navegación rápida:</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => {
              const respondida = respuestas.has(num)
              const actual = preguntaActual + 1 === num

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => cambiarPregunta(num - 1)}
                  className={`h-8 rounded-md font-semibold text-xs transition-all ${
                    actual
                      ? 'bg-blue-500 text-white shadow-md scale-105'
                      : respondida
                      ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              )
            })}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
