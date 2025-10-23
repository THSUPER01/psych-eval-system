"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMarcarLinkEnviado } from "@/lib/hooks/useSelection"
import { useToast } from "@/hooks/use-toast"
import { Check, Copy, Info, Loader2, Mail, MessageSquare } from "lucide-react"
import type { Candidato } from "@/types/selection.types"

interface EnviarLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidato: Candidato
}

export function EnviarLinkDialog({
  open,
  onOpenChange,
  candidato,
}: EnviarLinkDialogProps) {
  const { toast } = useToast()
  const marcarMutation = useMarcarLinkEnviado()
  const [copied, setCopied] = useState(false)

  // TODO: Reemplazar con la URL real del frontend público
  const linkFormulario = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/candidate/${candidato.tokenAcceso}`

  const copiarLink = () => {
    navigator.clipboard.writeText(linkFormulario)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Link copiado",
      description: "El link ha sido copiado al portapapeles.",
      duration: 2000,
    })
  }

  const marcarComoEnviado = async () => {
    try {
      await marcarMutation.mutateAsync(candidato.canId)
      toast({
        title: "Link marcado como enviado",
        description: "El link ha sido marcado como enviado al candidato.",
        duration: 3000,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo marcar el link como enviado.",
        duration: 5000,
      })
    }
  }

  // Plantilla de email sugerida
  const emailSubject = `Invitación a proceso de selección - ${candidato.nombreCompleto}`
  const emailBody = `Hola ${candidato.nombreCompleto},

Te invitamos a completar tu formulario de registro para el proceso de selección.

Por favor ingresa al siguiente link para completar tu información:
${linkFormulario}

Este link es personal e intransferible.

¡Gracias!

Super de Alimentos S.A.
Área de Selección
`

  const abrirEmail = () => {
    const mailtoLink = `mailto:${candidato.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoLink
  }

  const mensajeWhatsApp = `Hola ${candidato.nombreCompleto}! 👋

Te invitamos a completar tu formulario de registro para el proceso de selección en Super de Alimentos.

Ingresa aquí: ${linkFormulario}

¡Gracias! 🙏`

  const abrirWhatsApp = () => {
    const telefono = candidato.telefono.replace(/[^0-9]/g, '')
    const whatsappLink = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`
    window.open(whatsappLink, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar Link al Candidato</DialogTitle>
          <DialogDescription>
            Comparte el link de registro con {candidato.nombreCompleto}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del Candidato */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-500">Nombre:</span>
              <p className="text-base font-semibold">{candidato.nombreCompleto}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-base">{candidato.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Teléfono:</span>
              <p className="text-base">{candidato.telefono}</p>
            </div>
          </div>

          {/* Link de Registro */}
          <div className="space-y-2">
            <Label htmlFor="link">Link de Registro</Label>
            <div className="flex gap-2">
              <Input
                id="link"
                readOnly
                value={linkFormulario}
                className="flex-1 font-mono text-sm bg-gray-50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copiarLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instrucciones */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>¿Cómo enviar el link?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>1. Copia el link usando el botón de arriba</p>
              <p>2. Envíalo al candidato por email o WhatsApp usando los botones de abajo</p>
              <p>3. Una vez enviado, marca como "Link Enviado"</p>
            </AlertDescription>
          </Alert>

          {/* Acciones de Envío */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={abrirEmail}
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar por Email
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={abrirWhatsApp}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar por WhatsApp
            </Button>
          </div>

          {/* Marcar como Enviado */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">¿Ya enviaste el link?</p>
                <p className="text-xs text-muted-foreground">
                  Marca como enviado para llevar control del proceso
                </p>
              </div>
              <Button
                onClick={marcarComoEnviado}
                disabled={marcarMutation.isPending}
              >
                {marcarMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Check className="mr-2 h-4 w-4" />
                Marcar como Enviado
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
