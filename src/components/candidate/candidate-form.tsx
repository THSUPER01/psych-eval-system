import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getComunas, getBarriosByComuna, type BarrioData } from "@/lib/manizales-data"
import { getAllBarriosVillamaria, type BarrioVillamariaData } from "@/lib/villamaria-data"
import { SuccessConfirmation } from "@/components/ui/success-confirmation"
import { brandLogos } from "@/lib/brandAssets"
import { useCandidatoPublico, useCompletarFormulario } from "@/lib/hooks/useCandidatePublic"
import type { CrearFormularioCandidatoDto } from "@/types/selection.types"
import {
  validateEdad,
  validateDireccion,
  validateEdadesHijos,
  validateMunicipio,
  validateComuna,
  validateBarrio,
  validateEstrato,
  validateTalla,
  validateRequiredField,
} from "@/lib/validations"

interface FormData {
  CLB_EstadoCivil: string
  CLB_Genero: string
  edad_al_ingresar: string
  Municipio: string
  Barrio: string
  Comuna: string
  Estrato: string
  DireccionTipoVia: string
  DireccionNumero: string
  DireccionComplemento: string
  Hijos: string
  numero_hijos: string
  edades_de_hijos: string[]
  talla_camisa: string
  talla_pantalon: string
  talla_zapatos: string
  titulo_academico: string
}

export function CandidateForm({ token }: { token: string }) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  
  // Fetch candidato data
  const { data: candidato, isLoading: isLoadingCandidato, error: candidatoError } = useCandidatoPublico(token)
  
  // Mutation para completar formulario
  const completarFormulario = useCompletarFormulario()
  
  const [formData, setFormData] = useState<FormData>({
    CLB_EstadoCivil: "",
    CLB_Genero: "",
    edad_al_ingresar: "",
    Municipio: "",
    Barrio: "",
    Comuna: "",
    Estrato: "",
    DireccionTipoVia: "",
    DireccionNumero: "",
    DireccionComplemento: "",
    Hijos: "",
    numero_hijos: "",
    edades_de_hijos: [],
    talla_camisa: "",
    talla_pantalon: "",
    talla_zapatos: "",
    titulo_academico: "",
  })
  
  // Cargar datos geográficos
  const [comunas, setComunas] = useState<string[]>([])
  const [barriosDisponibles, setBarriosDisponibles] = useState<BarrioData[] | BarrioVillamariaData[]>([])

  // Pre-llenar el formulario si el candidato ya tiene datos
  useEffect(() => {
    if (candidato?.formulario) {
      const formulario = candidato.formulario
      // Intentar pre-parsear la dirección en partes (tipo, número, complemento)
      const fullDir = formulario.direccion || ""
      const tiposVia = ["Calle", "Carrera", "Avenida", "Transversal", "Diagonal", "Circular"]
      let DireccionTipoVia = ""
      let DireccionNumero = ""
      let DireccionComplemento = ""

      if (fullDir) {
        const match = fullDir.match(/^(Calle|Carrera|Avenida|Transversal|Diagonal|Circular)\s+(.*)$/i)
        if (match) {
          DireccionTipoVia = match[1]
          const resto = match[2]
          const comaIdx = resto.indexOf(",")
          if (comaIdx >= 0) {
            DireccionNumero = resto.substring(0, comaIdx).trim()
            DireccionComplemento = resto.substring(comaIdx + 1).trim()
          } else {
            DireccionNumero = resto.trim()
          }
        } else {
          // No se pudo identificar tipo de vía, dejar todo en número
          DireccionNumero = fullDir
        }
      }
      setFormData({
        CLB_EstadoCivil: formulario.estadoCivil || "",
        CLB_Genero: formulario.genero || "",
        edad_al_ingresar: formulario.edadIngreso?.toString() || "",
        Municipio: formulario.municipio || "",
        Barrio: formulario.barrio || "",
        Comuna: formulario.comuna || "",
        Estrato: formulario.estrato?.toString() || "",
        DireccionTipoVia,
        DireccionNumero,
        DireccionComplemento,
        Hijos: formulario.tieneHijo ? "Sí" : "No",
        numero_hijos: formulario.cantidadHijo?.toString() || "",
        edades_de_hijos: formulario.edadesHijos?.map(e => e.toString()) || [],
        talla_camisa: formulario.tallaCamisa || "",
        talla_pantalon: formulario.tallaPantalon || "",
        talla_zapatos: formulario.tallaZapato || "",        titulo_academico: formulario.tituloAcademico || "",      })
    }
  }, [candidato])

  useEffect(() => {
    // Cargar comunas cuando el municipio es Manizales
    if (formData.Municipio === "Manizales") {
      const comunasList = getComunas()
      setComunas(comunasList)
    } else {
      setComunas([])
      updateFormData("Comuna", "") // Resetear comuna si no es Manizales
    }
  }, [formData.Municipio])

  useEffect(() => {
    // Cargar barrios según el municipio seleccionado
    if (formData.Municipio === "Manizales" && formData.Comuna) {
      const barrios = getBarriosByComuna(formData.Comuna)
      setBarriosDisponibles(barrios)
    } else if (formData.Municipio === "Villamaría") {
      const barrios = getAllBarriosVillamaria()
      setBarriosDisponibles(barrios)
    } else {
      setBarriosDisponibles([])
    }
    // Resetear barrio al cambiar municipio o comuna
    updateFormData("Barrio", "")
  }, [formData.Municipio, formData.Comuna])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones contextuales
    const edadValidation = validateEdad(formData.edad_al_ingresar)
    if (!edadValidation.isValid) {
      toast({
        title: "Error de validación",
        description: edadValidation.message,
        variant: "destructive",
      })
      return
    }

    const municipioValidation = validateMunicipio(formData.Municipio)
    if (!municipioValidation.isValid) {
      toast({
        title: "Error de validación",
        description: municipioValidation.message,
        variant: "destructive",
      })
      return
    }

    const comunaValidation = validateComuna(formData.Municipio, formData.Comuna)
    if (!comunaValidation.isValid) {
      toast({
        title: "Error de validación",
        description: comunaValidation.message,
        variant: "destructive",
      })
      return
    }

    const barrioValidation = validateBarrio(formData.Barrio)
    if (!barrioValidation.isValid) {
      toast({
        title: "Error de validación",
        description: barrioValidation.message,
        variant: "destructive",
      })
      return
    }

    const direccionCompleta = `${formData.DireccionTipoVia} ${formData.DireccionNumero}${formData.DireccionComplemento ? `, ${formData.DireccionComplemento}` : ""}`.trim()
    const direccionValidation = validateDireccion(direccionCompleta)
    if (!direccionValidation.isValid) {
      toast({
        title: "Error de validación",
        description: direccionValidation.message,
        variant: "destructive",
      })
      return
    }

    const estratoValidation = validateEstrato(formData.Estrato)
    if (!estratoValidation.isValid) {
      toast({
        title: "Error de validación",
        description: estratoValidation.message,
        variant: "destructive",
      })
      return
    }

    // Validar hijos si aplica
    if (formData.Hijos === "Sí" || formData.Hijos === "Si") {
      const hijosValidation = validateEdadesHijos(formData.numero_hijos, formData.edades_de_hijos)
      if (!hijosValidation.isValid) {
        toast({
          title: "Error de validación",
          description: hijosValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    // Validar tallas
    const tallaCamisaValidation = validateTalla(formData.talla_camisa, 'camisa')
    if (!tallaCamisaValidation.isValid) {
      toast({
        title: "Error de validación",
        description: tallaCamisaValidation.message,
        variant: "destructive",
      })
      return
    }

    const tallaPantalonValidation = validateTalla(formData.talla_pantalon, 'pantalon')
    if (!tallaPantalonValidation.isValid) {
      toast({
        title: "Error de validación",
        description: tallaPantalonValidation.message,
        variant: "destructive",
      })
      return
    }

    const tallaZapatosValidation = validateTalla(formData.talla_zapatos, 'zapatos')
    if (!tallaZapatosValidation.isValid) {
      toast({
        title: "Error de validación",
        description: tallaZapatosValidation.message,
        variant: "destructive",
      })
      return
    }

    try {
      // Mapear payload al DTO esperado por el backend
      const edadesHijosNums = (formData.edades_de_hijos || [])
        .filter((e) => e !== "")
        .map((e) => parseInt(e, 10))
        .filter((n) => !Number.isNaN(n))

      const dto: CrearFormularioCandidatoDto = {
        estadoCivil: formData.CLB_EstadoCivil,
        genero: formData.CLB_Genero,
        edadIngreso: formData.edad_al_ingresar ? parseInt(formData.edad_al_ingresar, 10) : undefined,
        municipio: formData.Municipio,
        comuna: formData.Comuna,
        barrio: formData.Barrio,
        direccion: direccionCompleta,
        estrato: formData.Estrato ? parseInt(formData.Estrato, 10) : undefined,
        tieneHijo: formData.Hijos === "Sí" || formData.Hijos === "Si",
        edadesHijos: edadesHijosNums,
        tallaCamisa: formData.talla_camisa || undefined,
        tallaPantalon: formData.talla_pantalon || undefined,
        tallaZapato: formData.talla_zapatos || undefined,        tituloAcademico: formData.titulo_academico || undefined,      }

      await completarFormulario.mutateAsync({ token, datos: dto })

      toast({
        title: "Formulario enviado",
        description: "Hemos registrado tu información correctamente.",
      })

      setIsSubmitted(true)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar",
        description: err?.message || "Ocurri un error al enviar el formulario.",
      })
    }
  }

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateChildAge = (index: number, value: string) => {
    const newAges = [...formData.edades_de_hijos]
    newAges[index] = value
    setFormData((prev) => ({ ...prev, edades_de_hijos: newAges }))
  }

  const handleNumeroHijosChange = (value: string) => {
    const numHijos = parseInt(value) || 0
    const newAges = Array(numHijos).fill("")
    setFormData((prev) => ({ ...prev, numero_hijos: value, edades_de_hijos: newAges }))
  }

  console.log('CandidateForm render - isSubmitted:', isSubmitted)

  if (isSubmitted) {
    console.log('Rendering SuccessConfirmation component')
    return (
      <SuccessConfirmation
        title="Formulario enviado!"
        description="Gracias por completar el formulario de evaluación. Tu información ha sido guardada de manera segura y confidencial."
        message="El psicólogo a cargo revisará tu información y se pondrá en contacto contigo próximamente."
        onBackToHome={() => navigate("/")}
        backButtonText="Volver al inicio"
      />
    )
  }

  return (
    <div className="relative mx-auto max-w-4xl py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 -z-10 h-60 rounded-3xl bg-gradient-to-br from-[#00AEEF]/20 to-[#8E2FA0]/10 blur-3xl"
      />
      <Card className="overflow-hidden border-none bg-white shadow-2xl shadow-[#0046BE]/10 backdrop-blur rounded-3xl">
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-[#E6F2FF] via-[#F0E6FF] to-white px-6 py-8 sm:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-1/2 rounded-l-[160px] bg-gradient-to-l from-[#00AEEF]/10 to-transparent blur-2xl md:block"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-lg space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#00AEEF]/15 to-[#8E2FA0]/15 px-4 py-2 text-sm font-semibold text-[#0046BE]">
                <Brain className="h-4 w-4" />
                Evaluación en curso
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#0046BE] to-[#8E2FA0] bg-clip-text text-transparent">
                Bienvenido a tu proceso
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Dedica unos minutos a compartir tu información personal y laboral. Este paso nos ayuda a construir
                Rutas de crecimiento acordes con tu perfil.
              </CardDescription>
            </div>
            <div className="grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-md">
              {brandLogos.map((logo, index) => (
                <div
                  key={logo.src}
                  className="flex items-center justify-center rounded-2xl bg-white px-3 py-2 shadow-md ring-2 ring-[#00AEEF]/20 hover:ring-[#0046BE]/40 transition-all"
                >
                  <img src={logo.src}
                    alt={logo.alt}
                    className="h-9 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: información personal */}
            <div className="space-y-4">
              <div className="border-b-2 border-[#00AEEF]/30 pb-3">
                <h3 className="text-lg font-bold text-[#0046BE]">Información personal</h3>
                <p className="text-sm text-gray-600">Datos demográficos básicos</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado-civil">Estado civil</Label>
                  <Select
                    value={formData.CLB_EstadoCivil}
                    onValueChange={(value) => updateFormData("CLB_EstadoCivil", value)}
                    required
                  >
                    <SelectTrigger id="estado-civil">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Unión Libre">Unión libre</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select
                    value={formData.CLB_Genero}
                    onValueChange={(value) => updateFormData("CLB_Genero", value)}
                    required
                  >
                    <SelectTrigger id="genero">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                      <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo-academico">Título académico</Label>
                  <Select
                    value={formData.titulo_academico}
                    onValueChange={(value) => updateFormData("titulo_academico", value)}
                    required
                  >
                    <SelectTrigger id="titulo-academico">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BACHILLER">Bachiller</SelectItem>
                      <SelectItem value="TECNICO">Técnico</SelectItem>
                      <SelectItem value="TECNOLOGO">Tecnólogo</SelectItem>
                      <SelectItem value="PROFESIONAL">Profesional</SelectItem>
                      <SelectItem value="SIN_TITULO">Sin título</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad">Edad al ingresar</Label>
                    <Input
                      id="edad"
                      type="number"
                      min="18"
                      max="100"
                      placeholder="Ej: 28"
                      value={formData.edad_al_ingresar}
                      onChange={(e) => updateFormData("edad_al_ingresar", e.target.value)}
                      required
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hijos">¿Tiene hijos?</Label>
                  <Select
                    value={formData.Hijos}
                    onValueChange={(value) => {
                      updateFormData("Hijos", value)
                      if (value === "No") {
                        setFormData((prev) => ({ ...prev, numero_hijos: "", edades_de_hijos: [] }))
                      }
                    }}
                    required
                  >
                    <SelectTrigger id="hijos">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sí">Sí</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.Hijos === "Sí" && (
                  <div className="space-y-2">
                    <Label htmlFor="numero-hijos">¿Cuántos hijos?</Label>
                    <Select value={formData.numero_hijos} onValueChange={handleNumeroHijosChange} required>
                      <SelectTrigger id="numero-hijos">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {formData.Hijos === "Sí" && formData.numero_hijos && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold text-primary">Edades de los Hijos</h3>
                  <p className="text-sm text-muted-foreground">Información sobre las edades de tus hijos</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({ length: parseInt(formData.numero_hijos) }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`edad-hijo-${index}`}>Edad del hijo {index + 1}</Label>
                      <Input
                        id={`edad-hijo-${index}`}
                        type="number"
                        min="0"
                        max="50"
                        placeholder="Ej: 5"
                        value={formData.edades_de_hijos[index] || ""}
                        onChange={(e) => updateChildAge(index, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección: Ubicación */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Ubicación</h3>
                <p className="text-sm text-muted-foreground">información de residencia</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="municipio">Municipio</Label>
                  <Select
                    value={formData.Municipio}
                    onValueChange={(value) => updateFormData("Municipio", value)}
                    required
                  >
                    <SelectTrigger id="municipio">
                      <SelectValue placeholder="Selecciona municipio..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manizales">Manizales</SelectItem>
                      <SelectItem value="Villamaría">Villamaría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.Municipio === "Manizales" && (
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Select
                      value={formData.Comuna}
                      onValueChange={(value) => updateFormData("Comuna", value)}
                      required
                    >
                      <SelectTrigger id="comuna">
                        <SelectValue placeholder="Selecciona comuna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {comunas.map((comuna) => (
                          <SelectItem key={comuna} value={comuna}>
                            {comuna}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="barrio">Barrio</Label>
                  <Select
                    value={formData.Barrio}
                    onValueChange={(value) => updateFormData("Barrio", value)}
                    disabled={!formData.Municipio || (formData.Municipio === "Manizales" && !formData.Comuna)}
                    required
                  >
                    <SelectTrigger id="barrio">
                      <SelectValue placeholder={
                        !formData.Municipio 
                          ? "Primero selecciona municipio" 
                          : formData.Municipio === "Manizales" && !formData.Comuna 
                          ? "Primero selecciona comuna"
                          : "Selecciona barrio..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {barriosDisponibles.map((barrio) => (
                        <SelectItem key={barrio.objectId} value={barrio.nombre || ""}>
                          {barrio.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Dirección de vivienda</Label>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="direccion-tipo">Tipo de vía</Label>
                      <Select
                        value={formData.DireccionTipoVia}
                        onValueChange={(value) => updateFormData("DireccionTipoVia", value)}
                        required
                      >
                        <SelectTrigger id="direccion-tipo">
                          <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Calle">Calle</SelectItem>
                          <SelectItem value="Carrera">Carrera</SelectItem>
                          <SelectItem value="Avenida">Avenida</SelectItem>
                          <SelectItem value="Transversal">Transversal</SelectItem>
                          <SelectItem value="Diagonal">Diagonal</SelectItem>
                          <SelectItem value="Circular">Circular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="direccion-numero">Número</Label>
                      <Input
                        id="direccion-numero"
                        type="text"
                        placeholder="Ej: 77 # 21-87"
                        value={formData.DireccionNumero}
                        onChange={(e) => updateFormData("DireccionNumero", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="direccion-comp">Complemento</Label>
                      <Input
                        id="direccion-comp"
                        type="text"
                        placeholder="Ej: Conjunto Santa Mara Casa 8"
                        value={formData.DireccionComplemento}
                        onChange={(e) => updateFormData("DireccionComplemento", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estrato">Estrato</Label>
                  <Select value={formData.Estrato} onValueChange={(value) => updateFormData("Estrato", value)} required>
                    <SelectTrigger id="estrato">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sección: Tallas de ropa */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Tallas de ropa</h3>
                <p className="text-sm text-muted-foreground">información para dotación laboral</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="talla-camisa">Talla camisa</Label>
                  <Select
                    value={formData.talla_camisa}
                    onValueChange={(value) => updateFormData("talla_camisa", value)}
                    required
                  >
                    <SelectTrigger id="talla-camisa">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>                      
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talla-pantalon">Talla pantalón</Label>
                  <Select
                    value={formData.talla_pantalon}
                    onValueChange={(value) => updateFormData("talla_pantalon", value)}
                    required
                  >
                    <SelectTrigger id="talla-pantalon">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>                      
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talla-zapatos">Talla zapatos</Label>
                  <Select
                    value={formData.talla_zapatos}
                    onValueChange={(value) => updateFormData("talla_zapatos", value)}
                    required
                  >
                    <SelectTrigger id="talla-zapatos">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 27).map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Nota de privacidad - Política Completa */}
            <div className="bg-gradient-to-r from-[#E6F2FF] to-[#F0E6FF] rounded-2xl p-6 border-2 border-[#00AEEF]/20 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-xs text-gray-800 leading-relaxed">
                <div>
                  <p className="font-bold text-[#0046BE] mb-2">AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES</p>
                  <p className="text-justify">
                    Autorizo de manera voluntaria, previa, expresa e inequívoca a <strong>MUNDO SUPER S.A.S</strong> y sus empresas aliadas, en calidad de titular de mis Datos Personales, a que directamente, o a través de un tercero, recolecte, almacene, circule y utilice mis Datos Personales, para todas las finalidades contenidas en la <strong>Política de Privacidad y Proteccin de Datos Personales</strong> publicada en la página web <strong>http://www.super.com.co</strong>, la cual declaro conocer y entender, y como tal, forma parte integral de la presente AUTORIZACIÓN, y en especial para que se guarden registros documentales de mi asistencia a este evento o capacitacin, tales como listas de asistencia, fotografías, grabaciones de voz y/o videos, con finalidades históricas, indicadores internos y publicaciones tanto internas como externas.
                  </p>
                </div>

                <div className="border-t border-[#0046BE]/20 pt-3">
                  <p className="font-bold text-[#0046BE] mb-2">DERECHOS DEL TITULAR</p>
                  <p className="text-justify">
                    Declaro soy el Titular de los datos y/o su representante, que los datos suministrados son exactos, veraces y completos y que me fueron señalados mis derechos de:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Consultar la información aquí suministrada</li>
                    <li>Actualizar y rectificar la información suministrada</li>
                    <li>Suprimir o revocar la AUTORIZACIÓN otorgada para el tratamiento</li>
                  </ul>
                  <p className="text-justify mt-2">
                    Todos estos derechos pueden ser ejercidos a través del correo electrónico <strong>habeas.data@super.com.co</strong>, la página web <strong>www.super.com.co</strong>, o directamente en las instalaciones del Responsable del Tratamiento ubicadas en el <strong>Km 10 vía al Magdalena</strong>.
                  </p>
                </div>

                <div className="border-t border-[#0046BE]/20 pt-3 bg-white/50 p-2 rounded-lg">
                  <p className="font-bold text-[#00AEEF] mb-1">NOTA IMPORTANTE</p>
                  <p className="text-justify">
                    <strong>MUNDO SUPER S.A.S.</strong> y sus empresas aliadas utilizarn tus datos personales únicamente para procesos de selección y evaluación. Tu información será protegida conforme a la ley colombiana de proteccin de datos (Ley 1581 de 2012).
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-[#00AEEF]/20">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-2xl bg-gradient-to-r from-[#0046BE] to-[#00AEEF] hover:from-[#003A9E] hover:to-[#0098D4] text-white font-semibold shadow-lg shadow-[#0046BE]/30 transition-all" 
                disabled={completarFormulario.isPending}
              >
                {completarFormulario.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando Formulario...
                  </>
                ) : (
                  "Enviar Formulario"
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">
                Tu información será tratada de manera confidencial y segura
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



