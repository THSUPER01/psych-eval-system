import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DURACION_HORAS_SSO = Number(process.env.NEXT_PUBLIC_SESSION_DURATION_SSO || 8)

function isFromConecta(request: NextRequest): boolean {
  const referer = request.headers.get('referer')
  if (!referer) return false
  try {
    const url = new URL(referer)
    const expectedHost = (process.env.NEXT_PUBLIC_CONECTA_HOSTNAME || 'app.administracionsuper.com').toLowerCase()
    const expectedPath = (process.env.NEXT_PUBLIC_CONECTA_PATH || '/CONECTA').toLowerCase()
    const hostOk = url.hostname.toLowerCase() === expectedHost
    const path = url.pathname.toLowerCase()
    const pathOk = path === expectedPath || path.startsWith(expectedPath + '/')
    return hostOk && pathOk
  } catch {
    return false
  }
}

function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8'))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true
  const exp = decodeJwtExp(token)
  if (!exp) return true
  return Date.now() > exp * 1000
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Public paths that should not be blocked
  const publicPrefixes = [
    '/',
    '/psychologist/login',
    '/aplicar',
    '/candidate',
    '/api',
    '/_next',
    '/images',
    '/favicon.ico',
  ]
  const isPublic = publicPrefixes.some((p) => pathname === p || pathname.startsWith(p + '/'))

  const tokenCookie = request.cookies.get('authToken')?.value

  // SSO Auto-login from CONECTA if doc present and referer valid
  const doc = searchParams.get('doc')?.trim() || ''
  const docValido = /^\d{5,}$/.test(doc)
  if (docValido && isFromConecta(request)) {
    try {
      const APP_TOKEN = process.env.APP_TOKEN || process.env.NEXT_PUBLIC_APP_TOKEN || ''
      const MS_LOGIN_URL = process.env.NEXT_PUBLIC_MS_LOGIN_URL!
      const MS_ROLES_URL = process.env.NEXT_PUBLIC_MS_ROLES_URL!

      // 1) Validar usuario
      const validarResponse = await fetch(`${MS_LOGIN_URL}/Login/ValidarUsuario`, {
        method: 'POST',
        headers: { 'App-Token': APP_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento: doc }),
      })
      if (!validarResponse.ok) throw new Error('Usuario no válido')
      const validarData = await validarResponse.json()

      // 2) Obtener JWT (SSO duration)
      const jwtResponse = await fetch(`${MS_LOGIN_URL}/Login/ObtenerJWT`, {
        method: 'POST',
        headers: { 'App-Token': APP_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ documento: doc, duracionSesion: DURACION_HORAS_SSO }),
      })
      if (!jwtResponse.ok) throw new Error('Error obteniendo JWT')
      const jwtData = await jwtResponse.json()
      const authToken: string | undefined = jwtData?.data?.token || jwtData?.data?.Token
      if (!authToken) throw new Error('Token vacío')

      // 3) Obtener permisos
      const permisosResponse = await fetch(`${MS_ROLES_URL}/permisos/GetPermisosRol/${validarData.rol}`, {
        headers: { 'App-Token': APP_TOKEN, 'Content-Type': 'application/json' },
      })
      if (!permisosResponse.ok) throw new Error('Error obteniendo permisos')
      const permisosData = await permisosResponse.json()

      const response = NextResponse.redirect(new URL('/psychologist/dashboard', request.url))
      // Nota: para que el cliente pueda leer y migrar a localStorage, no usamos httpOnly aquí.
      const maxAge = DURACION_HORAS_SSO * 60 * 60
      response.cookies.set('authToken', authToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })
      response.cookies.set('appPermisos', JSON.stringify(permisosData.data || []), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })
      return response
    } catch (e) {
      // En caso de falla SSO, continuar al login manual
      return NextResponse.redirect(new URL('/psychologist/login', request.url))
    }
  }

  // If coming to protected pages without a valid token, redirect to login
  const isPsychologistArea = pathname.startsWith('/psychologist') && !pathname.startsWith('/psychologist/login')
  if (isPsychologistArea && (isTokenExpired(tokenCookie) || !tokenCookie)) {
    return NextResponse.redirect(new URL('/psychologist/login', request.url))
  }

  // Allow other public paths
  if (isPublic) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
}
