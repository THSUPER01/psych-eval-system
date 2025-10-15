import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, ClipboardList, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Brain className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 text-balance">Sistema de Evaluación Psicológica</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Plataforma profesional para gestionar evaluaciones psicológicas y recopilar información de candidatos de
            manera segura y eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Portal de Psicólogos</CardTitle>
              <CardDescription className="text-base">
                Gestiona requerimientos, visualiza respuestas y mantén un historial completo de cada candidato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Crear y enviar requerimientos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Ver respuestas de candidatos
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Subir documentos y pruebas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Historial completo
                </li>
              </ul>
              <Button asChild className="w-full" size="lg">
                <Link href="/psychologist/login">Acceder al Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">Portal de Candidatos</CardTitle>
              <CardDescription className="text-base">
                Completa tu formulario de evaluación de manera segura y confidencial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Formulario guiado paso a paso
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Información confidencial
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Acceso mediante link único
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Proceso simple y rápido
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
                <Link href="/candidate/demo">Ver Formulario Demo</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema seguro y confidencial para evaluaciones psicológicas profesionales
          </p>
        </div>
      </div>
    </div>
  )
}
