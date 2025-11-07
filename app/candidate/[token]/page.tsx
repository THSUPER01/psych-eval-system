"use client"

import { use } from "react"
import { CandidateForm } from "@/components/candidate/candidate-form"
import { useCandidatoPublico } from "@/lib/hooks/useCandidatePublic"
import { SuccessCard } from "@/components/ui/success-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Brain, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react"
import { EstadosCandidato } from "@/types/selection.types"

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
    return (
      <SuccessCard
        icon={<Brain className="h-10 w-10" />}
        title={`Tu proceso está en marcha, ${candidato.nombreCompleto}`}
        subtitle="Actualmente estamos evaluando tu perfil"
        description="Hemos recibido tu información y nos encontramos revisando tu perfil en detalle. Te contactaremos pronto con los siguientes pasos del proceso. Mantente atento a tu correo electrónico."
        headerGradient="from-blue-50 to-indigo-50"
        iconBgColor="bg-blue-100"
        iconClassName="text-blue-600"
        badge={{
          label: "Estado: En evaluación",
          variant: "outline",
          className: "bg-blue-50 text-blue-700 border-blue-200",
        }}
      />
    )
  }

  // Estado: CAND_FORMULARIO_COMPLETO
  if (estadoCodigo === EstadosCandidato.CAND_FORMULARIO_COMPLETO) {
    return (
      <SuccessCard
        icon={<CheckCircle2 className="h-10 w-10" />}
        title={`¡Formulario completado, ${candidato.nombreCompleto}!`}
        subtitle="Tu información ha sido registrada correctamente"
        description="Gracias por completar tu formulario demográfico. Nuestro equipo revisará tu información en detalle y se pondrá en contacto contigo próximamente con los siguientes pasos de tu evaluación."
        headerGradient="from-emerald-50 to-teal-50"
        iconBgColor="bg-emerald-100"
        iconClassName="text-emerald-600"
        badge={{
          label: "Estado: Formulario completo",
          variant: "outline",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        }}
      />
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

