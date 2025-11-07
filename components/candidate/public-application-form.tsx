"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Loader2 } from "lucide-react"
import { useModernToast } from "@/lib/toast"
import { getComunas, getBarriosByComuna, type BarrioData } from "@/lib/manizales-data"
import { getAllBarriosVillamaria, type BarrioVillamariaData } from "@/lib/villamaria-data"
import { SuccessConfirmation } from "@/components/ui/success-confirmation"
import { brandLogos } from "@/lib/brandAssets"
import { useRegistroCompleto } from "@/lib/hooks/useCandidatePublic"
import type { FormularioPublicoDto } from "@/types/selection.types"
import {
  validateEdad,
  validateTelefono,
  validateEmail,
  validateDireccion,
  validateEdadesHijos,
  validateMunicipio,
  validateComuna,
  validateBarrio,
  validateEstrato,
  validateTalla,
  validateNombreCompleto,
} from "@/lib/validations"

interface FormData {
  // Información de contacto
  cedula_ciudadania?: string
  nombre_completo: string
  correo_electronico: string
  telefono: string
  
  // Información demográfica
  CLB_EstadoCivil: string
  CLB_Genero: string
  edad_al_ingresar: string
  Municipio: string
  Barrio: string
  Comuna: string
  Estrato: string
  Direccion: string
  Hijos: string
  numero_hijos: string
  edades_de_hijos: string[]
  talla_camisa: string
  talla_pantalon: string
  talla_zapatos: string
}

export function PublicApplicationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registeredToken, setRegisteredToken] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    cedula_ciudadania: "",
    nombre_completo: "",
    correo_electronico: "",
    telefono: "",
    CLB_EstadoCivil: "",
    CLB_Genero: "",
    edad_al_ingresar: "",
    Municipio: "",
    Barrio: "",
    Comuna: "",
    Estrato: "",
    Direccion: "",
    Hijos: "",
    numero_hijos: "",
    edades_de_hijos: [],
    talla_camisa: "",
    talla_pantalon: "",
    talla_zapatos: "",
  })
  const toast = useModernToast()
  const registroCompleto = useRegistroCompleto()

  // Cargar datos geográficos
  const [comunas, setComunas] = useState<string[]>([])
  const [barriosDisponibles, setBarriosDisponibles] = useState<BarrioData[] | BarrioVillamariaData[]>([])

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
    // Validación de cédula (requerida por backend)
    if (!formData.cedula_ciudadania || !/^\d{6,20}$/.test(formData.cedula_ciudadania)) {
      toast.error({
        title: "Cédula inválida",
        description: "Ingresa una cédula válida (solo dígitos, entre 6 y 20).",
      })
      return
    }

  // Validaciones de información de contacto
    const nombreValidation = validateNombreCompleto(formData.nombre_completo)
    if (!nombreValidation.isValid) {
      toast.error({
        title: "Error de validación",
        description: nombreValidation.message,
      })
      return
    }

    const emailValidation = validateEmail(formData.correo_electronico)
    if (!emailValidation.isValid) {
      toast.error({
        title: "Error de validación",
        description: emailValidation.message,
      })
      return
    }

    const telefonoValidation = validateTelefono(formData.telefono)
    if (!telefonoValidation.isValid) {
      toast.error({
        title: "Error de validación",
        description: telefonoValidation.message,
      })
      return
    }

  // Validaciones opcionales de información demográfica (si se completó)
    if (formData.edad_al_ingresar) {
      const edadValidation = validateEdad(formData.edad_al_ingresar)
      if (!edadValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: edadValidation.message,
        })
        return
      }
    }

    if (formData.Municipio) {
      const municipioValidation = validateMunicipio(formData.Municipio)
      if (!municipioValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: municipioValidation.message,
        })
        return
      }

      const comunaValidation = validateComuna(formData.Municipio, formData.Comuna)
      if (!comunaValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: comunaValidation.message,
        })
        return
      }
    }

    if (formData.Barrio) {
      const barrioValidation = validateBarrio(formData.Barrio)
      if (!barrioValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: barrioValidation.message,
        })
        return
      }
    }

    if (formData.Direccion) {
      const direccionValidation = validateDireccion(formData.Direccion)
      if (!direccionValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: direccionValidation.message,
        })
        return
      }
    }

    if (formData.Estrato) {
      const estratoValidation = validateEstrato(formData.Estrato)
      if (!estratoValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: estratoValidation.message,
        })
        return
      }
    }

    // Validar hijos si aplica
    if (formData.Hijos === "si" && formData.numero_hijos) {
      const hijosValidation = validateEdadesHijos(formData.numero_hijos, formData.edades_de_hijos)
      if (!hijosValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: hijosValidation.message,
        })
        return
      }
    }

    // Validar tallas si se completaron
    if (formData.talla_camisa) {
      const tallaCamisaValidation = validateTalla(formData.talla_camisa, 'camisa')
      if (!tallaCamisaValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: tallaCamisaValidation.message,
        })
        return
      }
    }

    if (formData.talla_pantalon) {
      const tallaPantalonValidation = validateTalla(formData.talla_pantalon, 'pantalon')
      if (!tallaPantalonValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: tallaPantalonValidation.message,
        })
        return
      }
    }

    if (formData.talla_zapatos) {
      const tallaZapatosValidation = validateTalla(formData.talla_zapatos, 'zapatos')
      if (!tallaZapatosValidation.isValid) {
        toast.error({
          title: "Error de validación",
          description: tallaZapatosValidation.message,
        })
        return
      }
    }

    setIsLoading(true)
    try {
      // Mapear a DTO para registro público completo
      const edadesHijosNums = (formData.edades_de_hijos || [])
        .filter((e) => e !== "")
        .map((e) => parseInt(e, 10))
        .filter((n) => !Number.isNaN(n))

      const generoCode =
        formData.CLB_Genero === 'masculino' ? 'M' :
        formData.CLB_Genero === 'femenino' ? 'F' : 'O'

      const dto: Partial<FormularioPublicoDto> = {
        // Datos de candidato (requeridos)
        cedulaCiudadania: formData.cedula_ciudadania,
        nombreCompleto: formData.nombre_completo,
        email: formData.correo_electronico,
        telefono: formData.telefono,
        // Formulario (opcional)
        estadoCivil: formData.CLB_EstadoCivil || undefined,
        genero: formData.CLB_Genero ? generoCode : undefined,
        edadIngreso: formData.edad_al_ingresar ? parseInt(formData.edad_al_ingresar, 10) : undefined,
        municipio: formData.Municipio || undefined,
        comuna: formData.Comuna || undefined,
        barrio: formData.Barrio || undefined,
        direccion: formData.Direccion || undefined,
        estrato: formData.Estrato ? parseInt(formData.Estrato, 10) : undefined,
        tieneHijo: formData.Hijos === 'si',
        edadesHijos: edadesHijosNums.length ? edadesHijosNums : [],
        tallaCamisa: formData.talla_camisa || undefined,
        tallaPantalon: formData.talla_pantalon || undefined,
        tallaZapato: formData.talla_zapatos || undefined,
      }

      // Eliminar campos undefined
      Object.keys(dto).forEach((k) => {
        const key = k as keyof typeof dto
        if (dto[key] === undefined) delete dto[key]
      })

      const response = await registroCompleto.mutateAsync(dto as FormularioPublicoDto)

      if (response.success && response.data) {
        toast.success({
          title: 'Solicitud registrada',
          description: 'Hemos recibido tu información correctamente.',
        })
        setRegisteredToken(response.data.tokenAcceso || response.data.token || "")
        setIsSubmitted(true)
      } else {
        toast.error({
          title: 'No se pudo registrar',
          description: response.message || 'Ocurrió un error al enviar la solicitud.',
        })
      }
    } catch (err: any) {
      toast.error({
        title: 'No se pudo registrar',
        description: err?.message || 'Ocurrió un error al enviar la solicitud.',
      })
    } finally {
      setIsLoading(false)
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

  console.log('PublicApplicationForm render - isSubmitted:', isSubmitted)

  if (isSubmitted) {
    console.log('Rendering SuccessConfirmation component')
    return (
      <SuccessConfirmation
        title="¡Solicitud enviada!"
        description="Gracias por tu interés en trabajar con nosotros. Tu solicitud ha sido recibida correctamente."
        message="Nuestro equipo de recursos humanos revisará tu información y se pondrá en contacto contigo pronto."
        additionalInfo={
          <>
            <p className="text-sm font-medium mb-2">¿Qué sigue?</p>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li>Revisaremos tu solicitud en un plazo de 3-5 días hábiles</li>
              <li>Te contactaremos por correo o teléfono si tu perfil es seleccionado</li>
              <li>Recibirás instrucciones para las evaluaciones psicológicas</li>
            </ul>
          </>
        }
      />
    )
  }

  return (
    <div className="relative mx-auto max-w-5xl py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 -z-10 h-64 rounded-3xl bg-gradient-to-br from-[#7AC943]/20 to-[#00AEEF]/20 blur-3xl"
      />
      <Card className="overflow-hidden border-none bg-white shadow-2xl shadow-[#0046BE]/10 backdrop-blur rounded-3xl">
        <CardHeader className="relative overflow-hidden bg-gradient-to-br from-[#E6F2FF] via-white to-[#F0FFE6] px-6 py-8 sm:px-10">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-1/2 rounded-l-[160px] bg-gradient-to-l from-[#7AC943]/10 to-transparent blur-2xl md:block"
          />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7AC943]/15 to-[#F7941D]/15 px-4 py-2 text-sm font-semibold text-[#0046BE]">
                <Briefcase className="h-4 w-4" />
                Oportunidades laborales
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#0046BE] to-[#7AC943] bg-clip-text text-transparent">
                Construye tu futuro con nosotros
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Comparte tus datos y experiencia para participar en nuestros procesos de selección. Cuidaremos tu
                información en cada paso.
              </CardDescription>
            </div>
            <div className="grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-md">
              {brandLogos.map((logo, index) => (
                <div
                  key={logo.src}
                  className="flex items-center justify-center rounded-2xl bg-white px-3 py-2 shadow-md ring-2 ring-[#7AC943]/20 hover:ring-[#0046BE]/40 transition-all"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={48}
                    sizes="(min-width: 768px) 120px, 40vw"
                    priority={index === 0}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Información de Contacto */}
            <div className="space-y-4">
              <div className="border-b-2 border-[#7AC943]/30 pb-3">
                <h3 className="text-lg font-bold text-[#0046BE]">Información de contacto</h3>
                <p className="text-sm text-gray-600">Datos para comunicarnos contigo</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula_ciudadania">
                    Cédula de Ciudadanía <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cedula_ciudadania"
                    placeholder="Ej: 1234567890"
                    value={formData.cedula_ciudadania}
                    onChange={(e) => updateFormData("cedula_ciudadania", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre_completo"
                    placeholder="Ej: Juan Pérez García"
                    value={formData.nombre_completo}
                    onChange={(e) => updateFormData("nombre_completo", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="Ej: 3001234567"
                    value={formData.telefono}
                    onChange={(e) => updateFormData("telefono", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="correo_electronico">
                    Correo electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="correo_electronico"
                    type="email"
                    placeholder="Ej: juan.perez@ejemplo.com"
                    value={formData.correo_electronico}
                    onChange={(e) => updateFormData("correo_electronico", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sección: Información Personal */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Información personal</h3>
                <p className="text-sm text-muted-foreground">Datos demográficos básicos</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="CLB_Genero">Género</Label>
                  <Select value={formData.CLB_Genero} onValueChange={(value) => updateFormData("CLB_Genero", value)}>
                    <SelectTrigger id="CLB_Genero">
                      <SelectValue placeholder="Selecciona tu género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad_al_ingresar">Edad</Label>
                  <Input
                    id="edad_al_ingresar"
                    type="number"
                    placeholder="Ej: 25"
                    min="18"
                    max="100"
                    value={formData.edad_al_ingresar}
                    onChange={(e) => updateFormData("edad_al_ingresar", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="CLB_EstadoCivil">Estado civil</Label>
                  <Select
                    value={formData.CLB_EstadoCivil}
                    onValueChange={(value) => updateFormData("CLB_EstadoCivil", value)}
                  >
                    <SelectTrigger id="CLB_EstadoCivil">
                      <SelectValue placeholder="Selecciona tu estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="union_libre">Unión libre</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viudo">Viudo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Hijos">¿Tienes hijos?</Label>
                  <Select value={formData.Hijos} onValueChange={(value) => updateFormData("Hijos", value)}>
                    <SelectTrigger id="Hijos">
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.Hijos === "si" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="numero_hijos">Número de hijos</Label>
                      <Select value={formData.numero_hijos} onValueChange={handleNumeroHijosChange}>
                        <SelectTrigger id="numero_hijos">
                          <SelectValue placeholder="selecciona cantidad" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.edades_de_hijos.length > 0 && (
                      <div className="space-y-2 md:col-span-2">
                        <Label>Edades de los hijos</Label>
                        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-5">
                          {formData.edades_de_hijos.map((edad, index) => (
                            <Input
                              key={index}
                              type="number"
                              placeholder={`Hijo ${index + 1}`}
                              min="0"
                              max="100"
                              value={edad}
                              onChange={(e) => updateChildAge(index, e.target.value)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Sección: Ubicación */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Ubicación</h3>
                <p className="text-sm text-muted-foreground">Información de residencia</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="Municipio">Municipio</Label>
                  <Select
                    value={formData.Municipio}
                    onValueChange={(value) => updateFormData("Municipio", value)}
                  >
                    <SelectTrigger id="Municipio">
                      <SelectValue placeholder="Selecciona municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manizales">Manizales</SelectItem>
                      <SelectItem value="Villamaría">Villamaría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.Municipio === "Manizales" && (
                  <div className="space-y-2">
                    <Label htmlFor="Comuna">Comuna</Label>
                    <Select
                      value={formData.Comuna}
                      onValueChange={(value) => updateFormData("Comuna", value)}
                    >
                      <SelectTrigger id="Comuna">
                        <SelectValue placeholder="Selecciona comuna" />
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
                  <Label htmlFor="Barrio">Barrio</Label>
                  <Select
                    value={formData.Barrio}
                    onValueChange={(value) => updateFormData("Barrio", value)}
                    disabled={!formData.Municipio || (formData.Municipio === "Manizales" && !formData.Comuna)}
                  >
                    <SelectTrigger id="Barrio">
                        <SelectValue
                          placeholder={
                            !formData.Municipio 
                              ? "Primero selecciona municipio" 
                              : formData.Municipio === "Manizales" && !formData.Comuna 
                              ? "Primero selecciona comuna"
                              : "Selecciona barrio"
                          }
                        />
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

                <div className="space-y-2">
                  <Label htmlFor="Estrato">Estrato</Label>
                  <Select value={formData.Estrato} onValueChange={(value) => updateFormData("Estrato", value)}>
                    <SelectTrigger id="Estrato">
                      <SelectValue placeholder="selecciona estrato" />
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
              <div className="space-y-2">
                <Label htmlFor="Direccion">Dirección</Label>
                <Input
                    id="Direccion"
                    type="text"
                    placeholder="Ej: Calle 123 #45-67"
                    value={formData.Direccion}
                    onChange={(e) => updateFormData("Direccion", e.target.value)}
                  />
              </div>  
            </div>

            {/* Sección: Tallas */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Tallas de uniforme</h3>
                <p className="text-sm text-muted-foreground">Información para dotación laboral</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="talla_camisa">Talla de camisa</Label>
                  <Select
                    value={formData.talla_camisa}
                    onValueChange={(value) => updateFormData("talla_camisa", value)}
                  >
                    <SelectTrigger id="talla_camisa">
                      <SelectValue placeholder="selecciona talla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XS">XS</SelectItem>
                      <SelectItem value="S">S</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="XL">XL</SelectItem>
                      <SelectItem value="XXL">XXL</SelectItem>
                      <SelectItem value="XXXL">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talla_pantalon">Talla de pantalón</Label>
                  <Select
                    value={formData.talla_pantalon}
                    onValueChange={(value) => updateFormData("talla_pantalon", value)}
                  >
                    <SelectTrigger id="talla_pantalon">
                      <SelectValue placeholder="selecciona talla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="28">28</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="32">32</SelectItem>
                      <SelectItem value="34">34</SelectItem>
                      <SelectItem value="36">36</SelectItem>
                      <SelectItem value="38">38</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="42">42</SelectItem>
                      <SelectItem value="44">44</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talla_zapatos">Talla de zapatos</Label>
                  <Select
                    value={formData.talla_zapatos}
                    onValueChange={(value) => updateFormData("talla_zapatos", value)}
                  >
                    <SelectTrigger id="talla_zapatos">
                      <SelectValue placeholder="selecciona talla" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 18 }, (_, i) => i + 34).map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Nota de privacidad - Política Completa */}
            <div className="bg-gradient-to-r from-[#E6F2FF] to-[#F0FFE6] rounded-2xl p-6 border-2 border-[#00AEEF]/20 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-xs text-gray-800 leading-relaxed">
                <div>
                  <p className="font-bold text-[#0046BE] mb-2">AUTORIZACIÓN DE TRATAMIENTO DE DATOS PERSONALES</p>
                  <p className="text-justify">
                    Autorizo de manera voluntaria, previa, expresa e inequívoca a <strong>MUNDO SUPER S.A.S</strong> y sus empresas aliadas, en calidad de titular de mis Datos Personales, a que directamente, o a través de un tercero, recolecte, almacene, circule y utilice mis Datos Personales, para todas las finalidades contenidas en la <strong>Política de Privacidad y Protección de Datos Personales</strong> publicada en la página web <strong>http://www.super.com.co</strong>, la cual declaro conocer y entender, y como tal, forma parte integral de la presente autorización, y en especial para que se guarden registros documentales de mi asistencia a este evento o capacitación, tales como listas de asistencia, fotografías, grabaciones de voz y/o videos, con finalidades históricas, indicadores internos y publicaciones tanto internas como externas.
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
                    <li>Suprimir o revocar la autorización otorgada para el tratamiento</li>
                  </ul>
                  <p className="text-justify mt-2">
                    Todos estos derechos pueden ser ejercidos a través del correo electrónico <strong>habeas.data@super.com.co</strong>, la página web <strong>www.super.com.co</strong>, o directamente en las instalaciones del Responsable del Tratamiento ubicadas en el <strong>Km 10 vía al Magdalena</strong>.
                  </p>
                </div>

                <div className="border-t border-[#0046BE]/20 pt-3 bg-white/50 p-2 rounded-lg">
                  <p className="font-bold text-[#F7941D] mb-1">⚠️ NOTA IMPORTANTE</p>
                  <p className="text-justify">
                    <strong>MUNDO SUPER S.A.S.</strong> y sus empresas aliadas no retendrán, guardarán, usarán, o tendrán bajo su poder y custodia los documentos adjuntos a esta hoja de vida en su versión original. Únicamente solicitará y guardará copias de los mismos.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isLoading} 
                className="min-w-[200px] rounded-2xl bg-gradient-to-r from-[#7AC943] to-[#00AEEF] hover:from-[#6AB839] hover:to-[#0098D4] text-white font-semibold shadow-lg shadow-[#7AC943]/30 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Solicitud"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}



