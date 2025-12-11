"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  useRequerimiento, 
  useCandidatos, 
  useEliminarRequerimiento,
  useActualizarRequerimiento 
} from "@/lib/hooks/useSelection"
  import { useModernToast } from "@/lib/toast"
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  Calendar,
  Mail,
  User,
  Briefcase,
  Building2,
  Trash2,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CandidatosList } from "@/components/selection/CandidatosList"
import { AgregarCandidatoDialog } from "@/components/selection/AgregarCandidatoDialog"
import { NavigationLink } from "@/components/ui/navigation-link"

export default function RequerimientoDetallePage() {
  const params = useParams()
  const router = useRouter()
    const toast = useModernToast()
  const reqId = Number(params.id)

  const { data: requerimiento, isLoading } = useRequerimiento(reqId)
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos(reqId)
  const eliminarMutation = useEliminarRequerimiento()
  const actualizarMutation = useActualizarRequerimiento()

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddCandidatoDialog, setShowAddCandidatoDialog] = useState(false)

  const handleDelete = async () => {
    try {
      await eliminarMutation.mutateAsync(reqId)
        toast.success({
        title: "Requerimiento eliminado",
        description: "El requerimiento ha sido eliminado exitosamente.",
      })
      router.push("/panel/seleccion/requerimientos")
    } catch (error) {
        toast.error({
        title: "Error",
        description: "No se pudo eliminar el requerimiento. Por favor intenta nuevamente.",
      })
    }
  }

  const handleCambiarEstado = async (estadoCodigo: string) => {
    try {
      await actualizarMutation.mutateAsync({
        id: reqId,
        dto: { estadoCodigo },
      })
        toast.success({
        title: "Estado actualizado",
        description: "El estado del requerimiento ha sido actualizado.",
      })
    } catch (error) {
        toast.error({
        title: "Error",
        description: "No se pudo actualizar el estado.",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!requerimiento) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Requerimiento no encontrado</h2>
        <p className="text-muted-foreground mb-4">
          El requerimiento que buscas no existe o fue eliminado.
        </p>
        <NavigationLink href="/panel/seleccion/requerimientos">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Requerimientos
          </Button>
        </NavigationLink>
      </div>
    )
  }

  const getEstadoIcon = (estadoCodigo: string) => {
    switch (estadoCodigo) {
      case "ACTIVO":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "CERRADO":
        return <XCircle className="h-5 w-5 text-gray-500" />
      case "CANCELADO":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const getEstadoVariant = (estadoCodigo: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (estadoCodigo) {
      case "ACTIVO":
        return "default"
      case "CERRADO":
        return "secondary"
      case "CANCELADO":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NavigationLink href="/panel/seleccion/requerimientos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </NavigationLink>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {requerimiento.rolObjetivo}
            </h1>
            <p className="text-muted-foreground mt-1">
              {requerimiento.areaObjetivo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {requerimiento.estado?.estCodigo === "ACTIVO" && (
            <Button
              variant="outline"
              onClick={() => handleCambiarEstado("CERRADO")}
              disabled={actualizarMutation.isPending}
            >
              {actualizarMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cerrar Requerimiento
            </Button>
          )}
            {requerimiento.estado?.estCodigo === "CERRADO" && (
            <Button
              variant="outline"
              onClick={() => handleCambiarEstado("ACTIVO")}
              disabled={actualizarMutation.isPending}
            >
              {actualizarMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Reactivar
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Estado Banner */}
      <Card className={
          requerimiento.estado?.estCodigo === "ACTIVO" 
          ? "border-green-200 bg-green-50/50" 
            : requerimiento.estado?.estCodigo === "CERRADO"
          ? "border-gray-200 bg-gray-50/50"
          : "border-red-200 bg-red-50/50"
      }>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {getEstadoIcon(requerimiento.estado?.estCodigo || "PENDIENTE")}
              <div>
                <p className="font-semibold">
                    Estado: {requerimiento.estado?.estDescripcion || "Desconocido"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Creado {requerimiento.fechaCreacion ? formatDistanceToNow(new Date(requerimiento.fechaCreacion), {
                    addSuffix: true,
                    locale: es,
                    }) : "recientemente"}
                </p>
              </div>
            </div>
              <Badge variant={getEstadoVariant(requerimiento.estado?.estCodigo || "PENDIENTE")} className="text-base px-4 py-1">
              {requerimiento.totalCandidatos || 0} Candidatos
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Información del Requerimiento */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Información del Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Rol Objetivo
              </dt>
                <dd className="text-base font-semibold">{requerimiento.rolObjetivo || "No especificado"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Área Objetivo
              </dt>
              <dd className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                  {requerimiento.areaObjetivo || "No especificada"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Perfil Básico
              </dt>
              <dd className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {requerimiento.perfilBasico || "No especificado"}
              </dd>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Psicólogo Responsable
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Nombre
              </dt>
                <dd className="text-base font-semibold">{requerimiento.psicologoNombre || "No especificado"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Email
              </dt>
              <dd className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                  {requerimiento.psicologoEmail || "No especificado"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Documento
              </dt>
                <dd className="text-base">{requerimiento.psicologoDocumento || "No especificado"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground mb-1">
                Fecha de Creación
              </dt>
              <dd className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                  {requerimiento.fechaCreacion ? new Date(requerimiento.fechaCreacion).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  }) : "No especificada"}
              </dd>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Candidatos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Candidatos del Requerimiento
              </CardTitle>
              <CardDescription>
                Gestiona los candidatos asociados a este proceso de selección
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddCandidatoDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Candidato
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <CandidatosList 
            candidatos={candidatos} 
            isLoading={loadingCandidatos}
            requerimientoId={reqId}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el requerimiento y todos sus datos asociados.
              Los candidatos no serán eliminados pero se desvinculará su relación con este requerimiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Eliminar Requerimiento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Candidato Dialog */}
      <AgregarCandidatoDialog
        open={showAddCandidatoDialog}
        onOpenChange={setShowAddCandidatoDialog}
        requerimientoId={reqId}
      />
    </div>
  )
}
