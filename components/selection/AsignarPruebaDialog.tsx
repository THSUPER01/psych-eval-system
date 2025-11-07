"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTiposNormativa } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, Info, AlertCircle } from "lucide-react"
import { selectionApiService } from "@/lib/services/selectionApiService"

const formSchema = z.object({
  publicacionPruebaId: z.number().min(1, "Debe seleccionar una prueba"),
  tipoNormativaId: z.number().min(1, "Debe seleccionar un tipo de normativa"),
  fechaLimite: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AsignarPruebaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidato: {
    canId: number
    nombreCompleto: string
    genero?: string
    formulario?: {
      genero?: string
    }
  }
  publicacionesPrueba?: Array<{
    pubId: number
    nombrePrueba: string
    codigoVersion: string
  }>
  onAsignado?: () => void
}

export function AsignarPruebaDialog({
  open,
  onOpenChange,
  candidato,
  publicacionesPrueba = [],
  onAsignado,
}: AsignarPruebaDialogProps) {
  const toast = useModernToast()
  const { data: tiposNormativa, isLoading: loadingTipos } = useTiposNormativa()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicacionPruebaId: undefined,
      tipoNormativaId: undefined,
      fechaLimite: "",
    },
  })

  // Sugerir normativa según género del candidato
  const sugerirNormativa = () => {
    if (!tiposNormativa || tiposNormativa.length === 0) return null

    const genero = candidato.formulario?.genero || candidato.genero

    if (genero === "M" || genero === "Masculino") {
      return tiposNormativa.find((t) => t.tipNombre.toLowerCase().includes("hombres"))
    }
    if (genero === "F" || genero === "Femenino") {
      return tiposNormativa.find((t) => t.tipNombre.toLowerCase().includes("mujeres"))
    }
    return null
  }

  const sugerencia = sugerirNormativa()

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      const payload = {
        candidatoId: candidato.canId,
        publicacionPruebaId: values.publicacionPruebaId,
        tipoNormativaId: values.tipoNormativaId,
        fechaLimite: values.fechaLimite || undefined,
      }

      // TODO: Implementar servicio de asignación cuando esté disponible
      // await selectionApiService.crearAsignacion(payload)

      toast.success({
        title: "Prueba asignada",
        description: `La prueba ha sido asignada exitosamente a ${candidato.nombreCompleto}.`,
      })

      form.reset()
      onOpenChange(false)
      onAsignado?.()
    } catch (error: any) {
      toast.error({
        title: "Error",
        description: error.message || "No se pudo asignar la prueba. Por favor intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const usarSugerencia = () => {
    if (sugerencia) {
      form.setValue("tipoNormativaId", sugerencia.tipTipoNormativaId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignar Prueba Psicotécnica</DialogTitle>
          <DialogDescription>
            Candidato: <strong>{candidato.nombreCompleto}</strong>
            {candidato.formulario?.genero && (
              <> ({candidato.formulario.genero === "M" ? "Masculino" : "Femenino"})</>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Selección de Prueba */}
            <FormField
              control={form.control}
              name="publicacionPruebaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prueba Publicada *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una prueba..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {publicacionesPrueba.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No hay pruebas disponibles
                        </SelectItem>
                      ) : (
                        publicacionesPrueba.map((pub) => (
                          <SelectItem key={pub.pubId} value={pub.pubId.toString()}>
                            {pub.nombrePrueba} - {pub.codigoVersion}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione la prueba que realizará el candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sugerencia de normativa */}
            {sugerencia && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      <strong>Sugerencia:</strong> {sugerencia.tipNombre}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={usarSugerencia}
                    >
                      Usar esta
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Selección de Normativa */}
            <FormField
              control={form.control}
              name="tipoNormativaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Normativa *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value?.toString()}
                    disabled={isSubmitting || loadingTipos}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo de normativa" />
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
                              <div>
                                <div className="font-medium">{tipo.tipNombre}</div>
                                <div className="text-xs text-muted-foreground">
                                  {tipo.tipDescripcion}
                                </div>
                              </div>
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
                    Seleccione según perfil y género del candidato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha Límite (Opcional) */}
            <FormField
              control={form.control}
              name="fechaLimite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Límite (Opcional)</FormLabel>
                  <FormControl>
                    <input
                      type="datetime-local"
                      {...field}
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Fecha y hora máxima para completar la prueba
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Información importante */}
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">⚠️ Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <strong>Auxiliares:</strong> Personal operativo (oficina, admin, almacén,
                    contable)
                  </li>
                  <li>
                    <strong>Profesionales:</strong> Personal técnico o universitario
                  </li>
                  <li>
                    <strong>Género específico:</strong> Normativa diferenciada por hombres/mujeres
                  </li>
                </ul>
                <p className="mt-2 text-xs">
                  El tipo de normativa determina con qué tabla de baremos se calificará la prueba.
                  No puede modificarse después de la asignación.
                </p>
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Asignar Prueba
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
