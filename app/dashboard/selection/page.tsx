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
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function SelectionDashboardPage() {
  const { user } = useAuth()
  const { data: requerimientos, isLoading: loadingRequerimientos } = useRequerimientos()
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()

  // Calculate statistics
  const totalCandidatos = candidatos?.length || 0
  const completados = candidatos?.filter(c => c?.estado?.estCodigo === "COMPLETADO").length || 0
  const tasaCompletitud = totalCandidatos > 0 
    ? Math.round((completados / totalCandidatos) * 100)
    : 0
  
  const stats = {
    totalRequerimientos: requerimientos?.length || 0,
    activos: requerimientos?.filter(r => r?.estado?.estCodigo === "ACTIVO").length || 0,
    totalCandidatos: totalCandidatos,
    completados: completados,
    enProceso: candidatos?.filter(c => c?.estado?.estCodigo === "EN_PROCESO").length || 0,
    pendientes: candidatos?.filter(c => c?.estado?.estCodigo === "PENDIENTE").length || 0,
    tasaCompletitud: tasaCompletitud,
  }

  // Datos para gráfico de distribución de candidatos
  const distributionData = [
    { name: 'Completados', value: stats.completados, color: '#7AC943' },
    { name: 'En Proceso', value: stats.enProceso, color: '#00AEEF' },
    { name: 'Pendientes', value: stats.pendientes, color: '#F7941D' },
  ]

  // Datos para gráfico de actividad semanal (simulado)
  const weeklyActivityData = [
    { day: 'Lun', requerimientos: 2, candidatos: 5 },
    { day: 'Mar', requerimientos: 3, candidatos: 8 },
    { day: 'Mié', requerimientos: 1, candidatos: 3 },
    { day: 'Jue', requerimientos: 4, candidatos: 12 },
    { day: 'Vie', requerimientos: 2, candidatos: 7 },
    { day: 'Sab', requerimientos: 0, candidatos: 2 },
    { day: 'Dom', requerimientos: 1, candidatos: 1 },
  ]

  const COLORS = ['#7AC943', '#00AEEF', '#F7941D']

  return (
    <div className="relative space-y-6">
      {/* Decorative background */}
      <div className="pointer-events-none select-none absolute right-4 top-4 opacity-5 hidden xl:block z-0">
        <Image 
          src="/images/Recurso%203.png" 
          alt="Decoración" 
          width={180} 
          height={180}
          className="object-contain"
        />
      </div>

      {/* Header con bienvenida */}
      <div className="relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0046BE] to-[#8E2FA0] bg-clip-text text-transparent">
              Dashboard de Selección
            </h1>
            <p className="text-gray-600 mt-2">
              Hola <span className="font-semibold text-[#0046BE]">{user?.nombre || "Usuario"}</span>, aquí está el resumen de tu gestión de candidatos
            </p>
          </div>
          <Link href="/dashboard/selection/configuracion">
            <Button className="bg-gradient-to-r from-[#F7941D] to-[#8E2FA0] hover:from-[#E6871C] hover:to-[#7D2490] text-white rounded-2xl font-semibold shadow-lg">
              <Zap className="mr-2 h-4 w-4" />
              Configuración
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards - Mejoradas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {/* Total Requerimientos */}
        <Card className="border-2 border-[#0046BE]/20 hover:border-[#0046BE]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0046BE] to-[#00AEEF]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Requerimientos
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0046BE] to-[#00AEEF] text-white">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingRequerimientos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#0046BE]">{stats.totalRequerimientos}</div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-semibold text-[#7AC943]">{stats.activos}</span> activos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Candidatos */}
        <Card className="border-2 border-[#00AEEF]/20 hover:border-[#00AEEF]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#00AEEF] to-[#7AC943]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Candidatos
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#00AEEF] to-[#7AC943] text-white">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#00AEEF]">{stats.totalCandidatos}</div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-semibold text-[#8E2FA0]">{stats.enProceso}</span> en proceso
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tasa de Completitud */}
        <Card className="border-2 border-[#7AC943]/20 hover:border-[#7AC943]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7AC943] to-[#F7941D]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Completitud
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#7AC943] to-[#F7941D] text-white">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#7AC943]">{stats.tasaCompletitud}%</div>
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-semibold">{stats.completados}</span> completados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actividad */}
        <Card className="border-2 border-[#F7941D]/20 hover:border-[#F7941D]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F7941D] to-[#8E2FA0]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Actividad
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F7941D] to-[#8E2FA0] text-white">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingRequerimientos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#F7941D]">
                  {requerimientos?.filter(r => {
                    if (!r?.fechaCreacion) return false
                    const createdDate = new Date(r.fechaCreacion)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return createdDate > weekAgo
                  }).length || 0}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  esta semana
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Fila 1 */}
      <div className="grid gap-4 md:grid-cols-2 relative z-10">
        {/* Gráfico de Actividad Semanal */}
        <Card className="border-2 border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-[#0046BE]">Actividad Semanal</CardTitle>
            <CardDescription>Requerimientos y candidatos por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyActivityData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #0046BE', borderRadius: '12px' }}
                  formatter={(value) => value}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="requerimientos" 
                  stroke="#0046BE" 
                  strokeWidth={3}
                  dot={{ fill: '#0046BE', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="candidatos" 
                  stroke="#7AC943" 
                  strokeWidth={3}
                  dot={{ fill: '#7AC943', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Distribución de Candidatos */}
        <Card className="border-2 border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-[#0046BE]">Distribución de Candidatos</CardTitle>
            <CardDescription>Estado actual de todos los candidatos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #0046BE', borderRadius: '12px' }}
                  formatter={(value) => [`${value} candidatos`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas y Actividad Reciente */}
      <div className="grid gap-4 md:grid-cols-2 relative z-10">
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#0046BE] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#F7941D]" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Gestiona tus procesos de selección
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/selection/requerimientos">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#0046BE] to-[#00AEEF] hover:from-[#003A9E] hover:to-[#0098D4] text-white font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Crear Nuevo Requerimiento
              </Button>
            </Link>
            <Link href="/dashboard/selection/candidatos">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#7AC943] to-[#F7941D] hover:from-[#6AB839] hover:to-[#E6871C] text-white font-semibold">
                <Users className="mr-2 h-4 w-4" />
                Ver Candidatos
              </Button>
            </Link>
            <Link href="/dashboard/selection/asignaciones">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#8E2FA0] to-[#00AEEF] hover:from-[#7D2490] hover:to-[#0098D4] text-white font-semibold">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Asignar Pruebas
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#0046BE] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#00AEEF]" />
              Actividad Reciente
            </CardTitle>
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
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
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#E6F2FF] transition-all border border-transparent hover:border-[#00AEEF]/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#0046BE]/20 to-[#00AEEF]/20">
                          <Target className="h-4 w-4 text-[#0046BE]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{req.rolObjetivo}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(req.fechaCreacion), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={req?.estado?.estCodigo === "ACTIVO" ? "default" : "secondary"}>
                        {req?.estado?.estDescripcion || "Desconocido"}
                      </Badge>
                    </Link>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  No hay requerimientos aún
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Pendientes */}
      {candidatos && candidatos.filter(c => c?.estado?.estCodigo === "PENDIENTE").length > 0 && (
        <Card className="border-2 border-[#F7941D]/30 bg-gradient-to-br from-[#FFF8F0] to-[#FFFAF5] relative z-10">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F7941D] to-[#8E2FA0]" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#F7941D]">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#0046BE]">
                  Acciones Pendientes
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Tienes candidatos esperando gestión
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-[#F7941D]">{candidatos.filter(c => c?.estado?.estCodigo === "PENDIENTE").length}</span> candidatos 
                esperando asignación de pruebas
              </p>
              <Link href="/dashboard/selection/candidatos">
                <Button className="bg-gradient-to-r from-[#F7941D] to-[#8E2FA0] hover:from-[#E6871C] hover:to-[#7D2490] text-white rounded-xl font-semibold">
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
