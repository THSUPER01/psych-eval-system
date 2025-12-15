"use client"

import { use } from "react"
import { CandidateForm } from "@/components/candidate/candidate-form"
import { useCandidatoPublico, useResultadoCMT } from "@/lib/hooks/useCandidatePublic"
import { SuccessCard } from "@/components/ui/success-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, CheckCircle2, Clock, AlertCircle, XCircle, TrendingUp, BarChart3 } from "lucide-react"
import { EstadosCandidato } from "@/types/selection.types"

// Componente auxiliar para mostrar preview de resultados CMT
function ResultadoCMTPreview({ token }: { token: string }) {
  const { data: resultadoData, isLoading } = useResultadoCMT(token)

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none p-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!resultadoData?.data) {
    return null
  }

  const resultado = resultadoData.data
  const dimensionesDestacadas = resultado.dimensiones
    .filter(d => d.percentil && d.percentil >= 60)
    .sort((a, b) => (b.percentil || 0) - (a.percentil || 0))
    .slice(0, 5)

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tu Perfil Motivacional (CMT)
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mt-1">
              Vista preliminar de tus resultados
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {dimensionesDestacadas.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-700 mb-4">
              Estas son tus principales dimensiones motivacionales:
            </p>
            
            {dimensionesDestacadas.map((dimension) => (
              <div key={dimension.codigoDimension} className="border-l-4 border-purple-400 pl-4 py-2">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{dimension.nombreDimension}</h3>
                  <span className="text-sm font-medium text-purple-600">
                    Percentil {dimension.percentil}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{dimension.interpretacion}</p>
              </div>
            ))}

            <div className="mt-6 bg-purple-50 border border-purple-100 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <strong>ℹ️ Nota:</strong> Estos resultados son una vista preliminar. 
                Nuestro equipo de psicología realizará un análisis completo de tu perfil.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">
            Tu resultado está siendo procesado. Los detalles estarán disponibles pronto.
          </p>
        )}
      </div>
    </div>
  )
}

export default function CandidateFormPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: candidato, isLoading, error } = useCandidatoPublico(token)

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !candidato) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive" className="rounded-2xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <strong>Token inválido o candidato no encontrado.</strong>
              <p className="mt-2 text-sm">
                Por favor verifica el enlace que recibiste en tu correo electrónico.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  // Success states based on candidate status
  const estadoCodigo = candidato.estado.estCodigo

  // Estado: CAND_APROBADO
  if (estadoCodigo === EstadosCandidato.CAND_APROBADO) {
    return (
      <SuccessCard
        icon={<CheckCircle2 className="h-10 w-10" />}
        title={`¡Felicitaciones, ${candidato.nombreCompleto}!`}
        subtitle="Has sido aprobado en el proceso de selección"
        description="Nos pondremos en contacto contigo próximamente para continuar con el proceso de vinculación. Esperamos trabajar contigo pronto."
        headerGradient="from-green-50 to-emerald-50"
        iconBgColor="bg-green-100"
        iconClassName="text-green-600"
        badge={{
          label: "Estado: Aprobado",
          variant: "outline",
          className: "bg-green-50 text-green-700 border-green-200",
        }}
      />
    )
  }

  // Estado: CAND_RECHAZADO
  if (estadoCodigo === EstadosCandidato.CAND_RECHAZADO) {
    return (
      <SuccessCard
        icon={<XCircle className="h-10 w-10" />}
        title={`Gracias por tu participación, ${candidato.nombreCompleto}`}
        subtitle="Proceso de selección finalizado"
        description="Agradecemos sinceramente tu interés en formar parte de nuestra organización. En esta ocasión no continuaremos con tu proceso, pero te animamos a postularte nuevamente en futuras oportunidades."
        additionalContent={
          candidato.motivoRechazo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Retroalimentación:</p>
              <p className="text-sm text-gray-600">{candidato.motivoRechazo}</p>
            </div>
          )
        }
        headerGradient="from-red-50 to-rose-50"
        iconBgColor="bg-red-100"
        iconClassName="text-red-600"
        badge={{
          label: "Estado: No aprobado",
          variant: "outline",
          className: "bg-red-50 text-red-700 border-red-200",
        }}
      />
    )
  }

  // Estado: CAND_EN_EVALUACION
  if (estadoCodigo === EstadosCandidato.CAND_EN_EVALUACION) {
    const cmtCompletada = candidato.asignacionCmt?.pruebaCompletada || false
    const test16pfCompletado = candidato.asignacion16pf?.pruebaCompletada || false
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Card de estado */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Tu proceso está en marcha, {candidato.nombreCompleto}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-1">
                    Actualmente estamos evaluando tu perfil
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium">Formulario demográfico completado</p>
                    <p className="text-sm text-gray-600">Tus datos han sido registrados</p>
                  </div>
                </div>
                
                {cmtCompletada && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">Prueba CMT completada</p>
                      <p className="text-sm text-gray-600">Tu perfil motivacional está siendo evaluado</p>
                    </div>
                  </div>
                )}

                {test16pfCompletado && (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-700 font-medium">Test 16PF completado</p>
                      <p className="text-sm text-gray-600">Tu perfil de personalidad está siendo evaluado</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-gray-100">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700 font-medium">Próximos pasos</p>
                    <p className="text-sm text-gray-600">
                      Mantente atento a tu correo electrónico. Te contactaremos cuando tengamos novedades sobre tu proceso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  <Brain className="h-4 w-4" />
                  <span className="text-sm font-medium">Estado: En evaluación</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado CMT (si está disponible) */}
          {cmtCompletada && <ResultadoCMTPreview token={token} />}
        </div>
      </div>
    )
  }

  // Estado: CAND_FORMULARIO_COMPLETO
  if (estadoCodigo === EstadosCandidato.CAND_FORMULARIO_COMPLETO) {
    const cmtAsignada = candidato.asignacionCmt
    const cmtCompletada = cmtAsignada?.pruebaCompletada || false
    const test16pfAsignado = candidato.asignacion16pf
    const test16pfCompletado = test16pfAsignado?.pruebaCompletada || false

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4 sm:py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Card de éxito */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ¡Formulario completado, {candidato.nombreCompleto}!
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 mt-1">
                    Tu información ha sido registrada correctamente
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-4">
                Gracias por completar tu formulario demográfico. {cmtCompletada && test16pfCompletado ? 'Ya completaste todas las pruebas.' : 'Ahora continúa con las evaluaciones.'}
              </p>
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Estado: Formulario completo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Prueba CMT */}
          {cmtAsignada && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Cuestionario de Motivación para el Trabajo
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mt-1">
                      {cmtCompletada ? '¡Ya completaste esta prueba!' : 'Tu siguiente paso en el proceso'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                {cmtCompletada ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 font-medium">Prueba completada exitosamente</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Hemos recibido tus respuestas. Nuestro equipo está evaluando tu perfil motivacional.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">CMT Completada</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">15 preguntas cortas</p>
                          <p className="text-sm text-gray-600">Responde seleccionando la opción que mejor te describa</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Tiempo estimado: 20-35 minutos</p>
                          <p className="text-sm text-gray-600">No hay límite de tiempo, responde con calma</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-blue-600">3</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Sin respuestas correctas o incorrectas</p>
                          <p className="text-sm text-gray-600">Responde con sinceridad según tus preferencias</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                      <p className="text-sm text-blue-900">
                        <strong>💡 Consejo:</strong> Lee cada pregunta cuidadosamente y responde según lo que realmente te motiva en el trabajo, no según lo que crees que "deberías" responder.
                      </p>
                    </div>

                    <div className="flex justify-center pt-2">
                      <a
                        href={`/prueba/cmt/${token}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                      >
                        <Brain className="h-5 w-5" />
                        Iniciar Prueba CMT
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card de Prueba 16PF */}
          {test16pfAsignado && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-none">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      Test de Personalidad 16PF
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mt-1">
                      {test16pfCompletado ? '¡Ya completaste esta prueba!' : 'Evaluación de factores de personalidad'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                {test16pfCompletado ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700 font-medium">Prueba completada exitosamente</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Hemos recibido tus respuestas. Nuestro equipo está evaluando tu perfil de personalidad.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center pt-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">16PF Completado</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-purple-600">1</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">185 preguntas de opción múltiple</p>
                          <p className="text-sm text-gray-600">Responde seleccionando la opción que mejor te describa</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-purple-600">2</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Tiempo estimado: 40-60 minutos</p>
                          <p className="text-sm text-gray-600">No hay límite de tiempo, responde con tranquilidad</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-bold text-purple-600">3</span>
                        </div>
                        <div>
                          <p className="text-gray-700 font-medium">Evalúa 16 factores de personalidad</p>
                          <p className="text-sm text-gray-600">Ayuda a conocer tu perfil psicológico completo</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <p className="text-sm text-purple-900">
                        <strong>💡 Consejo:</strong> Responde con sinceridad según cómo realmente eres, no según cómo te gustaría ser. No hay respuestas correctas o incorrectas.
                      </p>
                    </div>

                    {test16pfAsignado.notaNormativa && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <strong>ℹ️ Nota:</strong> {test16pfAsignado.notaNormativa}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center pt-2">
                      <a
                        href={`/prueba/16pf/${token}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-base"
                      >
                        <BarChart3 className="h-5 w-5" />
                        Iniciar Test 16PF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Estado: CAND_REGISTRADO (debe completar formulario)
  if (estadoCodigo === EstadosCandidato.CAND_REGISTRADO) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4 sm:py-12">
        {/* Encabezado personalizado */}
        <div className="mx-auto max-w-4xl mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, {candidato.nombreCompleto}!
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Estamos casi listos. Completa tu información demográfica para continuar con tu proceso de selección.
            </p>
          </div>

          {/* Cards informativos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">1</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700">Información Personal</p>
                  <p className="text-xs text-gray-500">Ya completa</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">2</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700">Datos Demográficos</p>
                  <p className="text-xs text-gray-500">En progreso...</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-400">3</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700">Evaluación</p>
                  <p className="text-xs text-gray-500">Próximamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <CandidateForm token={token} />
      </div>
    )
  }

  // Estado por defecto - mostrar formulario
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-8 px-4 sm:py-12">
      <CandidateForm token={token} />
    </div>
  )
}

