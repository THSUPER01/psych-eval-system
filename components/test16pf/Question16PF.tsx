"use client"
import React from 'react'
import type { Pregunta16PF } from '@/types/test16pf.types'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Question16PFProps {
  pregunta: Pregunta16PF
  respuestaActual?: 1 | 2 | 3
  onRespuesta: (preguntaId: number, valor: 1 | 2 | 3) => void
}

export function Question16PF({ pregunta, respuestaActual, onRespuesta }: Question16PFProps) {
  const opciones = [
    { valor: 1 as 1, letra: 'A', texto: pregunta.pfpOpcionA },
    { valor: 2 as 2, letra: 'B', texto: pregunta.pfpOpcionB },
    { valor: 3 as 3, letra: 'C', texto: pregunta.pfpOpcionC },
  ]
  return (
    <Card className="p-4 space-y-4">
      <div className="text-xs text-muted-foreground">Pregunta {pregunta.pfpNumeroPregunta} de 185</div>
      <h3 className="font-medium leading-relaxed">{pregunta.pfpTextoPregunta}</h3>
      <div className="space-y-2">
        {opciones.map(op => (
          <label
            key={op.valor}
            className={cn(
              'flex items-start gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors',
              respuestaActual === op.valor ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
            )}
          >
            <input
              type="radio"
              name={`pregunta-${pregunta.pfpIdPregunta}`}
              value={op.valor}
              checked={respuestaActual === op.valor}
              onChange={() => onRespuesta(pregunta.pfpIdPregunta, op.valor)}
              className="mt-1"
            />
            <span className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {op.letra}
              </span>
              <span className="text-sm leading-snug">{op.texto}</span>
            </span>
          </label>
        ))}
      </div>
    </Card>
  )
}
