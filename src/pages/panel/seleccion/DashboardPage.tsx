import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRequerimientos, useCandidatos } from "@/lib/hooks/useSelection"
import { useAuth } from "@/lib/hooks/useAuth"
import { 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  BarChart3
} from "lucide-react"
import { Link } from "react-router-dom"
import { formatDistanceToNow, parseISO, format, subHours } from "date-fns"
import { es } from "date-fns/locale"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Función helper para formatear fechas UTC a hora de Bogotá (UTC-5)
const formatearFecha = (fechaUTC: string): string => {
  try {
    const fechaUTCParsed = parseISO(fechaUTC)
    const fechaBogota = subHours(fechaUTCParsed, 5)
    return format(fechaBogota, "d 'de' MMM, yyyy 'a las' HH:mm", { locale: es })
  } catch (error) {
    console.error("Error formateando fecha:", error)
    return "Fecha inválida"
  }
}

export default function SelectionDashboardPage() {
  const { user } = useAuth()
  const { data: requerimientos, isLoading: loadingRequerimientos } = useRequerimientos()
  const { data: candidatos, isLoading: loadingCandidatos } = useCandidatos()

  // Calculate statistics
  const totalCandidatos = candidatos?.length || 0
  const completados = candidatos?.filter(c => c?.formularioCompletado).length || 0
  
  const stats = {
    totalRequerimientos: requerimientos?.length || 0,
    activos: requerimientos?.filter(r => r?.estado?.estActivo === true).length || 0,
    totalCandidatos: totalCandidatos,
    completados: completados,
    enProceso: candidatos?.filter(c => c?.estado?.estCodigo === "EN_PROCESO" && !c?.formularioCompletado).length || 0,
    pendientes: candidatos?.filter(c => c?.estado?.estCodigo === "PENDIENTE" && !c?.formularioCompletado).length || 0,
  }

  // Datos para gráfico de distribución de candidatos
  const getDistributionData = () => {
    if (stats.totalCandidatos === 0) return []
    return [
      { name: 'Formulario Completado', value: stats.completados, color: '#7AC943' },
      { name: 'Pendiente Formulario', value: stats.totalCandidatos - stats.completados, color: '#F7941D' },
    ].filter(item => item.value > 0)
  }

  const distributionData = getDistributionData()

  // Datos para gráfico de actividad semanal (calculado desde datos reales)
  const getWeeklyActivityData = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab']
    const today = new Date()
    const weekData = []

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const reqCount = requerimientos?.filter(r => {
        if (!r?.fechaCreacion) return false
        const created = new Date(r.fechaCreacion)
        return created >= date && created < nextDay
      }).length || 0

      const candCount = candidatos?.filter(c => {
        if (!c?.fechaCreacion) return false
        const created = new Date(c.fechaCreacion)
        return created >= date && created < nextDay
      }).length || 0

      weekData.push({
        day: days[date.getDay()],
        requerimientos: reqCount,
        candidatos: candCount
      })
    }

    return weekData
  }

  const weeklyActivityData = getWeeklyActivityData()

  return (
    <div className="relative space-y-6">
      {/* Decorative background */}
      <div className="pointer-events-none select-none absolute right-4 top-4 opacity-5 hidden xl:block z-0">
        <img 
          src="/images/Recurso%203.png" 
          alt="Decoración" 
          className="w-[180px] h-[180px] object-contain"
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
          <Link to="/panel/seleccion/configuracion">
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
              Total Candidatos
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
                  <span className="font-semibold text-[#7AC943]">{stats.completados}</span> formularios completos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* En Proceso */}
        <Card className="border-2 border-[#F7941D]/20 hover:border-[#F7941D]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#F7941D] to-[#8E2FA0]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              En Proceso
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#F7941D] to-[#8E2FA0] text-white">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#F7941D]">{stats.enProceso}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Candidatos activos
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pendientes */}
        <Card className="border-2 border-[#8E2FA0]/20 hover:border-[#8E2FA0]/40 transition-all overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#8E2FA0] to-[#0046BE]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Pendientes
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#8E2FA0] to-[#0046BE] text-white">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingCandidatos ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-[#8E2FA0]">{stats.pendientes}</div>
                <p className="text-xs text-gray-600 mt-1">
                  Por iniciar
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
        {stats.totalCandidatos > 0 ? (
          <Card className="border-2 border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#0046BE]">Distribución de Candidatos</CardTitle>
              <CardDescription>Estado de formularios completados</CardDescription>
            </CardHeader>
            <CardContent>
              {distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '2px solid #0046BE', borderRadius: '12px' }}
                      formatter={(value) => [`${value} candidatos`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center">
                  <Users className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No hay datos para mostrar aún</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-gray-100 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-gray-700">Distribución de Candidatos</CardTitle>
              <CardDescription>Estado de formularios completados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Sin datos para mostrar</p>
              </div>
            </CardContent>
          </Card>
        )}
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
              Gestiona requerimientos y candidatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/panel/seleccion/requerimientos">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#0046BE] to-[#00AEEF] hover:from-[#003A9E] hover:to-[#0098D4] text-white font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Crear Nuevo Requerimiento
              </Button>
            </Link>
            <Link to="/panel/seleccion/candidatos">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#7AC943] to-[#F7941D] hover:from-[#6AB839] hover:to-[#E6871C] text-white font-semibold">
                <Users className="mr-2 h-4 w-4" />
                Ver Candidatos
              </Button>
            </Link>
            <Link to="/panel/seleccion/resultados">
              <Button className="w-full justify-start rounded-xl bg-gradient-to-r from-[#F7941D] to-[#8E2FA0] hover:from-[#E6871C] hover:to-[#7D2490] text-white font-semibold">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Resultados
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
                      to={`/panel/seleccion/requerimientos/${req.reqId}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#E6F2FF] transition-all border border-transparent hover:border-[#00AEEF]/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-[#0046BE]/20 to-[#00AEEF]/20">
                          <Target className="h-4 w-4 text-[#0046BE]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{req.rolObjetivo}</p>
                          <p className="text-xs text-gray-500">
                            {formatearFecha(req.fechaCreacion)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={req?.estado?.estActivo ? "default" : "secondary"}>
                        {req?.estado?.estActivo ? 'Activo' : 'Inactivo'}
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
              <Link to="/panel/seleccion/candidatos">
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
