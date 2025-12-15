import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCrearRequerimiento } from "@/lib/hooks/useSelection"
import { selectionApiService } from "@/lib/services/selectionApiService"
import { useAuth } from "@/lib/hooks/useAuth"
import { useModernToast } from "@/lib/toast"
import { Loader2 } from "lucide-react"

interface CrearRequerimientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrearRequerimientoDialog({
  open,
  onOpenChange,
}: CrearRequerimientoDialogProps) {
  const { user } = useAuth()
  const toast = useModernToast()
  const crearMutation = useCrearRequerimiento()

  const [formData, setFormData] = useState({
    rolObjetivo: "",
    areaObjetivo: "",
    perfilBasico: "",
  })

  useEffect(() => {
    if (open) {
      setFormData({
        rolObjetivo: "",
        areaObjetivo: "",
        perfilBasico: "",
      })
    }
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.rolObjetivo.trim() || formData.rolObjetivo.length < 3) {
      toast.error({
        title: "Error de validación",
        description: "El rol debe tener al menos 3 caracteres",
      })
      return
    }

    if (!formData.areaObjetivo.trim() || formData.areaObjetivo.length < 3) {
      toast.error({
        title: "Error de validación",
        description: "El área debe tener al menos 3 caracteres",
      })
      return
    }

    if (!formData.perfilBasico.trim() || formData.perfilBasico.length < 10) {
      toast.error({
        title: "Error de validación",
        description: "El perfil debe tener al menos 10 caracteres",
      })
      return
    }

    // Extraer solo el documento desde el JWT
    const documento = user?.DocumentoColaborador || (user as any)?.documento

    if (!documento) {
      toast.error({
        title: "Error",
        description: "No se pudo obtener el documento del colaborador desde el token.",
      })
      return
    }

    // Obtener info adicional del colaborador (nombre/email) desde el backend de Talento Humano
    const col = await selectionApiService.getColaboradorPorDocumento(documento)
    const nombre = col?.nombreCompleto || (user as any)?.nombreColaborador || ""
    const email =
      col?.correoInstitucional ||
      col?.correoElectronicoPersonal ||
      (user as any)?.email ||
      `${documento}@superalimentos.com.co`

    try {
      await crearMutation.mutateAsync({
        psicologoDocumento: documento,
        psicologoNombre: nombre,
        psicologoEmail: email,
        rolObjetivo: formData.rolObjetivo,
        areaObjetivo: formData.areaObjetivo,
        perfilBasico: formData.perfilBasico,
      })

      toast.success({
        title: "Requerimiento creado",
        description: "El requerimiento ha sido creado exitosamente.",
      })

      setFormData({
        rolObjetivo: "",
        areaObjetivo: "",
        perfilBasico: "",
      })
      onOpenChange(false)
    } catch (error) {
      toast.error({
        title: "Error",
        description: "No se pudo crear el requerimiento. Por favor intenta nuevamente.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Requerimiento</DialogTitle>
          <DialogDescription>
            Complete la información del proceso de selección
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rol">Rol *</Label>
            <Input
              id="rol"
              placeholder="Ej: Analista de Sistemas, Gerente Comercial"
              value={formData.rolObjetivo}
              onChange={(e) => setFormData({ ...formData, rolObjetivo: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              El rol o cargo para el cual se está reclutando
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área *</Label>
            <Input
              id="area"
              placeholder="Ej: Tecnología, Ventas, Administración"
              value={formData.areaObjetivo}
              onChange={(e) => setFormData({ ...formData, areaObjetivo: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              El área o departamento al que pertenece el rol
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="perfil">Perfil Básico *</Label>
            <Textarea
              id="perfil"
              placeholder="Describa el perfil ideal del candidato: habilidades, experiencia, formación académica, etc."
              className="min-h-[120px] resize-none"
              value={formData.perfilBasico}
              onChange={(e) => setFormData({ ...formData, perfilBasico: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Descripción del perfil profesional y competencias requeridas
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={crearMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={crearMutation.isPending}>
              {crearMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Crear Requerimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
