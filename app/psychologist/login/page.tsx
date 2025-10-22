import { LoginForm } from "@/components/psychologist/login-form"

export default function PsychologistLoginPage() {
  return (
    <div className="min-h-screen grid bg-gradient-to-br from-background via-secondary/20 to-background lg:grid-cols-2">
      {/* Ilustración */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="/images/LoginImage.png"
          alt="Ilustración de evaluación"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-background/10" />
        <div className="absolute bottom-8 left-8">
          <img src="/images/Logo.png" alt="Super de Alimentos" className="mb-6 h-14 w-auto" />
          <h2 className="text-3xl font-semibold leading-snug text-foreground">
            Sistema de Evaluación Psicológica
          </h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Plataforma segura para gestionar candidatos, evaluaciones y resultados.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-3">
            <img src="/images/Logo.png" alt="Super de Alimentos" className="h-10 w-auto" />
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Super de Alimentos S.A. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
