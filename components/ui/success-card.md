# SuccessCard Component

Componente reutilizable para mostrar pantallas de confirmación de éxito con diseño profesional y personalizable.

## Props

```typescript
interface SuccessCardProps {
  // Requerido
  icon: ReactNode                    // Icono a mostrar (ej: CheckCircle2)
  title: string                      // Título principal
  description: string                // Descripción principal

  // Opcional
  subtitle?: string                  // Subtítulo bajo el título
  additionalContent?: ReactNode      // Contenido adicional (ej: retroalimentación)
  
  badge?: {
    label: string                    // Texto del badge
    variant?: "default" | "secondary" | "destructive" | "outline"
    className?: string               // Clases Tailwind personalizadas
  }
  
  primaryButton?: {
    label: string
    onClick: () => void
  }
  
  secondaryButton?: {
    label: string
    onClick: () => void
  }
  
  // Personalización de colores
  headerGradient?: string            // Ej: "from-green-50 to-emerald-50"
  iconBgColor?: string               // Ej: "bg-green-100"
  iconClassName?: string             // Ej: "text-green-600"
  
  // Imagen decorativa
  decorativeImage?: {
    src: string
    alt: string
    width?: number
    height?: number
  }
}
```

## Ejemplos de Uso

### Éxito Simple
```tsx
<SuccessCard
  icon={<CheckCircle2 className="h-10 w-10" />}
  title="¡Proceso completado!"
  description="Tu solicitud ha sido enviada exitosamente."
  headerGradient="from-green-50 to-emerald-50"
  iconBgColor="bg-green-100"
  iconClassName="text-green-600"
  badge={{
    label: "Estado: Completado",
    className: "bg-green-50 text-green-700 border-green-200",
  }}
/>
```

### Con Contenido Adicional
```tsx
<SuccessCard
  icon={<XCircle className="h-10 w-10" />}
  title="Solicitud rechazada"
  subtitle="Por favor revisa la retroalimentación"
  description="Gracias por tu participación."
  additionalContent={
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="font-semibold text-sm mb-2">Razón:</p>
      <p className="text-sm text-gray-600">No cumple con los requisitos mínimos</p>
    </div>
  }
  headerGradient="from-red-50 to-rose-50"
  iconBgColor="bg-red-100"
  iconClassName="text-red-600"
  badge={{
    label: "No aprobado",
    className: "bg-red-50 text-red-700 border-red-200",
  }}
/>
```

### Con Botones
```tsx
<SuccessCard
  icon={<CheckCircle2 className="h-10 w-10" />}
  title="¡Bienvenido!"
  description="Tu cuenta ha sido creada exitosamente."
  primaryButton={{
    label: "Ir al dashboard",
    onClick: () => router.push("/dashboard"),
  }}
  secondaryButton={{
    label: "Ver guía",
    onClick: () => setShowGuide(true),
  }}
  headerGradient="from-blue-50 to-indigo-50"
  iconBgColor="bg-blue-100"
  iconClassName="text-blue-600"
/>
```

### Con Imagen
```tsx
<SuccessCard
  icon={<Brain className="h-10 w-10" />}
  title="En evaluación"
  description="Tu perfil está siendo revisado."
  decorativeImage={{
    src: "/images/evaluation.svg",
    alt: "Evaluación en progreso",
    width: 300,
    height: 200,
  }}
  headerGradient="from-purple-50 to-pink-50"
  iconBgColor="bg-purple-100"
  iconClassName="text-purple-600"
/>
```

## Esquemas de Color Predefinidos

### Verde (Aprobación)
```tsx
headerGradient="from-green-50 to-emerald-50"
iconBgColor="bg-green-100"
iconClassName="text-green-600"
```

### Rojo (Rechazo)
```tsx
headerGradient="from-red-50 to-rose-50"
iconBgColor="bg-red-100"
iconClassName="text-red-600"
```

### Azul (En proceso)
```tsx
headerGradient="from-blue-50 to-indigo-50"
iconBgColor="bg-blue-100"
iconClassName="text-blue-600"
```

### Esmeralda (Completado)
```tsx
headerGradient="from-emerald-50 to-teal-50"
iconBgColor="bg-emerald-100"
iconClassName="text-emerald-600"
```

### Púrpura (Especial)
```tsx
headerGradient="from-purple-50 to-pink-50"
iconBgColor="bg-purple-100"
iconClassName="text-purple-600"
```

## Características

- ✅ Totalmente responsive
- ✅ Soporta icons de lucide-react
- ✅ Personalizable con colores
- ✅ Decoraciones de fondo animadas
- ✅ Badges con variantes
- ✅ Botones opcionales
- ✅ Contenido adicional flexible
- ✅ Soporta imágenes decorativas
