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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCrearCandidato } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  cedulaCiudadania: z.string().min(6, "La cédula debe tener al menos 6 caracteres").max(20, "La cédula no puede tener más de 20 caracteres"),
  nombreCompleto: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().regex(/^[0-9+\-\s()]+$/, "Teléfono inválido").max(50),
})

type FormValues = z.infer<typeof formSchema>

interface AgregarCandidatoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requerimientoId: number
}

export function AgregarCandidatoDialog({
  open,
  onOpenChange,
  requerimientoId,
}: AgregarCandidatoDialogProps) {
  const toast = useModernToast()
  const crearMutation = useCrearCandidato()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cedulaCiudadania: "",
      nombreCompleto: "",
      email: "",
      telefono: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await crearMutation.mutateAsync({
        requerimientoId,
        cedulaCiudadania: values.cedulaCiudadania,
        nombreCompleto: values.nombreCompleto,
        email: values.email,
        telefono: values.telefono,
      })

      toast.success({
        title: "Candidato agregado",
        description: "El candidato ha sido registrado exitosamente. Ahora puedes enviarle el link de registro.",
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error({
        title: "Error",
        description: "No se pudo agregar el candidato. Por favor intenta nuevamente.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              name="cedulaCiudadania"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula de Ciudadanía</FormLabel>
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
                  <FormLabel>Nombre Completo</FormLabel>
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Teléfono</FormLabel>
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
                Agregar Candidato
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
