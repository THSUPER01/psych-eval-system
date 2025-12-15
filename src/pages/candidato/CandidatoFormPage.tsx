import { useParams } from "react-router-dom"
import { CandidateForm } from "@/components/candidate/candidate-form"
import { useCandidatoPublico, useResultadoCMT } from "@/lib/hooks/useCandidatePublic"
import { SuccessCard } from "@/components/ui/success-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Brain } from "lucide-react"
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

export default function CandidateFormPage() {
  const { token } = useParams<{ token: string }>()
  const { data: candidato, isLoading, error } = useCandidatoPublico(token!)

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

  // Estado: CAND_EN_EVALUACION - Mostrar estado del proceso
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
              <p className="text-gray-700 mb-4">
                Gracias por completar el formulario inicial. Nuestro equipo está revisando tu información.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">Formulario completado</span>
                </div>
                {test16pfCompletado && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Test 16PF completado</span>
                  </div>
                )}
                {cmtCompletada && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">Test CMT completado</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vista previa de resultados CMT si está disponible */}
          {cmtCompletada && <ResultadoCMTPreview token={token!} />}
        </div>
      </div>
    )
  }

  // Por defecto: mostrar formulario
  return <CandidateForm token={token!} />
}
