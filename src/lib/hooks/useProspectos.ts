import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { prospectosService } from "@/lib/services/prospectosService"
import type {
  ActualizarProspectoDto,
  CrearProspectoDto,
  RegistrarContactoDto,
  ConvertirProspectoDto,
  Prospecto,
  ProspectoResumen,
} from "@/types/prospectos.types"
import type { Candidato } from "@/types/selection.types"

export function useProspectos(filtroEstado?: string | null) {
  return useQuery<ProspectoResumen[]>({
    queryKey: ["prospectos", filtroEstado || "todos"],
    queryFn: () => prospectosService.obtenerProspectos(filtroEstado),
  })
}

export function useProspecto(id: number | null) {
  return useQuery<Prospecto>({
    queryKey: ["prospecto", id],
    queryFn: () => prospectosService.obtenerProspecto(id!),
    enabled: !!id && id > 0,
  })
}

export function useCrearProspecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearProspectoDto) => prospectosService.crearProspecto(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
    },
  })
}

export function useActualizarProspecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: ActualizarProspectoDto }) =>
      prospectosService.actualizarProspecto(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
      queryClient.invalidateQueries({ queryKey: ["prospecto", variables.id] })
    },
  })
}

export function useRegistrarContactoProspecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: RegistrarContactoDto }) =>
      prospectosService.registrarContacto(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
      queryClient.invalidateQueries({ queryKey: ["prospecto", variables.id] })
    },
  })
}

export function useConvertirProspecto() {
  const queryClient = useQueryClient()
  return useMutation<Candidato, Error, { id: number; dto: ConvertirProspectoDto }>({
    mutationFn: ({ id, dto }) => prospectosService.convertirACandidato(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
      queryClient.invalidateQueries({ queryKey: ["prospecto", variables.id] })
    },
  })
}

export function useEliminarProspecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => prospectosService.eliminarProspecto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
    },
  })
}

export function useSubirCvProspecto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => prospectosService.subirCv(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prospectos"] })
      queryClient.invalidateQueries({ queryKey: ["prospecto", variables.id] })
    },
  })
}
