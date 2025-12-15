import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import LoadingScreen from "@/components/ui/loading-screen"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { loginApiService } from "@/lib/services/loginApiService"

const PENDING_TOAST_KEY = "auth:nextToast"

type PendingToastPayload = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  className?: string
  duration?: number
}

type PendingAuth = {
  documento: string
  infoUsuario: {
    email?: { id: number; valor: string }
    emailSuper?: { id: number; valor: string }
    phoneNumber?: { id: number; valor: string }
  }
  permisos: any[]
}

const persistToast = (payload: PendingToastPayload) => {
  if (typeof window === "undefined") return
  sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload))
}

const maskEmail = (email: string) => {
  const [user, domain] = email.split("@")
  if (!user || !domain) return email
  const visible = user.slice(0, 2)
  return `${visible}${"*".repeat(Math.max(0, user.length - 2))}@${domain}`
}

const maskPhone = (value: string) => {
  const numeric = value.replace(/\D/g, "")
  if (numeric.length <= 4) return "****"
  return `${"*".repeat(numeric.length - 4)}${numeric.slice(-4)}`
}

export default function VerifyPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [pending, setPending] = useState<PendingAuth | null>(null)
  const [selected, setSelected] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("pendingAuth")
    if (!raw) {
      persistToast({
        title: "Sesion invalida",
        description: "Vuelve a iniciar sesion para continuar.",
        variant: "destructive",
        duration: 4000,
      })
      setIsChecking(false)
      navigate("/psicologo/login", { replace: true })
      return
    }
    try {
      const parsed = JSON.parse(raw) as PendingAuth
      setPending(parsed)
    } catch {
      persistToast({
        title: "Sesion invalida",
        description: "Debes iniciar sesion nuevamente.",
        variant: "destructive",
        duration: 4000,
      })
      navigate("/psicologo/login", { replace: true })
      return
    } finally {
      setIsChecking(false)
    }
  }, [navigate])

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem(PENDING_TOAST_KEY)
    if (!raw) return
    sessionStorage.removeItem(PENDING_TOAST_KEY)
    try {
      const parsed = JSON.parse(raw) as PendingToastPayload
      toast({
        title: parsed.title,
        description: parsed.description,
        variant: parsed.variant,
        className: parsed.className,
        duration: parsed.duration ?? 4000,
      })
    } catch {
      // ignore malformed payloads
    }
  }, [toast])

  const methods = useMemo(() => {
    if (!pending?.infoUsuario) return [] as Array<{ id: number; key: string; label: string }>
    const options: Array<{ id: number; key: string; label: string }> = []
    if (pending.infoUsuario.email?.id && pending.infoUsuario.email?.valor) {
      options.push({
        id: pending.infoUsuario.email.id,
        key: "email",
        label: `Correo personal (${maskEmail(pending.infoUsuario.email.valor)})`,
      })
    }
    if (pending.infoUsuario.emailSuper?.id && pending.infoUsuario.emailSuper?.valor) {
      options.push({
        id: pending.infoUsuario.emailSuper.id,
        key: "emailSuper",
        label: `Correo organizacional (${maskEmail(pending.infoUsuario.emailSuper.valor)})`,
      })
    }
    if (pending.infoUsuario.phoneNumber?.id && pending.infoUsuario.phoneNumber?.valor) {
      options.push({
        id: pending.infoUsuario.phoneNumber.id,
        key: "phoneNumber",
        label: `Celular (${maskPhone(pending.infoUsuario.phoneNumber.valor)})`,
      })
    }
    return options
  }, [pending])

  useEffect(() => {
    if (methods.length && !selected) setSelected(String(methods[0].id))
  }, [methods, selected])

  const handleSend = async () => {
    if (!pending?.documento || !selected) return
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const resp = await loginApiService.enviarToken(pending.documento, Number(selected))
      const idSession = (resp as any)?.data?.idSession || (resp as any)?.data?.idSesion || ""
      if (!idSession) throw new Error("No se recibio la sesion de verificacion")
      sessionStorage.setItem("pendingAuthSessionId", idSession)

      const selectedMethod = methods.find((m) => String(m.id) === selected)
      let methodName = "el canal seleccionado"
      if (selectedMethod?.key === "email") methodName = "tu correo personal"
      if (selectedMethod?.key === "emailSuper") methodName = "tu correo organizacional"
      if (selectedMethod?.key === "phoneNumber") methodName = "tu celular"

      persistToast({
        title: "Codigo enviado",
        description: `Revisa ${methodName} para obtener tu codigo de verificacion.`,
        className: "border-green-600 bg-green-600 text-white",
        duration: 4000,
      })
      
      await new Promise(resolve => setTimeout(resolve, 500))
      navigate("/psicologo/verify/code")
    } catch (error: any) {
      setIsSubmitting(false)
      toast({
        title: "Error al enviar el codigo",
        description: error?.message || "No se pudo enviar el codigo. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const showLoader = isChecking || isSubmitting
  const loaderMessage = isChecking
    ? "Cargando opciones de verificacion..."
    : "Enviando codigo de verificacion..."

  return (
    <div className="min-h-screen grid bg-gradient-to-br from-background via-secondary/20 to-background lg:grid-cols-2">
      {showLoader && <LoadingScreen message={loaderMessage} showProgress />}

      <div className="relative hidden overflow-hidden lg:flex">
        <img
          src="/images/Recurso 18.png"
          alt="Verificacion de identidad"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/10" />
        <div className="absolute bottom-8 left-8 right-8 space-y-3 text-black">
          <img src="/images/Logo.png" alt="Super de Alimentos" className="h-12 w-auto" />
          <h2 className="text-3xl font-semibold leading-snug text-black">
            Seguridad reforzada para proteger tu informacion
          </h2>
          <p className="max-w-md text-sm text-black/80">
            Selecciona el canal que prefieras para recibir el codigo temporal y completar tu ingreso.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-lg p-6 shadow-lg shadow-primary/10 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Verificacion en dos pasos</h1>
            <p className="text-sm text-muted-foreground">
              Escoge donde quieres recibir el codigo de 6 caracteres para confirmar tu identidad.
            </p>
          </div>
          <div>
            <Label className="mb-3 block text-sm font-medium">Canal de verificacion</Label>
            <RadioGroup value={selected} onValueChange={setSelected} className="space-y-3">
              {methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:border-primary"
                >
                  <RadioGroupItem value={String(method.id)} id={`method-${method.id}`} />
                  <Label htmlFor={`method-${method.id}`} className="cursor-pointer">
                    {method.label}
                  </Label>
                </div>
              ))}
              {!methods.length && (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No encontramos canales de verificacion disponibles. Vuelve a iniciar sesion.
                </div>
              )}
            </RadioGroup>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/psicologo/login")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleSend} disabled={!methods.length || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar codigo"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
