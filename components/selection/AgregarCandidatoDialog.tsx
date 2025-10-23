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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
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
  const { toast } = useToast()
  const crearMutation = useCrearCandidato()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      email: "",
      telefono: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await crearMutation.mutateAsync({
        requerimientoId,
        nombreCompleto: values.nombreCompleto,
        email: values.email,
        telefono: values.telefono,
      })

      toast({
        title: "Candidato agregado",
        description: "El candidato ha sido registrado exitosamente. Ahora puedes enviarle el link de registro.",
        duration: 3000,
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el candidato. Por favor intenta nuevamente.",
        duration: 5000,
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
