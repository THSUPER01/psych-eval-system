"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, Check } from "lucide-react"
import Image from "next/image"

interface OnboardingScreenProps {
  candidateName: string
  onStart: () => void
  onShowPolicy: () => void
}

// Subcomponente: Demostración CMT
function CardCMTDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [assignments, setAssignments] = useState<number[]>([0, 0, 0, 0, 0])

  const options = [
    "Saber que se reconocen mis conocimientos y capacidades.",
    "Poder coordinar y estimular los esfuerzos de otros.",
    "Saber que otras personas me aprecian.",
    "Resolver con éxito problemas difíciles del trabajo.",
    "Poder ocuparme en aquellos trabajos para los que tengo buenas capacidades.",
  ]

  const values = [5, 4, 3, 2, 1]
  const stepLabels = [
    "Paso 1 de 5: elige lo que MÁS te representa primero (5)",
    "Paso 2 de 5: ahora lo que te representa bastante (4)",
    "Paso 3 de 5: lo que te representa moderadamente (3)",
    "Paso 4 de 5: lo que te representa poco (2)",
    "Paso 5 de 5: finalmente lo que MENOS te representa (1)",
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < 4) {
          const newAssignments = [...assignments]
          newAssignments[prev] = values[prev]
          setAssignments(newAssignments)
          return prev + 1
        } else if (prev === 4) {
          const newAssignments = [...assignments]
          newAssignments[4] = values[4]
          setAssignments(newAssignments)
          return 5
        }
        return prev
      })
    }, 1400)

    return () => clearInterval(timer)
  }, [assignments])

  useEffect(() => {
    if (currentStep === 6) {
      const resetTimer = setTimeout(() => {
        setCurrentStep(0)
        setAssignments([0, 0, 0, 0, 0])
      }, 3000)
      return () => clearTimeout(resetTimer)
    }
  }, [currentStep])

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
        <CardTitle className="text-base font-bold text-gray-800 uppercase">
          LA MAYOR SATISFACCIÓN QUE DESEO OBTENER EN EL TRABAJO ES:
        </CardTitle>
        <AnimatePresence mode="wait">
          {currentStep < 5 && (
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xs text-blue-700 font-medium mt-2"
            >
              {stepLabels[currentStep]}
            </motion.p>
          )}
          {currentStep === 5 && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-green-700 font-semibold mt-2 flex items-center gap-1"
            >
              <Check className="h-4 w-4" /> ¡Grupo completado! Así de simple.
            </motion.p>
          )}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {options.map((option, index) => {
          const isAssigned = assignments[index] > 0
          const letter = String.fromCharCode(97 + index) // a, b, c, d, e

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: 1,
                scale: isAssigned ? [0.98, 1.02, 1] : 1,
                backgroundColor: isAssigned ? "rgb(239, 246, 255)" : "rgb(255, 255, 255)",
              }}
              transition={{ duration: 0.5 }}
              className={`border-2 rounded-lg p-4 flex items-center gap-3 ${
                isAssigned ? "border-blue-400 shadow-md" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="font-bold text-gray-700 text-sm">{letter})</span>
                <span className="text-sm text-gray-700">{option}</span>
              </div>
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all ${
                  isAssigned
                    ? "border-blue-500 bg-blue-500 text-white scale-110"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {isAssigned ? assignments[index] : "?"}
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// // Subcomponente: Demostración 16PF
// function Card16PFDemo() {
//   const [selectedOption, setSelectedOption] = useState<number | null>(null)
//   const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false })

//   const options = [
//     "Prefiero organizar y tomar el liderazgo del grupo.",
//     "Prefiero cooperar y apoyar al grupo.",
//     "Prefiero trabajar más independiente y concentrado.",
//   ]

//   useEffect(() => {
//     const sequence = async () => {
//       await new Promise((res) => setTimeout(res, 500))
//       setCursorPos({ x: 10, y: 10, visible: true })

//       await new Promise((res) => setTimeout(res, 800))
//       // Posición corregida: centrar en el radio button de la opción 2 (índice 1)
//       setCursorPos({ x: 38, y: 105, visible: true })

//       await new Promise((res) => setTimeout(res, 600))
//       setSelectedOption(1)
//       setCursorPos({ x: 38, y: 105, visible: false })

//       await new Promise((res) => setTimeout(res, 3000))
//       setSelectedOption(null)
//       setCursorPos({ x: 10, y: 10, visible: false })
//     }

//     const interval = setInterval(sequence, 6000)
//     sequence()

//     return () => clearInterval(interval)
//   }, [])

//   return (
//     <Card className="relative overflow-visible">
//       <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
//         <CardTitle className="text-base font-bold text-gray-800">
//           Cuando trabajo con otras personas yo...
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-6 space-y-3 relative">
//         {options.map((option, index) => {
//           const isSelected = selectedOption === index

//           return (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0.8 }}
//               animate={{
//                 opacity: 1,
//                 scale: isSelected ? [0.98, 1.02, 1] : 1,
//                 backgroundColor: isSelected ? "rgb(240, 253, 244)" : "rgb(255, 255, 255)",
//               }}
//               transition={{ duration: 0.4 }}
//               className={`border-2 rounded-lg p-4 flex items-center gap-3 cursor-pointer ${
//                 isSelected ? "border-green-500 shadow-lg" : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               <div
//                 className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
//                   isSelected ? "border-green-500 bg-green-500" : "border-gray-400"
//                 }`}
//               >
//                 {isSelected && <Check className="h-3 w-3 text-white" />}
//               </div>
//               <span className="text-sm text-gray-700 flex-1">{option}</span>
//             </motion.div>
//           )
//         })}

//         {/* Cursor fantasma */}
//         <AnimatePresence>
//           {cursorPos.visible && (
//             <motion.div
//               initial={{ scale: 0, x: 0, y: 0 }}
//               animate={{
//                 scale: [1, 1.2, 1],
//                 x: cursorPos.x,
//                 y: cursorPos.y,
//               }}
//               exit={{ scale: 0 }}
//               transition={{ duration: 0.5 }}
//               className="absolute w-6 h-6 rounded-full border-4 border-primary pointer-events-none z-10"
//               style={{ left: "0px", top: "0px" }}
//             />
//           )}
//         </AnimatePresence>

//         {selectedOption !== null && (
//           <motion.p
//             initial={{ opacity: 0, y: -6 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-xs text-green-700 font-medium mt-4 flex items-center gap-1"
//           >
//             <Check className="h-4 w-4" /> Opción seleccionada. ¡Así de fácil!
//           </motion.p>
//         )}
//       </CardContent>
//     </Card>
//   )
// }

// Componente principal
export default function OnboardingScreen({
  candidateName,
  onStart,
  onShowPolicy,
}: OnboardingScreenProps) {
  return (
    <main role="main" className="bg-gray-50 relative overflow-hidden">
      {/* Decoración de fondo con astronauta - animación flotante suave */}
      <motion.div 
        className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Image
          src="/images/Recurso 7.png"
          alt=""
          width={256}
          height={256}
          className="object-contain"
        />
      </motion.div>

      {/* Sección 1: Hero */}
      <section
        role="region"
        aria-labelledby="hero-title"
        className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-8 md:py-12 relative"
      >
        {/* Astronauta decorativo - animación de escala pulsante */}
        <motion.div 
          className="absolute bottom-10 left-4 hidden md:block opacity-20"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/images/Recurso 2.png"
            alt=""
            width={150}
            height={150}
            className="object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10 relative z-10"
        >
          {/* Logo de la empresa */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/Logo.png"
              alt="Super de Alimentos"
              width={200}
              height={60}
              className="object-contain"
              priority
            />
          </div>

          <h1 id="hero-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 text-center">
            Hola, {candidateName} 👋
          </h1>
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4 text-center">
            Bienvenido(a) al proceso de selección de Super de Alimentos.
          </h2>
          <div className="space-y-3 text-gray-700 text-sm md:text-base leading-relaxed">
            <p>
              Esto <strong>no es un examen</strong> con respuestas buenas o malas. Queremos conocerte
              para ubicarte mejor en el rol. Responde con sinceridad y sin pensarlo demasiado.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
              <p className="text-sm text-blue-900">
                <strong>🔒 Confidencialidad:</strong> Tus respuestas se usan únicamente para este
                proceso de selección y no se publican.
              </p>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              Desplázate para ver cómo funcionan las pruebas
              <ChevronDown className="h-5 w-5" />
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Sección 2: Demostración CMT */}
      <section
        role="region"
        aria-labelledby="cmt-demo-title"
        className="py-8 md:py-12 px-4 relative"
      >
        {/* Astronauta decorativo - animación bounce */}
        <motion.div 
          className="absolute top-20 right-4 hidden lg:block opacity-10"
          animate={{ 
            y: [0, -15, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/images/Recurso 13.png"
            alt=""
            width={120}
            height={120}
            className="object-contain"
          />
        </motion.div>

        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 items-start"
          >
            {/* Columna 1: Instrucciones - aparece PRIMERO en móvil y desktop */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:sticky md:top-4">
              <h2 id="cmt-demo-title" className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                ¿Cómo funciona el CMT?
              </h2>
              <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                <p>
                  Vas a ver grupos. Cada grupo tiene <strong>5 frases</strong> (a, b, c, d, e). Tu
                  tarea es asignar <strong>5, 4, 3, 2 y 1</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1.5 ml-2">
                  <li>
                    <strong>5 =</strong> lo que <strong>MÁS satisfacción</strong> te da / más te
                    representa en el trabajo.
                  </li>
                  <li>
                    <strong>1 =</strong> lo que <strong>MENOS satisfacción</strong> te da.
                  </li>
                </ul>
                <p className="font-semibold">No puedes repetir número dentro del mismo grupo.</p>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r-lg mt-4">
                  <p className="text-xs font-semibold text-amber-900 mb-1">
                    📌 Observa la animación
                  </p>
                  <p className="text-xs text-amber-800">
                    Mira cómo se asignan los números automáticamente. En tu caso, TÚ elegirás
                    haciendo clic. ¡Es simple!
                  </p>
                </div>
              </div>
            </div>

            {/* Columna 2: Demo - aparece SEGUNDO en móvil y desktop */}
            <div>
              <CardCMTDemo />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sección 3: Demostración 16PF */}
      <section
        role="region"
        aria-labelledby="16pf-demo-title"
        className="py-8 md:py-12 px-4"
      >
        <div className="max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6 items-start"
          >
            {/* Columna 1: Instrucciones - aparece PRIMERO en móvil, SEGUNDO en desktop */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:sticky md:top-4 order-1 md:order-2">
              <h2 id="16pf-demo-title" className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                ¿Cómo funciona el 16PF?
              </h2>
              <div className="space-y-3 text-gray-700 text-sm leading-relaxed">
                <p>
                  En cada pregunta verás <strong>2 o 3 opciones</strong>. Debes elegir{" "}
                  <strong>SOLO UNA</strong> opción por pregunta.
                </p>
                <p>
                  Responde de forma <strong>espontánea y honesta</strong>. No trates de "adivinar la
                  respuesta correcta".
                </p>
                <p>
                  <strong>No hay respuestas buenas o malas.</strong> Este cuestionario describe tu
                  forma de trabajar, comunicarte y tomar decisiones.
                </p>
                <p className="font-semibold">Intenta no dejar preguntas en blanco.</p>
                <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg mt-4">
                  <p className="text-xs font-semibold text-green-900 mb-1">
                    📌 Observa la animación
                  </p>
                  <p className="text-xs text-green-800">
                    El cursor se mueve y selecciona una opción. En tu caso, TÚ haces clic en la que
                    más te identifique.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Sección 4: CTA Final */}
      <section
        role="region"
        aria-labelledby="cta-title"
        className="py-12 md:py-16 px-4 relative"
      >
        {/* Astronauta decorativo flotante - animación de rotación suave */}
        <motion.div 
          className="absolute bottom-20 right-8 hidden lg:block opacity-15"
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/images/Recurso 27.png"
            alt=""
            width={140}
            height={140}
            className="object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-white shadow-2xl rounded-2xl p-6 md:p-10 text-center relative z-10"
        >
          <h2 id="cta-title" className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¿Listo(a) para comenzar?
          </h2>
          <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed">
            Ahora que ya viste cómo funciona, puedes iniciar. Responde con calma y sinceridad.
          </p>

          <Button
            type="button"
            onClick={onStart}
            aria-label="Comenzar el proceso de selección"
            size="lg"
            className="w-full sm:w-auto px-8 py-5 text-base font-semibold mb-5"
          >
            Comenzar ahora
          </Button>

          <div className="space-y-2">
            <button
              type="button"
              onClick={onShowPolicy}
              aria-label="Ver política de uso de datos"
              className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors"
            >
              Ver política de uso de datos
            </button>

            <p className="text-xs text-gray-500">
              ¿Problemas técnicos? Escríbenos a{" "}
              <a href="mailto:seleccion@super.com.co" className="text-primary underline">
                seleccion@super.com.co
              </a>
            </p>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
