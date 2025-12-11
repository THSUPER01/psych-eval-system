"use client"

import { useState, useEffect } from "react"
import { useCrearCandidato, useTiposNormativa, useRequerimientos } from "@/lib/hooks/useSelection"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, UserPlus, Mail, Phone, CreditCard, FileText, Briefcase } from "lucide-react"
import { useModernToast } from "@/lib/toast"
import type { CrearCandidatoDto } from "@/types/selection.types"

interface CrearCandidatoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requerimientoId?: number | null
}

export function CrearCandidatoDialog({
  open,
  onOpenChange,
  requerimientoId,
}: CrearCandidatoDialogProps) {
  const toast = useModernToast()
  const crearCandidato = useCrearCandidato()
  const { data: tiposNormativa, isLoading: loadingNormativas } = useTiposNormativa()
  const { data: requerimientos, isLoading: loadingRequerimientos } = useRequerimientos()

  const [formData, setFormData] = useState<CrearCandidatoDto>({
    requerimientoId: requerimientoId || 0,
    cedulaCiudadania: "",
    nombreCompleto: "",
    email: "",
    telefono: "",
    tipoNormativaId: undefined,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        requerimientoId: requerimientoId || 0,
        cedulaCiudadania: "",
        nombreCompleto: "",
        email: "",
        telefono: "",
        tipoNormativaId: undefined,
      })
    }
  }, [open, requerimientoId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.cedulaCiudadania.trim()) {
      toast.error({
        title: "Campo requerido",
        description: "La cédula de ciudadanía es obligatoria",
      })
      return
    }

    if (!formData.nombreCompleto.trim()) {
      toast.error({
        title: "Campo requerido",
        description: "El nombre completo es obligatorio",
      })
      return
    }

    if (!formData.email.trim()) {
      toast.error({
        title: "Campo requerido",
        description: "El correo electrónico es obligatorio",
      })
      return
    }

    if (!formData.telefono.trim()) {
      toast.error({
        title: "Campo requerido",
        description: "El teléfono es obligatorio",
      })
      return
    }

    try {
      const dto: CrearCandidatoDto = {
        cedulaCiudadania: formData.cedulaCiudadania,
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        telefono: formData.telefono,
        requerimientoId: formData.requerimientoId || 0,
        tipoNormativaId: formData.tipoNormativaId,
      }

      await crearCandidato.mutateAsync(dto)

      toast.success({
        title: "¡Candidato creado exitosamente!",
        description:
          "Se ha enviado un correo con el token de acceso. La prueba CMT fue asignada automáticamente.",
      })

      // Resetear formulario y cerrar
      setFormData({
        requerimientoId: requerimientoId || 0,
        cedulaCiudadania: "",
        nombreCompleto: "",
        email: "",
        telefono: "",
        tipoNormativaId: undefined,
      })
      onOpenChange(false)
    } catch (error: any) {
      toast.error({
        title: "Error al crear candidato",
        description:
          error?.message || "No se pudo crear el candidato. Verifica los datos e intenta nuevamente.",
      })
    }
  }

  const handleCancel = () => {
    setFormData({
      requerimientoId: requerimientoId || 0,
      cedulaCiudadania: "",
      nombreCompleto: "",
      email: "",
      telefono: "",
      tipoNormativaId: undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Crear Nuevo Candidato
            </DialogTitle>
            <DialogDescription>
              Registra un candidato y asigna automáticamente la prueba CMT. Se enviará un
              correo con el token de acceso.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Requerimiento (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="requerimiento" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Requerimiento / Vacante
                <span className="text-muted-foreground text-xs ml-2">(opcional)</span>
              </Label>
              <Select
                value={formData.requerimientoId ? String(formData.requerimientoId) : "0"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    requerimientoId: value === "0" ? 0 : Number(value),
                  })
                }
                disabled={crearCandidato.isPending || loadingRequerimientos}
              >
                <SelectTrigger id="requerimiento">
                  <SelectValue placeholder={
                    loadingRequerimientos 
                      ? "Cargando requerimientos..." 
                      : "Selecciona un requerimiento (opcional)..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">-- Ninguno (Candidato Público) --</SelectItem>
                  {loadingRequerimientos ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Cargando...
                    </div>
                  ) : requerimientos && requerimientos.length > 0 ? (
                    requerimientos
                      .filter(r => r.estado.estActivo)
                      .map((req) => (
                        <SelectItem
                          key={req.reqId}
                          value={String(req.reqId)}
                        >
                          {req.rolObjetivo} - {req.areaObjetivo}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay requerimientos activos
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Cédula de Ciudadanía */}
            <div className="space-y-2">
              <Label htmlFor="cedula" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Cédula de Ciudadanía
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cedula"
                type="text"
                placeholder="1234567890"
                value={formData.cedulaCiudadania}
                onChange={(e) =>
                  setFormData({ ...formData, cedulaCiudadania: e.target.value })
                }
                required
                disabled={crearCandidato.isPending}
              />
            </div>

            {/* Nombre Completo */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Nombre Completo
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Juan Pérez González"
                value={formData.nombreCompleto}
                onChange={(e) =>
                  setFormData({ ...formData, nombreCompleto: e.target.value })
                }
                required
                disabled={crearCandidato.isPending}
              />
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Correo Electrónico
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="juan.perez@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={crearCandidato.isPending}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Teléfono
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="3001234567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
                disabled={crearCandidato.isPending}
              />
            </div>

            {/* Tipo de Normativa CMT (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="normativa">
                Tipo de Normativa CMT
                <span className="text-muted-foreground text-xs ml-2">(opcional)</span>
              </Label>
              <Select
                value={formData.tipoNormativaId ? String(formData.tipoNormativaId) : undefined}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    tipoNormativaId: value ? Number(value) : undefined,
                  })
                }
                disabled={crearCandidato.isPending || loadingNormativas}
              >
                <SelectTrigger id="normativa">
                  <SelectValue placeholder={
                    loadingNormativas 
                      ? "Cargando normativas..." 
                      : "Selecciona un tipo de normativa (opcional)..."
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loadingNormativas ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Cargando normativas...
                    </div>
                  ) : tiposNormativa && tiposNormativa.length > 0 ? (
                    tiposNormativa
                      .filter((t) => t.tipActivo)
                      .map((tipo) => (
                        <SelectItem
                          key={tipo.tipTipoNormativaId}
                          value={String(tipo.tipTipoNormativaId)}
                        >
                          {tipo.tipNombre}
                        </SelectItem>
                      ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No hay normativas disponibles
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Define el tipo de baremo que se aplicará en la prueba CMT. Si no se
                selecciona, se puede asignar manualmente después.
              </p>
            </div>

            {/* Información adicional */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mt-4">
              <p className="text-sm text-blue-900 font-medium mb-1">
                ℹ️ ¿Qué sucederá al crear el candidato?
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Se creará el registro del candidato</li>
                <li>Se asignará automáticamente la prueba CMT</li>
                <li>Se enviará un correo con el token de acceso</li>
                <li>El candidato podrá completar su formulario demográfico</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={crearCandidato.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={crearCandidato.isPending}>
              {crearCandidato.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Candidato
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
