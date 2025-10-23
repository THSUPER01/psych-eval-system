'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginApiService } from '@/lib/services/loginApiService'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

interface TokenModalProps {
  documento: string
  idSession: string
  permisos: any[]
  onClose: () => void
}

export function TokenModal({ documento, idSession, permisos, onClose }: TokenModalProps) {
  const [token, setToken] = useState('')
  const [mantenerActivo, setMantenerActivo] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const validateToken = (value: string): string[] => {
    const errs: string[] = []
    if (!/^\d{6}$/.test(value)) {
      errs.push('El token debe tener 6 dígitos numéricos')
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validateToken(token)
    setErrors(v)
    if (v.length) return
    setIsLoading(true)
    try {
      const duracionSesion = mantenerActivo ? 12 : 6
      const resp = await loginApiService.verificarToken({
        documento,
        token,
        idSesion: idSession,
        duracionSesion,
      })
      const authToken = resp.data.token || resp.data.Token || ''
      if (!authToken) throw new Error('Token inválido')
      login(authToken, permisos)
      toast({
        title: 'Sesión iniciada',
        description: 'Código verificado correctamente.',
        className: 'border-green-600 bg-green-600 text-white',
      })
      onClose()
      router.push('/dashboard/selection')
    } catch (err: any) {
      const mensaje = err?.message || 'Código inválido'
      toast({ title: 'Error', description: mensaje, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="mb-1 block font-medium">
              Ingresa el código de 6 dígitos
            </label>
            <input
              id="token"
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              maxLength={6}
              value={token}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                setToken(v)
                setErrors(validateToken(v))
              }}
              className="w-full rounded-md border px-3 py-2"
              placeholder="000000"
            />
            {errors.length > 0 && (
              <p className="mt-1 text-sm text-red-600">{errors[0]}</p>
            )}
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={mantenerActivo}
              onChange={(e) => setMantenerActivo(e.target.checked)}
            />
            <span>Mantener sesión activa (12 horas)</span>
          </label>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? 'Verificando…' : 'Enviar código'}
            </button>
            <button type="button" onClick={onClose} className="w-full rounded-lg bg-gray-200 px-4 py-2 font-semibold">
              Cerrar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
