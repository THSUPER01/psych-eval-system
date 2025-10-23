'use client'

import { useState } from 'react'
import { loginApiService } from '@/lib/services/loginApiService'
import { useToast } from '@/hooks/use-toast'
import { TokenModal } from './TokenModal'

interface VerificationModalProps {
  documento: string
  infoUsuario: {
    email: { id: number; valor: string }
    emailSuper: { id: number; valor: string }
    phoneNumber: { id: number; valor: string }
  }
  permisos: any[]
  onClose: () => void
}

type MetodoVerificacion = 'Correo' | 'CorreoOrganizacional' | 'Celular'

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!user || !domain) return email
  const visible = user.slice(0, 1)
  return `${visible}***@${domain}`
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 4) return phone
  const last2 = digits.slice(-2)
  return `*** *** **${last2}`
}

export function VerificationModal({ documento, infoUsuario, permisos, onClose }: VerificationModalProps) {
  const [metodo, setMetodo] = useState<MetodoVerificacion>('CorreoOrganizacional')
  const [isLoading, setIsLoading] = useState(false)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const { toast } = useToast()

  const handleEnviar = async () => {
    setIsLoading(true)
    let idMetodo: number
    switch (metodo) {
      case 'Correo':
        idMetodo = infoUsuario.email.id
        break
      case 'CorreoOrganizacional':
        idMetodo = infoUsuario.emailSuper.id
        break
      case 'Celular':
        idMetodo = infoUsuario.phoneNumber.id
        break
    }
    try {
      const resp = await loginApiService.enviarToken(documento, idMetodo)
      setSessionId(resp.data.idSession)
      toast({
        title: 'Código enviado',
        description: 'Revisa el medio seleccionado para ingresar el código.',
        className: 'border-green-600 bg-green-600 text-white',
      })
      setShowTokenModal(true)
    } catch (err: any) {
      const mensaje = err?.message || 'Error al enviar el código'
      toast({ title: 'Error', description: mensaje, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  if (showTokenModal) {
    return (
      <TokenModal
        documento={documento}
        idSession={sessionId}
        permisos={permisos}
        onClose={() => {
          setShowTokenModal(false)
          onClose()
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-center text-lg font-semibold">Selecciona el canal para recibir el código</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input
              type="radio"
              name="metodo"
              checked={metodo === 'CorreoOrganizacional'}
              onChange={() => setMetodo('CorreoOrganizacional')}
            />
            <span>Correo organizacional ({maskEmail(infoUsuario.emailSuper.valor)})</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input type="radio" name="metodo" checked={metodo === 'Correo'} onChange={() => setMetodo('Correo')} />
            <span>Correo personal ({maskEmail(infoUsuario.email.valor)})</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <input type="radio" name="metodo" checked={metodo === 'Celular'} onChange={() => setMetodo('Celular')} />
            <span>Celular (+57 {maskPhone(infoUsuario.phoneNumber.valor)})</span>
          </label>
        </div>
        <div className="mt-6 space-y-3">
          <button
            onClick={handleEnviar}
            disabled={isLoading}
            className="w-full rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? 'Enviando…' : 'Enviar código'}
          </button>
          <button onClick={onClose} className="w-full rounded-lg bg-gray-200 px-4 py-2 font-semibold">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
