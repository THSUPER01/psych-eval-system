"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getComunas, getBarriosByComuna, type BarrioData } from "@/lib/manizales-data"
import { getAllBarriosVillamaria, type BarrioVillamariaData } from "@/lib/villamaria-data"
import { SuccessConfirmation } from "@/components/ui/success-confirmation"
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
  const [formData, setFormData] = useState<FormData>({
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
  const { toast } = useToast()

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
    
    // Validaciones de información de contacto
    const nombreValidation = validateNombreCompleto(formData.nombre_completo)
    if (!nombreValidation.isValid) {
      toast({
        title: "Error de validación",
        description: nombreValidation.message,
        variant: "destructive",
      })
      return
    }

    const emailValidation = validateEmail(formData.correo_electronico)
    if (!emailValidation.isValid) {
      toast({
        title: "Error de validación",
        description: emailValidation.message,
        variant: "destructive",
      })
      return
    }

    const telefonoValidation = validateTelefono(formData.telefono)
    if (!telefonoValidation.isValid) {
      toast({
        title: "Error de validación",
        description: telefonoValidation.message,
        variant: "destructive",
      })
      return
    }

    // Validaciones opcionales de información demográfica (si se completó)
    if (formData.edad_al_ingresar) {
      const edadValidation = validateEdad(formData.edad_al_ingresar)
      if (!edadValidation.isValid) {
        toast({
          title: "Error de validación",
          description: edadValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    if (formData.Municipio) {
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
    }

    if (formData.Barrio) {
      const barrioValidation = validateBarrio(formData.Barrio)
      if (!barrioValidation.isValid) {
        toast({
          title: "Error de validación",
          description: barrioValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    if (formData.Direccion) {
      const direccionValidation = validateDireccion(formData.Direccion)
      if (!direccionValidation.isValid) {
        toast({
          title: "Error de validación",
          description: direccionValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    if (formData.Estrato) {
      const estratoValidation = validateEstrato(formData.Estrato)
      if (!estratoValidation.isValid) {
        toast({
          title: "Error de validación",
          description: estratoValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    // Validar hijos si aplica
    if (formData.Hijos === "si" && formData.numero_hijos) {
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

    // Validar tallas si se completaron
    if (formData.talla_camisa) {
      const tallaCamisaValidation = validateTalla(formData.talla_camisa, 'camisa')
      if (!tallaCamisaValidation.isValid) {
        toast({
          title: "Error de validación",
          description: tallaCamisaValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    if (formData.talla_pantalon) {
      const tallaPantalonValidation = validateTalla(formData.talla_pantalon, 'pantalon')
      if (!tallaPantalonValidation.isValid) {
        toast({
          title: "Error de validación",
          description: tallaPantalonValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    if (formData.talla_zapatos) {
      const tallaZapatosValidation = validateTalla(formData.talla_zapatos, 'zapatos')
      if (!tallaZapatosValidation.isValid) {
        toast({
          title: "Error de validación",
          description: tallaZapatosValidation.message,
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)
    console.log('📝 Form validation passed, submitting...')

    // TODO: Implement actual API call to save public application data
    setTimeout(() => {
      console.log('✅ Setting isSubmitted to TRUE')
      setIsSubmitted(true)
      setIsLoading(false)
      console.log('📊 Form submitted successfully, should show SuccessConfirmation now')
    }, 1500)
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

  console.log('🔍 PublicApplicationForm render - isSubmitted:', isSubmitted)

  if (isSubmitted) {
    console.log('🎯 Rendering SuccessConfirmation component')
    return (
      <SuccessConfirmation
        title="¡Solicitud Enviada!"
        description="Gracias por tu interés en trabajar con nosotros. Tu solicitud ha sido recibida correctamente."
        message="Nuestro equipo de recursos humanos revisará tu información y te contactará pronto."
        additionalInfo={
          <>
            <p className="text-sm font-medium mb-2">¿Qué sigue?</p>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li>• Revisaremos tu solicitud en un plazo de 3-5 días hábiles</li>
              <li>• Te contactaremos por correo o teléfono si tu perfil es seleccionado</li>
              <li>• Recibirás instrucciones para las evaluaciones psicológicas</li>
            </ul>
          </>
        }
      />
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <Card>
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Briefcase className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl mb-2">Solicitud de Empleo</CardTitle>
          <CardDescription className="text-base">
            Super de Alimentos S.A. - Formulario de Postulación
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-4">
            Completa el siguiente formulario para postularte a las oportunidades laborales en nuestra empresa. Toda la
            información será tratada de manera confidencial.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Información de Contacto */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Información de Contacto</h3>
                <p className="text-sm text-muted-foreground">Datos para comunicarnos contigo</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre_completo">
                    Nombre Completo <span className="text-red-500">*</span>
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
                    Correo Electrónico <span className="text-red-500">*</span>
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
                <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
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
                  <Label htmlFor="CLB_EstadoCivil">Estado Civil</Label>
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
                      <SelectItem value="union_libre">Unión Libre</SelectItem>
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
                          <SelectValue placeholder="Selecciona cantidad" />
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
                      <SelectValue placeholder="Selecciona estrato" />
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
                <Label htmlFor="Direccion">Direccion</Label>
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
                <h3 className="text-lg font-semibold text-primary">Tallas de Uniforme</h3>
                <p className="text-sm text-muted-foreground">Información para dotación laboral</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="talla_camisa">Talla de Camisa</Label>
                  <Select
                    value={formData.talla_camisa}
                    onValueChange={(value) => updateFormData("talla_camisa", value)}
                  >
                    <SelectTrigger id="talla_camisa">
                      <SelectValue placeholder="Selecciona talla" />
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
                  <Label htmlFor="talla_pantalon">Talla de Pantalón</Label>
                  <Select
                    value={formData.talla_pantalon}
                    onValueChange={(value) => updateFormData("talla_pantalon", value)}
                  >
                    <SelectTrigger id="talla_pantalon">
                      <SelectValue placeholder="Selecciona talla" />
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
                  <Label htmlFor="talla_zapatos">Talla de Zapatos</Label>
                  <Select
                    value={formData.talla_zapatos}
                    onValueChange={(value) => updateFormData("talla_zapatos", value)}
                  >
                    <SelectTrigger id="talla_zapatos">
                      <SelectValue placeholder="Selecciona talla" />
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

            {/* Nota de privacidad */}
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground">
                <strong>Política de Privacidad:</strong> La información proporcionada será utilizada exclusivamente para
                procesos de selección en Super de Alimentos S.A. y será tratada de manera confidencial según la Ley de
                Protección de Datos Personales.
              </p>
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
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
