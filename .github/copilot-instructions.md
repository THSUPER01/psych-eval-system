# AI agent guide for this repo

Goal: Help agents make correct, fast changes without rediscovering project context.

## Architecture & routing
- SPA built with Vite + React + TypeScript. No SSR; all client-side.
- Router is code-based (React Router v6). Entry stack: `src/main.tsx` → `src/App.tsx` → `src/routes/index.tsx`.
- Protected sections live under `/panel/seleccion` and are guarded by `components/auth/ProtectedRoute.tsx`, which relies on `AuthProvider` from `lib/context/AuthContext.tsx`.
- Nested layout: `layouts/SelectionLayout.tsx` provides sidebar/header and renders children via `<Outlet/>`.

## State, data and APIs
- TanStack Query v5 is the server-state layer. A preconfigured `QueryClient` in `App.tsx` sets: `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 5min`. Prefer `useQuery`/`useMutation` over ad‑hoc fetch.
- Do NOT hand-roll fetches; use service modules under `src/lib/services/*` and `src/services/*`:
  - Selection domain: `lib/services/selectionApiService.ts` (candidatos, requerimientos, asignaciones, documentos, resultados, públicos, etc.). It injects `App-Token` and unwraps `{ success, data }` automatically via a local `http` helper.
  - Auth/2FA: `lib/services/loginApiService.ts` and roles: `lib/services/rolesService.ts`.
  - 16PF test: `lib/services/test16pfService.ts` (185 preguntas, guardar respuestas, escalas, resultado).
  
- Env vars (Vite) live in `.env` with VITE_ prefix. Keys in use: `VITE_API_SELECCION_URL`, `VITE_MS_LOGIN_URL`, `VITE_MS_ROLES_URL`, `VITE_APP_TOKEN`, optional `VITE_PREDICT_API_BASE_URL`. See `.env.example`.
- Typical query pattern example (see `pages/prueba/Test16PFPage.tsx`):
  - `useQuery({ queryKey: ['test16pf-preguntas', token], queryFn: () => test16pfService.getPreguntas(token!) })`.

## Auth model
- JWT stored in `localStorage` under `authToken`, decoded in `lib/services/authService.ts` (base64url + TextDecoder). Permissions cached in `appPermisos`.
- `AuthProvider` boots by bridging SSO cookies → localStorage if present, then sets `user`, `permissions`, and `userRole` via `rolesService.getRolById`.
- Use `lib/hooks/useAuth.ts` inside protected routes/components; `ProtectedRoute` optionally checks `requirePermission` against decoded IDs.

## UI, styles, and patterns
- Tailwind CSS 4 + shadcn/ui components under `components/ui/*`; compose class names with `lib/utils.ts (cn)`.
- Icons: `lucide-react`. Global toasts via `hooks/use-toast` and enhanced helpers `lib/toast.ts` (`useModernToast()` provides success/error/warning/info/loading with consistent styling).
- Loading UX: `components/ui/loading-screen.tsx` and `NavigationLoadingSpinner` overlay; lazy routes use `<Suspense fallback={...}>`.

## Conventions that matter
- Use the path alias `@` (configured in `vite.config.ts` and `tsconfig.app.json`) for all intra-src imports.
- Service helpers unwrap API envelopes; errors throw with best-effort messages from backend (`message`/`mensaje`). Reuse the provided `http` wrappers instead of duplicating headers.
- The selection API expects an `App-Token` header on every call; it’s injected by the services—don’t add it again in callers.
- 16PF flows assume exactly 185 answers; UI persists progress to `localStorage` using key `16pf_respuestas_${token}` (see `pages/prueba/Test16PFPage.tsx`).

## Run, build, lint
- Node ≥ 18. Dev server: `npm run dev` (port 3000, opens browser). Build: `npm run build`. Preview: `npm run preview`. Lint: `npm run lint`.
- SPA deploys to any static host; ensure all routes fall back to `index.html` (see README for Nginx example).

## Adding features quickly (examples)
- New API call in selection domain: add a method to `lib/services/selectionApiService.ts` and consume it via `useQuery(['key', args], () => service.method(args))`.
- New protected page under the panel: create `pages/panel/seleccion/FooPage.tsx`, add a lazy import and `<Route path="foo" element={<FooPage/>} />` inside the nested route in `routes/index.tsx`.
- Prediction widget usage: Pass candidato object to `components/PredictWidget.tsx`; widget displays `prediccionPermanencia`, `probabilidadPermanencia`, `fechaPrediccion`, `versionModelo` already computed by backend. No client-side ML calls needed.

## Troubleshooting (fast checks)
- Env not loaded? Ensure `VITE_*` prefix and restart dev server. APIs default to sensible localhost/production fallbacks.
- 401s to .NET APIs? Confirm `VITE_APP_TOKEN` and backend availability; never send tokens from components—services handle headers.
- Route 404 after deploy? Configure static host to rewrite to `index.html`.
