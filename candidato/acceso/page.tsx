"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Footer from "@/components/footer"

export default function AccesoTokenPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar que el token no esté vacío
    if (!token.trim()) {
      setError("Por favor ingresa tu token de acceso")
      return
    }

    // Validar formato básico (32 caracteres hexadecimales)
    const tokenRegex = /^[a-f0-9]{32}$/i
    if (!tokenRegex.test(token.trim())) {
      setError("El formato del token no es válido. Debe ser un código de 32 caracteres.")
      return
    }

    setIsLoading(true)

    try {
      // Validar token contra el backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SELECCION_URL || 'http://localhost:5208/api'}/publico/candidato/${token.trim()}`,
        {
          method: 'GET',
          headers: {
            'App-Token': process.env.NEXT_PUBLIC_APP_TOKEN || 'B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438',
          },
        }
      )

      if (response.ok) {
        // Token válido, redirigir al dashboard del candidato
        router.push(`/candidato/${token.trim()}`)
      } else if (response.status === 404) {
        setError("Token no encontrado. Verifica que el código sea correcto.")
      } else {
        setError("Error al validar el token. Por favor intenta nuevamente.")
      }
    } catch (err) {
      setError("Error de conexión. Por favor verifica tu conexión a internet.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-background via-secondary/20 to-background overflow-hidden">
      {/* Imágenes decorativas */}
      <Image
        src="/images/Recurso 1@2x.png"
        alt=""
        width={220}
        height={220}
        className="absolute left-0 top-0 opacity-30 pointer-events-none select-none hidden md:block"
      />
      <Image
        src="/images/Recurso 2@2x.png"
        alt=""
        width={180}
        height={180}
        className="absolute right-0 top-10 opacity-20 pointer-events-none select-none hidden md:block"
      />

      <main className="flex-1 flex flex-col justify-center items-center container mx-auto px-4 py-16 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo y título */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/80 p-4 rounded-2xl shadow-lg flex items-center justify-center">
                <Image
                  src="/images/Logo.png"
                  alt="Logo Super de Alimentos"
                  width={60}
                  height={60}
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-primary">
              Acceso con Token
            </h1>
            <p className="text-muted-foreground">
              Ingresa el código que recibiste en tu correo electrónico
            </p>
          </div>

          {/* Formulario */}
          <Card className="shadow-xl border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Ingresa tu token
              </CardTitle>
              <CardDescription>
                El token es un código único de 32 caracteres que te fue enviado por correo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token">Token de Acceso</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="Ej: 09bd4bd45eef4667803c7692f65511ad"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value)
                      setError("")
                    }}
                    className="font-mono text-sm"
                    disabled={isLoading}
                    maxLength={32}
                  />
                  <p className="text-xs text-muted-foreground">
                    {token.length}/32 caracteres
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isLoading || !token.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Validando...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Ingresar
                      </>
                    )}
                  </Button>

                  <Link href="/" className="block">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full gap-2"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver al inicio
                    </Button>
                  </Link>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>💡 Consejo:</strong> Revisa tu bandeja de entrada o carpeta de spam. 
                  El correo proviene de nuestro sistema de selección.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Link de ayuda */}
          <div className="text-center text-sm text-muted-foreground">
            ¿No tienes un token?{" "}
            <Link href="/aplicar" className="text-primary hover:underline font-medium">
              Aplica a una vacante
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
