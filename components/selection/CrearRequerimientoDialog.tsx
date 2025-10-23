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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useCrearRequerimiento } from "@/lib/hooks/useSelection"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  cargoObjetivo: z.string().min(3, "El cargo debe tener al menos 3 caracteres"),
  areaObjetivo: z.string().min(3, "El área debe tener al menos 3 caracteres"),
  perfilBasico: z.string().min(10, "El perfil debe tener al menos 10 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

interface CrearRequerimientoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CrearRequerimientoDialog({
  open,
  onOpenChange,
}: CrearRequerimientoDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const crearMutation = useCrearRequerimiento()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cargoObjetivo: "",
      areaObjetivo: "",
      perfilBasico: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    if (!user?.documento) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo obtener la información del usuario.",
        duration: 5000,
      })
      return
    }

    try {
      await crearMutation.mutateAsync({
        psicologoDocumento: user.documento,
        psicologoNombre: user.nombre || "",
        psicologoEmail: user.email || "",
        cargoObjetivo: values.cargoObjetivo,
        areaObjetivo: values.areaObjetivo,
        perfilBasico: values.perfilBasico,
      })

      toast({
        title: "Requerimiento creado",
        description: "El requerimiento ha sido creado exitosamente.",
        duration: 3000,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el requerimiento. Por favor intenta nuevamente.",
        duration: 5000,
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cargoObjetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo Objetivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Analista de Sistemas, Gerente Comercial"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    El cargo para el cual se está reclutando
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areaObjetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área Objetivo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Tecnología, Ventas, Administración"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    El área o departamento al que pertenece el cargo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="perfilBasico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil Básico</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el perfil ideal del candidato: habilidades, experiencia, formación académica, etc."
                      className="min-h-[120px] resize-none"
                      {...field}
                      disabled={crearMutation.isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Descripción del perfil profesional y competencias requeridas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
