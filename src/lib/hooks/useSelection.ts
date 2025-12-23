import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { selectionApiService, asignarCmtManual } from '@/lib/services/selectionApiService'
import { test16pfService } from '@/lib/services/test16pfService'
import { useAuth } from './useAuth'
import type {
  Requerimiento,
  CrearRequerimientoDto,
  ActualizarRequerimientoDto,
  Candidato,
  CrearCandidatoDto,
  TipoNormativa,
} from '@/types/selection.types'

// ==================== ASIGNACIÓN MANUAL CMT ====================
export function useAsignarCmtManual() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ candidatoId, tipoNormativaId }: { candidatoId: number; tipoNormativaId: number }) =>
      asignarCmtManual(candidatoId, tipoNormativaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      queryClient.invalidateQueries({ queryKey: ['candidato', variables.candidatoId] })
    },
  })
}
// ==================== ASIGNACIÓN 16PF ====================
export function useAsignar16pf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (candidatoId: number) => selectionApiService.asignar16pf(candidatoId),
    onSuccess: (_data, candidatoId) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      queryClient.invalidateQueries({ queryKey: ['candidato', candidatoId] })
      // Si ya existiera algún resultado cacheado por token relacionado se podría invalidar aquí
    },
  })
}

// ==================== REQUERIMIENTOS ====================

export function useRequerimientos() {
  const { user, isLoading: authLoading } = useAuth()

  return useQuery<Requerimiento[]>({
    queryKey: ['requerimientos', user?.documento],
    queryFn: async () => {
      // Si aún cargando auth, esperar o retornar vacío (controlado por enabled)
      if (authLoading) return []

      // Lógica de roles: Si es Admin/Jefe ve todo, si no, filtra por su documento
      // Ajusta los nombres de roles según tu base de datos
      return selectionApiService.getRequerimientos()
    },
    enabled: !authLoading && !!user, // Solo ejecutar cuando hay usuario autenticado
  })
}

export function useRequerimiento(id: number) {
  return useQuery<Requerimiento>({
    queryKey: ['requerimiento', id],
    queryFn: () => selectionApiService.getRequerimientoPorId(id),
    enabled: !!id && id > 0,
  })
}

export function useRequerimientosPorPsicologo(documento: string) {
  return useQuery<Requerimiento[]>({
    queryKey: ['requerimientos', 'psicologo', documento],
    queryFn: () => selectionApiService.getRequerimientosPorPsicologo(documento),
    enabled: !!documento,
  })
}

export function useCrearRequerimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CrearRequerimientoDto) => selectionApiService.crearRequerimiento(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requerimientos'] })
    },
  })
}

export function useActualizarRequerimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarRequerimientoDto }) =>
      selectionApiService.actualizarRequerimiento(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requerimientos'] })
      queryClient.invalidateQueries({ queryKey: ['requerimiento', variables.id] })
    },
  })
}

export function useEliminarRequerimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => selectionApiService.eliminarRequerimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requerimientos'] })
    },
  })
}

// ==================== CANDIDATOS ====================

export function useCandidatos(
  requerimientoId?: number,
  filtroEstado: 'activos' | 'completados' | 'todos' = 'todos'
) {
  const { user, isLoading: authLoading } = useAuth()

  return useQuery<Candidato[]>({
    queryKey: requerimientoId 
      ? ['candidatos', 'requerimiento', requerimientoId, filtroEstado] 
      : ['candidatos', 'general', user?.documento, filtroEstado],
    queryFn: async () => {
      // 1. Si hay requerimiento específico, tiene prioridad
      if (requerimientoId) {
        const lista = await selectionApiService.getCandidatosPorRequerimiento(requerimientoId)
        return aplicarFiltroEstado(lista, filtroEstado)
      }

      // 2. Si es Admin o no hay usuario, traer todo (comportamiento default)
      // El backend filtra automǭticamente por psicólogo según headers (X-Documento / X-Roles).


      // 3. Si es Psicólogo, usar endpoint específico
      const lista = await selectionApiService.getCandidatos()
      return aplicarFiltroEstado(lista, filtroEstado)
    },
    enabled: !authLoading && !!user,
  })
}

function aplicarFiltroEstado(lista: Candidato[], filtro: 'activos' | 'completados' | 'todos'): Candidato[] {
  if (filtro === 'todos') return lista
  const esCompletado = (c: Candidato) => c.estado?.estCodigo === 'CAND_APROBADO' || c.estado?.estCodigo === 'CAND_RECHAZADO'
  return filtro === 'completados' ? lista.filter(esCompletado) : lista.filter((c) => !esCompletado(c))
}

export function useCandidato(id: number) {
  return useQuery<Candidato>({
    queryKey: ['candidato', id],
    queryFn: () => selectionApiService.getCandidatoPorId(id),
    enabled: !!id && id > 0,
  })
}

export function useCrearCandidato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CrearCandidatoDto) => selectionApiService.crearCandidato(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      queryClient.invalidateQueries({ queryKey: ['candidatos', 'requerimiento', data.requerimientoId] })
      queryClient.invalidateQueries({ queryKey: ['requerimiento', data.requerimientoId] })
    },
  })
}

export function useMarcarLinkEnviado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (candidatoId: number) => selectionApiService.marcarLinkEnviado(candidatoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
    },
  })
}

export function useEliminarCandidato() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => selectionApiService.eliminarCandidato(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
    },
  })
}

export function useAsignarCandidatoARequerimiento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ candidatoId, requerimientoId }: { candidatoId: number; requerimientoId: number }) =>
      selectionApiService.asignarCandidatoARequerimiento(candidatoId, requerimientoId),
    onSuccess: (data, variables) => {
      // Refrescar listas y detalles relacionados
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      queryClient.invalidateQueries({ queryKey: ['candidato', variables.candidatoId] })
      if (variables.requerimientoId) {
        queryClient.invalidateQueries({ queryKey: ['requerimiento', variables.requerimientoId] })
      }
      queryClient.invalidateQueries({ queryKey: ['requerimientos'] })
    },
  })
}

export function useRegistrarResultado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ candidatoId, dto }: { candidatoId: number; dto: import('@/types/selection.types').RegistrarResultadoDto }) =>
      selectionApiService.registrarResultado(candidatoId, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] })
      queryClient.invalidateQueries({ queryKey: ['candidato', variables.candidatoId] })
    },
  })
}

// ==================== PRUEBAS ====================

export function usePruebasPsicotecnicas() {
  return useQuery({
    queryKey: ['pruebas-psicotecnicas'],
    queryFn: () => selectionApiService.getPruebasPsicotecnicas(),
  })
}

export function usePublicacionesActivas() {
  return useQuery({
    queryKey: ['publicaciones-activas'],
    queryFn: () => selectionApiService.getPublicacionesActivas(),
  })
}

// ==================== RESULTADOS ====================

export function useResultadosCandidato(candidatoId: number) {
  return useQuery({
    queryKey: ['resultados', 'candidato', candidatoId],
    queryFn: () => selectionApiService.getResultadosPorCandidato(candidatoId),
    enabled: !!candidatoId && candidatoId > 0,
  })
}

export function useRespuestasIntento(intentoId: number) {
  return useQuery({
    queryKey: ['respuestas', 'intento', intentoId],
    queryFn: () => selectionApiService.getRespuestasIntento(intentoId),
    enabled: !!intentoId && intentoId > 0,
  })
}

// ==================== DOCUMENTOS ====================

export function useDocumentosCandidato(candidatoId: number) {
  return useQuery({
    queryKey: ['documentos', 'candidato', candidatoId],
    queryFn: () => selectionApiService.getDocumentosCandidato(candidatoId),
    enabled: !!candidatoId && candidatoId > 0,
  })
}

export function useSubirDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      candidatoId,
      file,
      tipoDocumento,
    }: {
      candidatoId: number
      file: File
      tipoDocumento: string
    }) => selectionApiService.subirDocumento(candidatoId, file, tipoDocumento),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documentos', 'candidato', variables.candidatoId] })
    },
  })
}

export function useEliminarDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentoId: number) => selectionApiService.eliminarDocumento(documentoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
    },
  })
}

// ============================================
// HOOKS PARA TIPOS DE NORMATIVA
// ============================================

export function useTiposNormativa() {
  return useQuery<TipoNormativa[]>({
    queryKey: ['tipos-normativa'],
    queryFn: () => selectionApiService.getTiposNormativa(),
    staleTime: 1000 * 60 * 60, // Cache por 1 hora (catálogo estático)
  })
}

// ============================================
// HOOKS PARA RESULTADOS CMT
// ============================================

/**
 * Hook para obtener el resultado CMT de un candidato específico
 * (Acceso desde dashboard de psicólogo usando token)
 */
export function useResultadoCMTPorCandidato(token: string | null | undefined, recalcular = false) {
  return useQuery({
    queryKey: ['cmt-resultado', 'token', token, recalcular],
    queryFn: () => selectionApiService.getResultadoCMTPorToken(token!, recalcular),
    enabled: !!token && token.length > 0,
    staleTime: recalcular ? 0 : 1000 * 60 * 5, // 5 minutos (o 0 si se fuerza recálculo)
  })
}

// ============================================
// HOOK RESULTADO 16PF (por token de candidato)
// ============================================
export function useResultado16PFPorCandidato(token: string | null | undefined) {
  return useQuery({
    queryKey: ['16pf-resultado', 'token', token],
    queryFn: () => test16pfService.getResultado(token!),
    enabled: !!token && token.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}
