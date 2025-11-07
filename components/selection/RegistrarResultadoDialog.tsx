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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRegistrarResultado } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

const formSchema = z.object({
  resultadoSeleccion: z.enum(["aprobado", "rechazado"], {
    required_error: "Debes seleccionar un resultado",
  }),
  motivoRechazo: z.string().optional(),
}).refine((data) => {
  // Si es rechazado, el motivo es obligatorio
  if (data.resultadoSeleccion === "rechazado" && (!data.motivoRechazo || data.motivoRechazo.trim().length === 0)) {
    return false
  }
  return true
}, {
  message: "El motivo de rechazo es obligatorio cuando se rechaza un candidato",
  path: ["motivoRechazo"],
})

type FormValues = z.infer<typeof formSchema>

interface RegistrarResultadoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidatoId: number
  nombreCandidato: string
}

export function RegistrarResultadoDialog({
  open,
  onOpenChange,
  candidatoId,
  nombreCandidato,
}: RegistrarResultadoDialogProps) {
  const toast = useModernToast()
  const registrarMutation = useRegistrarResultado()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resultadoSeleccion: undefined,
      motivoRechazo: "",
    },
  })

  const resultado = form.watch("resultadoSeleccion")
  const esRechazado = resultado === "rechazado"

  const onSubmit = async (values: FormValues) => {
    try {
      await registrarMutation.mutateAsync({
        candidatoId,
        dto: {
          resultadoSeleccion: values.resultadoSeleccion === "aprobado",
          motivoRechazo: values.resultadoSeleccion === "rechazado" ? values.motivoRechazo : undefined,
        },
      })

      toast.success({
        title: "Resultado registrado",
        description: `El candidato ha sido ${values.resultadoSeleccion === "aprobado" ? "aprobado" : "rechazado"} exitosamente.`,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error({
        title: "Error",
        description: "No se pudo registrar el resultado. Por favor intenta nuevamente.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Registrar Resultado de Evaluación</DialogTitle>
          <DialogDescription>
            Define el resultado final del proceso de selección para{" "}
            <strong>{nombreCandidato}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="resultadoSeleccion"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Resultado de la Evaluación</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-3"
                      disabled={registrarMutation.isPending}
                    >
                      <div className="flex items-center space-x-3 rounded-lg border-2 border-green-200 bg-green-50/50 p-4 hover:bg-green-50 transition-colors">
                        <RadioGroupItem value="aprobado" id="aprobado" />
                        <Label
                          htmlFor="aprobado"
                          className="flex flex-1 cursor-pointer items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-green-900">Aprobar Candidato</p>
                              <p className="text-sm text-green-700">
                                El candidato cumple con los requisitos del perfil
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 rounded-lg border-2 border-red-200 bg-red-50/50 p-4 hover:bg-red-50 transition-colors">
                        <RadioGroupItem value="rechazado" id="rechazado" />
                        <Label
                          htmlFor="rechazado"
                          className="flex flex-1 cursor-pointer items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div>
                              <p className="font-semibold text-red-900">Rechazar Candidato</p>
                              <p className="text-sm text-red-700">
                                El candidato no cumple con los requisitos
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {esRechazado && (
              <FormField
                control={form.control}
                name="motivoRechazo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-red-900">
                      Motivo del Rechazo <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe brevemente por qué el candidato no cumple con el perfil (ej: no alcanzó el puntaje mínimo en la prueba, experiencia insuficiente, etc.)"
                        className="min-h-[100px] resize-none border-red-200 focus-visible:ring-red-500"
                        {...field}
                        disabled={registrarMutation.isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-red-700">
                      Este motivo será visible para el candidato y ayudará en futuros procesos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={registrarMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={registrarMutation.isPending || !resultado}
                className={
                  resultado === "aprobado"
                    ? "bg-green-600 hover:bg-green-700"
                    : resultado === "rechazado"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              >
                {registrarMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {resultado === "aprobado" && <CheckCircle2 className="mr-2 h-4 w-4" />}
                {resultado === "rechazado" && <XCircle className="mr-2 h-4 w-4" />}
                {resultado
                  ? `Confirmar ${resultado === "aprobado" ? "Aprobación" : "Rechazo"}`
                  : "Selecciona un Resultado"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
