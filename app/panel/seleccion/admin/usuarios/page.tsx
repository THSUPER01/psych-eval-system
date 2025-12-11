"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { loginApiService } from "@/lib/services/loginApiService"
import { rolesService } from "@/lib/services/rolesService"
import { useAuth } from "@/lib/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, UserPlus, Shield, AlertCircle, Users as UsersIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const registrarUsuarioSchema = z.object({
  documentoUsuario: z.string().min(5, "Documento debe tener al menos 5 caracteres"),
  idRol: z.number().min(1, "Debe seleccionar un rol"),
})

type RegistrarUsuarioForm = z.infer<typeof registrarUsuarioSchema>

export default function AdminUsuariosPage() {
  const { user, hasPermission } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [openDialog, setOpenDialog] = useState(false)

  // Verificar si el usuario es ADMIN
  const isAdmin = user?.RolApp === "66" || user?.RolApp === 66

  const { data: usuarios, isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => loginApiService.obtenerUsuarios(),
    enabled: isAdmin,
  })

  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.getAllRoles(),
    enabled: isAdmin,
  })

  const roles = rolesData?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RegistrarUsuarioForm>({
    resolver: zodResolver(registrarUsuarioSchema),
    defaultValues: {
      documentoUsuario: "",
      idRol: 0,
    },
  })

  const registrarMutation = useMutation({
    mutationFn: async (data: RegistrarUsuarioForm) => {
      return loginApiService.registrarUsuario({
        documentoUsuario: data.documentoUsuario,
        idRol: data.idRol,
        usuarioCreacion: user?.documento || "",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toast({
        title: "Usuario registrado",
        description: "El usuario ha sido registrado exitosamente en el sistema",
      })
      setOpenDialog(false)
      reset()
    },
    onError: (error: any) => {
      toast({
        title: "Error al registrar usuario",
        description: error.message || "No se pudo registrar el usuario",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: RegistrarUsuarioForm) => {
    registrarMutation.mutate(data)
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-sm text-muted-foreground">
              Solo los administradores pueden acceder a este módulo
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administración de usuarios del sistema</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Registrar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Registrar Nuevo Usuario
              </DialogTitle>
              <DialogDescription>
                Ingrese el documento del colaborador y asigne un rol
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="documentoUsuario">Documento del Usuario</Label>
                <Input
                  id="documentoUsuario"
                  placeholder="Ej: 1056121362"
                  {...register("documentoUsuario")}
                />
                {errors.documentoUsuario && (
                  <p className="text-sm text-destructive">{errors.documentoUsuario.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idRol">Rol del Usuario</Label>
                <Select
                  value={watch("idRol")?.toString() || "0"}
                  onValueChange={(value) => setValue("idRol", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent className="w-[600px]">
                    <SelectItem value="0" disabled>Seleccione un rol</SelectItem>
                    {loadingRoles ? (
                      <div className="p-2 text-sm text-muted-foreground">Cargando roles...</div>
                    ) : (
                      roles.map((rol) => (
                        <SelectItem 
                          key={rol.rolIdRol} 
                          value={String(rol.rolIdRol)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {rol.rolRol}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex-1">
                              {rol.rolDescripcion}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.idRol && (
                  <p className="text-sm text-destructive">{errors.idRol.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-900">
                    <p className="font-medium mb-1">Importante:</p>
                    <p>El usuario debe existir como colaborador activo en el sistema.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={registrarMutation.isPending}>
                  {registrarMutation.isPending ? "Registrando..." : "Registrar Usuario"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
                <p className="text-2xl font-bold mt-1">
                  {usuarios?.usuarios?.length || 0}
                </p>
              </div>
              <UsersIcon className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Roles Disponibles</p>
                <p className="text-2xl font-bold mt-1">{roles.length}</p>
              </div>
              <Shield className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold mt-1">
                  {usuarios?.usuarios?.filter((u: any) => u.rol === 66).length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>
            Lista de todos los usuarios con acceso al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingUsuarios ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : usuarios?.usuarios && usuarios.usuarios.length > 0 ? (
            <div className="space-y-3">
              {usuarios.usuarios.map((usuario: any) => {
                const rol = roles.find(r => r.rolIdRol === usuario.rol)
                return (
                  <div
                    key={usuario.documento}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UsersIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {usuario.nombre}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Doc: {usuario.documento}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={usuario.rol === 66 ? "default" : "outline"}>
                                {rol?.rolRol || `Rol ${usuario.rol}`}
                              </Badge>
                              <Badge variant={usuario.estado === 1 ? "default" : "secondary"}>
                                {usuario.estado === 1 ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rol?.rolDescripcion || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No hay usuarios registrados aún</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setOpenDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primer Usuario
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
