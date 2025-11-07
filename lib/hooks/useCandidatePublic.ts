/**
 * React Query Hooks para API Pública de Candidatos
 * 
 * Estos hooks manejan el estado y caché de las peticiones a la API pública,
 * permitiendo el acceso de candidatos mediante tokens sin autenticación.
 * 
 * @see GUIA_INTEGRACION_FRONTEND_CANDIDATOS.md
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { candidatePublicApiService } from '@/lib/services/candidatePublicApiService'
import type {
  Candidato,
  RegistroSimpleDto,
  FormularioPublicoDto,
  CrearFormularioCandidatoDto,
} from '@/types/selection.types'

// ==================== QUERY KEYS ====================

export const candidatePublicKeys = {
  all: ['candidatos-publico'] as const,
  detail: (token: string) => [...candidatePublicKeys.all, 'detail', token] as const,
  pruebas: (token: string) => [...candidatePublicKeys.all, 'pruebas', token] as const,
}

// ==================== QUERIES ====================

/**
 * Hook para obtener los datos del candidato por su token
 * 
 * @param token - Token único del candidato
 * @param enabled - Si false, no ejecuta la query automáticamente
 * 
 * @example
 * ```tsx
 * function PaginaCandidato({ token }: { token: string }) {
 *   const { data: candidato, isLoading, error } = useCandidatoPublico(token)
 *   
 *   if (isLoading) return <div>Cargando...</div>
 *   if (error || !candidato) return <div>Candidato no encontrado</div>
 *   
 *   return (
 *     <div>
 *       <h1>¡Hola {candidato.nombreCompleto}!</h1>
 *       <p>Estado: {candidato.estado.estDescripcion}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useCandidatoPublico(token: string, enabled = true) {
  return useQuery({
    queryKey: candidatePublicKeys.detail(token),
    queryFn: async () => {
      const response = await candidatePublicApiService.obtenerPorToken(token)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'No se pudo obtener los datos del candidato')
      }
      return response.data
    },
    enabled: enabled && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  })
}

/**
 * Hook para obtener las pruebas asignadas a un candidato
 * 
 * @param token - Token único del candidato
 * 
 * @example
 * ```tsx
 * function MisPruebas({ token }: { token: string }) {
 *   const { data: pruebas, isLoading } = usePruebasCandidato(token)
 *   
 *   if (isLoading) return <div>Cargando pruebas...</div>
 *   if (!pruebas?.length) return <div>No tienes pruebas asignadas</div>
 *   
 *   return (
 *     <div>
 *       {pruebas.map(prueba => (
 *         <div key={prueba.aspId}>
 *           <h3>{prueba.nombrePrueba}</h3>
 *           <p>{prueba.completado ? 'Completada' : 'Pendiente'}</p>
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePruebasCandidato(token: string) {
  return useQuery({
    queryKey: candidatePublicKeys.pruebas(token),
    queryFn: async () => {
      const response = await candidatePublicApiService.obtenerPruebas(token)
      if (!response.success) {
        throw new Error(response.message || 'No se pudieron obtener las pruebas')
      }
      return response.data || []
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

// ==================== MUTATIONS ====================

/**
 * Hook para registro simple de candidato (solo datos básicos)
 * Después de registrar, el candidato debe completar su formulario demográfico
 * 
 * @example
 * ```tsx
 * function FormularioRegistro() {
 *   const registrar = useRegistroSimple()
 *   const toast = useModernToast()
 *   const router = useRouter()
 *   
 *   const handleSubmit = async (datos: RegistroSimpleDto) => {
 *     const result = await registrar.mutateAsync(datos)
 *     if (result.success && result.data) {
 *       const token = result.data.token
 *       localStorage.setItem('candidatoToken', token)
 *       
 *       toast.success({
 *         title: 'Registro exitoso',
 *         description: 'Ahora completa tu información demográfica'
 *       })
 *       
 *       router.push(`/candidate/${token}`)
 *     }
 *   }
 *   
 *   return <FormularioUI onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useRegistroSimple() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (dto: RegistroSimpleDto) => {
      return await candidatePublicApiService.registroSimple(dto)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Invalidar caché para forzar re-fetch
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.all })
      }
    },
  })
}

/**
 * Hook para registro completo de candidato (datos + formulario en un solo paso)
 * El candidato queda con estado FORMULARIO_COMPLETO inmediatamente
 * 
 * @example
 * ```tsx
 * function FormularioCompleto() {
 *   const registrar = useRegistroCompleto()
 *   const toast = useModernToast()
 *   const router = useRouter()
 *   
 *   const handleSubmit = async (datos: FormularioPublicoDto) => {
 *     const result = await registrar.mutateAsync(datos)
 *     if (result.success && result.data) {
 *       toast.success({
 *         title: '¡Registro completado!',
 *         description: 'Tu información ha sido guardada exitosamente'
 *       })
 *       
 *       router.push(`/candidate/${result.data.token}/confirmacion`)
 *     } else {
 *       toast.error({
 *         title: 'Error en el registro',
 *         description: result.message || 'No se pudo completar el registro'
 *       })
 *     }
 *   }
 *   
 *   return <FormularioUI onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useRegistroCompleto() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (dto: FormularioPublicoDto) => {
      return await candidatePublicApiService.registroCompleto(dto)
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.all })
      }
    },
  })
}

/**
 * Hook para completar el formulario demográfico de un candidato existente
 * Usado después de un registro simple o cuando el psicólogo agregó al candidato
 * 
 * @example
 * ```tsx
 * function CompletarFormulario({ token }: { token: string }) {
 *   const completar = useCompletarFormulario()
 *   const toast = useModernToast()
 *   const router = useRouter()
 *   
 *   const handleSubmit = async (datos: CrearFormularioCandidatoDto) => {
 *     const result = await completar.mutateAsync({ token, datos })
 *     if (result.success) {
 *       toast.success({
 *         title: 'Formulario completado',
 *         description: 'Tu información ha sido guardada correctamente'
 *       })
 *       
 *       router.push(`/candidate/${token}/confirmacion`)
 *     } else {
 *       toast.error({
 *         title: 'Error',
 *         description: result.message || 'No se pudo guardar el formulario'
 *       })
 *     }
 *   }
 *   
 *   return <FormularioUI onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useCompletarFormulario() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ token, datos }: { token: string; datos: CrearFormularioCandidatoDto }) => {
      return await candidatePublicApiService.completarFormulario(token, datos)
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidar el detalle del candidato para refrescar el estado
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.detail(variables.token) })
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.all })
      }
    },
  })
}
