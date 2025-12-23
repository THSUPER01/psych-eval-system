import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2, AlertTriangle, ArrowRight, Radio } from 'lucide-react'
import { motion } from 'framer-motion'

interface Instructions16PFProps {
  onAccept: () => void
}

export default function Instructions16PF({ onAccept }: Instructions16PFProps) {
  const [hasReadInstructions, setHasReadInstructions] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: 'A' | 'B' | 'C' | null }>({
    1: null,
    2: null,
    3: null,
  })

  // Simular auto-respuestas después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedAnswers({
        1: 'A',
        2: 'C',
        3: 'A',
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleSelectAnswer = (questionId: number, answer: 'A' | 'B' | 'C') => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: prev[questionId] === answer ? null : answer
    }))
  }

  const ExampleQuestion = ({ id, text, optionA, optionB, optionC }: { id: number; text: string; optionA: string; optionB: string; optionC: string }) => {
    const selected = selectedAnswers[id]

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: id * 0.15 }}
        className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <p className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Badge variant="outline" className="h-7 w-7 flex items-center justify-center rounded-full p-0">
            {id}
          </Badge>
          <span>{text}</span>
        </p>
        
        <div className="grid grid-cols-3 gap-3 text-sm">
          {(['A', 'B', 'C'] as const).map((option) => {
            const optionText = option === 'A' ? optionA : option === 'B' ? optionB : optionC
            const isSelected = selected === option
            
            return (
              <motion.button
                key={option}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAnswer(id, option)}
                className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-all cursor-pointer font-medium ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Radio className={`h-4 w-4 ${isSelected ? 'fill-current' : ''}`} />
                <span className="flex-1 text-left">
                  <strong>{option}.</strong> {optionText}
                </span>
              </motion.button>
            )
          })}
        </div>

        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 text-xs text-green-600 font-medium flex items-center gap-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            Respuesta registrada
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Test 16PF</h1>
          <p className="text-slate-600">Cuestionario Factorial de Personalidad</p>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-2xl border-slate-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardTitle className="text-2xl flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="p-2 bg-white/20 rounded-lg"
                  >
                    <AlertTriangle className="h-6 w-6" />
                  </motion.div>
                  Instrucciones
                </CardTitle>
              </motion.div>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
            {/* Introducción */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full" />
                Introducción
              </h3>
              <p className="text-slate-700 leading-relaxed bg-gradient-to-r from-blue-50 to-transparent p-4 rounded-lg border-l-4 border-blue-400">
                El siguiente cuestionario contiene una serie de frases diseñadas para conocer sus actitudes e intereses. 
                <strong className="text-slate-900"> No existen respuestas correctas o incorrectas</strong>. Las personas difieren en intereses y puntos 
                de vista, y el objetivo es conocer mejor su forma de ser. Responda con sinceridad, ya que esto permitirá 
                obtener resultados más precisos.
              </p>
            </motion.section>

            {/* Instrucciones Generales */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-blue-50 via-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Instrucciones Generales
              </h3>
              <ul className="space-y-3 text-slate-700">
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 p-2 hover:bg-blue-100/50 rounded transition-colors"
                >
                  <span className="text-blue-600 font-bold mt-1 text-lg">•</span>
                  <span>Cada pregunta tiene <strong>tres alternativas: A, B y C</strong>.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-start gap-3 p-2 hover:bg-blue-100/50 rounded transition-colors"
                >
                  <span className="text-blue-600 font-bold mt-1 text-lg">•</span>
                  <span>Normalmente debe escoger <strong>A o C</strong>.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-start gap-3 p-2 hover:bg-blue-100/50 rounded transition-colors"
                >
                  <span className="text-blue-600 font-bold mt-1 text-lg">•</span>
                  <span>La opción <strong>B o "?"</strong> debe usarse solo cuando sea <strong>imposible decidir</strong> entre A y C.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex items-start gap-3 p-2 hover:bg-blue-100/50 rounded transition-colors"
                >
                  <span className="text-blue-600 font-bold mt-1 text-lg">•</span>
                  <span>Las preguntas están numeradas y deben <strong>contestarse en orden</strong>.</span>
                </motion.li>
              </ul>
            </motion.section>

            {/* Ejemplos Prácticos */}
            <section>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Ejemplos Prácticos</h3>
              <p className="text-sm text-slate-600 mb-4">
                Intenta responder estos ejemplos. Observa cómo funcionan las opciones y cómo seleccionas tu respuesta:
              </p>
              
              <div className="space-y-4">
                <ExampleQuestion
                  id={1}
                  text="Me gusta presenciar una competencia deportiva"
                  optionA="Verdadero"
                  optionB="?"
                  optionC="Falso"
                />
                <ExampleQuestion
                  id={2}
                  text="Prefiero las personas:"
                  optionA="Reservadas"
                  optionB="?"
                  optionC="Que hacen amigos fácilmente"
                />
                <ExampleQuestion
                  id={3}
                  text="El dinero no hace la felicidad"
                  optionA="Verdadero"
                  optionB="?"
                  optionC="Falso"
                />
              </div>
            </section>

            {/* Recomendaciones Importantes */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 via-amber-50 to-slate-50 border-2 border-amber-200 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Recomendaciones Importantes
              </h3>
              <ul className="space-y-3 text-slate-700">
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex items-start gap-3 p-2 hover:bg-amber-100/40 rounded transition-colors"
                >
                  <span className="text-amber-600 font-bold mt-1 text-lg">✓</span>
                  <span><strong>No piense demasiado</strong> cada respuesta ni emplee mucho tiempo en decidir.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-start gap-3 p-2 hover:bg-amber-100/40 rounded transition-colors"
                >
                  <span className="text-amber-600 font-bold mt-1 text-lg">✓</span>
                  <span><strong>Evite usar la opción B (?)</strong>, salvo cuando realmente no pueda decidir entre A y C.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-start gap-3 p-2 hover:bg-amber-100/40 rounded transition-colors"
                >
                  <span className="text-amber-600 font-bold mt-1 text-lg">✓</span>
                  <span><strong>Procure no dejar ninguna pregunta sin responder.</strong></span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start gap-3 p-2 hover:bg-amber-100/40 rounded transition-colors"
                >
                  <span className="text-amber-600 font-bold mt-1 text-lg">✓</span>
                  <span>Si alguna frase no se ajusta perfectamente a su caso, <strong>elija la respuesta que más se aproxime</strong>.</span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.65 }}
                  className="flex items-start gap-3 p-2 hover:bg-amber-100/40 rounded transition-colors"
                >
                  <span className="text-amber-600 font-bold mt-1 text-lg">✓</span>
                  <span><strong>Responda con sinceridad</strong>; el cuestionario está diseñado para detectar contradicciones.</span>
                </motion.li>
              </ul>
            </motion.section>

            {/* Advertencia Final */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Alert className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-50 shadow-sm">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-900 font-medium ml-2">
                  <strong>Importante:</strong> Una vez que inicie el cuestionario, podrá guardar su progreso y continuar más tarde. 
                  El test contiene <strong>185 preguntas</strong> que deberá completar para finalizar.
                </AlertDescription>
              </Alert>
            </motion.div>

            {/* Confirmación */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 border-t-2 border-slate-200"
            >
              <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                <div className="flex-shrink-0 pt-1">
                  <Checkbox
                    id="accept-instructions"
                    checked={hasReadInstructions}
                    onCheckedChange={(checked) => setHasReadInstructions(checked === true)}
                    className="h-5 w-5 cursor-pointer rounded border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </div>
                <label
                  htmlFor="accept-instructions"
                  className="text-sm text-slate-700 cursor-pointer leading-relaxed font-medium flex-1"
                >
                  <span className="block mb-1">He leído y comprendido las instrucciones</span>
                  <span className="text-xs text-slate-500">
                    Confirmo que entiendo el formato de respuesta y estoy listo/a para iniciar el cuestionario 16PF
                  </span>
                </label>
                {hasReadInstructions && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Botón de Inicio */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end pt-6 gap-3"
            >
              <Button
                variant="outline"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-6"
              >
                Revisar Instrucciones
              </Button>
              <Button
                onClick={onAccept}
                disabled={!hasReadInstructions}
                size="lg"
                className="gap-2 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Iniciar Cuestionario
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-slate-500">
          <p>Tiempo estimado: 30-40 minutos • 185 preguntas</p>
        </div>
      </div>
    </div>
  )
}
