"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { loginApiService } from "@/lib/services/loginApiService"
import { useAuth } from "@/lib/hooks/useAuth"
import { Loader2 } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type PendingAuth = {
  documento: string
  permisos: any[]
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

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingAuth")
    const sid = sessionStorage.getItem("pendingAuthSessionId") || ""
    if (!raw || !sid) {
      toast({ title: "Sesión inválida", description: "Vuelve a iniciar sesión.", variant: "destructive" })
      router.replace("/psychologist/login")
      return
    }
    try {
      const parsed = JSON.parse(raw)
      setPending({ documento: parsed.documento, permisos: parsed.permisos })
      setSessionId(sid)
    } catch {
      router.replace("/psychologist/login")
    }
  }, [router, toast])

  const onChangeCode = (value: string) => {
    // Permitir tanto mayúsculas como minúsculas; solo filtrar caracteres no alfanuméricos
    const filtered = value.replace(/[^a-zA-Z0-9]/g, "")
    setCode(filtered.slice(0, 6))
  }

  const handleVerify = async () => {
    if (!pending?.documento || !sessionId) return
    if (code.length !== 6) {
      toast({ 
        title: "Código incompleto", 
        description: "Por favor ingresa los 6 caracteres del código.", 
        variant: "destructive",
        duration: 4000
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
      if (!token) throw new Error("No se recibió el token de sesión")
      
      // Ejecutar login (guarda en localStorage)
      login(token, (pending as any).permisos)
      
      // IMPORTANTE: También guardar en cookie para que el middleware reconozca la sesión
      if (typeof document !== 'undefined') {
        const maxAge = (keepActive ? 12 : 6) * 60 * 60 // segundos
        document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; SameSite=Lax`
        document.cookie = `appPermisos=${encodeURIComponent(JSON.stringify((pending as any).permisos))}; path=/; max-age=${maxAge}; SameSite=Lax`
      }
      
      // Limpiar estado temporal
      sessionStorage.removeItem("pendingAuth")
      sessionStorage.removeItem("pendingAuthSessionId")
      
      toast({ 
        title: "¡Bienvenido(a)!", 
        description: "Has iniciado sesión correctamente.", 
        className: "border-green-600 bg-green-600 text-white",
        duration: 3000
      })
      
      // Navegar al dashboard (ahora el middleware reconocerá la cookie)
      router.push("/dashboard/selection")
    } catch (e: any) {
      toast({ 
        title: "Código incorrecto", 
        description: "El código ingresado no es válido. Por favor verifica e intenta nuevamente.", 
        variant: "destructive",
        duration: 5000
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Verificación de dos pasos</h1>
          <p className="text-sm text-muted-foreground">
            Se ha enviado un código de verificación. Ingrésalo para continuar.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-center block">Código de verificación</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={onChangeCode}
                disabled={isSubmitting}
                autoFocus
              >
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
              Ingresa el código alfanumérico de 6 caracteres
            </p>
          </div>
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Checkbox 
              id="keep" 
              checked={keepActive} 
              onCheckedChange={(v) => setKeepActive(Boolean(v))}
              disabled={isSubmitting}
            />
            <Label htmlFor="keep" className="cursor-pointer">
              Mantener sesión activa por más tiempo
            </Label>
          </div>
        </div>
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push("/psychologist/verify")}
            disabled={isSubmitting}
          >
            Cambiar método
          </Button>
          <Button 
            onClick={handleVerify} 
            disabled={isSubmitting || code.length !== 6}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando…
              </>
            ) : (
              "Verificar"
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
