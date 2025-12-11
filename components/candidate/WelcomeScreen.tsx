"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeScreenProps {
  candidateName: string
  onStart: () => void
  onShowPolicy: () => void
}

export default function WelcomeScreen({
  candidateName,
  onStart,
  onShowPolicy,
}: WelcomeScreenProps) {
  return (
    <main
      role="main"
      aria-labelledby="welcome-title"
      className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background"
    >
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
            SA
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Super de Alimentos</h1>
            <p className="text-sm text-gray-600">Proceso de Selección</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <section className="mb-8">
          <h1 id="welcome-title" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Hola, {candidateName} 👋
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
            Bienvenido(a) al proceso de selección de Super de Alimentos.
          </h2>
          <div className="space-y-3 text-gray-700">
            <p className="text-base leading-relaxed">
              Este <strong>NO es un examen</strong> con respuestas buenas o malas. Queremos conocerte
              mejor para ubicarte en el rol que más se ajuste a tu perfil y motivaciones.
            </p>
            <p className="text-base leading-relaxed">
              Te pedimos que respondas con <strong>sinceridad</strong> y{" "}
              <strong>sin pensarlo demasiado</strong>. La primera respuesta que te venga a la mente
              suele ser la más auténtica.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-blue-900">
                <strong>🔒 Confidencialidad:</strong> Tus respuestas se usan únicamente para este
                proceso de selección y no se publican. Toda la información es tratada con total
                privacidad.
              </p>
            </div>
          </div>
        </section>

        {/* CMT Card */}
        <section
          role="region"
          aria-labelledby="cmt-title"
          className="mb-6"
        >
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle id="cmt-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                📋 Cuestionario CMT (Motivaciones en el trabajo)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    Vas a ver grupos. Cada grupo tiene <strong>5 frases</strong> (a, b, c, d, e).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <div>
                    <p className="mb-2">
                      Tu tarea es asignar <strong>5, 4, 3, 2 y 1</strong>:
                    </p>
                    <ul className="ml-4 space-y-1 text-sm">
                      <li>
                        <strong>5 =</strong> lo que <strong>MÁS satisfacción</strong> te da / más te
                        representa en el trabajo.
                      </li>
                      <li>
                        <strong>1 =</strong> lo que <strong>MENOS satisfacción</strong> te da.
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    <strong>No puedes repetir número</strong> dentro del mismo grupo.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <div>
                    <p className="mb-2">Ejemplo de frases que vas a priorizar:</p>
                    <ul className="ml-4 space-y-1 text-sm text-gray-600">
                      <li>• Saber que se reconocen mis conocimientos y capacidades.</li>
                      <li>• Poder coordinar y estimular los esfuerzos de otros.</li>
                      <li>• Resolver con éxito problemas difíciles del trabajo.</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    <strong>No hay respuestas correctas o incorrectas:</strong> es sobre lo que te
                    motiva a TI.
                  </span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 italic mt-6 border-t pt-4">
                Por favor, ordénalas pensando en lo que realmente te importa en tu trabajo actual o
                ideal.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 16PF Card */}
        <section
          role="region"
          aria-labelledby="16pf-title"
          className="mb-6"
        >
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle id="16pf-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                🧠 Cuestionario 16PF (Preferencias y estilo personal)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    En cada pregunta verás <strong>2 o 3 opciones</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    Debes elegir <strong>SOLO UNA</strong> opción por pregunta.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    Responde de forma <strong>espontánea y honesta</strong>. No trates de "adivinar la
                    respuesta correcta".
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    <strong>No hay respuestas buenas o malas.</strong> Este cuestionario describe tu
                    forma de trabajar, comunicarte y tomar decisiones.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">•</span>
                  <span>
                    Intenta <strong>no dejar preguntas en blanco</strong>.
                  </span>
                </li>
              </ul>
              <p className="text-xs text-gray-500 italic mt-6 border-t pt-4">
                Tus respuestas nos ayudan a ubicarte en el rol más adecuado.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Before Starting Card */}
        <section
          role="region"
          aria-labelledby="before-title"
          className="mb-8"
        >
          <Card>
            <CardHeader className="bg-amber-50">
              <CardTitle id="before-title" className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                ⚡ Antes de empezar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">1.</span>
                  <span>Busca un lugar tranquilo.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">2.</span>
                  <span>Responde seguido, sin cerrar la ventana.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">3.</span>
                  <span>Lee bien cada instrucción al inicio de cada bloque.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-semibold shrink-0">4.</span>
                  <span>
                    Si una opción no te representa al 100%, marca la que <strong>MÁS se parezca</strong>{" "}
                    a ti.
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Actions Footer */}
        <footer className="bg-white border-t rounded-lg shadow-sm p-6 space-y-4">
          <Button
            type="button"
            onClick={onStart}
            aria-label="Comenzar el proceso de selección"
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-base font-semibold"
          >
            Comenzar ahora
          </Button>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onShowPolicy}
              aria-label="Ver política de uso de datos"
              className="text-sm text-gray-600 underline hover:text-gray-900 transition-colors"
            >
              Ver política de uso de datos
            </button>

            <p className="text-xs text-gray-500 text-center">
              ¿Problemas técnicos? Escríbenos a{" "}
              <a
                href="mailto:seleccion@super.com.co"
                className="text-primary hover:underline"
              >
                seleccion@super.com.co
              </a>
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}
