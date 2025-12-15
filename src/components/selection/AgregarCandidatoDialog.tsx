import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCrearCandidato, useTiposNormativa, useRequerimientos } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, AlertCircle, Info, Briefcase } from "lucide-react"

interface AgregarCandidatoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requerimientoId?: number | null
}

export function AgregarCandidatoDialog({
  open,
  onOpenChange,
  requerimientoId,
}: AgregarCandidatoDialogProps) {
  const toast = useModernToast()
  const crearMutation = useCrearCandidato()
  const { data: tiposNormativa, isLoading: loadingTipos } = useTiposNormativa()
  const { data: requerimientos, isLoading: loadingReqs } = useRequerimientos()
  
  // Filtrar solo requerimientos activos
  const requerimientosActivos = requerimientos?.filter(r => r.estado?.estActivo === true) || []

  const [formData, setFormData] = useState({
    requerimientoId: requerimientoId || 0,
    cedulaCiudadania: "",
    nombreCompleto: "",
    email: "",
    telefono: "",
    tipoNormativaId: 0,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        requerimientoId: requerimientoId || 0,
        cedulaCiudadania: "",
        nombreCompleto: "",
        email: "",
        telefono: "",
        tipoNormativaId: 0,
      })
    }
  }, [open, requerimientoId])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.requerimientoId || formData.requerimientoId === 0) {
      toast.error({
        title: "Error de validación",
        description: "Debes seleccionar un requerimiento",
      })
      return
    }

    if (!formData.cedulaCiudadania.trim() || formData.cedulaCiudadania.length < 6) {
      toast.error({
        title: "Error de validación",
        description: "La cédula debe tener al menos 6 caracteres",
      })
      return
    }

    if (!formData.nombreCompleto.trim() || formData.nombreCompleto.length < 3) {
      toast.error({
        title: "Error de validación",
        description: "El nombre debe tener al menos 3 caracteres",
      })
      return
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error({
        title: "Error de validación",
        description: "El email es inválido",
      })
      return
    }

    if (!formData.telefono.trim()) {
      toast.error({
        title: "Error de validación",
        description: "El teléfono es obligatorio",
      })
      return
    }

    if (!formData.tipoNormativaId || formData.tipoNormativaId === 0) {
      toast.error({
        title: "Error de validación",
        description: "Debes seleccionar un tipo de normativa",
      })
      return
    }

    try {
      await crearMutation.mutateAsync({
        requerimientoId: formData.requerimientoId,
        cedulaCiudadania: formData.cedulaCiudadania,
        nombreCompleto: formData.nombreCompleto,
        email: formData.email,
        telefono: formData.telefono,
        tipoNormativaId: formData.tipoNormativaId,
      })

      toast.success({
        title: "Candidato agregado",
        description: "El candidato ha sido registrado exitosamente con la prueba CMT asignada automáticamente.",
      })

      setFormData({
        requerimientoId: requerimientoId || 0,
        cedulaCiudadania: "",
        nombreCompleto: "",
        email: "",
        telefono: "",
        tipoNormativaId: 0,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo agregar el candidato. Por favor intenta nuevamente.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Candidato</DialogTitle>
          <DialogDescription>
            Registra un nuevo candidato para este proceso de selección
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Requerimiento */}
          <div className="space-y-2">
            <Label htmlFor="requerimiento">Requerimiento *</Label>
            <Select
              value={String(formData.requerimientoId)}
              onValueChange={(value) => setFormData({ ...formData, requerimientoId: parseInt(value) })}
              disabled={crearMutation.isPending || loadingReqs}
            >
              <SelectTrigger id="requerimiento">
                <SelectValue placeholder="Selecciona el requerimiento" />
              </SelectTrigger>
              <SelectContent>
                {loadingReqs ? (
                  <SelectItem value="0" disabled>
                    Cargando requerimientos...
                  </SelectItem>
                ) : requerimientosActivos.length > 0 ? (
                  requerimientosActivos.map((req) => (
                    <SelectItem
                      key={req.reqId}
                      value={req.reqId.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{req.rolObjetivo} - {req.areaObjetivo}</span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="0" disabled>
                    No hay requerimientos activos disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecciona el proceso de selección al que pertenecerá este candidato
            </p>
          </div>

          {/* Cédula de Ciudadanía */}
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula de Ciudadanía *</Label>
            <Input
              id="cedula"
              placeholder="Ej: 1234567890"
              value={formData.cedulaCiudadania}
              onChange={(e) => setFormData({ ...formData, cedulaCiudadania: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Número de cédula del candidato
            </p>
          </div>

          {/* Nombre Completo */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Juan Pérez García"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              disabled={crearMutation.isPending}
            />
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              El candidato recibirá el link de registro en este correo
            </p>
          </div>

          {/* Celular */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Celular *</Label>
            <Input
              id="telefono"
              placeholder="300 123 4567"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              disabled={crearMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Número de contacto del candidato
            </p>
          </div>

          {/* Tipo de Perfil CMT */}
          <div className="space-y-2">
            <Label htmlFor="normativa">Tipo de Perfil CMT *</Label>
            <Select
              value={String(formData.tipoNormativaId)}
              onValueChange={(value) => setFormData({ ...formData, tipoNormativaId: parseInt(value) })}
              disabled={crearMutation.isPending || loadingTipos}
            >
              <SelectTrigger id="normativa">
                <SelectValue placeholder="Selecciona el tipo de normativa" />
              </SelectTrigger>
              <SelectContent>
                {loadingTipos ? (
                  <SelectItem value="0" disabled>
                    Cargando...
                  </SelectItem>
                ) : tiposNormativa && tiposNormativa.length > 0 ? (
                  tiposNormativa
                    .filter((tipo) => tipo.tipActivo)
                    .map((tipo) => (
                      <SelectItem
                        key={tipo.tipTipoNormativaId}
                        value={tipo.tipTipoNormativaId.toString()}
                      >
                        {tipo.tipNombre}
                      </SelectItem>
                    ))
                ) : (
                  <SelectItem value="0" disabled>
                    No hay tipos de normativa disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Define cómo se calcularán los resultados de la prueba CMT según el perfil del rol y candidato
            </p>
          </div>

          {/* Alert de información */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>💡 Importante:</strong> Al crear el candidato se generará automáticamente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Un token único para el acceso del candidato</li>
                <li>La asignación de la prueba CMT con el tipo de normativa seleccionado</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!requerimientosActivos || requerimientosActivos.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay requerimientos activos disponibles. Por favor crea un requerimiento activo antes de agregar candidatos.
              </AlertDescription>
            </Alert>
          ) : null}

          {!tiposNormativa || tiposNormativa.length === 0 ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No se pudieron cargar los tipos de normativa. Por favor recarga la página o contacta al administrador.
              </AlertDescription>
            </Alert>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={crearMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={crearMutation.isPending || loadingTipos || loadingReqs || requerimientosActivos.length === 0}>
              {crearMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Agregar Candidato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
