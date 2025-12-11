"use client"
import React from 'react'
import type { Resultado16PFDto, Escala16PF } from '@/types/test16pf.types'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function colorInterpretacion(i: string) {
  switch (i) {
    case 'ALTO': return 'text-green-600'
    case 'MEDIO': return 'text-amber-600'
    case 'BAJO': return 'text-red-600'
    default: return 'text-muted-foreground'
  }
}

export function Resultado16PF({ resultado }: { resultado: Resultado16PFDto }) {
  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-2">
        <h2 className="text-xl font-semibold">Resultados Test 16PF</h2>
        <p className="text-sm text-muted-foreground">Candidato: <span className="font-medium">{resultado.nombreCandidato}</span></p>
        <p className="text-sm text-muted-foreground">Normativa aplicada: {resultado.tipoNormativa}</p>
        <p className="text-sm text-muted-foreground">Fecha: {new Date(resultado.fechaAplicacion).toLocaleDateString()}</p>
        <p className="text-sm text-muted-foreground">Respuestas: {resultado.totalRespuestas}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resultado.escalas.map((e: Escala16PF) => (
          <Card key={e.codigoEscala} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">{e.codigoEscala}</span>
                {e.nombreEscala}
              </div>
              <span className={`text-xs font-medium ${colorInterpretacion(e.interpretacion)}`}>{e.interpretacion}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{e.poloBajo}</span>
              <span>{e.poloAlto}</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <div
                  key={n}
                  className={`h-2 flex-1 rounded ${n === e.decatipo ? 'bg-primary' : 'bg-muted'}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs">
              <span>PD: {e.puntuacionDirecta}</span>
              <span>Decatipo: {e.decatipo}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
