# Implementación de Sistema de Autenticación en React + Next.js

## 📋 Descripción del Sistema

Implementar un sistema de autenticación multi-método que incluye:
1. **Login Manual**: Autenticación por número de documento
2. **Doble Autenticación (2FA)**: Verificación por código enviado a correo/SMS
3. **Auto-Login SSO**: Autenticación automática desde sistema CONECTA

---

## 🔑 Archivos Esenciales de Referencia (Angular)

### 1. Servicios de Autenticación

#### `auth.service.ts` - Gestión de sesión local
```typescript
- getToken(): Obtiene token JWT de localStorage
- getPermisos(): Obtiene permisos del usuario
- decodeToken(): Decodifica JWT con jwt-decode
- isTokenExpired(): Verifica expiración del token
- isAuthenticated(): Valida si hay sesión activa
- login(token): Guarda token y actualiza estado
- permisos(permisos): Guarda permisos del usuario
- logout(): Limpia sesión
```

#### `ms-login.service.ts` - Comunicación con API
```typescript
- validarUsuario(documento): Valida existencia del usuario
- EnviarToken(documento, idMetodo): Envía código de verificación
- VerificarToken(documento, token, idSesion, duracionSesion): Valida código 2FA
- ObtenerJWT(documento, duracionSesion): Genera token JWT
- ObtenerColaboradorActivo(documento): Obtiene info del usuario
```

#### `ms-gestion-roles.service.ts` - Gestión de permisos
```typescript
- GetPermisosRol(id): Obtiene permisos del rol del usuario
```

### 2. Guards/Middlewares

#### `auth.guard.ts` - Protección de rutas
```typescript
Funciones:
- Verificar si el usuario está autenticado
- Validar permisos específicos por ruta
- Implementar auto-login desde CONECTA
- Redirigir a login si no hay sesión
```

### 3. Componentes de UI

#### `LoginComponent`
- Formulario con input de documento
- Validación: mínimo 6 dígitos, solo números
- Flujo condicional según permisos de 2FA

#### `VerificacionModalComponent`
- Selección de método de envío (correo personal/organizacional/celular)
- Radio buttons para elegir canal
- Envío de código de verificación

#### `TokenModalComponent`
- Input para código de 6 dígitos
- Checkbox "Mantener sesión activa"
- Validación del código 2FA

---

## 🚀 Prompt para Implementación en Next.js

```markdown
# PROMPT PARA IA - IMPLEMENTACIÓN DE AUTENTICACIÓN EN NEXT.JS

Necesito implementar un sistema de autenticación completo en mi aplicación Next.js (App Router) con React. 
El sistema debe replicar la funcionalidad de una aplicación Angular existente.

## REQUISITOS TÉCNICOS

### Stack Tecnológico
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS (o CSS Modules)
- Librería para manejo de JWT: `jose` o `jsonwebtoken`
- Librería para HTTP: `axios` o `fetch`
- Gestión de estado global: Context API o Zustand

### Estructura de Carpetas Sugerida
```
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── VerificationModal.tsx
│   │   └── TokenModal.tsx
│   └── ui/
├── lib/
│   ├── services/
│   │   ├── authService.ts
│   │   ├── loginApiService.ts
│   │   └── rolesService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── usePermissions.ts
│   └── utils/
│       ├── jwt.ts
│       └── validation.ts
├── middleware.ts
└── types/
    └── auth.types.ts
```

## FUNCIONALIDADES A IMPLEMENTAR

### 1. LOGIN MANUAL

**Componente: LoginForm.tsx**
- Input para número de documento (validación: min 6 dígitos, solo números)
- Botón "Validar" deshabilitado si el formulario es inválido
- Mostrar errores de validación en tiempo real
- Al enviar:
  1. Llamar a `validarUsuario(documento)` del API
  2. Obtener permisos del rol: `GetPermisosRol(rol)`
  3. Verificar si requiere doble autenticación (permiso "Requiere doble autenticación")
  4. Si NO requiere 2FA: Obtener JWT y hacer login directo
  5. Si requiere 2FA: Abrir modal de verificación

### 2. DOBLE AUTENTICACIÓN (2FA)

**Componente: VerificationModal.tsx**
- Modal/Dialog con 3 opciones de radio buttons:
  - Correo personal
  - Correo organizacional
  - Número celular
- Mostrar los valores enmascarados (ej: "j***@gmail.com", "+57 3** *** **12")
- Botón "Enviar código" que:
  1. Llama a `EnviarToken(documento, idMetodo)`
  2. Recibe `idSession` en la respuesta
  3. Abre el modal de token
  4. Muestra mensaje de éxito con SweetAlert2 o similar

**Componente: TokenModal.tsx**
- Input para código de 6 dígitos (solo números)
- Checkbox "Mantener sesión activa"
  - Si está marcado: sesión de 12 horas
  - Si no está marcado: sesión de 6 horas
- Validación en tiempo real
- Botón "Enviar código" que:
  1. Llama a `VerificarToken(documento, token, idSession, duracionSesion)`
  2. Si es válido: guarda token JWT y permisos
  3. Redirige al dashboard
  4. Si es inválido: muestra error

### 3. AUTO-LOGIN DESDE CONECTA (SSO)

**Implementar en: middleware.ts**
- Verificar si la petición viene de:
  - Hostname: `app.administracionsuper.com`
  - Path que inicia con: `/CONECTA` o `/CONECTA/*`
- Extraer parámetro `doc` de la URL
- Validar formato del documento (mínimo 5 dígitos)
- Si es válido:
  1. Llamar a `validarUsuario(doc)`
  2. Llamar a `ObtenerJWT(doc, 8)` (8 horas)
  3. Llamar a `GetPermisosRol(rol)`
  4. Guardar token y permisos
  5. Permitir acceso automático
- Si no es válido: redirigir a login manual

### 4. SERVICIO DE AUTENTICACIÓN

**Archivo: authService.ts**

Implementar las siguientes funciones:

```typescript
interface AuthService {
  // Gestión de token
  getToken(): string | null;
  setToken(token: string): void;
  removeToken(): void;
  decodeToken(): any;
  isTokenExpired(): boolean;
  
  // Gestión de permisos
  getPermissions(): number[];
  setPermissions(permisos: any[]): void;
  hasPermission(permisoId: number): boolean;
  
  // Estado de autenticación
  isAuthenticated(): boolean;
  login(token: string, permisos: any[]): void;
  logout(): void;
}
```

**Almacenamiento:**
- Usar `localStorage` para persistencia
- Keys: `authToken`, `appPermisos`
- Decodificar JWT con librería apropiada

### 5. SERVICIOS DE API

**Archivo: loginApiService.ts**

```typescript
interface LoginApiService {
  validarUsuario(documento: string): Promise<ValidarUsuarioResponse>;
  enviarToken(documento: string, idMetodo: number): Promise<EnviarTokenResponse>;
  verificarToken(params: VerificarTokenParams): Promise<VerificarTokenResponse>;
  obtenerJWT(documento: string, duracionSesion: number): Promise<ObtenerJWTResponse>;
  obtenerColaboradorActivo(documento: string): Promise<ColaboradorActivoResponse>;
}
```

**Configuración:**
- Base URL: `https://app.administracionsuper.com/Microservices/MS_Login/Api`
- Headers requeridos:
  - `App-Token`: '63f3c980e89de5d47a969fedfc64d7ec0ee199781fb57ca267888fb123bc90f7'
  - `Content-Type`: 'application/json'

**Endpoints:**
- POST `/Login/ValidarUsuario` - body: `{ documento }`
- POST `/Login/EnviarToken` - body: `{ documento, idMetodo }`
- POST `/Login/VerificarToken` - body: `{ documento, token, idSesion, duracionSesion }`
- POST `/Login/ObtenerJWT` - body: `{ documento, duracionSesion }`
- GET `/Usuario/ObtenerColaboradorActivo/{documento}`

**Archivo: rolesService.ts**

```typescript
interface RolesService {
  getPermisosRol(id: number): Promise<PermisosRolResponse>;
}
```

**Configuración:**
- Base URL: `https://app.administracionsuper.com/Microservices/MS_RolesPermisos/Api`
- Headers: mismo `App-Token`

**Endpoints:**
- GET `/permisos/GetPermisosRol/{id}`

### 6. CONTEXT DE AUTENTICACIÓN

**Archivo: AuthContext.tsx**

```typescript
interface AuthContextType {
  user: User | null;
  permissions: number[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, permisos: any[]) => void;
  logout: () => void;
  hasPermission: (permisoId: number) => boolean;
}
```

Debe:
- Proveer estado de autenticación a toda la app
- Exponer métodos de login/logout
- Verificar permisos
- Manejar loading states

### 7. MIDDLEWARE DE PROTECCIÓN

**Archivo: middleware.ts**

Debe:
- Verificar autenticación en rutas protegidas
- Verificar permisos específicos según la ruta
- Implementar auto-login desde CONECTA
- Redirigir a login si no hay sesión
- Permitir acceso a rutas públicas (login, assets, api)

**Ejemplo de configuración:**
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

### 8. HOOK PERSONALIZADO

**Archivo: useAuth.ts**

```typescript
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Archivo: usePermissions.ts**

```typescript
export function usePermissions() {
  const { permissions, hasPermission } = useAuth();
  
  return {
    permissions,
    hasPermission,
    canAccessProduccion: hasPermission(PERMISOS.PRODUCCION),
    canAccessRoles: hasPermission(PERMISOS.ROLES),
    // ... otros permisos comunes
  };
}
```

### 9. CONSTANTES DE PERMISOS

**Archivo: types/auth.types.ts**

```typescript
export const PERMISOS = {
  PRODUCCION: 1,
  IDENTIFICACION_RECURSO: 9,
  VALIDAR_ORDENES: 10,
  AUTORIZAR_ORDEN: 11,
  USUARIOS: 7,
  ROLES: 5,
  RECURSOS: 8,
  CONFIGCUARTOSMOGUL: 12,
  SECUENCIACION: 55,
  USO_CUARTOS: 66,
  PENDIENTES_APROBACION_CALIDAD: 67,
  CONTROL_PESOS_BANDEJA: 68,
  MIS_CUARTOS_ACTIVOS: 69,
  ITEMNAVBAR_CUARTOSMADURACION: 70,
  CONFIGURACIONMATRIZCANASTA: 83,
  ADMINISTRADOR_LINEAS: 130,
  DISENADOR_ETAPAS: 131
} as const;

export type PermisoKey = keyof typeof PERMISOS;
export type PermisoValue = typeof PERMISOS[PermisoKey];
```

### 10. VALIDACIONES

**Archivo: utils/validation.ts**

```typescript
export const validarDocumento = (documento: string): boolean => {
  return /^\d{6,}$/.test(documento);
};

export const validarToken = (token: string): boolean => {
  return /^\d{6}$/.test(token);
};

export const validarDocumentoAutoLogin = (doc: string): boolean => {
  return /^\d{5,}$/.test(doc.trim());
};
```

### 11. UTILIDADES JWT

**Archivo: utils/jwt.ts**

```typescript
import { jwtDecode } from 'jwt-decode';

export const decodeJWT = (token: string): any => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isJWTExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const expirationTime = decoded.exp * 1000;
  return Date.now() > expirationTime;
};
```

## FLUJOS DE USUARIO

### Flujo 1: Login Manual sin 2FA
```
1. Usuario ingresa documento
2. Click en "Validar"
3. API valida usuario y obtiene rol
4. API obtiene permisos del rol
5. No tiene permiso "Requiere doble autenticación"
6. API obtiene JWT directamente
7. Se guarda token y permisos
8. Redirección a dashboard
```

### Flujo 2: Login Manual con 2FA
```
1. Usuario ingresa documento
2. Click en "Validar"
3. API valida usuario y obtiene rol
4. API obtiene permisos del rol
5. Tiene permiso "Requiere doble autenticación"
6. Abre modal de verificación
7. Usuario selecciona método (correo/celular)
8. API envía código de verificación
9. Abre modal de token
10. Usuario ingresa código de 6 dígitos
11. Usuario selecciona duración de sesión
12. API verifica token
13. API retorna JWT
14. Se guarda token y permisos
15. Redirección a dashboard
```

### Flujo 3: Auto-Login desde CONECTA
```
1. Usuario accede desde CONECTA con parámetro ?doc=123456
2. Middleware detecta referrer de CONECTA
3. Middleware valida formato del documento
4. API valida usuario
5. API obtiene JWT (8 horas)
6. API obtiene permisos del rol
7. Se guarda token y permisos
8. Permite acceso directo sin mostrar login
```

## MANEJO DE ERRORES

Implementar manejo de errores para:
- Usuario no encontrado
- Token inválido o expirado
- Código 2FA incorrecto
- Errores de red/timeout
- Token expirado durante navegación

Usar:
- Toast notifications o SweetAlert2 para mensajes
- Estados de loading durante peticiones
- Mensajes de error claros y específicos

## SEGURIDAD

Implementar:
- HTTPOnly cookies (opcional, alternativa a localStorage)
- Validación de origen en auto-login
- Sanitización de inputs
- Rate limiting en intentos de login
- HTTPS obligatorio en producción
- Refresh token (opcional pero recomendado)

## TESTING

Crear tests para:
- Componente LoginForm
- Componente VerificationModal
- Componente TokenModal
- AuthService (todas las funciones)
- Middleware de autenticación
- Hooks personalizados

## EXTRAS OPCIONALES

- Implementar refresh token para renovar sesión
- Agregar biometría/FaceID en dispositivos compatibles
- Implementar "Recordar dispositivo" para no pedir 2FA siempre
- Logs de auditoría de inicios de sesión
- Recuperación de cuenta
- Cambio de métodos 2FA

## NOTAS IMPORTANTES

1. **Decodificación de Token**: El token JWT contiene información del usuario y rol
2. **Permisos**: Son un array de objetos, extraer solo los IDs de acción: `permisos.map(p => p.accIdAccion)`
3. **Duración de Sesión**: 
   - Manual sin "mantener activo": 6 horas
   - Manual con "mantener activo": 12 horas
   - Auto-login CONECTA: 8 horas fijas
4. **Respuesta de ValidarUsuario**: Contiene estructura con `email.valor`, `emailSuper.valor`, `phoneNumber.valor` y sus respectivos IDs
5. **App-Token**: Es único por aplicación, debe estar en variables de entorno

## ENTREGABLES ESPERADOS

1. Todos los archivos TypeScript con tipos bien definidos
2. Componentes React funcionales con hooks
3. Documentación de cada servicio/función
4. README con instrucciones de configuración
5. Archivo .env.example con variables necesarias
6. Comentarios en código complejo

¿Puedes implementar todo este sistema de autenticación siguiendo estas especificaciones exactas?
```

---

## 📦 Archivos de Referencia a Compartir

Si necesitas compartir el código exacto de Angular, adjunta estos archivos:

1. **Servicios:**
   - `src/app/services/auth.service.ts`
   - `src/app/services/ms-login.service.ts`
   - `src/app/services/ms-gestion-roles.service.ts`

2. **Componentes:**
   - `src/app/shared/login/login.component.ts`
   - `src/app/shared/login/login.component.html`
   - `src/app/shared/login/modal/verificacion-modal/verificacion-modal.component.ts`
   - `src/app/shared/login/modal/verificacion-modal/verificacion-modal.component.html`
   - `src/app/shared/login/modal/token-modal/token-modal.component.ts`
   - `src/app/shared/login/modal/token-modal/token-modal.component.html`

3. **Guards:**
   - `src/app/shared/guards/auth.guard.ts`
   - `src/app/shared/guards/permisos.guard.ts`

4. **Constantes:**
   - `src/app/shared/constants/permisos.ts`

5. **Configuración:**
   - `src/app/environments/environment.ts`

---

## 🔐 Variables de Entorno para Next.js

```env
# .env.local o .env.production

# API URLs
NEXT_PUBLIC_MS_LOGIN_URL=https://app.administracionsuper.com/Microservices/MS_Login/Api
NEXT_PUBLIC_MS_ROLES_URL=https://app.administracionsuper.com/Microservices/MS_RolesPermisos/Api

# App Token (SENSIBLE - No exponer en cliente si es posible)
APP_TOKEN=63f3c980e89de5d47a969fedfc64d7ec0ee199781fb57ca267888fb123bc90f7

# CONECTA SSO
NEXT_PUBLIC_CONECTA_HOSTNAME=app.administracionsuper.com
NEXT_PUBLIC_CONECTA_PATH=/CONECTA

# Sesión
NEXT_PUBLIC_SESSION_DURATION_SHORT=6
NEXT_PUBLIC_SESSION_DURATION_LONG=12
NEXT_PUBLIC_SESSION_DURATION_SSO=8
```

---

## ✅ Checklist de Implementación

- [ ] Crear estructura de carpetas
- [ ] Instalar dependencias (jwt-decode, axios/swr, zustand/context)
- [ ] Crear tipos TypeScript para todas las interfaces
- [ ] Implementar AuthService
- [ ] Implementar LoginApiService
- [ ] Implementar RolesService
- [ ] Crear AuthContext/Provider
- [ ] Implementar LoginForm component
- [ ] Implementar VerificationModal component
- [ ] Implementar TokenModal component
- [ ] Crear middleware de autenticación
- [ ] Implementar auto-login desde CONECTA
- [ ] Crear hooks personalizados (useAuth, usePermissions)
- [ ] Configurar rutas protegidas
- [ ] Implementar validaciones
- [ ] Agregar manejo de errores
- [ ] Implementar loading states
- [ ] Crear constantes de permisos
- [ ] Agregar toast/notifications
- [ ] Testing de componentes críticos
- [ ] Documentar código
- [ ] Configurar variables de entorno
- [ ] Probar todos los flujos

---

## 🎯 Notas Adicionales

### Diferencias Angular vs Next.js

| Angular | Next.js/React |
|---------|---------------|
| Services (Injectable) | Custom hooks + Context API |
| Guards (CanActivate) | Middleware + HOCs |
| RxJS Observables | Promises + async/await |
| FormsModule | react-hook-form o Formik |
| Angular Material Dialog | Radix UI, Headless UI, o Shadcn |
| HttpClient | Axios, fetch, o SWR |
| Router Guards | Middleware.ts |
| LocalStorage directo | Misma API, considerar SSR |

### Consideraciones SSR/CSR

- `localStorage` solo funciona en cliente (usar `'use client'` en componentes)
- Verificar autenticación en servidor cuando sea posible
- Cookies HTTPOnly son más seguras que localStorage para tokens

### Librerías Recomendadas

```json
{
  "dependencies": {
    "jose": "^5.0.0", // JWT en Next.js
    "axios": "^1.6.0", // HTTP client
    "zustand": "^4.4.0", // Estado global (alternativa a Context)
    "react-hook-form": "^7.48.0", // Formularios
    "zod": "^3.22.0", // Validación de schemas
    "sonner": "^1.0.0", // Toast notifications
    "@radix-ui/react-dialog": "^1.0.0" // Modals accesibles
  }
}
```

---

## 📞 Contacto y Soporte

Para dudas sobre la implementación, revisar:
1. Código fuente de Angular en este repositorio
2. Documentación de APIs en Swagger (si existe)
3. Tests unitarios de la implementación Angular

---

**Última actualización:** Octubre 2025
**Autor:** Sistema de Autenticación PRO
**Versión:** 1.0.0
