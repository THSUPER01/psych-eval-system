"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { loginApiService } from "@/lib/services/loginApiService"
import { rolesService } from "@/lib/services/rolesService"
import { VerificationModal } from "@/components/auth/VerificationModal"
import { useAuth } from "@/lib/hooks/useAuth"

export function LoginForm() {
  const [documento, setDocumento] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const validateDocumento = (value: string): string[] => {
    const errs: string[] = []
    if (!/^\d{6,}$/.test(value)) {
      errs.push("Documento inválido: mínimo 6 dígitos numéricos")
    }
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validateDocumento(documento)
    setErrors(v)
    if (v.length) return
    setIsLoading(true)
    try {
      // 1. Validar usuario
      const validar = await loginApiService.validarUsuario(documento)
      // 2. Obtener permisos del rol
      const permisosResp = await rolesService.getPermisosRol(validar.rol)
      const permisos = permisosResp.data
      // 3. Verificar si requiere 2FA
      const requiere2FA = permisos.some((p) => p.accAccion === 'Requiere doble autenticación')
      if (requiere2FA) {
        setUserData({ documento, infoUsuario: validar.data, permisos })
        setShowVerification(true)
      } else {
        const jwtResp = await loginApiService.obtenerJWT(documento, 12)
        const token = jwtResp.data.token || jwtResp.data.Token
        if (!token) throw new Error('No se recibió token')
        login(token, permisos)
        toast({ title: 'Inicio de sesión exitoso', description: 'Bienvenido al dashboard' })
        router.push('/psychologist/dashboard')
      }
    } catch (err: any) {
      const mensaje = err?.message || 'Error al iniciar sesión'
      toast({ title: 'Error', description: mensaje, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-xl bg-primary/10 p-3">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Portal de Psicólogos</CardTitle>
          <CardDescription>Autenticación segura por documento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                type="text"
                inputMode="numeric"
                placeholder="Ingresa tu número de documento"
                value={documento}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '')
                  setDocumento(v)
                  setErrors(validateDocumento(v))
                }}
                required
              />
              {errors.length > 0 && <p className="text-sm text-red-600">{errors[0]}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar documento'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>

      {showVerification && userData && (
        <VerificationModal
          documento={userData.documento}
          infoUsuario={userData.infoUsuario}
          permisos={userData.permisos}
          onClose={() => setShowVerification(false)}
        />
      )}
    </>
  )
}
