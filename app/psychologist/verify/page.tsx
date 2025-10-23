"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { loginApiService } from "@/lib/services/loginApiService"
import { Loader2 } from "lucide-react"

type PendingAuth = {
  documento: string
  infoUsuario: {
    email?: { id: number; valor: string }
    emailSuper?: { id: number; valor: string }
    phoneNumber?: { id: number; valor: string }
  }
  permisos: any[]
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@")
  if (!user || !domain) return email
  const visible = user.slice(0, 2)
  return `${visible}${"*".repeat(Math.max(0, user.length - 2))}@${domain}`
}

function maskPhone(value: string) {
  const v = value.replace(/\D/g, "")
  if (v.length <= 4) return "****"
  return `${"*".repeat(v.length - 4)}${v.slice(-4)}`
}

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pending, setPending] = useState<PendingAuth | null>(null)
  const [selected, setSelected] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingAuth")
    if (!raw) {
      toast({ title: "Sesión inválida", description: "Vuelve a iniciar sesión.", variant: "destructive" })
      router.replace("/psychologist/login")
      return
    }
    try {
      const parsed = JSON.parse(raw) as PendingAuth
      setPending(parsed)
    } catch {
      router.replace("/psychologist/login")
    }
  }, [router, toast])

  const methods = useMemo(() => {
    if (!pending?.infoUsuario) return [] as Array<{ id: number; key: string; label: string }>
    const arr: Array<{ id: number; key: string; label: string }> = []
    if (pending.infoUsuario.email?.id && pending.infoUsuario.email?.valor) {
      arr.push({ id: pending.infoUsuario.email.id, key: "email", label: `Correo personal (${maskEmail(pending.infoUsuario.email.valor)})` })
    }
    if (pending.infoUsuario.emailSuper?.id && pending.infoUsuario.emailSuper?.valor) {
      arr.push({ id: pending.infoUsuario.emailSuper.id, key: "emailSuper", label: `Correo organizacional (${maskEmail(pending.infoUsuario.emailSuper.valor)})` })
    }
    if (pending.infoUsuario.phoneNumber?.id && pending.infoUsuario.phoneNumber?.valor) {
      arr.push({ id: pending.infoUsuario.phoneNumber.id, key: "phoneNumber", label: `Celular (${maskPhone(pending.infoUsuario.phoneNumber.valor)})` })
    }
    return arr
  }, [pending])

  useEffect(() => {
    if (methods.length && !selected) setSelected(String(methods[0].id))
  }, [methods, selected])

  const handleSend = async () => {
    if (!pending?.documento || !selected) return
    setIsSubmitting(true)
    try {
      const resp = await loginApiService.enviarToken(pending.documento, Number(selected))
      const idSession = (resp as any)?.data?.idSession || (resp as any)?.data?.idSesion || ""
      if (!idSession) throw new Error("No se recibió la sesión de verificación")
      sessionStorage.setItem("pendingAuthSessionId", idSession)
      
      // Obtener el método seleccionado para personalizar el mensaje
      const selectedMethod = methods.find((m) => String(m.id) === selected)
      let methodName = "el canal seleccionado"
      if (selectedMethod?.key === "email") methodName = "tu correo personal"
      if (selectedMethod?.key === "emailSuper") methodName = "tu correo organizacional"
      if (selectedMethod?.key === "phoneNumber") methodName = "tu celular"
      
      toast({ 
        title: "Código enviado exitosamente", 
        description: `Revisa ${methodName} para obtener tu código de verificación.`, 
        className: "border-green-600 bg-green-600 text-white",
        duration: 4000
      })
      router.push("/psychologist/verify/code")
    } catch (e: any) {
      toast({ 
        title: "Error al enviar el código", 
        description: e?.message || "No se pudo enviar el código. Por favor intenta nuevamente.", 
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Verificación en dos pasos</h1>
          <p className="text-sm text-muted-foreground">Selecciona cómo quieres recibir tu código de 6 caracteres.</p>
        </div>
        <div>
          <Label className="mb-2 block">Canal de verificación</Label>
          <RadioGroup value={selected} onValueChange={setSelected} className="space-y-3">
            {methods.map((m) => (
              <div key={m.id} className="flex items-center space-x-3 rounded-md border p-3">
                <RadioGroupItem value={String(m.id)} id={`m-${m.id}`} />
                <Label htmlFor={`m-${m.id}`} className="cursor-pointer">
                  {m.label}
                </Label>
              </div>
            ))}
            {!methods.length && (
              <div className="text-sm text-muted-foreground">No hay métodos disponibles. Vuelve a iniciar sesión.</div>
            )}
          </RadioGroup>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/psychologist/login")} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={!methods.length || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar código"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
