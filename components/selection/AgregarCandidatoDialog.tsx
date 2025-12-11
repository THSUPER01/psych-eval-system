"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCrearCandidato, useTiposNormativa, useRequerimientos } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, AlertCircle, Info, Briefcase } from "lucide-react"

const formSchema = z.object({
  requerimientoId: z.number({
    required_error: "Debes seleccionar un requerimiento",
  }).min(1, "Debes seleccionar un requerimiento"),
  cedulaCiudadania: z.string().min(6, "La cédula debe tener al menos 6 caracteres").max(20, "La cédula no puede tener más de 20 caracteres"),
  nombreCompleto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().regex(/^[0-9+\-\s()]+$/, "Teléfono inválido").max(50),
  tipoNormativaId: z.number({
    required_error: "Debes seleccionar un tipo de normativa",
  }).min(1, "Debes seleccionar un tipo de normativa"),
})

type FormValues = z.infer<typeof formSchema>

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requerimientoId: requerimientoId || undefined,
      cedulaCiudadania: "",
      nombreCompleto: "",
      email: "",
      telefono: "",
      tipoNormativaId: undefined,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await crearMutation.mutateAsync({
        requerimientoId: values.requerimientoId,
        cedulaCiudadania: values.cedulaCiudadania,
        nombreCompleto: values.nombreCompleto,
        email: values.email,
        telefono: values.telefono,
        tipoNormativaId: values.tipoNormativaId,
      })

      toast.success({
        title: "Candidato agregado",
        description: "El candidato ha sido registrado exitosamente con la prueba CMT asignada automáticamente.",
      })

      form.reset()
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="requerimientoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requerimiento *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={crearMutation.isPending || loadingReqs}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el requerimiento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingReqs ? (
                        <SelectItem value="loading" disabled>
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
                        <SelectItem value="empty" disabled>
                          No hay requerimientos activos disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona el proceso de selección al que pertenecerá este candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cedulaCiudadania"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de Ciudadanía *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 1234567890"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de cédula del candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombreCompleto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Juan Pérez García"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    El candidato recibirá el link de registro en este correo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="300 123 4567"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de contacto del candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoNormativaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Perfil CMT *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                    disabled={crearMutation.isPending || loadingTipos}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de normativa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingTipos ? (
                        <SelectItem value="loading" disabled>
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
                        <SelectItem value="empty" disabled>
                          No hay tipos de normativa disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define cómo se calcularán los resultados de la prueba CMT según el perfil del rol y candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
