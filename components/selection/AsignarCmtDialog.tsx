"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTiposNormativa, useAsignarCmtManual } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, ClipboardCheck } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidato: { canId: number; nombreCompleto: string }
}

export function AsignarCmtDialog({ open, onOpenChange, candidato }: Props) {
  const { data: tiposNormativa, isLoading } = useTiposNormativa()
  const asignarMutation = useAsignarCmtManual()
  const toast = useModernToast()
  const [tipoNormativaId, setTipoNormativaId] = useState<string>("")

  const tiposActivos = useMemo(() => (tiposNormativa || []).filter(t => t.tipActivo), [tiposNormativa])

  const handleAsignar = async () => {
    if (!tipoNormativaId) return
    try {
      await asignarMutation.mutateAsync({ candidatoId: candidato.canId, tipoNormativaId: Number(tipoNormativaId) })
      toast.success({ title: "Prueba CMT asignada", description: `Se asignó CMT a ${candidato.nombreCompleto}` })
      onOpenChange(false)
    } catch (e) {
      toast.error({ title: "Error", description: e instanceof Error ? e.message : "No se pudo asignar la prueba" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Asignar Prueba CMT</DialogTitle>
          <DialogDescription>
            Selecciona el tipo de normativa para la prueba CMT
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Candidato:</span>{" "}
            <span className="font-medium">{candidato.nombreCompleto}</span>
          </div>
          <div>
            <label className="text-sm font-medium">Tipo de Normativa</label>
            <Select value={tipoNormativaId} onValueChange={setTipoNormativaId} disabled={isLoading || asignarMutation.isPending}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona una normativa"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando tipos de normativa...
                  </SelectItem>
                ) : tiposActivos.length > 0 ? (
                  tiposActivos.map(t => (
                    <SelectItem key={t.tipTipoNormativaId} value={String(t.tipTipoNormativaId)}>
                      {t.tipNombre}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No hay tipos de normativa disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Solo se listan normativas activas</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={asignarMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleAsignar} disabled={!tipoNormativaId || asignarMutation.isPending}>
            {asignarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ClipboardCheck className="mr-2 h-4 w-4" />Asignar CMT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
