import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import LoadingScreen from "@/components/ui/loading-screen"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/useAuth"
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
  permisos: any[]
}

const persistToast = (payload: PendingToastPayload) => {
  if (typeof window === "undefined") return
  sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload))
}

export default function VerifyCodePage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { toast } = useToast()
  const [pending, setPending] = useState<PendingAuth | null>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [code, setCode] = useState<string>("")
  const [keepActive, setKeepActive] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("pendingAuth")
    const sid = sessionStorage.getItem("pendingAuthSessionId") || ""
    if (!raw || !sid) {
      persistToast({
        title: "Sesion invalida",
        description: "Debes validar tu documento nuevamente.",
        variant: "destructive",
        duration: 4000,
      })
      setIsChecking(false)
      navigate("/psicologo/login", { replace: true })
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setPending({ documento: parsed.documento, permisos: parsed.permisos })
      setSessionId(sid)
    } catch {
      persistToast({
        title: "Sesion invalida",
        description: "Ocurrio un problema con la informacion de verificacion.",
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

  const onChangeCode = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9]/g, "")
    setCode(filtered.slice(0, 6))
  }

  const handleVerify = async () => {
    if (!pending?.documento || !sessionId) return
    if (code.length !== 6) {
      toast({
        title: "Codigo incompleto",
        description: "Debes ingresar los 6 caracteres del codigo.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const resp = await loginApiService.verificarToken({
        documento: pending.documento,
        token: code,
        idSesion: sessionId,
        duracionSesion: keepActive ? 12 : 6,
      })
      const token = (resp as any)?.data?.token || (resp as any)?.data?.Token
      if (!token) throw new Error("No se recibio el token de sesion")

      login(token, pending.permisos, pending.documento)

      if (typeof document !== "undefined") {
        const maxAge = (keepActive ? 12 : 6) * 60 * 60
        document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
        document.cookie = `appPermisos=${encodeURIComponent(
          JSON.stringify(pending.permisos),
        )}; path=/; max-age=${maxAge}; SameSite=Lax`
      }

      sessionStorage.removeItem("pendingAuth")
      sessionStorage.removeItem("pendingAuthSessionId")

      toast({
        title: "Bienvenido",
        description: "Tu inicio de sesion fue exitoso.",
        className: "border-green-600 bg-green-600 text-white",
        duration: 3000,
      })

      await new Promise(resolve => setTimeout(resolve, 600))
      navigate("/panel/seleccion")
    } catch (error: any) {
      setIsSubmitting(false)
      toast({
        title: "Codigo incorrecto",
        description: error?.message || "El codigo ingresado no es valido. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const showLoader = isChecking || isSubmitting
  const loaderMessage = isChecking
    ? "Verificando informacion previa..."
    : "Confirmando tu codigo..."

  return (
    <div className="min-h-screen grid bg-gradient-to-br from-background via-secondary/20 to-background lg:grid-cols-2">
      {showLoader && <LoadingScreen message={loaderMessage} showProgress />}

      <div className="relative hidden overflow-hidden lg:flex lg:w-[55vw]">
        <img
          src="/images/Recurso 27.png"
          alt="Ingreso con verificacion"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-background/10" />
        <div className="absolute bottom-8 left-8 right-8 space-y-3 text-black">
          <img src="/images/Logo.png" alt="Super de Alimentos" className="h-12 w-auto" />
          <h2 className="text-3xl font-semibold leading-snug">
            Ingresa el codigo temporal para finalizar tu acceso
          </h2>
          <p className="max-w-md text-sm text-black/80">
            Por tu seguridad este codigo solo estara activo unos minutos. Mantelo en privado.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md space-y-6 p-6 shadow-lg shadow-primary/10">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Verifica tu codigo</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa el codigo de 6 caracteres que recibiste
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={onChangeCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keepActive"
                checked={keepActive}
                onCheckedChange={(checked) => setKeepActive(checked as boolean)}
              />
              <Label htmlFor="keepActive" className="text-sm cursor-pointer">
                Mantener sesion activa por 12 horas (en lugar de 6)
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/psicologo/login")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleVerify} disabled={code.length !== 6 || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar codigo"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
