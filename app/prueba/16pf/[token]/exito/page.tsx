"use client"
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { test16pfService } from '@/lib/services/test16pfService'
import { Resultado16PF } from '@/components/test16pf/Resultado16PF'
import type { Resultado16PFDto } from '@/types/test16pf.types'

export default function Exito16PFPage() {
  const params = useParams<{ token: string }>()
  const token = params?.token
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
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally { if (!cancelado) setCargando(false) }
    }
    fetchResultado()
    return () => { cancelado = true }
  }, [token])

  if (cargando) return <div className="flex min-h-screen items-center justify-center text-sm">Cargando resultado…</div>
  if (error) return <div className="p-6 text-sm text-red-600">Error: {error}</div>
  if (!resultado) return <div className="p-6 text-sm">No se encontró resultado.</div>
  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <div className="rounded-md bg-green-50 border border-green-200 p-4 text-green-700 text-sm">¡Test 16PF completado exitosamente!</div>
      <Resultado16PF resultado={resultado} />
    </div>
  )
}
