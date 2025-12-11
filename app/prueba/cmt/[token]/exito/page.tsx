"use client"


import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { SuccessConfirmation } from "@/components/ui/success-confirmation"
import { CheckCircle2, Clock, Mail, Bell } from "lucide-react"
import Image from "next/image"


export default function CMTExitoPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const token = params.token as string

  // Obtener el email del psicólogo desde search params o localStorage temporal
  const [psicologoEmail, setPsicologoEmail] = useState<string | null>(null)

  useEffect(() => {
    // Limpiar localStorage cuando se muestra la página de éxito
    localStorage.removeItem(`cmt_respuestas_${token}`)

    // Buscar email en search params (preferido)
    const emailFromQuery = searchParams.get("psicologoEmail")
    if (emailFromQuery) {
      setPsicologoEmail(emailFromQuery)
      // Guardar en localStorage para recarga
      localStorage.setItem(`cmt_psicologo_email_${token}`, emailFromQuery)
      return
    }
    // Si no está en query, buscar en localStorage (por recarga)
    const emailFromStorage = localStorage.getItem(`cmt_psicologo_email_${token}`)
    if (emailFromStorage) {
      setPsicologoEmail(emailFromStorage)
    }
  }, [token, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 relative overflow-hidden">
      {/* Logo en la parte superior */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        <Image
          src="/images/Logo.png"
          alt="Super de Alimentos"
          width={180}
          height={54}
          className="object-contain"
          priority
        />
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-10 right-10 w-64 h-64 opacity-5 pointer-events-none hidden lg:block">
        <Image
          src="/images/Recurso 7.png"
          alt=""
          width={256}
          height={256}
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <SuccessConfirmation
          title="¡Prueba CMT Completada!"
          description="Tus respuestas han sido guardadas correctamente y serán evaluadas por nuestro equipo de selección."
          message="Cuestionario de Motivación para el Trabajo"
          additionalInfo={
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-lg text-center mb-4 text-gray-900">
                ¿Qué sigue ahora?
              </h3>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Revisión de resultados</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Nuestro equipo de psicología analizará tus respuestas junto con las demás evaluaciones del proceso.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Te contactaremos pronto</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Recibirás un correo electrónico o llamada telefónica informándote sobre los siguientes pasos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mantente atento</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Revisa tu correo regularmente, incluyendo la carpeta de spam o correo no deseado.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  ¿Tienes preguntas? Contáctanos en{" "}
                  {psicologoEmail ? (
                    <a href={`mailto:${psicologoEmail}`} className="text-primary underline font-medium hover:text-primary/80">
                      {psicologoEmail}
                    </a>
                  ) : (
                    <span className="text-primary font-medium">(correo no disponible)</span>
                  )}
                </p>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 font-medium">
                  ¡Gracias por tu tiempo y dedicación!
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Te deseamos mucho éxito en tu proceso de selección 🎉
                </p>
              </div>
            </div>
          }
          onBackToHome={() => router.push(`/candidato/${token}`)}
          backButtonText="Volver al Dashboard"
        />
      </div>
    </div>
  )
}
