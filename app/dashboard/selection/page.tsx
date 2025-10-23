"use client"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequerimientos, useCandidatos } from "@/lib/hooks/useSelection"
import { useAuth } from "@/lib/hooks/useAuth"
import { 
  FileText, 
  Users, 
  ClipboardCheck, 
  TrendingUp,
  Plus,
  Calendar,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function SelectionDashboardPage() {
  const { user } = useAuth()
  const { data: requerimientos, isLoading: loadingRequerimientos } = useRequerimientos()
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()

  // Calculate statistics
  const stats = {
    totalRequerimientos: requerimientos?.length || 0,
    activos: requerimientos?.filter(r => r.estado.estCodigo === "ACTIVO").length || 0,
    totalCandidatos: candidatos?.length || 0,
    enProceso: candidatos?.filter(c => c.estado.estCodigo === "EN_PROCESO").length || 0,
  }

  return (
    <div className="relative space-y-6">
      {/* Decorative background images */}
      <div className="pointer-events-none select-none absolute right-4 top-4 opacity-5 hidden xl:block z-0">
        <Image 
          src="/images/Recurso%203.png" 
          alt="Decoración" 
          width={180} 
          height={180}
          className="object-contain"
        />
      </div>
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard de Selección
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido, {user?.nombre || "Usuario"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requerimientos
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingRequerimientos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalRequerimientos}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activos} activos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Candidatos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalCandidatos}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.enProceso} en proceso
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de Completitud
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats.totalCandidatos > 0
                    ? Math.round(
                        ((candidatos?.filter(c => c.estado.estCodigo === "COMPLETADO").length || 0) /
                          stats.totalCandidatos) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Candidatos completados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividad
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingRequerimientos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {requerimientos?.filter(r => {
                    const createdDate = new Date(r.fechaCreacion)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return createdDate > weekAgo
                  }).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta semana
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 relative z-10">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tus procesos de selección
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/selection/requerimientos">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Crear Nuevo Requerimiento
              </Button>
            </Link>
            <Link href="/dashboard/selection/candidatos">
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Ver Candidatos
              </Button>
            </Link>
            <Link href="/dashboard/selection/asignaciones">
              <Button className="w-full justify-start" variant="outline">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Asignar Pruebas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimos requerimientos creados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRequerimientos ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : requerimientos && requerimientos.length > 0 ? (
              <div className="space-y-3">
                {requerimientos
                  .sort((a, b) => 
                    new Date(b.fechaCreacion).getTime() - 
                    new Date(a.fechaCreacion).getTime()
                  )
                  .slice(0, 5)
                  .map((req) => (
                    <Link
                      key={req.reqId}
                      href={`/dashboard/selection/requerimientos/${req.reqId}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{req.cargoObjetivo}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(req.fechaCreacion), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={req.estado.estCodigo === "ACTIVO" ? "default" : "secondary"}>
                        {req.estado.estDescripcion}
                      </Badge>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No hay requerimientos aún
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {candidatos && candidatos.filter(c => c.estado.estCodigo === "PENDIENTE").length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-900">
                Acciones Pendientes
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Tienes candidatos pendientes de gestión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-amber-900">
                {candidatos.filter(c => c.estado.estCodigo === "PENDIENTE").length} candidatos 
                esperando asignación de pruebas
              </p>
              <Link href="/dashboard/selection/candidatos">
                <Button variant="outline" size="sm" className="border-amber-300">
                  Ver Candidatos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
