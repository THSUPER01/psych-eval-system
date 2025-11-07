"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEliminarCandidato } from "@/lib/hooks/useSelection"
import { useModernToast } from "@/lib/toast"
import { 
  MoreVertical, 
  Eye, 
  Trash2,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { Candidato } from "@/types/selection.types"
import { EnviarLinkDialog } from "./EnviarLinkDialog"

interface CandidatosListProps {
  candidatos?: Candidato[]
  isLoading: boolean
  requerimientoId: number
}

export function CandidatosList({ candidatos, isLoading, requerimientoId }: CandidatosListProps) {
  const toast = useModernToast()
  const eliminarMutation = useEliminarCandidato()
  const [selectedCandidato, setSelectedCandidato] = useState<Candidato | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)

  const handleDelete = async (canId: number) => {
    if (!confirm("¿Estás seguro de eliminar este candidato?")) {
      return
    }

    try {
      await eliminarMutation.mutateAsync(canId)
      toast.success({
        title: "Candidato eliminado",
        description: "El candidato ha sido eliminado exitosamente.",
      })
    } catch (error) {
      toast.error({
        title: "Error",
        description: "No se pudo eliminar el candidato.",
      })
    }
  }

  const handleEnviarLink = (candidato: Candidato) => {
    setSelectedCandidato(candidato)
    setShowLinkDialog(true)
  }

  const getEstadoIcon = (estadoCodigo: string) => {
    switch (estadoCodigo) {
      case "COMPLETADO":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "EN_PROCESO":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "PENDIENTE":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getEstadoVariant = (estadoCodigo: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (estadoCodigo) {
      case "COMPLETADO":
        return "default"
      case "EN_PROCESO":
        return "outline"
      case "PENDIENTE":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (!candidatos || candidatos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No hay candidatos registrados
        </h3>
        <p className="text-sm text-muted-foreground">
          Agrega candidatos para comenzar el proceso de selección.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Formulario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidatos.map((candidato) => (
              <TableRow key={candidato.canId}>
                <TableCell className="font-medium">
                  {candidato.nombreCompleto}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {candidato.cedulaCiudadania}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {candidato.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {candidato.telefono}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {candidato.linkEnviado ? (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Enviado
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEnviarLink(candidato)}
                      className="h-8"
                    >
                      <LinkIcon className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {candidato.formularioCompleto ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completo
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getEstadoIcon(candidato.estado.estCodigo)}
                    <Badge variant={getEstadoVariant(candidato.estado.estCodigo)}>
                      {candidato.estado.estDescripcion}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(candidato.fechaCreacion), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/selection/candidatos/${candidato.canId}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalle
                        </Link>
                      </DropdownMenuItem>
                      {!candidato.linkEnviado && (
                        <DropdownMenuItem onClick={() => handleEnviarLink(candidato)}>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Enviar Link
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(candidato.canId)}
                        className="text-destructive focus:text-destructive"
                        disabled={eliminarMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Enviar Link Dialog */}
      {selectedCandidato && (
        <EnviarLinkDialog
          open={showLinkDialog}
          onOpenChange={setShowLinkDialog}
          candidato={selectedCandidato}
        />
      )}
    </>
  )
}
