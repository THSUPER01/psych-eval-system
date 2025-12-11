"use client"
import React from 'react'
import { Progress } from '@/components/ui/progress'

interface Progress16PFProps {
  respondidas: number
  total: number
}

export function Progress16PF({ respondidas, total }: Progress16PFProps) {
  const porcentaje = Math.round((respondidas / total) * 100)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium">
        <span>{respondidas} / {total} respondidas</span>
        <span>{porcentaje}%</span>
      </div>
      <Progress value={porcentaje} />
      {respondidas === total && (
        <div className="text-xs text-primary font-medium">✓ Todas las preguntas respondidas. Puedes enviar el test.</div>
      )}
    </div>
  )
}
