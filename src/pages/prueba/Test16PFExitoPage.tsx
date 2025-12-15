import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { test16pfService } from '@/lib/services/test16pfService'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import type { Resultado16PFDto } from '@/types/test16pf.types'

function VolverButton({ token }: { token?: string }) {
  const navigate = useNavigate()
  return (
    <Button onClick={() => navigate(`/candidato/${token}`)} className="bg-green-600 hover:bg-green-700">
      Volver al panel del candidato
    </Button>
  )
}

export default function Test16PFExitoPage() {
  const { token } = useParams<{ token: string }>()
  const [resultado, setResultado] = useState<Resultado16PFDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let cancelado = false
    
    async function fetchResultado() {
      try {
        if (!token) throw new Error('Token inválido')
        const res = await test16pfService.getResultado(token)
        if (!cancelado) setResultado(res)
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : 'Error desconocido')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }
    
    fetchResultado()
    return () => {
      cancelado = true
    }
  }, [token])

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto" />
          <h2 className="text-2xl font-bold text-red-700">Error al cargar resultados</h2>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!resultado) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-slate-600">No se encontró resultado para este test.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-green-200 shadow-lg">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-green-700">¡Test 16PF completado exitosamente!</h2>
            <p className="text-slate-600">
              Tus respuestas han sido guardadas y serán analizadas por nuestro equipo de psicología.
            </p>
            <div className="pt-4">
              <VolverButton token={token} />
            </div>
          </CardContent>
        </Card>
        
        {/* Información de resultados */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Información del test completado</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Candidato:</dt>
                <dd className="font-medium">{resultado.nombreCandidato}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Fecha de aplicación:</dt>
                <dd className="font-medium">{new Date(resultado.fechaAplicacion).toLocaleDateString('es-CO')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Total de respuestas:</dt>
                <dd className="font-medium">{resultado.totalRespuestas}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Género aplicado:</dt>
                <dd className="font-medium">{resultado.generoAplicado}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
