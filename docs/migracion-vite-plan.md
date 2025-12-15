# Plan de Migración: Next.js → Vite + React SPA

**Fecha:** 12 de Diciembre, 2025  
**Sistema:** Evaluación Psicológica - Super de Alimentos S.A.  
**Objetivo:** Migrar desde Next.js 15 (App Router + SSR) a SPA pura con Vite + React + TypeScript

---

## 1. RESUMEN EJECUTIVO

### Sistema Actual
- **Framework:** Next.js 15.2.4 con App Router
- **Lenguaje:** TypeScript 5.7.3
- **UI:** shadcn/ui + Radix UI + TailwindCSS 4.1.9
- **State Management:** React Context (AuthContext) + TanStack Query v5
- **Autenticación:** JWT con SSO desde sistema CONECTA + middleware
- **Backend:** APIs REST .NET (separadas, no se modifican)

### Arquitectura Actual
**Dos portales independientes:**
1. **Portal Psicólogos** → Login + 2FA → Panel de selección
2. **Portal Candidatos** → Acceso por token único → Formularios de pruebas

---

## 2. MAPEO DE RUTAS: NEXT.JS → VITE SPA

### 2.1 Rutas Públicas

| Next.js (App Router) | Vite (React Router) | Tipo | Descripción |
|---------------------|---------------------|------|-------------|
| `/` | `/` | Public | Página de inicio con links a ambos portales |
| `/aplicar` | `/aplicar` | Public | Formulario público de aplicación de candidatos |
| `/psicologo/login` | `/psicologo/login` | Public | Login psicólogos (email + contraseña) |
| `/psicologo/verify` | `/psicologo/verify` | Public | Verificación 2FA por email |
| `/psicologo/verify/code` | `/psicologo/verify/code` | Public | Ingreso de código 2FA |
| `/candidato/[token]` | `/candidato/:token` | Public | Formulario demográfico (sin auth) |
| `/candidato/acceso` | `/candidato/acceso` | Public | Solicitar acceso con token |
| `/prueba/16pf/[token]` | `/prueba/16pf/:token` | Public | Test 16PF (185 preguntas, tokenizado) |
| `/prueba/16pf/[token]/exito` | `/prueba/16pf/:token/exito` | Public | Confirmación 16PF completado |
| `/prueba/cmt/[token]` | `/prueba/cmt/:token` | Public | Test CMT (72 preguntas, tokenizado) |
| `/prueba/cmt/[token]/exito` | `/prueba/cmt/:token/exito` | Public | Confirmación CMT completado |

### 2.2 Rutas Protegidas (Requieren Auth)

| Next.js (App Router) | Vite (React Router) | Rol | Descripción |
|---------------------|---------------------|-----|-------------|
| `/panel/seleccion` | `/panel/seleccion` | Psicólogo | Dashboard principal con KPIs |
| `/panel/seleccion/requerimientos` | `/panel/seleccion/requerimientos` | Psicólogo | Lista de requerimientos |
| `/panel/seleccion/requerimientos/[id]` | `/panel/seleccion/requerimientos/:id` | Psicólogo | Detalle de requerimiento |
| `/panel/seleccion/candidatos` | `/panel/seleccion/candidatos` | Psicólogo | Lista de candidatos |
| `/panel/seleccion/candidatos/[id]` | `/panel/seleccion/candidatos/:id` | Psicólogo | Detalle de candidato |
| `/panel/seleccion/pruebas` | `/panel/seleccion/pruebas` | Psicólogo | Gestión de pruebas |
| `/panel/seleccion/pruebas/[id]` | `/panel/seleccion/pruebas/:id` | Psicólogo | Detalle de prueba |
| `/panel/seleccion/resultados` | `/panel/seleccion/resultados` | Psicólogo | Resultados de evaluaciones |
| `/panel/seleccion/resultados/[id]` | `/panel/seleccion/resultados/:id` | Psicólogo | Resultado individual |
| `/panel/seleccion/configuracion` | `/panel/seleccion/configuracion` | Psicólogo | Configuración del sistema |

**Total:** 11 rutas públicas + 10 rutas protegidas = **21 rutas principales**

---

## 3. ANÁLISIS DE COMPONENTES Y LÓGICA

### 3.1 Componentes UI (shadcn/ui) - Reutilizables 100%
**Ubicación actual:** `components/ui/` (40+ componentes)

✅ **Estrategia:** Copiar directamente a Vite, solo ajustar imports de Next
- `next/image` → `<img>` nativa o librería de lazy loading
- Todos los componentes son client-side, no hay modificaciones mayores

**Componentes críticos:**
- Button, Card, Dialog, Alert, Badge, Skeleton
- Form, Input, Select, Checkbox, Radio
- Table, Tabs, Toast, Progress
- Sheet, ScrollArea, Tooltip

### 3.2 Componentes de Negocio

#### **Candidatos** (`components/candidate/`)
- `candidate-form.tsx` → Formulario demográfico (Manizales data)
- `public-application-form.tsx` → Aplicación pública
- `OnboardingScreen.tsx` → Pantalla bienvenida
- `WelcomeScreen.tsx` → Pantalla intro

#### **Psicólogos** (`components/psychologist/`)
- `login-form.tsx` → Login + 2FA flow

#### **Panel Selección** (`components/selection/`)
- `SelectionSidebar.tsx` → Navegación lateral
- `SelectionHeader.tsx` → Header con usuario
- `CandidatosList.tsx` → Tabla de candidatos
- `CrearRequerimientoDialog.tsx` → Modal crear requerimiento
- `AgregarCandidatoDialog.tsx` → Modal agregar candidato
- `EnviarLinkDialog.tsx` → Modal enviar link de test
- `AsignarCmtDialog.tsx` → Asignar CMT
- `AsignarRequerimientoDialog.tsx` → Asignar a requerimiento
- `RegistrarResultadoDialog.tsx` → Registrar resultados
- `CmtResultadoChart.tsx` → Gráficos CMT
- `NotificationBell.tsx` → Notificaciones

#### **Tests 16PF** (`components/test16pf/`)
- `Question16PF.tsx` → Componente de pregunta
- `Progress16PF.tsx` → Barra de progreso
- `Resultado16PF.tsx` → Visualización de resultados

#### **Autenticación** (`components/auth/`)
- `ProtectedRoute.tsx` → HOC/Guard para rutas protegidas
- `TokenModal.tsx` → Modal de validación token
- `VerificationModal.tsx` → Modal verificación 2FA

### 3.3 Servicios API (Ya preparados para SPA)
**Ubicación:** `lib/services/`

✅ **No requieren cambios**, ya usan fetch puro:
- `authService.ts` → Manejo de JWT en localStorage
- `selectionApiService.ts` → CRUD requerimientos, candidatos, pruebas
- `test16pfService.ts` → Test 16PF (preguntas, respuestas)
- `candidatePublicApiService.ts` → APIs públicas para candidatos
- `loginApiService.ts` → Login y 2FA
- `rolesService.ts` → Roles y permisos
- `notificationsService.ts` → Notificaciones

**Variables de entorno actuales:**
```env
NEXT_PUBLIC_API_SELECCION_URL=http://localhost:5208/api
NEXT_PUBLIC_MS_LOGIN_URL=http://localhost:5065/api
NEXT_PUBLIC_MS_ROLES_URL=http://localhost:5137/api
NEXT_PUBLIC_APP_TOKEN=B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438
NEXT_PUBLIC_CONECTA_HOSTNAME=app.administracionsuper.com
NEXT_PUBLIC_CONECTA_PATH=/CONECTA
NEXT_PUBLIC_SESSION_DURATION_SSO=8
```

### 3.4 Hooks Custom (React Query)
**Ubicación:** `lib/hooks/`

✅ **Compatibles con Vite**, solo ajustar imports:
- `useAuth.ts` → Context de autenticación
- `useSelection.ts` → React Query hooks (requerimientos, candidatos)
- `useCandidatePublic.ts` → Hooks para candidatos públicos
- `use-toast.ts` → Notificaciones toast
- `use-mobile.ts` → Responsive detection
- `use-notifications.ts` → Sistema de notificaciones

### 3.5 Context Providers
**Ubicación:** `lib/context/`

- `AuthContext.tsx` → Estado de autenticación global
- Se mantiene igual, solo ajustar `useRouter` de Next → `useNavigate` de React Router

---

## 4. DATA FETCHING: ANTES Y DESPUÉS

### ❌ ANTES (Next.js)
```tsx
// pages/panel/seleccion/page.tsx
"use client"
import { useRequerimientos } from '@/lib/hooks/useSelection'

export default function SelectionDashboardPage() {
  const { data, isLoading } = useRequerimientos() // React Query
  // ...
}
```

### ✅ DESPUÉS (Vite)
```tsx
// src/pages/panel/seleccion/DashboardPage.tsx
import { useRequerimientos } from '@/lib/hooks/useSelection'

export default function SelectionDashboardPage() {
  const { data, isLoading } = useRequerimientos() // React Query (IGUAL)
  // ...
}
```

**Conclusión:** La mayoría del código ya es compatible al usar React Query en client components.

---

## 5. ELIMINACIONES Y REEMPLAZOS NECESARIOS

### 5.1 Eliminar/Reemplazar

| Next.js Feature | Reemplazo Vite |
|----------------|----------------|
| `next/image` → `<Image>` | `<img>` nativa o `react-lazy-load-image-component` |
| `next/link` → `<Link>` | `react-router-dom` → `<Link>` |
| `next/navigation` → `useRouter()` | `react-router-dom` → `useNavigate()` |
| `next/navigation` → `usePathname()` | `react-router-dom` → `useLocation()` |
| `next/navigation` → `useSearchParams()` | `react-router-dom` → `useSearchParams()` |
| `middleware.ts` (SSO auto-login) | ⚠️ Mover lógica a frontend o backend |
| `app/layout.tsx` (Root Layout) | `src/App.tsx` con providers |
| Font loading (Next) | Import directo de Google Fonts en CSS |
| `@vercel/analytics` | Configurar analytics via script tag |

### 5.2 Middleware de SSO
**Problema:** El `middleware.ts` actual intercepta requests con `?doc=XXXX` y hace auto-login SSO desde CONECTA.

**Solución Vite:**
1. **Opción A (Recomendada):** Crear un `/api/sso-login` endpoint en backend .NET que haga la misma lógica
2. **Opción B:** En el frontend, detectar `?doc=` en URL y hacer las llamadas al MS_LOGIN_URL desde el componente de login

**Implementaremos Opción B** para mantener la arquitectura stateless del backend.

---

## 6. ARQUITECTURA DE LA SPA

```
vite-psych-eval-system/
├── public/
│   └── images/              # Assets estáticos (logos, decoraciones)
├── src/
│   ├── main.tsx             # Entry point (ReactDOM.render)
│   ├── App.tsx              # Router principal + Providers
│   ├── routes/              # Configuración de rutas
│   │   ├── index.tsx        # Definición de todas las rutas
│   │   ├── ProtectedRoute.tsx  # Guard de autenticación
│   │   └── PublicRoute.tsx  # Rutas públicas (opcional)
│   ├── pages/               # Componentes de página (equivalente a app/)
│   │   ├── HomePage.tsx
│   │   ├── AplicarPage.tsx
│   │   ├── psicologo/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── VerifyPage.tsx
│   │   │   └── VerifyCodePage.tsx
│   │   ├── candidato/
│   │   │   ├── CandidatoFormPage.tsx
│   │   │   └── AccesoPage.tsx
│   │   ├── prueba/
│   │   │   ├── Test16PFPage.tsx
│   │   │   ├── Test16PFExitoPage.tsx
│   │   │   ├── TestCMTPage.tsx
│   │   │   └── TestCMTExitoPage.tsx
│   │   └── panel/
│   │       └── seleccion/
│   │           ├── DashboardPage.tsx
│   │           ├── RequerimientosPage.tsx
│   │           ├── RequerimientoDetallePage.tsx
│   │           ├── CandidatosPage.tsx
│   │           ├── CandidatoDetallePage.tsx
│   │           ├── PruebasPage.tsx
│   │           ├── ResultadosPage.tsx
│   │           └── ConfiguracionPage.tsx
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/
│   │   ├── candidate/
│   │   ├── psychologist/
│   │   ├── selection/
│   │   ├── test16pf/
│   │   └── common/          # Compartidos (Footer, Header, etc.)
│   ├── lib/                 # Utilidades, helpers, contextos
│   │   ├── services/        # API services (sin cambios)
│   │   ├── hooks/           # Custom hooks (React Query)
│   │   ├── context/         # React contexts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── manizales-data.ts
│   ├── types/               # TypeScript types
│   ├── styles/
│   │   └── globals.css      # TailwindCSS + estilos globales
│   └── data/                # JSON estáticos (barrios, comunas)
├── .env                     # Variables de entorno (VITE_*)
├── .env.example
├── vite.config.ts           # Configuración de Vite
├── tailwind.config.ts       # TailwindCSS
├── tsconfig.json
├── package.json
└── README.md
```

---

## 7. DECISIONES TÉCNICAS

### 7.1 Router
**Elección:** React Router v6 (DOM)

**Razones:**
- Estándar de la industria para SPAs
- Soporta rutas anidadas, lazy loading, guards
- API similar a Next.js navigation hooks
- Excelente documentación

**Configuración:**
```tsx
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import HomePage from '@/pages/HomePage'
// ...

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/aplicar', element: <AplicarPage /> },
  { 
    path: '/panel/seleccion', 
    element: <ProtectedRoute><SelectionLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'requerimientos', element: <RequerimientosPage /> },
      // ...
    ]
  },
  // ...
])
```

### 7.2 State Management
**Mantener:** React Context + TanStack Query v5

**Razones:**
- Ya implementado y funcional
- React Query maneja cache y sincronización de servidor
- AuthContext suficiente para estado global de auth
- No necesitamos Redux/Zustand para este caso

### 7.3 Estilos
**Mantener:** TailwindCSS 4.1.9

**Ajustes:**
- Migrar `tailwind.config.js` de Next → Vite
- Copiar `globals.css` completo
- Mantener fuente Poppins (importar desde Google Fonts)
- Conservar tema OKLCH y variables CSS

### 7.4 Build y Deployment
**Configuración Vite:**
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['@tanstack/react-query'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'charts': ['recharts', 'chart.js', 'react-chartjs-2'],
        },
      },
    },
  },
})
```

**Deployment:**
- Build estático: `npm run build` → `dist/`
- Deploy a: Vercel, Netlify, Azure Static Web Apps, o servidor Nginx/Apache
- Variables de entorno: `.env` con prefijo `VITE_` en lugar de `NEXT_PUBLIC_`

---

## 8. PLAN DE EJECUCIÓN (Fases)

### ✅ FASE 1: Análisis y Planificación
- [x] Mapear rutas y componentes
- [x] Identificar dependencias de Next.js
- [x] Documentar decisiones técnicas

### 🔄 FASE 2: Setup Proyecto Vite (ACTUAL)
- [ ] Crear proyecto: `npm create vite@latest vite-psych-eval-system -- --template react-ts`
- [ ] Configurar TailwindCSS 4.1.9
- [ ] Configurar alias de paths (`@/`)
- [ ] Configurar React Router v6
- [ ] Configurar `.env` con variables `VITE_*`
- [ ] Instalar dependencias: React Query, Radix UI, etc.
- [ ] Migrar `globals.css` y configuración de fuentes

### 📦 FASE 3: Migración de Base (UI + Utils)
- [ ] Copiar `components/ui/` completo (shadcn)
- [ ] Copiar `lib/utils.ts`, `lib/validations.ts`
- [ ] Copiar `lib/services/` (sin cambios)
- [ ] Copiar `types/` completo
- [ ] Copiar `data/` (JSONs de Manizales)
- [ ] Copiar `hooks/` (ajustar imports de Next)

### 🔐 FASE 4: Autenticación y Context
- [ ] Migrar `AuthContext.tsx` (reemplazar `useRouter` → `useNavigate`)
- [ ] Crear `ProtectedRoute` guard para React Router
- [ ] Migrar `authService.ts` (ya compatible)
- [ ] Implementar SSO auto-login en frontend (detectar `?doc=`)
- [ ] Migrar componentes de login y 2FA

### 🏠 FASE 5: Rutas Públicas
- [ ] Migrar página de inicio (`/`)
- [ ] Migrar página de aplicación (`/aplicar`)
- [ ] Migrar formulario de candidato (`/candidato/:token`)
- [ ] Probar flujo de acceso por token

### 🔬 FASE 6: Pruebas Psicométricas
- [ ] Migrar Test 16PF (`/prueba/16pf/:token`)
- [ ] Migrar Test CMT (`/prueba/cmt/:token`)
- [ ] Migrar páginas de éxito
- [ ] Probar guardado local de respuestas
- [ ] Probar envío de resultados a API

### 👨‍⚕️ FASE 7: Panel de Psicólogos
- [ ] Crear layout protegido con sidebar
- [ ] Migrar Dashboard (`/panel/seleccion`)
- [ ] Migrar Requerimientos (lista y detalle)
- [ ] Migrar Candidatos (lista y detalle)
- [ ] Migrar Pruebas y Resultados
- [ ] Migrar Configuración
- [ ] Probar todos los CRUDs y flujos

### 🧪 FASE 8: Testing y Optimización
- [ ] Verificar `npm run build` sin errores
- [ ] Verificar `npm run lint` (ESLint)
- [ ] Probar flujos críticos end-to-end
- [ ] Optimizar bundle size (code splitting)
- [ ] Verificar lazy loading de rutas
- [ ] Probar en diferentes navegadores

### 📚 FASE 9: Documentación
- [ ] Actualizar README con instrucciones de Vite
- [ ] Documentar cambios vs Next.js
- [ ] Documentar deploy a producción
- [ ] Crear CHANGELOG.md

---

## 9. RIESGOS Y MITIGACIÓN

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Pérdida de funcionalidad SSO | Alto | Implementar lógica SSO en frontend con llamadas directas a MS_LOGIN |
| Problemas con lazy loading de imágenes | Medio | Usar `react-lazy-load-image-component` o nativas HTML |
| Ruptura de rutas dinámicas | Alto | Testear exhaustivamente rutas con params `:token`, `:id` |
| Pérdida de optimizaciones de Next | Bajo | Vite es igual o más rápido, bundle size controlado con code splitting |
| Incompatibilidad de shadcn/ui | Bajo | shadcn es framework-agnostic, solo ajustar imports |
| Variables de entorno no cargadas | Medio | Documentar cambio de `NEXT_PUBLIC_*` → `VITE_*` |

---

## 10. CHECKLIST DE MIGRACIÓN

### Antes de Empezar
- [x] Backup del proyecto Next.js actual
- [x] Crear rama `feature/migracion-vite-evaluacion`
- [x] Análisis completo de dependencias

### Durante la Migración
- [ ] Trabajar fase por fase (no saltar pasos)
- [ ] Commit frecuente con mensajes descriptivos
- [ ] Probar cada módulo antes de continuar
- [ ] Mantener compatibilidad con APIs backend (no cambiar contratos)

### Antes del Merge
- [ ] Build sin errores ni warnings críticos
- [ ] Todos los flujos funcionales probados
- [ ] README actualizado
- [ ] Variables de entorno documentadas
- [ ] Code review interno

---

## 11. COMANDOS Y SCRIPTS

### Next.js (Actual)
```bash
npm run dev          # Dev server puerto 3000
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # ESLint check
```

### Vite (Nuevo)
```bash
npm run dev          # Dev server puerto 3000 (Vite HMR ultra-rápido)
npm run build        # Build producción → dist/
npm run preview      # Preview build local
npm run lint         # ESLint check
```

---

## 12. REFERENCIAS

### Documentación Oficial
- [Vite](https://vitejs.dev/)
- [React Router v6](https://reactrouter.com/)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [TailwindCSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

### Guías de Migración
- [Next.js to Vite Migration Guide](https://vitejs.dev/guide/migration-from-next.html)
- [React Router Migration from Next.js](https://reactrouter.com/en/main/start/tutorial)

---

## 13. NOTAS IMPORTANTES

### ⚠️ NO MODIFICAR
- Contratos de APIs backend (.NET)
- Estructura de datos en `types/`
- Lógica de negocio en servicios

### ✅ MANTENER
- TailwindCSS y tema visual
- shadcn/ui components
- React Query hooks
- Estructura de carpetas similar

### 🔄 ADAPTAR
- Sistema de routing
- Manejo de imágenes
- Navegación programática
- Middleware SSO (frontend)

---

**Última actualización:** 12 de Diciembre, 2025  
**Responsable:** GitHub Copilot Agent  
**Estado:** ✅ FASE 1 COMPLETADA | 🔄 FASE 2 EN PROGRESO
