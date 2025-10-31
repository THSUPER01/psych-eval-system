"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Brain, Loader2 } from "lucide-react"

import LoadingScreen from "@/components/ui/loading-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { loginApiService } from "@/lib/services/loginApiService"
import { rolesService } from "@/lib/services/rolesService"

const PENDING_TOAST_KEY = "auth:nextToast"

type PendingToastPayload = {
  title: string
  description?: string
  variant?: "default" | "destructive"
  className?: string
  duration?: number
}

export function LoginForm() {
  const [documento, setDocumento] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateDocumento = (value: string): string[] => {
    const errs: string[] = []
    if (!/^\d{6,}$/.test(value)) {
      errs.push("Documento invalido: minimo 6 digitos numericos")
    }
    return errs
  }

  const persistToast = (payload: PendingToastPayload) => {
    if (typeof window === "undefined") return
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload))
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateDocumento(documento)
    setErrors(validationErrors)
    if (validationErrors.length) return
    setIsLoading(true)
    try {
      const validar = await loginApiService.validarUsuario(documento)
      const permisosResp = await rolesService.getPermisosRol(validar.rol)
      const permisos = permisosResp.data

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "pendingAuth",
          JSON.stringify({ documento, infoUsuario: validar.data, permisos }),
        )
        persistToast({
          title: "Usuario validado",
          description: "Selecciona tu metodo de verificacion para continuar.",
          className: "border-green-600 bg-green-600 text-white",
          duration: 3000,
        })
      }
      router.push("/psychologist/verify")
    } catch (err: any) {
      const mensaje = err?.message || "Documento no encontrado"
      toast({
        title: "Error de validacion",
        description: mensaje,
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <LoadingScreen message="Validando tu documento..." showProgress />}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-xl bg-primary/10 p-3">
              <Brain className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Portal de Psicologos</CardTitle>
          <CardDescription>Autenticacion segura por documento</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                type="text"
                inputMode="numeric"
                placeholder="Ingresa tu numero de documento"
                value={documento}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setDocumento(value)
                  setErrors(validateDocumento(value))
                }}
                disabled={isLoading}
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
                "Validar documento"
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

      {/* Flujo 2FA ahora se maneja en rutas dedicadas */}
    </>
  )
}
