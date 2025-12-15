# Sistema de Evaluación Psicológica - Vite SPA

> **Migración de Next.js 15 a Vite + React + TypeScript**  
> Aplicación SPA para gestión de evaluaciones psicológicas en procesos de selección de "Super de Alimentos S.A."

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#-arquitectura)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Build y Deploy](#-build-y-deploy)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Tecnologías](#-tecnologías)
- [Diferencias con Next.js](#-diferencias-con-nextjs)

---

## 📖 Descripción

Sistema de evaluación psicológica con dos portales independientes:

### 🧑‍⚕️ Portal de Psicólogos
- Autenticación con login + 2FA
- Dashboard de KPIs y estadísticas
- Gestión de requerimientos de selección
- Seguimiento de candidatos
- Registro y visualización de resultados de pruebas

### 👤 Portal de Candidatos
- Acceso por token único (sin autenticación)
- Formulario demográfico
- Pruebas psicométricas:
  - **16PF** (185 preguntas)
  - **CMT** (72 preguntas)

---

## 🏗️ Arquitectura

```
Cliente SPA (Vite)  ←→  APIs REST (.NET Backend)
     ↓                       ↓
 React Router           SQL Server
 React Query            
 TailwindCSS            
```

**Características clave:**
- ✅ **SPA pura** - Sin SSR, totalmente client-side
- ✅ **React Router v6** - Routing client-side con guards
- ✅ **TanStack Query** - Cache y sincronización de servidor
- ✅ **shadcn/ui** - Componentes UI reutilizables
- ✅ **TailwindCSS 4** - Estilos con OKLCH
- ✅ **TypeScript strict** - Type-safety completo

---

## 📦 Requisitos Previos

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0
- **Backend .NET** corriendo en local o servidor

---

## ⚙️ Instalación

```bash
# Instalar dependencias
npm install
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto (copia de `.env.example`):

```env
# Backend APIs .NET
VITE_API_SELECCION_URL=http://localhost:5208/api
VITE_MS_LOGIN_URL=http://localhost:5065/api
VITE_MS_ROLES_URL=http://localhost:5137/api

# App Token (autenticación con backend)
VITE_APP_TOKEN=YOUR_APP_TOKEN_HERE

# SSO Connect configuration
VITE_CONECTA_HOSTNAME=app.administracionsuper.com
VITE_CONECTA_PATH=/CONECTA
VITE_SESSION_DURATION_SSO=8
```

⚠️ **Importante:** En Vite, las variables de entorno deben tener el prefijo `VITE_` para ser accesibles en el cliente.

### Fuente Poppins

La fuente se carga desde Google Fonts vía index.html.

---

## 🚀 Desarrollo

```bash
# Iniciar servidor de desarrollo (puerto 3000)
npm run dev
```

El servidor abrirá automáticamente en `http://localhost:3000`.

**Características del dev server:**
- ⚡ **HMR ultra-rápido** (Hot Module Replacement)
- 🔥 Recarga instantánea de estilos
- 🐛 Source maps para debugging

---

## 📦 Build y Deploy

### Build Local

```bash
# Compilar para producción
npm run build

# Vista previa del build
npm run preview
```

El build genera archivos estáticos en la carpeta `dist/`.

### Despliegue

La aplicación es una SPA estática, compatible con:

#### **Vercel**
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### **Azure Static Web Apps**
Configurar via Azure Portal o GitHub Actions.

#### **Nginx**
```nginx
server {
    listen 80;
    server_name tudominio.com;
    root /ruta/a/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

⚠️ **Importante:** Como es una SPA, todas las rutas deben redirigir a `index.html` para que React Router maneje la navegación.

---

## 📁 Estructura del Proyecto

```
vite-psych-eval-system/
├── public/                  # Assets estáticos
│   └── images/              # Logos, ilustraciones, decoraciones
├── src/
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Router principal + Providers
│   ├── index.css            # Estilos globales (TailwindCSS)
│   ├── routes/              # Configuración de rutas
│   ├── pages/               # Componentes de página
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # shadcn/ui components
│   │   ├── auth/
│   │   ├── candidate/
│   │   ├── psychologist/
│   │   ├── selection/
│   │   └── test16pf/
│   ├── lib/                 # Lógica de negocio
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks (React Query)
│   │   ├── context/         # React contexts
│   │   └── utils.ts
│   ├── types/               # TypeScript types
│   └── data/                # Data estática (JSON)
├── .env                     # Variables de entorno (no versionar)
├── .env.example             # Template de variables
├── vite.config.ts           # Configuración de Vite
├── tsconfig.json            # TypeScript config
└── package.json
```

---

## 🛠️ Tecnologías

### Core
- **Vite 7.2** - Build tool ultra-rápido
- **React 18.3** - UI library
- **TypeScript 5.7** - Type-safety
- **React Router 6** - Client-side routing

### UI & Styling
- **TailwindCSS 4.1** - Utility-first CSS
- **shadcn/ui** - Component library
- **Radix UI** - Primitives accesibles
- **Lucide React** - Iconos
- **Framer Motion** - Animaciones

### State & Data
- **TanStack Query v5** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Charts
- **Recharts** - Gráficos responsivos
- **Chart.js** - Gráficos avanzados

---

## 🔄 Diferencias con Next.js

| Concepto | Next.js | Vite SPA |
|----------|---------|----------|
| **Routing** | App Router (file-based) | React Router (code-based) |
| **Data Fetching** | `getServerSideProps`, Server Components | `useQuery` (React Query) |
| **Navigation** | `next/link`, `useRouter` | `<Link>`, `useNavigate()` |
| **Images** | `next/image` | `<img>` nativa |
| **Env Variables** | `NEXT_PUBLIC_*` | `VITE_*` |
| **Middleware** | `middleware.ts` (server) | Lógica en frontend |
| **Rendering** | SSR/SSG/ISR | CSR (Client-Side) |
| **Build Output** | `.next/` | `dist/` |
| **Dev Server** | `next dev` | `vite dev` (más rápido) |

---

## 📝 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo (puerto 3000)
npm run build     # Build de producción
npm run preview   # Preview del build
npm run lint      # ESLint check
```

---

## 🐛 Troubleshooting

### El build falla con errores de TypeScript
- Asegúrate de que `tsconfig.app.json` tenga `"noEmit": true`
- Revisa que las rutas alias (`@/*`) estén configuradas en `vite.config.ts` y `tsconfig.app.json`

### Las variables de entorno no se cargan
- Verifica que tengan el prefijo `VITE_`
- Reinicia el servidor de desarrollo después de modificar `.env`

### Las rutas no funcionan en producción
- Configura el servidor para redirigir todas las rutas a `index.html`
- En Vercel/Netlify esto se hace automáticamente

### Error 401 en las APIs
- Verifica que `VITE_APP_TOKEN` esté configurado correctamente
- Asegúrate de que el backend .NET esté corriendo

---

## 📚 Documentación de Referencia

- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 📄 Licencia

UNLICENSED - Super de Alimentos S.A.

---

**Última actualización:** Diciembre 2025
