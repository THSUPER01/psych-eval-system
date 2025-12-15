import type React from "react"

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
  // Informaci�n de contacto
  cedula_ciudadania?: string
  nombre_completo: string
  correo_electronico: string
  telefono: string
  
  // Informaci�n demogr�fica
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
  habilidades: string
}

export function PublicApplicationForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [registeredToken, setRegisteredToken] = useState<string>("")
  const [hojaVida, setHojaVida] = useState<File | null>(null)
  const [archivoError, setArchivoError] = useState<string | null>(null)
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
    DireccionTipoVia: "",
    DireccionNumero: "",
    DireccionComplemento: "",
    Hijos: "",
    numero_hijos: "",
    edades_de_hijos: [],
    talla_camisa: "",
    talla_pantalon: "",
    talla_zapatos: "",
    habilidades: "",
  })
  const toast = useModernToast()

  // Cargar datos geogr�ficos
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
  // Cargar barrios seg�n el municipio seleccionado
    if (formData.Municipio === "Manizales" && formData.Comuna) {
      const barrios = getBarriosByComuna(formData.Comuna)
      setBarriosDisponibles(barrios)
  } else if (formData.Municipio === "Villamar�a") {
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
    // Validaci�n de c�dula (requerida por backend)
    if (!formData.cedula_ciudadania || !/^\d{6,20}$/.test(formData.cedula_ciudadania)) {
      toast.error({
        title: "C�dula inv�lida",
        description: "Ingresa una c�dula v�lida (solo d�gitos, entre 6 y 20).",
      })
      return
    }

  // Validaciones de informaci�n de contacto
    const nombreValidation = validateNombreCompleto(formData.nombre_completo)
    if (!nombreValidation.isValid) {
      toast.error({
        title: "Error de validaci�n",
        description: nombreValidation.message,
      })
      return
    }

    const emailValidation = validateEmail(formData.correo_electronico)
    if (!emailValidation.isValid) {
      toast.error({
        title: "Error de validaci�n",
        description: emailValidation.message,
      })
      return
    }

    const telefonoValidation = validateTelefono(formData.telefono)
    if (!telefonoValidation.isValid) {
      toast.error({
        title: "Error de validaci�n",
        description: telefonoValidation.message,
      })
      return
    }

  // Validaciones opcionales de informaci�n demogr�fica (si se complet�)
    if (formData.edad_al_ingresar) {
      const edadValidation = validateEdad(formData.edad_al_ingresar)
      if (!edadValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: edadValidation.message,
        })
        return
      }
    }

    if (formData.Municipio) {
      const municipioValidation = validateMunicipio(formData.Municipio)
      if (!municipioValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: municipioValidation.message,
        })
        return
      }

      const comunaValidation = validateComuna(formData.Municipio, formData.Comuna)
      if (!comunaValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: comunaValidation.message,
        })
        return
      }
    }

    if (formData.Barrio) {
      const barrioValidation = validateBarrio(formData.Barrio)
      if (!barrioValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: barrioValidation.message,
        })
        return
      }
    }

    // Validaci�n de direcci�n (opcional): si se diligencia alguno de los campos, exigir tipo y n�mero
    const tieneAlgunaDireccion = !!(formData.DireccionTipoVia || formData.DireccionNumero || formData.DireccionComplemento)
    let direccionCompleta: string | undefined = undefined
    if (tieneAlgunaDireccion) {
      if (!formData.DireccionTipoVia || !formData.DireccionNumero) {
        toast.error({
          title: "Direcci�n incompleta",
          description: "Selecciona el tipo de v�a e ingresa el n�mero de la direcci�n.",
        })
        return
      }
      direccionCompleta = `${formData.DireccionTipoVia} ${formData.DireccionNumero}${formData.DireccionComplemento ? `, ${formData.DireccionComplemento}` : ""}`.trim()
      const direccionValidation = validateDireccion(direccionCompleta)
      if (!direccionValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: direccionValidation.message,
        })
        return
      }
    }

    if (formData.Estrato) {
      const estratoValidation = validateEstrato(formData.Estrato)
      if (!estratoValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
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
          title: "Error de validaci�n",
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
          title: "Error de validaci�n",
          description: tallaCamisaValidation.message,
        })
        return
      }
    }

    if (formData.talla_pantalon) {
      const tallaPantalonValidation = validateTalla(formData.talla_pantalon, 'pantalon')
      if (!tallaPantalonValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: tallaPantalonValidation.message,
        })
        return
      }
    }

    if (formData.talla_zapatos) {
      const tallaZapatosValidation = validateTalla(formData.talla_zapatos, 'zapatos')
      if (!tallaZapatosValidation.isValid) {
        toast.error({
          title: "Error de validaci�n",
          description: tallaZapatosValidation.message,
        })
        return
      }
    }

    setIsLoading(true)
    try {
      // Mapear a FormData para registro p�blico completo con archivo
      const edadesHijosNums = (formData.edades_de_hijos || [])
        .filter((e) => e !== "")
        .map((e) => parseInt(e, 10))
        .filter((n) => !Number.isNaN(n))

      const generoCode =
        formData.CLB_Genero === 'masculino' ? 'M' :
        formData.CLB_Genero === 'femenino' ? 'F' : 'O'

      // Construir FormData (multipart/form-data)
      const formDataToSend = new FormData()
      
      // Datos requeridos
      formDataToSend.append('NombreCompleto', formData.nombre_completo)
      formDataToSend.append('Email', formData.correo_electronico)
      formDataToSend.append('Telefono', formData.telefono)
      formDataToSend.append('CedulaCiudadania', formData.cedula_ciudadania || '')
      formDataToSend.append('TieneHijo', formData.Hijos === 'si' ? 'true' : 'false')
      
      // Datos opcionales del formulario
      if (formData.CLB_EstadoCivil) formDataToSend.append('EstadoCivil', formData.CLB_EstadoCivil)
      if (formData.CLB_Genero) formDataToSend.append('Genero', generoCode)
      if (formData.edad_al_ingresar) formDataToSend.append('EdadIngreso', formData.edad_al_ingresar)
      if (formData.Municipio) formDataToSend.append('Municipio', formData.Municipio)
      if (formData.Comuna) formDataToSend.append('Comuna', formData.Comuna)
      if (formData.Barrio) formDataToSend.append('Barrio', formData.Barrio)
      if (direccionCompleta) formDataToSend.append('Direccion', direccionCompleta)
      if (formData.Estrato) formDataToSend.append('Estrato', formData.Estrato)
      
      // Enviar EdadesHijos como campos m�ltiples repetidos (recomendado por backend)
      if (edadesHijosNums.length) {
        edadesHijosNums.forEach(edad => {
          formDataToSend.append('EdadesHijos', edad.toString())
        })
      }
      
      if (formData.talla_camisa) formDataToSend.append('TallaCamisa', formData.talla_camisa)
      if (formData.talla_pantalon) formDataToSend.append('TallaPantalon', formData.talla_pantalon)
      if (formData.talla_zapatos) formDataToSend.append('TallaZapato', formData.talla_zapatos)
      if (formData.habilidades) formDataToSend.append('Habilidades', formData.habilidades)
      
      // Archivo de hoja de vida (opcional)
      if (hojaVida) {
        formDataToSend.append('HojaVida', hojaVida)
      }

      // Llamar al endpoint con-cv usando FormData
      const response = await fetch(
        `${import.meta.env.VITE_API_SELECCION_URL || 'http://localhost:5208/api'}/publico/registro-completo-con-cv`,
        {
          method: 'POST',
          headers: {
            'App-Token': import.meta.env.VITE_APP_TOKEN || 'B5935F96448CE865F31F7F9C6D4A914FB90EE07461AEEA615B9618B32DB18438',
          },
          body: formDataToSend,
        }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = errorText
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData?.message || errorData?.mensaje || errorMessage
        } catch {}
        throw new Error(errorMessage)
      }
      
      const result = await response.json()

      if (result.success && result.data) {
        toast.success({
          title: '�Solicitud enviada con �xito!',
          description: hojaVida 
            ? 'Tu informaci�n y hoja de vida fueron recibidas correctamente.' 
            : 'Tu informaci�n fue recibida correctamente.',
        })
        setRegisteredToken(result.data.tokenAcceso || result.data.token || "")
        setIsSubmitted(true)
      } else {
        toast.error({
          title: 'No se pudo registrar',
          description: result.message || 'Ocurri� un error al enviar la solicitud.',
        })
      }
    } catch (err: any) {
      toast.error({
        title: 'No se pudo registrar',
        description: err?.message || 'Ocurri� un error al enviar la solicitud.',
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setArchivoError(null)
    
    if (!file) {
      setHojaVida(null)
      return
    }
    
    // Validar tama�o (5 MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
      setArchivoError(`El archivo es muy grande (${sizeMB} MB). M�ximo permitido: 5 MB`)
      setHojaVida(null)
      e.target.value = ''
      return
    }
    
    // Validar extensi�n
    const extensionesPermitidas = ['.pdf', '.doc', '.docx']
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!extensionesPermitidas.includes(extension)) {
      setArchivoError('Solo se permiten archivos PDF, Word (DOC) o Word (DOCX)')
      setHojaVida(null)
      e.target.value = ''
      return
    }
    
    setHojaVida(file)
  }

  console.log('PublicApplicationForm render - isSubmitted:', isSubmitted)

  if (isSubmitted) {
    console.log('Rendering SuccessConfirmation component')
    return (
      <SuccessConfirmation
        title="�Solicitud enviada con �xito!"
        description={
          hojaVida 
            ? "Gracias por tu inter�s en trabajar con nosotros. Recibimos tu informaci�n y tu hoja de vida correctamente." 
            : "Gracias por tu inter�s en trabajar con nosotros. Tu solicitud ha sido recibida correctamente."
        }
        message="Nuestro equipo de recursos humanos revisar� tu informaci�n y se pondr� en contacto contigo pronto."
        additionalInfo={
          <>
            <p className="text-sm font-medium mb-2">?? �Qu� sigue ahora?</p>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li>? Tu informaci�n ya est� guardada en nuestro sistema</li>
              <li>?? Revisaremos tu solicitud en un plazo de 3-5 d�as h�biles</li>
              <li>?? Te contactaremos por correo o tel�fono si tu perfil es seleccionado</li>
              <li>?? Si eres seleccionado, recibir�s instrucciones para las evaluaciones</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200">
              ?? <strong>Importante:</strong> Revisa tu correo electr�nico (incluyendo la carpeta de spam) en los pr�ximos d�as.
            </p>
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
                Comparte tus datos y experiencia para participar en nuestros procesos de selecci�n. Cuidaremos tu
                informaci�n en cada paso.
              </CardDescription>
            </div>
            <div className="grid w-full max-w-sm grid-cols-2 gap-3 sm:max-w-md">
              {brandLogos.map((logo, index) => (
                <div
                  key={logo.src}
                  className="flex items-center justify-center rounded-2xl bg-white px-3 py-2 shadow-md ring-2 ring-[#7AC943]/20 hover:ring-[#0046BE]/40 transition-all"
                >
                  <img src={logo.src}
                    alt={logo.alt}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 py-8 sm:px-10 sm:py-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Secci�n: Informaci�n de Contacto */}
            <div className="space-y-4">
              <div className="border-b-2 border-[#7AC943]/30 pb-3">
                <h3 className="text-lg font-bold text-[#0046BE]">Informaci�n de contacto</h3>
                <p className="text-sm text-gray-600">Datos para comunicarnos contigo</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cedula_ciudadania">
                    C�dula de Ciudadan�a <span className="text-red-500">*</span>
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
                    placeholder="Ej: Juan P�rez Garc�a"
                    value={formData.nombre_completo}
                    onChange={(e) => updateFormData("nombre_completo", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">
                    Tel�fono <span className="text-red-500">*</span>
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
                    Correo electr�nico <span className="text-red-500">*</span>
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

            {/* Secci�n: Informaci�n Personal */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Informaci�n personal</h3>
                <p className="text-sm text-muted-foreground">Datos demogr�ficos b�sicos</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="CLB_Genero">G�nero</Label>
                  <Select value={formData.CLB_Genero} onValueChange={(value) => updateFormData("CLB_Genero", value)}>
                    <SelectTrigger id="CLB_Genero">
                      <SelectValue placeholder="Selecciona tu g�nero" />
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
                      <SelectItem value="union_libre">Uni�n libre</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viudo">Viudo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="Hijos">�Tienes hijos?</Label>
                  <Select value={formData.Hijos} onValueChange={(value) => updateFormData("Hijos", value)}>
                    <SelectTrigger id="Hijos">
                      <SelectValue placeholder="Selecciona una opci�n" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">S�</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.Hijos === "si" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="numero_hijos">N�mero de hijos</Label>
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

            {/* Secci�n: Ubicaci�n */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Ubicaci�n</h3>
                <p className="text-sm text-muted-foreground">Informaci�n de residencia</p>
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
                      <SelectItem value="Villamar�a">Villamar�a</SelectItem>
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
              <div className="space-y-2 md:col-span-3">
                <Label>Direcci�n de vivienda</Label>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="DireccionTipoVia">Tipo de v�a</Label>
                    <Select
                      value={formData.DireccionTipoVia}
                      onValueChange={(value) => updateFormData("DireccionTipoVia", value)}
                    >
                      <SelectTrigger id="DireccionTipoVia">
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
                    <Label htmlFor="DireccionNumero">N�mero</Label>
                    <Input
                      id="DireccionNumero"
                      type="text"
                      placeholder="Ej: 77 # 21-87"
                      value={formData.DireccionNumero}
                      onChange={(e) => updateFormData("DireccionNumero", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="DireccionComplemento">Complemento</Label>
                    <Input
                      id="DireccionComplemento"
                      type="text"
                      placeholder="Ej: Conjunto Santa Mar�a Casa 8"
                      value={formData.DireccionComplemento}
                      onChange={(e) => updateFormData("DireccionComplemento", e.target.value)}
                    />
                  </div>
                </div>
              </div>  
            </div>

            {/* Secci�n: Experiencia y Habilidades */}
            <div className="space-y-4">
              <div className="border-b-2 border-[#7AC943]/30 pb-3">
                <h3 className="text-lg font-bold text-[#0046BE]">Cu�ntanos sobre ti</h3>
                <p className="text-sm text-gray-600">Tus habilidades y experiencia (opcional)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="habilidades" className="text-base">
                  �Qu� sabes hacer? �En qu� has trabajado antes?
                </Label>
                <p className="text-xs text-muted-foreground mb-2">
                  ?? Ejemplo: "He trabajado como cajero 2 a�os, soy bueno con los n�meros y trato bien a los clientes"
                </p>
                <textarea
                  id="habilidades"
                  className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0046BE] focus:border-transparent resize-none"
                  placeholder="Escribe aqu� tus experiencias, habilidades o lo que sabes hacer..."
                  value={formData.habilidades}
                  onChange={(e) => updateFormData("habilidades", e.target.value)}
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.habilidades.length} / 2000 caracteres
                </p>
              </div>
            </div>

            {/* Secci�n: Hoja de Vida */}
            <div className="space-y-4">
              <div className="border-b-2 border-[#7AC943]/30 pb-3">
                <h3 className="text-lg font-bold text-[#0046BE]">Adjunta tu hoja de vida</h3>
                <p className="text-sm text-gray-600">Si tienes una, s�bela aqu� (opcional)</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-dashed border-[#00AEEF]/40">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-[#0046BE] p-2 rounded-lg">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="hojaVida" className="text-base font-semibold text-[#0046BE] cursor-pointer">
                        Selecciona tu hoja de vida
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        ?? Formatos: PDF, Word (DOC, DOCX) � Tama�o m�ximo: 5 MB
                      </p>
                    </div>
                  </div>

                  <input
                    id="hojaVida"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#7AC943] file:text-white hover:file:bg-[#6AB839] file:cursor-pointer cursor-pointer"
                  />

                  {hojaVida && !archivoError && (
                    <div className="bg-white rounded-lg p-3 border-2 border-green-200 flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded">
                        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{hojaVida.name}</p>
                        <p className="text-xs text-gray-600">
                          {(hojaVida.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>
                  )}

                  {archivoError && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-start gap-3">
                      <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800">{archivoError}</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">
                    ?? <strong>Tip:</strong> Si no tienes hoja de vida en el computador, puedes dejar este campo vac�o y enviar el formulario de todos modos.
                  </p>
                </div>
              </div>
            </div>

            {/* Secci�n: Tallas */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Tallas de uniforme</h3>
                <p className="text-sm text-muted-foreground">Informaci�n para dotaci�n laboral</p>
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
                  <Label htmlFor="talla_pantalon">Talla de pantal�n</Label>
                  <Select
                    value={formData.talla_pantalon}
                    onValueChange={(value) => updateFormData("talla_pantalon", value)}
                  >
                    <SelectTrigger id="talla_pantalon">
                      <SelectValue placeholder="selecciona talla" />
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
                  <Label htmlFor="talla_zapatos">Talla de zapatos</Label>
                  <Select
                    value={formData.talla_zapatos}
                    onValueChange={(value) => updateFormData("talla_zapatos", value)}
                  >
                    <SelectTrigger id="talla_zapatos">
                      <SelectValue placeholder="selecciona talla" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Tallas desde 34 hasta 51 */}
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

            {/* Nota de privacidad - Pol�tica Completa */}
            <div className="bg-gradient-to-r from-[#E6F2FF] to-[#F0FFE6] rounded-2xl p-6 border-2 border-[#00AEEF]/20 space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-3 text-xs text-gray-800 leading-relaxed">
                <div>
                  <p className="font-bold text-[#0046BE] mb-2">AUTORIZACI�N DE TRATAMIENTO DE DATOS PERSONALES</p>
                  <p className="text-justify">
                    Autorizo de manera voluntaria, previa, expresa e inequ�voca a <strong>MUNDO SUPER S.A.S</strong> y sus empresas aliadas, en calidad de titular de mis Datos Personales, a que directamente, o a trav�s de un tercero, recolecte, almacene, circule y utilice mis Datos Personales, para todas las finalidades contenidas en la <strong>Pol�tica de Privacidad y Protecci�n de Datos Personales</strong> publicada en la p�gina web <strong>http://www.super.com.co</strong>, la cual declaro conocer y entender, y como tal, forma parte integral de la presente autorizaci�n, y en especial para que se guarden registros documentales de mi asistencia a este evento o capacitaci�n, tales como listas de asistencia, fotograf�as, grabaciones de voz y/o videos, con finalidades hist�ricas, indicadores internos y publicaciones tanto internas como externas.
                  </p>
                </div>

                <div className="border-t border-[#0046BE]/20 pt-3">
                  <p className="font-bold text-[#0046BE] mb-2">DERECHOS DEL TITULAR</p>
                  <p className="text-justify">
                    Declaro soy el Titular de los datos y/o su representante, que los datos suministrados son exactos, veraces y completos y que me fueron se�alados mis derechos de:
                  </p>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                    <li>Consultar la informaci�n aqu� suministrada</li>
                    <li>Actualizar y rectificar la informaci�n suministrada</li>
                    <li>Suprimir o revocar la autorizaci�n otorgada para el tratamiento</li>
                  </ul>
                  <p className="text-justify mt-2">
                    Todos estos derechos pueden ser ejercidos a trav�s del correo electr�nico <strong>habeas.data@super.com.co</strong>, la p�gina web <strong>www.super.com.co</strong>, o directamente en las instalaciones del Responsable del Tratamiento ubicadas en el <strong>Km 10 v�a al Magdalena</strong>.
                  </p>
                </div>

                <div className="border-t border-[#0046BE]/20 pt-3 bg-white/50 p-2 rounded-lg">
                  <p className="font-bold text-[#F7941D] mb-1">?? NOTA IMPORTANTE</p>
                  <p className="text-justify">
                    <strong>MUNDO SUPER S.A.S.</strong> y sus empresas aliadas no retendr�n, guardar�n, usar�n, o tendr�n bajo su poder y custodia los documentos adjuntos a esta hoja de vida en su versi�n original. �nicamente solicitar� y guardar� copias de los mismos.
                  </p>
                </div>
              </div>
            </div>

            {/* Bot�n de env�o */}
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




