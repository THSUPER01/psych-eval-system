"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
      router.replace("/psychologist/login")
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
      router.replace("/psychologist/login")
      return
    } finally {
      setIsChecking(false)
    }
  }, [router])

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
      const resp = await loginApiService.verificarToken({
        documento: pending.documento,
        token: code,
        idSesion: sessionId,
        duracionSesion: keepActive ? 12 : 6,
      })
      const token = (resp as any)?.data?.token || (resp as any)?.data?.Token
      if (!token) throw new Error("No se recibio el token de sesion")

      login(token, pending.permisos)

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

      router.push("/dashboard/selection")
    } catch (error: any) {
      toast({
        title: "Codigo incorrecto",
        description: error?.message || "El codigo ingresado no es valido. Intenta nuevamente.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
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
        <Image
          src="/images/Recurso 27.png"
          alt="Ingreso con verificacion"
          fill
          className="object-cover"
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-background/10" />
        <div className="absolute bottom-8 left-8 right-8 space-y-3 text-black">
          <Image src="/images/Logo.png" alt="Super de Alimentos" width={165} height={48} />
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
            <h1 className="text-2xl font-semibold">Ingresa tu codigo</h1>
            <p className="text-sm text-muted-foreground">
              Encontraras un codigo alfanumerico de 6 caracteres en el canal que elegiste.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="block text-sm font-medium">Codigo de verificacion</Label>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={onChangeCode} disabled={isSubmitting} autoFocus>
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
              <p className="text-xs text-center text-muted-foreground">
                Solo letras (A-Z) y numeros (0-9). No distingue mayusculas.
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <Checkbox
                id="keep-session"
                checked={keepActive}
                onCheckedChange={(value) => setKeepActive(Boolean(value))}
                disabled={isSubmitting}
              />
              <Label htmlFor="keep-session" className="cursor-pointer text-sm">
                Mantener sesion activa por mas tiempo
              </Label>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.push("/psychologist/verify")}
              disabled={isSubmitting}
            >
              Cambiar metodo
            </Button>
            <Button onClick={handleVerify} disabled={isSubmitting || code.length !== 6}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
