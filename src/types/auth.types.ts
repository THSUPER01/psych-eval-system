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
  DISENADOR_ETAPAS: 131,
} as const

export type PermisoKey = keyof typeof PERMISOS
export type PermisoValue = (typeof PERMISOS)[PermisoKey]

export interface Permiso {
  perIdPermisoRol: number
  accIdAccion: number
  accAccion: string
  accVisIdVista: number
  visVista: string
  modAplIdAplicacion: number
  modModulo: string
  visModIdModulo: number
}

export interface ValidarUsuarioResponse {
  data: {
    email: { id: number; valor: string }
    emailSuper: { id: number; valor: string }
    phoneNumber: { id: number; valor: string }
  }
  rol: number
  mensaje?: string
}

export interface EnviarTokenResponse {
  data: {
    idSession: string
  }
  mensaje?: string
}

export interface VerificarTokenParams {
  documento: string
  token: string
  idSesion: string
  duracionSesion: number
}

export interface VerificarTokenResponse {
  data: {
    token?: string
    Token?: string
  }
  mensaje?: string
}

export interface ObtenerJWTResponse {
  data: {
    token?: string
    Token?: string
  }
  mensaje?: string
}

export interface PermisosRolResponse {
  data: Permiso[]
  mensaje?: string
}

export interface Rol {
  rolIdRol: number
  rolRol: string
  rolAplIdAplicacion: number
  rolDescripcion: string
  rolEstEstado: number
  rolUsuarioCreacion: string
  rolUsuarioModificacion: string
  rolFechaCreacion: string
  rolFechaModificacion: string
  groPermisoRols: any[]
  rolEstEstadoNavigation: any
}

export interface RolResponse {
  success: boolean
  message: string
  data: Rol
}

export interface DecodedToken {
  exp: number
  iat: number
  [key: string]: any
}

export interface User {
  documento?: string
  rol?: number
  permisos?: number[]
  [key: string]: any
}

export interface AuthContextType {
  user: User | null
  permissions: number[]
  userRole: Rol | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, permisos: Permiso[], documento?: string) => void
  logout: () => void
  hasPermission: (permisoId: number) => boolean
}
