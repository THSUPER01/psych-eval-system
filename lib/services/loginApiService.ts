const API_URL = process.env.NEXT_PUBLIC_MS_LOGIN_URL ||
  'https://app.administracionsuper.com/Microservices/MS_Login/Api'

const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN ||
  'B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438'

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'App-Token': APP_TOKEN,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      const data = JSON.parse(text)
      message = data?.mensaje || message
    } catch {}
    throw new Error(message || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

import type {
  ValidarUsuarioResponse,
  EnviarTokenResponse,
  VerificarTokenParams,
  VerificarTokenResponse,
  ObtenerJWTResponse,
} from '@/types/auth.types'

export const loginApiService = {
  async validarUsuario(documento: string): Promise<ValidarUsuarioResponse> {
    return http<ValidarUsuarioResponse>('/Login/ValidarUsuario', {
      method: 'POST',
      body: JSON.stringify({ documento }),
    })
  },

  async enviarToken(documento: string, idMetodo: number): Promise<EnviarTokenResponse> {
    return http<EnviarTokenResponse>('/Login/EnviarToken', {
      method: 'POST',
      body: JSON.stringify({ documento, idMetodo }),
    })
  },

  async verificarToken(params: VerificarTokenParams): Promise<VerificarTokenResponse> {
    return http<VerificarTokenResponse>('/Login/VerificarToken', {
      method: 'POST',
      body: JSON.stringify({
        documento: params.documento,
        token: params.token,
        idSesion: params.idSesion,
        duracionSesion: params.duracionSesion,
      }),
    })
  },

  async obtenerJWT(documento: string, duracionSesion: number): Promise<ObtenerJWTResponse> {
    return http<ObtenerJWTResponse>('/Login/ObtenerJWT', {
      method: 'POST',
      body: JSON.stringify({ documento, duracionSesion }),
    })
  },

  async obtenerColaboradorActivo(documento: string): Promise<any> {
    return http<any>(`/Usuario/ObtenerColaboradorActivo/${documento}`, {
      method: 'GET',
    })
  },
}
