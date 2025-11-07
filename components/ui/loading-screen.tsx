"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useEffect, useState } from "react"
import { Sparkles, Rocket } from "lucide-react"

interface LoadingScreenProps {
  message?: string
  showProgress?: boolean
}

const inspirationalMessages = [
  "Tu futuro profesional comienza aquí...",
  "Cada paso te acerca a tus metas...",
  "Creemos en tu potencial y talento...",
  "Juntos construimos un mejor futuro...",
  "Tu crecimiento es nuestro compromiso...",
  "Aquí encontrarás oportunidades para crecer...",
  "Bienvenido a un equipo que te impulsa...",
  "Tu desarrollo profesional es nuestra prioridad...",
  "Crecer contigo es nuestro propósito...",
  "Donde tu talento se convierte en éxito...",
  "Transformamos vidas, creamos oportunidades...",
  "Tu historia de éxito empieza hoy...",
  "Somos más que trabajo, somos familia...",
  "Aquí tu esfuerzo es reconocido y valorado...",
  "Juntos alcanzamos nuevas alturas...",
]

// Astronautas seleccionados para la animación
const astronauts = [
  { src: "/images/Recurso 2.png", size: 120, delay: 0 },
  { src: "/images/Recurso 7.png", size: 100, delay: 0.2 },
  { src: "/images/Recurso 13.png", size: 110, delay: 0.4 },
  { src: "/images/Recurso 27.png", size: 115, delay: 0.6 },
  { src: "/images/Recurso 33.png", size: 105, delay: 0.8 },
]

export default function LoadingScreen({ 
  message, 
  showProgress = false 
}: LoadingScreenProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)

  // Combinar mensaje personalizado con mensajes inspiradores
  const allMessages = message 
    ? [message, ...inspirationalMessages] 
    : inspirationalMessages

  useEffect(() => {
    // Cambiar mensaje cada 2 segundos (mejorado para mejor legibilidad)
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % allMessages.length)
    }, 2000)

    return () => clearInterval(messageInterval)
  }, [allMessages.length])

  useEffect(() => {
    if (showProgress) {
      // Simular progreso de carga con mejor pacing
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev // No llegar a 100 hasta completar
          const increment = Math.random() * 10 + 5 // Entre 5 y 15
          return Math.min(prev + increment, 95)
        })
      }, 400)

      return () => clearInterval(progressInterval)
    }
  }, [showProgress])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center z-50 overflow-hidden">
      {/* Estrellas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="h-4 w-4 text-primary/30" />
          </motion.div>
        ))}
      </div>

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-4">
        {/* Logo de la empresa */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Image
            src="/images/Logo.png"
            alt="Super de Alimentos"
            width={240}
            height={72}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Astronautas flotantes en círculo */}
        <div className="relative w-80 h-80 mb-8">
          {/* Círculo central con ícono de cohete */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl">
              <Rocket className="h-12 w-12 text-white" />
            </div>
          </motion.div>

          {/* Astronautas orbitando */}
          {astronauts.map((astronaut, index) => {
            const angle = (index / astronauts.length) * 2 * Math.PI
            const radius = 140

            return (
              <motion.div
                key={astronaut.src}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: Math.cos(angle) * radius - astronaut.size / 2,
                  y: Math.sin(angle) * radius - astronaut.size / 2,
                  rotate: [0, 360],
                }}
                transition={{
                  opacity: { delay: astronaut.delay, duration: 0.5 },
                  scale: { delay: astronaut.delay, duration: 0.5 },
                  rotate: {
                    duration: 10 + index * 2,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src={astronaut.src}
                    alt=""
                    width={astronaut.size}
                    height={astronaut.size}
                    className="object-contain drop-shadow-lg"
                  />
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        {/* Mensajes rotando automáticamente */}
        <div className="text-center mb-6 min-h-[120px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="space-y-3"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight px-4">
                {allMessages[currentMessage]}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <p className="text-sm text-gray-600">
                  Preparando tu experiencia
                </p>
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Barra de progreso (opcional) */}
        {showProgress && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            className="w-full max-w-md"
          >
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {Math.floor(Math.min(progress, 100))}%
            </p>
          </motion.div>
        )}

        {/* Puntos de carga animados */}
        {!showProgress && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
