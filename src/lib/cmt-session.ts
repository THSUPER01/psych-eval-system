import { parseUtcDate } from "@/lib/date"

export type SesionCmt = {
  estado: 'PENDIENTE' | 'INICIADA' | 'COMPLETADA' | 'EXPIRADA'
  serverNowUtc: string
  fechaLimiteUtc: string | null
  tiempoMaxMinutos: number
}

export function crearRelojSesion(sesion: SesionCmt) {
  const serverNowDate = parseUtcDate(sesion.serverNowUtc)
  const serverNow = serverNowDate ? serverNowDate.getTime() : Date.now()
  const deadline = sesion.fechaLimiteUtc ? (parseUtcDate(sesion.fechaLimiteUtc)?.getTime() ?? 0) : 0
  const offset = Date.now() - serverNow // corrige deriva del cliente

  return () => {
    const now = Date.now() - offset
    const remainingMs = Math.max(0, deadline - now)
    const totalSec = Math.floor(remainingMs / 1000)
    const mm = Math.floor(totalSec / 60)
    const ss = totalSec % 60
    return { remainingMs, label: `${mm}:${ss.toString().padStart(2,'0')}` }
  }
}
