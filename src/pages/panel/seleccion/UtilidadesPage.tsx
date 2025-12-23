
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  useProspectos,
  useProspecto,
  useCrearProspecto,
  useActualizarProspecto,
  useRegistrarContactoProspecto,
  useConvertirProspecto,
  useEliminarProspecto,
  useSubirCvProspecto,
} from "@/lib/hooks/useProspectos"
import { useRequerimientos } from "@/lib/hooks/useSelection"
import type {
  ProspectoEstado,
  ProspectoFuente,
  CrearProspectoDto,
  ActualizarProspectoDto,
} from "@/types/prospectos.types"
import type { Requerimiento } from "@/types/selection.types"
import { formatUtcToLocal } from "@/lib/date"
import { useModernToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  Users,
  Sparkles,
  PhoneCall,
  ThumbsUp,
  UserCheck,
  UserX,
  Search,
  Plus,
  RefreshCcw,
  Eye,
  Pencil,
  UserPlus,
  Trash2,
  Upload,
} from "lucide-react"

type EstadoFiltro = "TODOS" | "PENDIENTES" | ProspectoEstado
type FuenteFiltro = "TODAS" | ProspectoFuente

type ProspectoFormState = {
  nombres: string
  apellidos: string
  documento: string
  email: string
  telefono: string
  cargoActual: string
  empresaActual: string
  anosExperiencia: string
  salarioActual: string
  aspiracionSalarial: string
  nivelEducacion: string
  fuente: string
  urlPerfil: string
  urlHojaVida: string
  notas: string
  requerimientoId: string
}

const fuentes: ProspectoFuente[] = ["LinkedIn", "Computrabajo", "Indeed", "Referido", "Otro"]

const nivelesEducacion = [
  "Bachiller",
  "Tecnico",
  "Tecnologo",
  "Profesional",
  "Especializacion",
  "Maestria",
  "Doctorado",
]

const estadoLabels: Record<ProspectoEstado, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  INTERESADO: "Interesado",
  NO_INTERESADO: "No interesado",
  CONVERTIDO: "Convertido",
}

const estadoClasses: Record<ProspectoEstado, string> = {
  NUEVO: "border-blue-200 bg-blue-50 text-blue-700",
  CONTACTADO: "border-amber-200 bg-amber-50 text-amber-700",
  INTERESADO: "border-emerald-200 bg-emerald-50 text-emerald-700",
  NO_INTERESADO: "border-slate-200 bg-slate-50 text-slate-600",
  CONVERTIDO: "border-purple-200 bg-purple-50 text-purple-700",
}

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha"
  return formatUtcToLocal(value, "d MMM yyyy HH:mm")
}

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)
}

const parseMoney = (value: string) => {
  const cleaned = value.replace(/[^\d]/g, "")
  if (!cleaned) return undefined
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

const getEstadoBadge = (estado: ProspectoEstado) => (
  <Badge variant="outline" className={cn("font-semibold", estadoClasses[estado])}>
    {estadoLabels[estado]}
  </Badge>
)

const emptyForm: ProspectoFormState = {
  nombres: "",
  apellidos: "",
  documento: "",
  email: "",
  telefono: "",
  cargoActual: "",
  empresaActual: "",
  anosExperiencia: "",
  salarioActual: "",
  aspiracionSalarial: "",
  nivelEducacion: "SIN_DEFINIR",
  fuente: "",
  urlPerfil: "",
  urlHojaVida: "",
  notas: "",
  requerimientoId: "",
}

export default function UtilidadesPage() {
  const toast = useModernToast()
  const { data: prospectos, isLoading, refetch } = useProspectos()
  const { data: requerimientos } = useRequerimientos()

  const crearProspecto = useCrearProspecto()
  const actualizarProspecto = useActualizarProspecto()
  const registrarContacto = useRegistrarContactoProspecto()
  const convertirProspecto = useConvertirProspecto()
  const eliminarProspecto = useEliminarProspecto()
  const subirCv = useSubirCvProspecto()

  const [search, setSearch] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("TODOS")
  const [fuenteFiltro, setFuenteFiltro] = useState<FuenteFiltro>("TODAS")

  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [contactId, setContactId] = useState<number | null>(null)
  const [convertId, setConvertId] = useState<number | null>(null)
  const [cvId, setCvId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const stats = useMemo(() => {
    const list = prospectos || []
    const total = list.length
    const nuevos = list.filter((item) => item.estado === "NUEVO").length
    const contactados = list.filter((item) => item.estado === "CONTACTADO").length
    const interesados = list.filter((item) => item.estado === "INTERESADO").length
    const noInteresados = list.filter((item) => item.estado === "NO_INTERESADO").length
    const convertidos = list.filter((item) => item.estado === "CONVERTIDO").length
    const pendientes = list.filter((item) => item.estado === "NUEVO" || item.estado === "CONTACTADO").length
    return { total, nuevos, contactados, interesados, noInteresados, convertidos, pendientes }
  }, [prospectos])

  const filtrados = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    return (prospectos || [])
      .filter((item) => {
        if (estadoFiltro === "TODOS") return true
        if (estadoFiltro === "PENDIENTES") {
          return item.estado === "NUEVO" || item.estado === "CONTACTADO"
        }
        return item.estado === estadoFiltro
      })
      .filter((item) => (fuenteFiltro === "TODAS" ? true : item.fuente === fuenteFiltro))
      .filter((item) => {
        if (!normalized) return true
        return (
          item.nombreCompleto.toLowerCase().includes(normalized) ||
          item.email.toLowerCase().includes(normalized) ||
          (item.cargoActual || "").toLowerCase().includes(normalized)
        )
      })
  }, [prospectos, estadoFiltro, fuenteFiltro, search])

  const handleCreate = async (dto: CrearProspectoDto, file?: File | null) => {
    try {
      const created = await crearProspecto.mutateAsync(dto)
      if (file) {
        try {
          await subirCv.mutateAsync({ id: created.id, file })
        } catch (error: any) {
          toast.warning({
            title: "CV pendiente",
            description: error?.message || "El prospecto se creo pero no se pudo subir el CV.",
          })
        }
      }
      toast.success({ title: "Prospecto creado", description: "Se agrego el prospecto a la base." })
      setCreateOpen(false)
    } catch (error: any) {
      toast.error({ title: "Error al crear", description: error?.message || "No se pudo crear el prospecto." })
    }
  }

  const handleUpdate = async (id: number, dto: ActualizarProspectoDto) => {
    try {
      await actualizarProspecto.mutateAsync({ id, dto })
      toast.success({ title: "Prospecto actualizado", description: "Se guardaron los cambios." })
      setEditId(null)
    } catch (error: any) {
      toast.error({ title: "Error al actualizar", description: error?.message || "No se pudo actualizar el prospecto." })
    }
  }

  const handleContacto = async (id: number, dto: { respuesta?: boolean | null; notas?: string | null }) => {
    try {
      await registrarContacto.mutateAsync({ id, dto })
      toast.success({ title: "Contacto registrado", description: "Se actualizo el estado del prospecto." })
      setContactId(null)
    } catch (error: any) {
      toast.error({ title: "Error al registrar", description: error?.message || "No se pudo registrar el contacto." })
    }
  }

  const handleConvertir = async (id: number, dto: { requerimientoId: number; enviarEmailBienvenida?: boolean }) => {
    try {
      const candidato = await convertirProspecto.mutateAsync({ id, dto })
      toast.success({
        title: "Prospecto convertido",
        description: candidato?.canId ? `Candidato creado con id ${candidato.canId}.` : "Candidato creado correctamente.",
      })
      setConvertId(null)
    } catch (error: any) {
      toast.error({ title: "Error al convertir", description: error?.message || "No se pudo convertir el prospecto." })
    }
  }

  const handleEliminar = async (id: number) => {
    try {
      await eliminarProspecto.mutateAsync(id)
      toast.success({ title: "Prospecto eliminado", description: "Se removio el prospecto de la base." })
      setDeleteId(null)
    } catch (error: any) {
      toast.error({ title: "Error al eliminar", description: error?.message || "No se pudo eliminar el prospecto." })
    }
  }

  const handleSubirCv = async (id: number, file: File) => {
    try {
      await subirCv.mutateAsync({ id, file })
      toast.success({ title: "CV actualizado", description: "La hoja de vida se cargo correctamente." })
      setCvId(null)
    } catch (error: any) {
      toast.error({ title: "Error al subir CV", description: error?.message || "No se pudo subir la hoja de vida." })
    }
  }

  const tarjetas = [
    {
      key: "TODOS" as const,
      title: "Total",
      value: stats.total,
      icon: Users,
      className: "border-[#0046BE]/20 bg-gradient-to-br from-[#E6F2FF] to-white text-[#0046BE]",
    },
    {
      key: "NUEVO" as const,
      title: "Nuevos",
      value: stats.nuevos,
      icon: Sparkles,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      key: "CONTACTADO" as const,
      title: "Contactados",
      value: stats.contactados,
      icon: PhoneCall,
      className: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      key: "INTERESADO" as const,
      title: "Interesados",
      value: stats.interesados,
      icon: ThumbsUp,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      key: "CONVERTIDO" as const,
      title: "Convertidos",
      value: stats.convertidos,
      icon: UserCheck,
      className: "border-purple-200 bg-purple-50 text-purple-700",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utilidades</h1>
          <p className="text-muted-foreground mt-1">
            Suite de apoyo para operaciones de selección con foco en agilidad y orden.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="h-4 w-4" /> Actualizar
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Agregar prospecto
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prospectos" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full justify-start">
          <TabsTrigger value="prospectos" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">
            Prospectos
          </TabsTrigger>
          <TabsTrigger value="automatizaciones" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">
            Automatizaciones
          </TabsTrigger>
          <TabsTrigger value="analitica" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0046BE] data-[state=active]:to-[#00AEEF] data-[state=active]:text-white">
            Analítica
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prospectos" className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {tarjetas.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setEstadoFiltro(card.key)}
                aria-pressed={estadoFiltro === card.key}
                className={cn(
                  "group block h-full text-left focus-visible:outline-none",
                  estadoFiltro === card.key && "rounded-xl"
                )}
              >
                <Card
                  className={cn(
                    "h-full border-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0046BE]/40",
                    estadoFiltro === card.key && "ring-2 ring-[#0046BE]/40 shadow-lg border-[#0046BE]/30",
                    card.className
                  )}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold">{card.title}</CardTitle>
                    <card.icon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    {card.key === "TODOS" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pendientes: <span className="font-semibold">{stats.pendientes}</span>
                      </p>
                    )}
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, email o cargo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={estadoFiltro} onValueChange={(value) => setEstadoFiltro(value as EstadoFiltro)}>
                    <SelectTrigger className="min-w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDIENTES">Pendientes</SelectItem>
                      <SelectItem value="NUEVO">Nuevos</SelectItem>
                      <SelectItem value="CONTACTADO">Contactados</SelectItem>
                      <SelectItem value="INTERESADO">Interesados</SelectItem>
                      <SelectItem value="NO_INTERESADO">No interesados</SelectItem>
                      <SelectItem value="CONVERTIDO">Convertidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={fuenteFiltro} onValueChange={(value) => setFuenteFiltro(value as FuenteFiltro)}>
                    <SelectTrigger className="min-w-[180px]">
                      <SelectValue placeholder="Fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODAS">Todas las fuentes</SelectItem>
                      {fuentes.map((fuente) => (
                        <SelectItem key={fuente} value={fuente}>
                          {fuente}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant={estadoFiltro === "PENDIENTES" ? "default" : "outline"}
                    onClick={() => setEstadoFiltro("PENDIENTES")}
                    className="gap-2"
                  >
                    <UserX className="h-4 w-4" /> Pendientes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Prospectos</CardTitle>
              <CardDescription>Portafolio centralizado con acciones rápidas de seguimiento.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : filtrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mb-3" />
                  <p className="text-sm">No hay prospectos para mostrar con estos filtros.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Cargo</TableHead>
                        <TableHead className="hidden lg:table-cell">Fuente</TableHead>
                        <TableHead className="hidden xl:table-cell">Creador</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="hidden xl:table-cell">Creado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtrados.map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/40">
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.nombreCompleto}</span>
                              <span className="text-xs text-muted-foreground md:hidden">{item.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{item.email}</TableCell>
                          <TableCell className="hidden lg:table-cell">{item.cargoActual || "-"}</TableCell>
                          <TableCell className="hidden lg:table-cell">{item.fuente || "-"}</TableCell>
                          <TableCell className="hidden xl:table-cell">{item.psicologoNombre || "-"}</TableCell>
                          <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                          <TableCell className="hidden xl:table-cell">{formatDate(item.fechaCreacion)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => setDetailId(item.id)}>
                                <Eye className="h-4 w-4" />
                                <span className="hidden xl:inline">Detalle</span>
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditId(item.id)}>
                                <Pencil className="h-4 w-4" />
                                <span className="hidden xl:inline">Editar</span>
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => setContactId(item.id)}>
                                <PhoneCall className="h-4 w-4" />
                                <span className="hidden xl:inline">Contacto</span>
                              </Button>
                              <Button variant="outline" size="sm" className="gap-1" onClick={() => setCvId(item.id)}>
                                <Upload className="h-4 w-4" />
                                <span className="hidden xl:inline">CV</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => setConvertId(item.id)}
                                disabled={item.estado === "CONVERTIDO"}
                              >
                                <UserPlus className="h-4 w-4" />
                                <span className="hidden xl:inline">Convertir</span>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-1"
                                onClick={() => setDeleteId(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="hidden xl:inline">Eliminar</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automatizaciones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Automatizaciones</CardTitle>
              <CardDescription>Flujos inteligentes para reducir tareas manuales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Este módulo estará disponible pronto. Aquí podrás orquestar envíos de recordatorios, campañas de seguimiento y avisos internos sin salir del panel.</p>
              <p className="text-xs">Tip: cuéntanos tus casos de uso prioritarios para priorizarlos.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analitica" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Analítica</CardTitle>
              <CardDescription>Indicadores accionables sobre el embudo de selección.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Próximamente verás tableros con conversión, tiempos de ciclo y desempeño por requerimiento para tomar decisiones más rápido.</p>
              <p className="text-xs">Mientras tanto, seguimos consolidando la data histórica para que las métricas nazcan completas.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProspectoFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        requerimientos={requerimientos}
        title="Agregar prospecto"
        submitLabel="Crear prospecto"
        onSubmit={(dto, file) => handleCreate(dto, file)}
        isSubmitting={crearProspecto.isPending}
      />

      <ProspectoDetailDialog
        open={detailId !== null}
        onOpenChange={(open) => setDetailId(open ? detailId : null)}
        prospectoId={detailId}
        onEdit={(id) => {
          setDetailId(null)
          setEditId(id)
        }}
        onContact={(id) => {
          setDetailId(null)
          setContactId(id)
        }}
        onConvert={(id) => {
          setDetailId(null)
          setConvertId(id)
        }}
      />

      <ProspectoEditDialog
        open={editId !== null}
        onOpenChange={(open) => setEditId(open ? editId : null)}
        prospectoId={editId}
        requerimientos={requerimientos}
        onSubmit={(id, dto) => handleUpdate(id, dto)}
        isSubmitting={actualizarProspecto.isPending}
      />

      <ProspectoContactoDialog
        open={contactId !== null}
        onOpenChange={(open) => setContactId(open ? contactId : null)}
        prospectoId={contactId}
        onSubmit={(id, dto) => handleContacto(id, dto)}
        isSubmitting={registrarContacto.isPending}
      />

      <ProspectoConvertirDialog
        open={convertId !== null}
        onOpenChange={(open) => setConvertId(open ? convertId : null)}
        prospectoId={convertId}
        requerimientos={requerimientos}
        onSubmit={(id, dto) => handleConvertir(id, dto)}
        isSubmitting={convertirProspecto.isPending}
      />

      <ProspectoCvDialog
        open={cvId !== null}
        onOpenChange={(open) => setCvId(open ? cvId : null)}
        prospectoId={cvId}
        onSubmit={(id, file) => handleSubirCv(id, file)}
        isSubmitting={subirCv.isPending}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => setDeleteId(open ? deleteId : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar prospecto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion elimina el prospecto de tu base. Puedes crear uno nuevo cuando lo necesites.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleEliminar(deleteId)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function ProspectoFormDialog({
  open,
  onOpenChange,
  requerimientos,
  title,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  requerimientos: Requerimiento[] | undefined
  title: string
  submitLabel: string
  onSubmit: (dto: CrearProspectoDto, file?: File | null) => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState<ProspectoFormState>(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (field: keyof ProspectoFormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setFileError("")
      return
    }

    const maxSize = 5 * 1024 * 1024
    const allowed = [".pdf", ".doc", ".docx"]
    const lowerName = nextFile.name.toLowerCase()
    const isAllowed = allowed.some((ext) => lowerName.endsWith(ext))

    if (!isAllowed) {
      setFile(null)
      setFileError("Formato invalido. Usa PDF, DOC o DOCX.")
      return
    }

    if (nextFile.size > maxSize) {
      setFile(null)
      setFileError("El archivo supera 5 MB.")
      return
    }

    setFile(nextFile)
    setFileError("")
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!formData.fuente || fileError) return
    const anosNumber = Number(formData.anosExperiencia || 0)
    const salarioActual = parseMoney(formData.salarioActual)
    const aspiracionSalarial = parseMoney(formData.aspiracionSalarial)
    const nivelEducacion =
      formData.nivelEducacion === "SIN_DEFINIR" ? undefined : formData.nivelEducacion.trim()
    const payload: CrearProspectoDto = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      documento: formData.documento.trim() || undefined,
      email: formData.email.trim(),
      telefono: formData.telefono.trim() || undefined,
      cargoActual: formData.cargoActual.trim() || undefined,
      empresaActual: formData.empresaActual.trim() || undefined,
      anosExperiencia: Number.isFinite(anosNumber) && anosNumber > 0 ? anosNumber : undefined,
      salarioActual,
      aspiracionSalarial,
      nivelEducacion,
      fuente: formData.fuente,
      urlPerfil: formData.urlPerfil.trim() || undefined,
      urlHojaVida: formData.urlHojaVida.trim() || undefined,
      notas: formData.notas.trim() || undefined,
      requerimientoId: formData.requerimientoId ? Number(formData.requerimientoId) : undefined,
    }
    onSubmit(payload, file)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setFormData(emptyForm)
          setFile(null)
          setFileError("")
        }
      }}
    >
      <DialogContent
        className="max-w-3xl w-[min(96vw,900px)] max-h-[85vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Registra informacion basica del prospecto y su fuente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombres *</label>
              <Input value={formData.nombres} onChange={(e) => handleChange("nombres", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Apellidos *</label>
              <Input value={formData.apellidos} onChange={(e) => handleChange("apellidos", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Documento</label>
              <Input value={formData.documento} onChange={(e) => handleChange("documento", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefono</label>
              <Input value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cargo actual</label>
              <Input value={formData.cargoActual} onChange={(e) => handleChange("cargoActual", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa actual</label>
              <Input value={formData.empresaActual} onChange={(e) => handleChange("empresaActual", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Años de experiencia</label>
              <Input
                type="number"
                min={0}
                value={formData.anosExperiencia}
                onChange={(e) => handleChange("anosExperiencia", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Salario actual</label>
              <Input
                inputMode="numeric"
                value={formData.salarioActual}
                onChange={(e) => handleChange("salarioActual", e.target.value)}
                placeholder="Ej: 2500000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspiracion salarial</label>
              <Input
                inputMode="numeric"
                value={formData.aspiracionSalarial}
                onChange={(e) => handleChange("aspiracionSalarial", e.target.value)}
                placeholder="Ej: 3000000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nivel de educacion</label>
              <Select value={formData.nivelEducacion} onValueChange={(value) => handleChange("nivelEducacion", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SIN_DEFINIR">Sin definir</SelectItem>
                  {nivelesEducacion.map((nivel) => (
                    <SelectItem key={nivel} value={nivel}>
                      {nivel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fuente *</label>
              <Select value={formData.fuente} onValueChange={(value) => handleChange("fuente", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fuente" />
                </SelectTrigger>
                <SelectContent>
                  {fuentes.map((fuente) => (
                    <SelectItem key={fuente} value={fuente}>
                      {fuente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL del perfil</label>
              <Input
                type="url"
                value={formData.urlPerfil}
                onChange={(e) => handleChange("urlPerfil", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Hoja de vida (archivo)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="rounded-lg border border-dashed bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Seleccionar archivo
                  </Button>
                  {file ? (
                    <span className="text-xs text-muted-foreground">
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">PDF o Word, max 5 MB.</span>
                  )}
                </div>
                {file && !fileError && (
                  <p className="mt-2 text-xs text-muted-foreground">Se cargara al guardar el prospecto.</p>
                )}
              </div>
              {fileError && <p className="text-xs text-red-600">{fileError}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Requerimiento asociado</label>
              <Select
                value={formData.requerimientoId || "0"}
                onValueChange={(value) => handleChange("requerimientoId", value === "0" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona requerimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin requerimiento</SelectItem>
                  {requerimientos?.map((req) => (
                    <SelectItem key={req.reqId} value={String(req.reqId)}>
                      {req.rolObjetivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea
                value={formData.notas}
                onChange={(e) => handleChange("notas", e.target.value)}
                rows={4}
                placeholder="Habilidades, disponibilidad o detalles importantes."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.nombres.trim() ||
                !formData.apellidos.trim() ||
                !formData.email.trim() ||
                !formData.fuente ||
                Boolean(fileError)
              }
            >
              {isSubmitting ? "Guardando..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProspectoDetailDialog({
  open,
  onOpenChange,
  prospectoId,
  onEdit,
  onContact,
  onConvert,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectoId: number | null
  onEdit: (id: number) => void
  onContact: (id: number) => void
  onConvert: (id: number) => void
}) {
  const { data: prospecto, isLoading } = useProspecto(prospectoId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalle de prospecto</DialogTitle>
          <DialogDescription>Consulta la informacion completa y las acciones principales.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : prospecto ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold">{prospecto.nombreCompleto}</h3>
                <p className="text-sm text-muted-foreground">{prospecto.email}</p>
              </div>
              {getEstadoBadge(prospecto.estado)}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DetailItem label="Documento" value={prospecto.documento || "Sin documento"} />
              <DetailItem label="Telefono" value={prospecto.telefono || "Sin telefono"} />
              <DetailItem label="Cargo actual" value={prospecto.cargoActual || "-"} />
              <DetailItem label="Empresa" value={prospecto.empresaActual || "-"} />
              <DetailItem label="Fuente" value={prospecto.fuente || "-"} />
              <DetailItem label="Creador" value={prospecto.psicologoNombre || "-"} />
              <DetailItem label="Salario actual" value={formatMoney(prospecto.salarioActual)} />
              <DetailItem label="Aspiracion salarial" value={formatMoney(prospecto.aspiracionSalarial)} />
              <DetailItem label="Nivel educacion" value={prospecto.nivelEducacion || "-"} />
              <DetailItem label="Anos experiencia" value={prospecto.anosExperiencia ? `${prospecto.anosExperiencia}` : "-"} />
              <DetailItem label="Creado" value={formatDate(prospecto.fechaCreacion)} />
              <DetailItem label="Primer contacto" value={formatDate(prospecto.fechaContacto)} />
              <DetailItem label="Respuesta" value={formatDate(prospecto.fechaRespuesta)} />
              <DetailItem
                label="Hoja de vida"
                value={
                  prospecto.urlHojaVida ? (
                    <a href={prospecto.urlHojaVida} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Ver CV
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
              {prospecto.urlPerfil && (
                <DetailItem
                  label="Perfil"
                  value={
                    <a href={prospecto.urlPerfil} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      Abrir perfil
                    </a>
                  }
                />
              )}
              {prospecto.candidatoId && (
                <DetailItem
                  label="Candidato"
                  value={
                    <Link to={`/panel/seleccion/candidatos/${prospecto.candidatoId}`} className="text-blue-600 underline">
                      Ver candidato {prospecto.candidatoId}
                    </Link>
                  }
                />
              )}
            </div>

            {prospecto.notas && (
              <div className="rounded-xl border p-4 bg-muted/20">
                <p className="text-sm font-medium mb-2">Notas</p>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{prospecto.notas}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              <Button variant="outline" onClick={() => onEdit(prospecto.id)}>
                Editar
              </Button>
              <Button variant="outline" onClick={() => onContact(prospecto.id)}>
                Registrar contacto
              </Button>
              <Button onClick={() => onConvert(prospecto.id)} disabled={prospecto.estado === "CONVERTIDO"}>
                Convertir
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No se encontro el prospecto.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProspectoEditDialog({
  open,
  onOpenChange,
  prospectoId,
  requerimientos,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectoId: number | null
  requerimientos: Requerimiento[] | undefined
  onSubmit: (id: number, dto: ActualizarProspectoDto) => void
  isSubmitting: boolean
}) {
  const { data: prospecto, isLoading } = useProspecto(prospectoId)
  const [formData, setFormData] = useState<ProspectoFormState | null>(null)

  useEffect(() => {
    if (!open) return
    if (!prospecto) return
    setFormData({
      nombres: prospecto.nombres || "",
      apellidos: prospecto.apellidos || "",
      documento: prospecto.documento || "",
      email: prospecto.email || "",
      telefono: prospecto.telefono || "",
      cargoActual: prospecto.cargoActual || "",
      empresaActual: prospecto.empresaActual || "",
      anosExperiencia: prospecto.anosExperiencia ? String(prospecto.anosExperiencia) : "",
      salarioActual: prospecto.salarioActual ? String(prospecto.salarioActual) : "",
      aspiracionSalarial: prospecto.aspiracionSalarial ? String(prospecto.aspiracionSalarial) : "",
      nivelEducacion: prospecto.nivelEducacion || "SIN_DEFINIR",
      fuente: prospecto.fuente || "",
      urlPerfil: prospecto.urlPerfil || "",
      urlHojaVida: prospecto.urlHojaVida || "",
      notas: prospecto.notas || "",
      requerimientoId: prospecto.requerimientoId ? String(prospecto.requerimientoId) : "",
    })
  }, [open, prospecto])

  const handleChange = (field: keyof ProspectoFormState, value: string) => {
    if (!formData) return
    setFormData((prev) => ({
      ...(prev || formData),
      [field]: value,
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!formData || !prospecto || !formData.fuente) return
    const anosNumber = Number(formData.anosExperiencia || 0)
    const salarioActual = parseMoney(formData.salarioActual)
    const aspiracionSalarial = parseMoney(formData.aspiracionSalarial)
    const nivelEducacion =
      formData.nivelEducacion === "SIN_DEFINIR" ? undefined : formData.nivelEducacion.trim()
    const payload: ActualizarProspectoDto = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      documento: formData.documento.trim() || undefined,
      email: formData.email.trim(),
      telefono: formData.telefono.trim() || undefined,
      cargoActual: formData.cargoActual.trim() || undefined,
      empresaActual: formData.empresaActual.trim() || undefined,
      anosExperiencia: Number.isFinite(anosNumber) && anosNumber > 0 ? anosNumber : undefined,
      salarioActual,
      aspiracionSalarial,
      nivelEducacion,
      fuente: formData.fuente,
      urlPerfil: formData.urlPerfil.trim() || undefined,
      urlHojaVida: formData.urlHojaVida.trim() || undefined,
      notas: formData.notas.trim() || undefined,
      requerimientoId: formData.requerimientoId ? Number(formData.requerimientoId) : undefined,
    }
    onSubmit(prospecto.id, payload)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) setFormData(null)
      }}
    >
      <DialogContent
        className="max-w-3xl w-[min(96vw,900px)] max-h-[85vh] overflow-y-auto"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Editar prospecto</DialogTitle>
          <DialogDescription>Actualiza la informacion del prospecto seleccionado.</DialogDescription>
        </DialogHeader>

        {isLoading || !formData ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombres *</label>
                <Input value={formData.nombres} onChange={(e) => handleChange("nombres", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellidos *</label>
                <Input value={formData.apellidos} onChange={(e) => handleChange("apellidos", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Documento</label>
                <Input value={formData.documento} onChange={(e) => handleChange("documento", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefono</label>
                <Input value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo actual</label>
                <Input value={formData.cargoActual} onChange={(e) => handleChange("cargoActual", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa actual</label>
                <Input value={formData.empresaActual} onChange={(e) => handleChange("empresaActual", e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Años de experiencia</label>
                <Input
                  type="number"
                  min={0}
                  value={formData.anosExperiencia}
                  onChange={(e) => handleChange("anosExperiencia", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salario actual</label>
                <Input
                  inputMode="numeric"
                  value={formData.salarioActual}
                  onChange={(e) => handleChange("salarioActual", e.target.value)}
                  placeholder="Ej: 2500000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aspiracion salarial</label>
                <Input
                  inputMode="numeric"
                  value={formData.aspiracionSalarial}
                  onChange={(e) => handleChange("aspiracionSalarial", e.target.value)}
                  placeholder="Ej: 3000000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nivel de educacion</label>
                <Select value={formData.nivelEducacion} onValueChange={(value) => handleChange("nivelEducacion", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIN_DEFINIR">Sin definir</SelectItem>
                    {nivelesEducacion.map((nivel) => (
                      <SelectItem key={nivel} value={nivel}>
                        {nivel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fuente *</label>
                <Select value={formData.fuente} onValueChange={(value) => handleChange("fuente", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    {fuentes.map((fuente) => (
                      <SelectItem key={fuente} value={fuente}>
                        {fuente}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL del perfil</label>
              <Input
                type="url"
                value={formData.urlPerfil}
                onChange={(e) => handleChange("urlPerfil", e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Requerimiento asociado</label>
                <Select
                  value={formData.requerimientoId || "0"}
                  onValueChange={(value) => handleChange("requerimientoId", value === "0" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona requerimiento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin requerimiento</SelectItem>
                    {requerimientos?.map((req) => (
                      <SelectItem key={req.reqId} value={String(req.reqId)}>
                        {req.rolObjetivo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Notas</label>
                <Textarea
                  value={formData.notas}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  rows={4}
                  placeholder="Habilidades, disponibilidad o detalles importantes."
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.nombres.trim() ||
                  !formData.apellidos.trim() ||
                  !formData.email.trim() ||
                  !formData.fuente
                }
              >
                {isSubmitting ? "Guardando..." : "Actualizar prospecto"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProspectoContactoDialog({
  open,
  onOpenChange,
  prospectoId,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectoId: number | null
  onSubmit: (id: number, dto: { respuesta?: boolean | null; notas?: string | null }) => void
  isSubmitting: boolean
}) {
  const { data: prospecto, isLoading } = useProspecto(prospectoId)
  const [respuesta, setRespuesta] = useState<"sin_respuesta" | "interesado" | "no_interesado">("sin_respuesta")
  const [notas, setNotas] = useState("")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!prospecto) return
    const respuestaValue =
      respuesta === "interesado" ? true : respuesta === "no_interesado" ? false : null
    onSubmit(prospecto.id, { respuesta: respuestaValue, notas: notas.trim() || undefined })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setRespuesta("sin_respuesta")
          setNotas("")
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Registrar contacto</DialogTitle>
          <DialogDescription>Actualiza el estado de seguimiento del prospecto.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : prospecto ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border p-4 bg-muted/20">
              <p className="font-semibold">{prospecto.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{prospecto.email}</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Respuesta del prospecto</p>
              <RadioGroup value={respuesta} onValueChange={(value) => setRespuesta(value as any)} className="space-y-2">
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <RadioGroupItem value="sin_respuesta" id="resp-pendiente" />
                  <label htmlFor="resp-pendiente" className="text-sm">
                    Contactado sin respuesta
                  </label>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <RadioGroupItem value="interesado" id="resp-si" />
                  <label htmlFor="resp-si" className="text-sm">
                    Interesado
                  </label>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <RadioGroupItem value="no_interesado" id="resp-no" />
                  <label htmlFor="resp-no" className="text-sm">
                    No interesado
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas del contacto</label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar contacto"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">No se encontro el prospecto.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProspectoConvertirDialog({
  open,
  onOpenChange,
  prospectoId,
  requerimientos,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectoId: number | null
  requerimientos: Requerimiento[] | undefined
  onSubmit: (id: number, dto: { requerimientoId: number; enviarEmailBienvenida?: boolean }) => void
  isSubmitting: boolean
}) {
  const { data: prospecto, isLoading } = useProspecto(prospectoId)
  const [requerimientoId, setRequerimientoId] = useState("")
  const [enviarEmail, setEnviarEmail] = useState(true)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!prospecto || !requerimientoId) return
    onSubmit(prospecto.id, { requerimientoId: Number(requerimientoId), enviarEmailBienvenida: enviarEmail })
  }

  const requiereDocumento = !prospecto?.documento
  const requiereEmail = !prospecto?.email
  const puedeConvertir = !requiereDocumento && !requiereEmail && Boolean(requerimientoId)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setRequerimientoId("")
          setEnviarEmail(true)
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Convertir a candidato</DialogTitle>
          <DialogDescription>Convierte el prospecto en candidato formal del proceso.</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : prospecto ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border p-4 bg-muted/20">
              <p className="font-semibold">{prospecto.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{prospecto.email || "Email no registrado"}</p>
            </div>

            {(requiereDocumento || requiereEmail) && (
              <Alert variant="destructive">
                <AlertTitle>Informacion incompleta</AlertTitle>
                <AlertDescription>
                  Debes registrar documento y email antes de convertir este prospecto.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Requerimiento *</label>
              <Select value={requerimientoId} onValueChange={setRequerimientoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona requerimiento" />
                </SelectTrigger>
                <SelectContent>
                  {requerimientos?.map((req) => (
                    <SelectItem key={req.reqId} value={String(req.reqId)}>
                      {req.rolObjetivo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-start gap-3 text-sm">
              <Checkbox checked={enviarEmail} onCheckedChange={(checked) => setEnviarEmail(Boolean(checked))} />
              <span>
                Enviar email de bienvenida con link de acceso
              </span>
            </label>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !puedeConvertir}>
                {isSubmitting ? "Convirtiendo..." : "Convertir"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">No se encontro el prospecto.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function ProspectoCvDialog({
  open,
  onOpenChange,
  prospectoId,
  onSubmit,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospectoId: number | null
  onSubmit: (id: number, file: File) => void
  isSubmitting: boolean
}) {
  const { data: prospecto, isLoading } = useProspecto(prospectoId)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setError("")
    }
  }, [open])

  const handleFileChange = (nextFile: File | null) => {
    if (!nextFile) {
      setFile(null)
      setError("")
      return
    }

    const maxSize = 5 * 1024 * 1024
    const allowed = [".pdf", ".doc", ".docx"]
    const lowerName = nextFile.name.toLowerCase()
    const isAllowed = allowed.some((ext) => lowerName.endsWith(ext))

    if (!isAllowed) {
      setFile(null)
      setError("Formato invalido. Usa PDF, DOC o DOCX.")
      return
    }

    if (nextFile.size > maxSize) {
      setFile(null)
      setError("El archivo supera 5 MB.")
      return
    }

    setFile(nextFile)
    setError("")
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!prospecto || !file || error) return
    onSubmit(prospecto.id, file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cargar hoja de vida</DialogTitle>
          <DialogDescription>Sube un CV en PDF o Word (max 5 MB).</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : prospecto ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border p-4 bg-muted/20">
              <p className="font-semibold">{prospecto.nombreCompleto}</p>
              <p className="text-sm text-muted-foreground">{prospecto.email}</p>
              {prospecto.urlHojaVida && (
                <a href={prospecto.urlHojaVida} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">
                  Ver CV actual
                </a>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Seleccionar archivo
                </Button>
                {file ? (
                  <span className="text-xs text-muted-foreground">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">PDF o Word, max 5 MB.</span>
                )}
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !file || Boolean(error)}>
                {isSubmitting ? "Subiendo..." : "Guardar CV"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="text-sm text-muted-foreground">No se encontro el prospecto.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
