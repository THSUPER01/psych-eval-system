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
import { Badge } from "@/components/ui/badge"
import { useRequerimientos, useAsignarCandidatoARequerimiento } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, Briefcase } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidato: { canId: number; nombreCompleto: string }
}

export function AsignarRequerimientoDialog({ open, onOpenChange, candidato }: Props) {
  const { data: requerimientos, isLoading } = useRequerimientos()
  const asignarMutation = useAsignarCandidatoARequerimiento()
  const toast = useModernToast()
  const [reqId, setReqId] = useState<string>("")

  const requerimientosActivos = useMemo(() => {
    return (requerimientos || []).filter(r => r?.estado?.estActivo === true)
  }, [requerimientos])

  const handleAsignar = async () => {
    if (!reqId) return
    try {
      await asignarMutation.mutateAsync({ candidatoId: candidato.canId, requerimientoId: Number(reqId) })
      toast.success({ title: "Candidato asignado", description: `Se asignó a ${candidato.nombreCompleto}` })
      onOpenChange(false)
    } catch (e) {
      toast.error({ title: "Error", description: e instanceof Error ? e.message : "No se pudo asignar" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Asignar a Requerimiento</DialogTitle>
          <DialogDescription>
            Selecciona el proceso donde quedará el candidato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="text-sm">
            <span className="text-muted-foreground">Candidato:</span>{" "}
            <span className="font-medium">{candidato.nombreCompleto}</span>
          </div>
          <div>
            <label className="text-sm font-medium">Requerimiento</label>
            <Select value={reqId} onValueChange={setReqId} disabled={isLoading || asignarMutation.isPending}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={isLoading ? "Cargando..." : "Selecciona un requerimiento"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando requerimientos...
                  </SelectItem>
                ) : requerimientosActivos.length > 0 ? (
                  requerimientosActivos.map(r => (
                    <SelectItem key={r.reqId} value={String(r.reqId)}>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{r.rolObjetivo} - {r.areaObjetivo}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No hay requerimientos activos disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Solo se listan requerimientos activos</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={asignarMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleAsignar} disabled={!reqId || asignarMutation.isPending}>
            {asignarMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
