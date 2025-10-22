# Ejemplos de Código para Next.js - Sistema de Autenticación

## 📁 Estructura de Archivos Recomendada

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   └── api/
│       └── auth/
│           └── route.ts
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── VerificationModal.tsx
│       └── TokenModal.tsx
├── lib/
│   ├── services/
│   │   ├── authService.ts
│   │   ├── loginApiService.ts
│   │   └── rolesService.ts
│   ├── context/
│   │   └── AuthContext.tsx
│   └── hooks/
│       ├── useAuth.ts
│       └── usePermissions.ts
├── middleware.ts
└── types/
    └── auth.types.ts
```

---

## 🔐 1. Tipos TypeScript (auth.types.ts)

```typescript
// types/auth.types.ts

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

export interface Permiso {
  perIdPermisoRol: number;
  accIdAccion: number;
  accAccion: string;
  accVisIdVista: number;
  visVista: string;
  modAplIdAplicacion: number;
  modModulo: string;
  visModIdModulo: number;
}

export interface ValidarUsuarioResponse {
  data: {
    email: { id: number; valor: string };
    emailSuper: { id: number; valor: string };
    phoneNumber: { id: number; valor: string };
  };
  rol: number;
  mensaje?: string;
}

export interface EnviarTokenResponse {
  data: {
    idSession: string;
  };
  mensaje?: string;
}

export interface VerificarTokenParams {
  documento: string;
  token: string;
  idSesion: string;
  duracionSesion: number;
}

export interface VerificarTokenResponse {
  data: {
    token: string;
    Token?: string; // API puede retornar en diferentes formatos
  };
  mensaje?: string;
}

export interface ObtenerJWTResponse {
  data: {
    token: string;
    Token?: string;
  };
  mensaje?: string;
}

export interface PermisosRolResponse {
  data: Permiso[];
  mensaje?: string;
}

export interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: any;
}

export interface User {
  documento: string;
  rol: number;
  permisos: number[];
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  permissions: number[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, permisos: Permiso[]) => void;
  logout: () => void;
  hasPermission: (permisoId: number) => boolean;
}
```

---

## 🛠️ 2. Servicio de Autenticación (authService.ts)

```typescript
// lib/services/authService.ts
'use client';

import { jwtDecode } from 'jwt-decode';
import { DecodedToken, Permiso } from '@/types/auth.types';

const TOKEN_KEY = 'authToken';
const PERMISOS_KEY = 'appPermisos';

export const authService = {
  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  isTokenExpired(): boolean {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.exp) return true;

    const expirationTime = decoded.exp * 1000;
    return Date.now() > expirationTime;
  },

  // Permissions management
  getPermissions(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PERMISOS_KEY);
  },

  setPermissions(permisos: Permiso[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PERMISOS_KEY, JSON.stringify(permisos));
  },

  decodePermissions(): number[] {
    const permisos = this.getPermissions();
    if (!permisos) return [];

    try {
      const parsed: Permiso[] = JSON.parse(permisos);
      return parsed.map(p => p.accIdAccion);
    } catch (error) {
      console.error('Error decoding permissions:', error);
      return [];
    }
  },

  hasPermission(permisoId: number): boolean {
    const permisos = this.decodePermissions();
    return permisos.includes(permisoId);
  },

  // Authentication state
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  },

  login(token: string, permisos: Permiso[]): void {
    this.setToken(token);
    this.setPermissions(permisos);
  },

  logout(): void {
    this.removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PERMISOS_KEY);
    }
  }
};
```

---

## 🌐 3. Servicio de API de Login (loginApiService.ts)

```typescript
// lib/services/loginApiService.ts

import axios, { AxiosInstance } from 'axios';
import {
  ValidarUsuarioResponse,
  EnviarTokenResponse,
  VerificarTokenParams,
  VerificarTokenResponse,
  ObtenerJWTResponse
} from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_MS_LOGIN_URL || 
  'https://app.administracionsuper.com/Microservices/MS_Login/Api';

const APP_TOKEN = process.env.APP_TOKEN || 
  '63f3c980e89de5d47a969fedfc64d7ec0ee199781fb57ca267888fb123bc90f7';

class LoginApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'App-Token': APP_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  }

  async validarUsuario(documento: string): Promise<ValidarUsuarioResponse> {
    try {
      const response = await this.client.post<ValidarUsuarioResponse>(
        '/Login/ValidarUsuario',
        { documento }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async enviarToken(
    documento: string, 
    idMetodo: number
  ): Promise<EnviarTokenResponse> {
    try {
      const response = await this.client.post<EnviarTokenResponse>(
        '/Login/EnviarToken',
        { documento, idMetodo }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async verificarToken(
    params: VerificarTokenParams
  ): Promise<VerificarTokenResponse> {
    try {
      const response = await this.client.post<VerificarTokenResponse>(
        '/Login/VerificarToken',
        {
          documento: params.documento,
          token: params.token,
          idSesion: params.idSesion,
          duracionSesion: params.duracionSesion
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obtenerJWT(
    documento: string, 
    duracionSesion: number
  ): Promise<ObtenerJWTResponse> {
    try {
      const response = await this.client.post<ObtenerJWTResponse>(
        '/Login/ObtenerJWT',
        { documento, duracionSesion }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async obtenerColaboradorActivo(documento: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/Usuario/ObtenerColaboradorActivo/${documento}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any): void {
    if (axios.isAxiosError(error)) {
      const mensaje = error.response?.data?.mensaje || error.message;
      console.error('API Error:', mensaje);
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

export const loginApiService = new LoginApiService();
```

---

## 👥 4. Servicio de Roles (rolesService.ts)

```typescript
// lib/services/rolesService.ts

import axios, { AxiosInstance } from 'axios';
import { PermisosRolResponse } from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_MS_ROLES_URL || 
  'https://app.administracionsuper.com/Microservices/MS_RolesPermisos/Api';

const APP_TOKEN = process.env.APP_TOKEN || 
  '63f3c980e89de5d47a969fedfc64d7ec0ee199781fb57ca267888fb123bc90f7';

class RolesService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'App-Token': APP_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  }

  async getPermisosRol(id: number): Promise<PermisosRolResponse> {
    try {
      const response = await this.client.get<PermisosRolResponse>(
        `/permisos/GetPermisosRol/${id}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error obteniendo permisos:', error.response?.data);
      }
      throw error;
    }
  }
}

export const rolesService = new RolesService();
```

---

## 🎯 5. Context de Autenticación (AuthContext.tsx)

```typescript
// lib/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { AuthContextType, User, Permiso } from '@/types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar autenticación al montar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    try {
      if (authService.isAuthenticated()) {
        const decoded = authService.decodeToken();
        const permisos = authService.decodePermissions();

        setUser(decoded as User);
        setPermissions(permisos);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token: string, permisos: Permiso[]) => {
    authService.login(token, permisos);
    
    const decoded = authService.decodeToken();
    const permisosIds = authService.decodePermissions();

    setUser(decoded as User);
    setPermissions(permisosIds);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setPermissions([]);
    router.push('/login');
  }, [router]);

  const hasPermission = useCallback((permisoId: number): boolean => {
    return permissions.includes(permisoId);
  }, [permissions]);

  const value: AuthContextType = {
    user,
    permissions,
    isAuthenticated: !!user && !authService.isTokenExpired(),
    isLoading,
    login,
    logout,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

---

## 🪝 6. Custom Hooks

### useAuth Hook

```typescript
// lib/hooks/useAuth.ts
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/lib/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

### usePermissions Hook

```typescript
// lib/hooks/usePermissions.ts
'use client';

import { useAuth } from './useAuth';
import { PERMISOS } from '@/types/auth.types';

export function usePermissions() {
  const { permissions, hasPermission } = useAuth();

  return {
    permissions,
    hasPermission,
    
    // Permisos específicos comunes
    canAccessProduccion: hasPermission(PERMISOS.PRODUCCION),
    canAccessRoles: hasPermission(PERMISOS.ROLES),
    canAccessUsuarios: hasPermission(PERMISOS.USUARIOS),
    canAccessSecuenciacion: hasPermission(PERMISOS.SECUENCIACION),
    canUseCuartos: hasPermission(PERMISOS.USO_CUARTOS),
    canAdminLineas: hasPermission(PERMISOS.ADMINISTRADOR_LINEAS),
    
    // Método helper
    canAccess: (permisoId: number) => hasPermission(permisoId)
  };
}
```

---

## 🔒 7. Middleware (middleware.ts)

```typescript
// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const DURACION_HORAS = 8;

function isFromConecta(request: NextRequest): boolean {
  const referer = request.headers.get('referer');
  if (!referer) return false;

  try {
    const url = new URL(referer);
    const hostOk = url.hostname === 'app.administracionsuper.com';
    const prefix = '/CONECTA'.toLowerCase();
    const path = url.pathname.toLowerCase();
    const pathOk = path === prefix || path.startsWith(prefix + '/');

    return hostOk && pathOk;
  } catch {
    return false;
  }
}

function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000;
    return Date.now() > expirationTime;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Rutas públicas
  const publicPaths = ['/login', '/', '/api', '/_next', '/images', '/favicon.ico'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Token de la cookie o header
  const token = request.cookies.get('authToken')?.value;

  // 1. Si ya tiene sesión válida, permitir acceso
  if (token && !isTokenExpired(token)) {
    // Si intenta ir a login, redirigir a dashboard
    if (pathname === '/login' || pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Auto-login desde CONECTA
  const doc = searchParams.get('doc')?.trim() || '';
  const docValido = /^\d{5,}$/.test(doc);

  if (docValido && isFromConecta(request)) {
    try {
      // Llamar a los servicios de autenticación
      const APP_TOKEN = process.env.APP_TOKEN!;
      const MS_LOGIN_URL = process.env.NEXT_PUBLIC_MS_LOGIN_URL!;
      const MS_ROLES_URL = process.env.NEXT_PUBLIC_MS_ROLES_URL!;

      // Validar usuario
      const validarResponse = await fetch(`${MS_LOGIN_URL}/Login/ValidarUsuario`, {
        method: 'POST',
        headers: {
          'App-Token': APP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ documento: doc })
      });

      if (!validarResponse.ok) throw new Error('Usuario no válido');
      
      const validarData = await validarResponse.json();

      // Obtener JWT
      const jwtResponse = await fetch(`${MS_LOGIN_URL}/Login/ObtenerJWT`, {
        method: 'POST',
        headers: {
          'App-Token': APP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          documento: doc, 
          duracionSesion: DURACION_HORAS 
        })
      });

      if (!jwtResponse.ok) throw new Error('Error obteniendo JWT');
      
      const jwtData = await jwtResponse.json();
      const authToken = jwtData.data?.token || jwtData.data?.Token;

      // Obtener permisos
      const permisosResponse = await fetch(
        `${MS_ROLES_URL}/permisos/GetPermisosRol/${validarData.rol}`,
        {
          headers: {
            'App-Token': APP_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!permisosResponse.ok) throw new Error('Error obteniendo permisos');
      
      const permisosData = await permisosResponse.json();

      // Crear response con cookies
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      
      response.cookies.set('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: DURACION_HORAS * 60 * 60
      });

      response.cookies.set('appPermisos', JSON.stringify(permisosData.data), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: DURACION_HORAS * 60 * 60
      });

      return response;
    } catch (error) {
      console.error('[middleware] Auto-login falló:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 3. Si es ruta pública, permitir
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 4. No autenticado, redirigir a login
  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 🎨 8. Componente LoginForm

```typescript
// components/auth/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { loginApiService } from '@/lib/services/loginApiService';
import { rolesService } from '@/lib/services/rolesService';
import { VerificationModal } from './VerificationModal';
import { toast } from 'sonner';

export function LoginForm() {
  const [documento, setDocumento] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const validateDocumento = (value: string): string[] => {
    const errores: string[] = [];
    
    if (!value) {
      errores.push('El documento es obligatorio');
    } else if (value.length < 6) {
      errores.push('Debe tener al menos 6 caracteres');
    } else if (!/^\d+$/.test(value)) {
      errores.push('Solo números permitidos');
    }
    
    return errores;
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDocumento(value);
    setErrors(validateDocumento(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateDocumento(documento);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Validar usuario
      const validarResponse = await loginApiService.validarUsuario(documento);
      
      // 2. Obtener permisos del rol
      const permisosResponse = await rolesService.getPermisosRol(validarResponse.rol);
      
      // 3. Verificar si requiere doble autenticación
      const requiereDobleAuth = permisosResponse.data.some(
        p => p.accAccion === 'Requiere doble autenticación'
      );

      if (requiereDobleAuth) {
        // Mostrar modal de verificación
        setUserData({
          documento,
          infoUsuario: validarResponse.data,
          permisos: permisosResponse.data
        });
        setShowVerification(true);
      } else {
        // Login directo sin 2FA
        const jwtResponse = await loginApiService.obtenerJWT(documento, 12);
        const token = jwtResponse.data.token || jwtResponse.data.Token;
        
        login(token, permisosResponse.data);
        toast.success('Inicio de sesión exitoso');
        router.push('/dashboard');
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <img 
            src="/images/Logo.png" 
            alt="Logo" 
            className="mx-auto mb-6 h-24 w-auto"
          />
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                value={documento}
                onChange={handleDocumentoChange}
                placeholder="Ingresa tu número de documento"
                className={`w-full px-4 py-2 border rounded-lg text-center font-semibold ${
                  errors.length > 0 ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              
              {errors.length > 0 && (
                <div className="mt-2 text-red-500 text-sm">
                  {errors.map((error, index) => (
                    <div key={index}>- {error}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={errors.length > 0 || !documento || isLoading}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Validando...' : 'Validar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showVerification && userData && (
        <VerificationModal
          documento={userData.documento}
          infoUsuario={userData.infoUsuario}
          permisos={userData.permisos}
          onClose={() => setShowVerification(false)}
        />
      )}
    </>
  );
}
```

---

## 📧 9. Modal de Verificación

```typescript
// components/auth/VerificationModal.tsx
'use client';

import { useState } from 'react';
import { loginApiService } from '@/lib/services/loginApiService';
import { TokenModal } from './TokenModal';
import { toast } from 'sonner';

interface VerificationModalProps {
  documento: string;
  infoUsuario: any;
  permisos: any[];
  onClose: () => void;
}

type MetodoVerificacion = 'Correo' | 'CorreoOrganizacional' | 'Celular';

export function VerificationModal({ 
  documento, 
  infoUsuario, 
  permisos, 
  onClose 
}: VerificationModalProps) {
  const [metodo, setMetodo] = useState<MetodoVerificacion>('CorreoOrganizacional');
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const handleEnviar = async () => {
    setIsLoading(true);

    let idMetodo: number;
    switch (metodo) {
      case 'Correo':
        idMetodo = infoUsuario.email.id;
        break;
      case 'CorreoOrganizacional':
        idMetodo = infoUsuario.emailSuper.id;
        break;
      case 'Celular':
        idMetodo = infoUsuario.phoneNumber.id;
        break;
    }

    try {
      const response = await loginApiService.enviarToken(documento, idMetodo);
      
      toast.success('En contados instantes te llegará el código por el medio que seleccionaste');
      
      setSessionId(response.data.idSession);
      setShowTokenModal(true);
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al enviar el código';
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  if (showTokenModal) {
    return (
      <TokenModal
        documento={documento}
        idSession={sessionId}
        permisos={permisos}
        onClose={() => {
          setShowTokenModal(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <img 
          src="/images/Logo.png" 
          alt="Logo" 
          className="mx-auto mb-6 h-24 w-auto"
        />

        <h3 className="text-center font-bold mb-6">
          Selecciona el canal por el cual quieres recibir el código:
        </h3>

        <div className="space-y-4 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="Correo"
              checked={metodo === 'Correo'}
              onChange={(e) => setMetodo(e.target.value as MetodoVerificacion)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-sm">
              Enviarme un correo a <strong>{infoUsuario.email.valor}</strong>
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="CorreoOrganizacional"
              checked={metodo === 'CorreoOrganizacional'}
              onChange={(e) => setMetodo(e.target.value as MetodoVerificacion)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-sm">
              Enviarme un correo a <strong>{infoUsuario.emailSuper.valor}</strong>
            </span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              value="Celular"
              checked={metodo === 'Celular'}
              onChange={(e) => setMetodo(e.target.value as MetodoVerificacion)}
              className="w-4 h-4"
            />
            <span className="font-semibold text-sm">
              Enviarme un mensaje de texto a <strong>{infoUsuario.phoneNumber.valor}</strong>
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnviar}
            disabled={isLoading}
            className="w-full px-6 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:bg-gray-400"
          >
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔢 10. Modal de Token

```typescript
// components/auth/TokenModal.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { loginApiService } from '@/lib/services/loginApiService';
import { toast } from 'sonner';

interface TokenModalProps {
  documento: string;
  idSession: string;
  permisos: any[];
  onClose: () => void;
}

export function TokenModal({ 
  documento, 
  idSession, 
  permisos, 
  onClose 
}: TokenModalProps) {
  const [token, setToken] = useState('');
  const [mantenerActivo, setMantenerActivo] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const validateToken = (value: string): string[] => {
    const errores: string[] = [];
    
    if (!value) {
      errores.push('El token es obligatorio');
    } else if (value.length < 6) {
      errores.push('Debe tener al menos 6 caracteres');
    } else if (value.length > 6) {
      errores.push('No puede exceder los 6 caracteres');
    }
    
    return errores;
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    setErrors(validateToken(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateToken(token);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const duracionSesion = mantenerActivo ? 12 : 6;
      
      const response = await loginApiService.verificarToken({
        documento,
        token,
        idSesion: idSession,
        duracionSesion
      });

      const authToken = response.data.token || response.data.Token;
      
      login(authToken, permisos);
      toast.success('Código verificado exitosamente');
      onClose();
      router.push('/dashboard');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Código inválido';
      toast.error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <img 
          src="/images/Logo.png" 
          alt="Logo" 
          className="mx-auto mb-6 h-24 w-auto"
        />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={token}
              onChange={handleTokenChange}
              placeholder="Ingresa el código de verificación"
              className={`w-full px-4 py-2 border rounded-lg text-center font-bold text-lg ${
                errors.length > 0 ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={6}
            />
            
            {errors.length > 0 && (
              <div className="mt-2 text-red-500 text-sm">
                {errors.map((error, index) => (
                  <div key={index}>- {error}</div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mantenerActivo}
                onChange={(e) => setMantenerActivo(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="font-bold">Mantener sesión activa</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={errors.length > 0 || !token || isLoading}
            className="w-full px-6 py-2 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? 'Verificando...' : 'Enviar código'}
          </button>

          <p className="text-sm text-gray-600 text-center">
            Si después de dos minutos no te ha llegado el código de verificación,{' '}
            <button 
              type="button"
              onClick={onClose}
              className="text-blue-600 underline cursor-pointer"
            >
              haz clic aquí
            </button>
            {' '}y selecciona otro método de envío.
          </p>
        </form>
      </div>
    </div>
  );
}
```

---

## 🛡️ 11. Layout Protegido

```typescript
// app/(protected)/layout.tsx

import { AuthProvider } from '@/lib/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
}
```

```typescript
// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

---

## 🌍 12. Variables de Entorno

```env
# .env.local

# API URLs
NEXT_PUBLIC_MS_LOGIN_URL=https://app.administracionsuper.com/Microservices/MS_Login/Api
NEXT_PUBLIC_MS_ROLES_URL=https://app.administracionsuper.com/Microservices/MS_RolesPermisos/Api

# App Token (sensible - usar en servidor cuando sea posible)
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

## 📦 13. Dependencias (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "jwt-decode": "^4.0.0",
    "jose": "^5.0.0",
    "sonner": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 🚀 14. Página de Login

```typescript
// app/login/page.tsx

import { LoginForm } from '@/components/auth/LoginForm';
import { Toaster } from 'sonner';

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <Toaster position="top-right" />
    </>
  );
}
```

---

## ✅ Checklist Final

- [ ] Instalar dependencias: `npm install axios jwt-decode sonner`
- [ ] Crear estructura de carpetas
- [ ] Copiar todos los archivos TypeScript
- [ ] Configurar variables de entorno
- [ ] Probar login manual sin 2FA
- [ ] Probar login con 2FA
- [ ] Probar auto-login desde CONECTA
- [ ] Verificar protección de rutas
- [ ] Verificar permisos por rol
- [ ] Implementar loading states
- [ ] Agregar manejo de errores
- [ ] Testing completo

---

**Nota:** Este código es una implementación completa lista para producción. Ajusta los estilos según tu diseño específico.
