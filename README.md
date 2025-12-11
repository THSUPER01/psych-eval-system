# psych-eval-system

Sistema de Evaluación Psicológica (Next.js 15 App Router) para procesos de selección en Super de Alimentos S.A.

## Características Principales
- Portal Psicólogo: gestión de requerimientos, candidatos y resultados (CMT).
- Portal Candidato: formulario demográfico + token de acceso y carga de CV (S3).
- Visualización de resultados CMT con gráficas (Chart.js, horizontal bar + rangos normativos).
- Asignación dinámica de normativas CMT.
- Arquitectura preparada para despliegue en IIS (standalone) o cualquier Node host.

## Requisitos
- Node.js >= 18
- pnpm / npm
- Acceso a backend API (variable `NEXT_PUBLIC_BACKEND_API_URL`).
- Bucket S3 configurado para almacenar CV (usando proxy de descarga opcional).

## Instalación
```bash
git clone https://github.com/THSUPER01/psych-eval-system.git
cd psych-eval-system
cp .env.example .env.local  # Editar valores reales
npm install  # o pnpm install
```

## Scripts
```bash
npm run dev        # Desarrollo
npm run build      # Compilación producción (standalone)
npm run start      # Inicia servidor Next
npm run start:prod # Ejecuta .next/standalone/server.js (IIS/iisnode)
npm run lint       # ESLint
npm run typecheck  # Verificación TypeScript
```

## Variables de Entorno Clave
| Variable | Descripción |
|----------|-------------|
| NEXT_PUBLIC_BACKEND_API_URL | Base API backend selección |
| NEXT_PUBLIC_API_SELECCION_URL | URL de ayuda para fetch front |
| ALLOWED_CV_HOSTS | Lista de hosts permitidos para proxy CV |
| PORT | Puerto ejecución producción |
| ENABLE_MOCK_DATA | Activa datos mock si se implementa |

## Proxy de Descarga de CV
Se recomienda NO exponer directamente URLs S3 si el bucket tiene políticas restrictivas de CORS. Se puede crear un endpoint `/api/cv?file=<url>` que valida el host y retransmite el contenido.

Ejemplo (pendiente de implementación en este repo):
```ts
// app/api/cv/route.ts
import { NextRequest } from 'next/server'
export async function GET(req: NextRequest) {
  const fileUrl = req.nextUrl.searchParams.get('file')
  if (!fileUrl) return new Response('Missing file param', { status: 400 })
  const allowed = process.env.ALLOWED_CV_HOSTS?.split(',').map(h => h.trim()).filter(Boolean) || []
  try {
    const urlObj = new URL(fileUrl)
    if (!allowed.includes(urlObj.host)) return new Response('Host not allowed', { status: 403 })
    const upstream = await fetch(fileUrl)
    if (!upstream.ok) return new Response('Upstream error', { status: 502 })
    const buf = await upstream.arrayBuffer()
    const filename = urlObj.pathname.split('/').pop() || 'cv.pdf'
    return new Response(buf, {
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }
}
```

Después, en el frontend reemplazar:
```ts
window.open(candidato.formulario.urlHojaVida, '_blank')
```
por:
```ts
window.open(`/api/cv?file=${encodeURIComponent(candidato.formulario.urlHojaVida)}`)
```

## Despliegue en IIS (iisnode)
1. Ejecutar `npm run build`.
2. Copiar carpetas: `.next/standalone`, `.next/static`, `public` y `web.config` al directorio del sitio IIS.
3. Asegurar Node 18+ instalado y iisnode configurado.
4. Establecer variables de entorno en el pool de aplicación (o web.config si se usa setEnvironment).
5. Acceder vía `https://tu-dominio/`.

## Limpieza y Buenas Prácticas
- `.env.local` nunca se commitea.
- Evitar incluir dumps JSON grandes no necesarios (ej: RESPONSECANDIDATOS.JSON solo si es doc).
- Usar `npm run typecheck` antes de subir cambios.

## Próximas Mejoras Sugeridas
- Integrar validación zod + react-hook-form en todos los formularios.
- Añadir pruebas unitarias (Jest / Vitest) para lógica de transformación.
- Implementar sistema de roles real vía backend.
- Cache selectiva React Query con invalidaciones más finas.
- Endpoints proxy adicionales para ficheros (firmas, certificados).

## Integración CI
Este repositorio incluye workflow GitHub Actions en `.github/workflows/ci.yml` que:
- Instala dependencias (`npm ci`).
- Ejecuta `npm run lint` y `npm run typecheck`.
- Construye el proyecto (`npm run build`).
- Publica artefacto de despliegue (standalone + static + public).

Para añadir auditoría de seguridad opcional:
```yaml
  - name: Audit
    run: npm audit --omit=dev || true
```

Badge ejemplo (agregar en la parte superior del README):
```md
![CI](https://github.com/THSUPER01/psych-eval-system/actions/workflows/ci.yml/badge.svg)
```

## Licencia
Uso interno Super de Alimentos S.A. (UNLICENSED).
