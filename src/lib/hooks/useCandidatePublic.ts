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
  CmtResponderPreguntaDto,
} from '@/types/selection.types'

// ==================== QUERY KEYS ====================

export const candidatePublicKeys = {
  all: ['candidatos-publico'] as const,
  detail: (token: string) => [...candidatePublicKeys.all, 'detail', token] as const,
  cmtPreguntas: (token: string) => [...candidatePublicKeys.all, 'cmt', 'preguntas', token] as const,
  cmtEstado: (token: string) => [...candidatePublicKeys.all, 'cmt', 'estado', token] as const,
  cmtResultado: (token: string) => [...candidatePublicKeys.all, 'cmt', 'resultado', token] as const,
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
 *       router.push(`/candidato/${token}`)
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
 *       router.push(`/candidato/${result.data.token}/confirmacion`)
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
 *       router.push(`/candidato/${token}/confirmacion`)
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
        // Invalidar el detalle del candidato para refreschar el estado
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.detail(variables.token) })
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.all })
      }
    },
  })
}

// ==================== CMT (PRUEBA MOTIVACIONAL) ====================

/**
 * Hook para obtener las preguntas de la prueba CMT
 * 
 * @param token - Token único del candidato
 * 
 * @example
 * ```tsx
 * function PruebaCMT({ token }: { token: string }) {
 *   const { data, isLoading, error } = usePreguntasCMT(token)
 *   
 *   if (isLoading) return <div>Cargando preguntas...</div>
 *   if (error) return <div>Error al cargar la prueba</div>
 *   
 *   return (
 *     <div>
 *       {data?.data.map((pregunta, index) => (
 *         <PreguntaCMT key={index} pregunta={pregunta} numero={index + 1} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePreguntasCMT(token: string, enabled = true) {
  return useQuery({
    queryKey: candidatePublicKeys.cmtPreguntas(token),
    queryFn: async () => {
      const response = await candidatePublicApiService.obtenerPreguntasCMT(token)
      if (!response.success) {
        throw new Error('No se pudieron obtener las preguntas CMT')
      }
      return response
    },
    enabled: enabled && !!token,
    staleTime: 1000 * 60 * 60, // 1 hora (las preguntas no cambian)
  })
}

export function useEstadoCMT(token: string, enabled = true) {
  return useQuery({
    queryKey: candidatePublicKeys.cmtEstado(token),
    queryFn: async () => {
      const response = await candidatePublicApiService.obtenerEstadoCMT(token)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'No se pudo obtener el estado CMT')
      }
      return response.data
    },
    enabled: enabled && !!token,
    refetchInterval: 1000 * 30,
    refetchOnWindowFocus: true,
  })
}

export function useAutosaveCMT() {
  return useMutation({
    mutationFn: async ({
      token,
      respuesta,
      segundosConsumidosCliente,
    }: {
      token: string
      respuesta: CmtResponderPreguntaDto
      segundosConsumidosCliente: number
    }) => {
      const response = await candidatePublicApiService.autosaveCMT(token, { respuesta, segundosConsumidosCliente })
      if (!response.success) {
        throw new Error(response.message || 'No se pudo guardar el progreso')
      }
      return response
    },
  })
}

/**
 * Hook para enviar las respuestas de la prueba CMT
 * 
 * @example
 * ```tsx
 * function FormularioCMT({ token }: { token: string }) {
 *   const enviarRespuestas = useEnviarRespuestasCMT()
 *   const toast = useToast()
 *   const router = useRouter()
 *   
 *   const handleSubmit = async (respuestas: any[]) => {
 *     const result = await enviarRespuestas.mutateAsync({ token, respuestas })
 *     if (result.success) {
 *       toast.success({
 *         title: 'Prueba completada',
 *         description: 'Tus respuestas han sido guardadas exitosamente'
 *       })
 *       router.push(`/candidato/${token}/resultado`)
 *     } else {
 *       toast.error({
 *         title: 'Error',
 *         description: result.message || 'No se pudieron guardar las respuestas'
 *       })
 *     }
 *   }
 *   
 *   return <FormularioCMTUI onSubmit={handleSubmit} />
 * }
 * ```
 */
export function useEnviarRespuestasCMT() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      token, 
      respuestas 
    }: { 
      token: string
      respuestas: CmtResponderPreguntaDto[] 
    }) => {
      return await candidatePublicApiService.enviarRespuestasCMT(token, { respuestas })
    },
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidar caché para refrescar estado del candidato
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.detail(variables.token) })
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.cmtResultado(variables.token) })
        queryClient.invalidateQueries({ queryKey: candidatePublicKeys.all })
      }
    },
  })
}

/**
 * Hook para obtener el resultado de la prueba CMT
 * 
 * @param token - Token único del candidato
 * @param recalcular - Si true, fuerza recálculo del resultado
 * 
 * @example
 * ```tsx
 * function ResultadoCMT({ token }: { token: string }) {
 *   const { data, isLoading, error } = useResultadoCMT(token)
 *   
 *   if (isLoading) return <div>Calculando resultado...</div>
 *   if (error) return <div>Error al obtener resultado</div>
 *   
 *   return (
 *     <div>
 *       <h2>Resultados de {data?.data.nombreCandidato}</h2>
 *       {data?.data.dimensiones.map(dim => (
 *         <DimensionCard key={dim.codigoDimension} dimension={dim} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useResultadoCMT(token: string, recalcular = false) {
  return useQuery({
    queryKey: candidatePublicKeys.cmtResultado(token),
    queryFn: async () => {
      const response = await candidatePublicApiService.obtenerResultadoCMT(token, recalcular)
      if (!response.success) {
        throw new Error('No se pudo obtener el resultado CMT')
      }
      return response
    },
    enabled: !!token,
    staleTime: recalcular ? 0 : 1000 * 60 * 5, // 5 minutos (o 0 si se recalcula)
  })
}
