import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SuccessConfirmation } from '@/components/ui/success-confirmation'
import { CheckCircle2, Clock, Mail, Bell } from 'lucide-react'

export default function TestCMTExitoPage() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()

  // Obtener el email del psicólogo desde search params o localStorage temporal
  const [psicologoEmail, setPsicologoEmail] = useState<string | null>(null)

  useEffect(() => {
    // Limpiar localStorage cuando se muestra la página de éxito
    localStorage.removeItem(`cmt_respuestas_${token}`)

    // Buscar email en search params (preferido)
    const emailFromQuery = searchParams.get('psicologoEmail')
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
        <img src="/images/Logo.png" alt="Super de Alimentos" className="h-14 object-contain" />
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-10 right-10 w-64 h-64 opacity-5 pointer-events-none hidden lg:block">
        <img src="/images/Recurso 7.png" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <SuccessConfirmation
          title="¡Prueba CMT Completada!"
          description="Tus respuestas han sido guardadas correctamente y serán evaluadas por nuestro equipo de selección."
          message="Cuestionario de Motivación para el Trabajo"
          additionalInfo={
            <div className="space-y-4 text-left">
              <h3 className="font-semibold text-lg text-center mb-4 text-gray-900">¿Qué sigue ahora?</h3>

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
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Tiempo estimado de respuesta</p>
                  <p className="text-sm text-gray-600 mt-1">
                    El proceso de evaluación puede tardar entre 3 y 5 días hábiles. Te pedimos paciencia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Mantente atento(a)</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Revisa tu correo electrónico y tu teléfono regularmente. Podríamos contactarte en cualquier
                    momento.
                  </p>
                </div>
              </div>

              {psicologoEmail && (
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    Si tienes dudas o preguntas, puedes contactar a tu psicólogo asignado:
                  </p>
                  <p className="text-center mt-2">
                    <a href={`mailto:${psicologoEmail}`} className="text-primary font-semibold hover:underline">
                      {psicologoEmail}
                    </a>
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  ¡Gracias por tu tiempo y dedicación en completar esta evaluación!
                </p>
                <button
                  onClick={() => navigate(`/candidato/${token}`)}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Volver al panel del candidato
                </button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}
