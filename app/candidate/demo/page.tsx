"use client"

import { useState, useEffect } from "react"
import { CandidateForm } from "@/components/candidate/candidate-form"
import OnboardingScreen from "@/components/candidate/OnboardingScreen"
import LoadingScreen from "@/components/ui/loading-screen"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function CandidateDemoPage() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [showLoading, setShowLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showPolicy, setShowPolicy] = useState(false)

  // Manejar la transición del onboarding al formulario
  const handleStartForm = () => {
    setShowOnboarding(false)
    setShowLoading(true)

    // Simular tiempo de carga (3 segundos)
    setTimeout(() => {
      setShowLoading(false)
      setShowForm(true)
    }, 3000)
  }

  // Mostrar loading screen
  if (showLoading) {
    return <LoadingScreen message="Preparando tu formulario de evaluación..." showProgress={true} />
  }

  if (showOnboarding) {
    return (
      <>
        <OnboardingScreen
          candidateName="María González Pérez"
          onStart={handleStartForm}
          onShowPolicy={() => setShowPolicy(true)}
        />
        
        {/* Policy Dialog */}
        <Dialog open={showPolicy} onOpenChange={setShowPolicy}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Política de Uso de Datos</DialogTitle>
              <DialogDescription>
                Información sobre cómo tratamos tus datos personales
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Recolección de Datos</h3>
                <p>
                  Super de Alimentos recolecta información personal y respuestas a cuestionarios
                  psicotécnicos únicamente con fines de evaluación para el proceso de selección.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">2. Uso de la Información</h3>
                <p>
                  Tus respuestas serán analizadas por el equipo de Recursos Humanos para determinar
                  la mejor ubicación dentro de la organización. Esta información no será compartida
                  con terceros ni utilizada para otros fines.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">3. Confidencialidad</h3>
                <p>
                  Toda la información proporcionada es tratada con estricta confidencialidad y
                  almacenada de forma segura. Solo personal autorizado del área de selección tendrá
                  acceso a tus respuestas.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">4. Derechos del Candidato</h3>
                <p>
                  Tienes derecho a solicitar información sobre los datos que tenemos de ti, así como
                  su corrección o eliminación una vez finalizado el proceso de selección.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">5. Contacto</h3>
                <p>
                  Para cualquier consulta sobre el manejo de tus datos, contáctanos en{" "}
                  <a href="mailto:seleccion@super.com.co" className="text-primary underline">
                    seleccion@super.com.co
                  </a>
                </p>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Mostrar formulario
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <CandidateForm token="demo" />
      </div>
    )
  }

  // Fallback (no debería llegar aquí)
  return null
}
