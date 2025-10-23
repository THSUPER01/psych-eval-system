import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { selectionApiService } from '@/lib/services/selectionApiService'
import type {
  Requerimiento,
  CrearRequerimientoDto,
  ActualizarRequerimientoDto,
  Candidato,
  CrearCandidatoDto,
  AsignacionPrueba,
  CrearAsignacionDto,
} from '@/types/selection.types'

// ==================== REQUERIMIENTOS ====================

export function useRequerimientos() {
  return useQuery<Requerimiento[]>({
    queryKey: ['requerimientos'],
    queryFn: () => selectionApiService.getRequerimientos(),
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

export function useCandidatos(requerimientoId?: number) {
  return useQuery<Candidato[]>({
    queryKey: requerimientoId ? ['candidatos', 'requerimiento', requerimientoId] : ['candidatos'],
    queryFn: () =>
      requerimientoId
        ? selectionApiService.getCandidatosPorRequerimiento(requerimientoId)
        : selectionApiService.getCandidatos(),
  })
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

// ==================== PRUEBAS Y ASIGNACIONES ====================

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

export function useAsignaciones(candidatoId?: number) {
  return useQuery<AsignacionPrueba[]>({
    queryKey: candidatoId ? ['asignaciones', 'candidato', candidatoId] : ['asignaciones'],
    queryFn: () =>
      candidatoId
        ? selectionApiService.getAsignacionesPorCandidato(candidatoId)
        : selectionApiService.getAsignaciones(),
  })
}

export function useCrearAsignacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CrearAsignacionDto) => selectionApiService.crearAsignacion(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
      queryClient.invalidateQueries({ queryKey: ['asignaciones', 'candidato', data.candidatoId] })
    },
  })
}

export function useEliminarAsignacion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => selectionApiService.eliminarAsignacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] })
    },
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
