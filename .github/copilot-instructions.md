# Copilot Instructions - Sistema de Evaluación Psicológica

## Project Overview
This is a Next.js 15 (App Router) psychological evaluation system for recruiting candidates at "Super de Alimentos S.A." The system has two distinct user portals:
1. **Psychologist Portal** - Create requirements, track candidates, upload test results
2. **Candidate Portal** - Fill evaluation forms via unique token-based links

**Status**: Frontend MVP with mock data. Backend API integration is pending implementation (see TODOs).

## Architecture

### Two-Portal Structure
- **Psychologist flow**: `/psychologist/login` → `/psychologist/dashboard` → `/psychologist/requirement/[id]`
- **Candidate flow**: `/candidate/[token]` (tokenized access, no authentication)
- Routes are organized in `app/` using Next.js 15 App Router conventions

### Component Organization
```
components/
├── candidate/          # Candidate-facing components
│   ├── candidate-form.tsx             # Token-based evaluation form
│   └── public-application-form.tsx    # Public job application form
├── psychologist/       # Psychologist-facing components
│   ├── create-requirement-dialog.tsx  # Creates requirement, sends token link
│   ├── requirements-list.tsx          # Dashboard view with status badges
│   ├── requirement-details.tsx        # Tabs: responses + document uploads
│   └── login-form.tsx                 # Auth placeholder (mock login)
└── ui/                 # shadcn/ui components (do not modify manually)
```

### Key Data Structures
**Candidate Form Fields** (see `candidate-form.tsx`):
- `CLB_EstadoCivil`, `CLB_Genero`, `edad_al_ingresar`, `Barrio`, `Comuna`, `Estrato`, `Hijos`, `edades_de_hijos`, `tallas`

**Public Application Form Fields** (see `public-application-form.tsx`):
- Contact: `nombre_completo`, `correo_electronico`, `telefono`
- Same demographic fields as candidate form

**Requirement Model** (see `requirements-list.tsx`):
- `candidateName`, `candidateEmail`, `candidatePhone`, `status` (pending/completed), `createdAt`, `submittedAt`

**Geographic Data** (see `lib/manizales-data.ts`):
- Manizales neighborhoods and communes from official GeoJSON data
- Helper functions: `getComunas()`, `getBarriosByComuna()`, `searchBarrios()`

## Tech Stack & Patterns

### UI Framework: shadcn/ui + Radix UI
- **ALL UI components** are shadcn-generated in `components/ui/`
- **Never manually edit** these files - use shadcn CLI to update
- Uses `class-variance-authority` for button variants (see `button.tsx`)
- Utility function: `cn()` from `lib/utils.ts` for className merging

### Styling Conventions
- **Tailwind CSS v4** with inline `@theme` directive in `globals.css`
- **OKLCH color space** for professional theme (primary: `oklch(0.42 0.19 264)`)
- **Geist fonts** (Sans + Mono) from Vercel
- Gradient backgrounds: `bg-gradient-to-br from-background via-secondary/20 to-background`

### Form Handling Pattern
```tsx
// Standard pattern across all forms
const [formData, setFormData] = useState<FormDataType>({ ... })
const updateFormData = (field: keyof FormDataType, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }))
}
// Used with shadcn Select: onValueChange={(value) => updateFormData("field", value)}
```

### Icons
- **lucide-react** for all icons (Brain, ClipboardList, Shield, etc.)
- Consistent pattern: Icon in colored background circle/square for headers

## Critical Workflows

### Development
```bash
npm run dev    # Start dev server (port 3000)
npm run build  # Production build (TypeScript/ESLint errors ignored in config)
npm run lint   # ESLint check
```

### Adding shadcn Components
```bash
npx shadcn@latest add <component-name>  # Adds to components/ui/
```
Configuration is in `components.json` (aliases: `@/*`, style: "new-york")

## Backend Integration Points (TODO)

**Authentication**: 
- `components/psychologist/login-form.tsx` line 26 - Replace mock login with actual auth
- `components/psychologist/dashboard-header.tsx` line 20 - Implement real logout

**Data Persistence**:
- `components/candidate/candidate-form.tsx` line 48 - API call to save candidate responses
- `components/psychologist/create-requirement-dialog.tsx` line 34 - API to create requirement + send email with token
- `components/psychologist/requirement-details.tsx` line 56 - File upload to storage (S3/similar)

**Data Fetching**:
- Replace `mockRequirements` in `requirements-list.tsx` with API call
- Replace `mockResponse` in `requirement-details.tsx` with API fetch by requirementId

## Data Structure

### Static Data Organization
```
data/
└── manizales-barrios-comunas.geojson  # Official Manizales geographic data

lib/
├── utils.ts            # Tailwind cn() utility
└── manizales-data.ts   # Geographic data helpers (getComunas, getBarriosByComuna, etc.)
```

## Project-Specific Conventions

### Spanish Localization
- All UI text is in **Spanish** (Colombian context)
- Field names maintain database format (e.g., `CLB_EstadoCivil`) but display formatted
- Toast notifications use Spanish messages
- Geographic data for Manizales neighborhoods and communes

### TypeScript Strictness
- `strict: true` in tsconfig, but **build errors are ignored** in `next.config.mjs`
- Use `type` for React component props: `type FormData = { ... }`
- Prefer `interface` for complex object shapes

### File Naming
- React components: `kebab-case.tsx` (e.g., `candidate-form.tsx`)
- Pages: Next.js conventions (`page.tsx`, `[token]/page.tsx`)
- No `index.tsx` files - use `page.tsx` for routes

### State Management Pattern
- Client components use local `useState` (no global state library)
- Mark interactive components with `"use client"` directive
- Use `useToast()` hook for feedback (from `hooks/use-toast.ts`)

## Quick Reference

**Path alias**: `@/` maps to project root (see `tsconfig.json`)

**Toast pattern**: 
```tsx
const { toast } = useToast()
toast({ title: "Success", description: "Message" })
```

**shadcn component imports**: 
```tsx
import { Button } from "@/components/ui/button"  // Never use relative paths
```

**Dynamic route params**: 
```tsx
export default function Page({ params }: { params: { token: string } }) { ... }
```

## What NOT to Do
- Don't manually edit files in `components/ui/` - use shadcn CLI
- Don't add global state (Zustand/Redux) without discussing architecture
- Don't use CSS modules or styled-components - Tailwind only
- Don't implement auth without clarifying token strategy (JWT/session/etc.)
- Don't change the color scheme without updating OKLCH values consistently

## External Dependencies
- **Vercel Analytics** integrated in root layout
- **react-hook-form** + **zod** available but not yet used (consider for form validation)
- **date-fns** for date formatting (see `requirements-list.tsx` for usage pattern)
