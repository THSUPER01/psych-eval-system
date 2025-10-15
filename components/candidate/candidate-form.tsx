"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Direccion: string
  Hijos: string
  numero_hijos: string
  edades_de_hijos: string[]
  talla_camisa: string
  talla_pantalon: string
  talla_zapatos: string
}

export function CandidateForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState<FormData>({
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
  const router = useRouter()

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

    const direccionValidation = validateDireccion(formData.Direccion)
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
    if (formData.Hijos === "Sí") {
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

    setIsLoading(true)
    console.log('📝 Form validation passed, submitting...')

    // TODO: Implement actual API call to save form data
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

  console.log('🔍 CandidateForm render - isSubmitted:', isSubmitted)

  if (isSubmitted) {
    console.log('🎯 Rendering SuccessConfirmation component')
    return (
      <SuccessConfirmation
        title="¡Formulario Enviado!"
        description="Gracias por completar el formulario de evaluación. Tu información ha sido guardada de manera segura y confidencial."
        message="El psicólogo a cargo revisará tu información y se pondrá en contacto contigo próximamente."
        onBackToHome={() => router.push("/")}
        backButtonText="Volver al Inicio"
      />
    )
  }

  return (
    <div className="container mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-accent/10 p-2 rounded-lg">
              <Brain className="w-8 h-8 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl">Formulario de Evaluación</CardTitle>
              <CardDescription>Por favor completa todos los campos con tu información</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Información Personal */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Información Personal</h3>
                <p className="text-sm text-muted-foreground">Datos demográficos básicos</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado-civil">Estado Civil</Label>
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
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
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
                  <Label htmlFor="edad">Edad al Ingresar</Label>
                  <Input
                    id="edad"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="28"
                    value={formData.edad_al_ingresar}
                    onChange={(e) => updateFormData("edad_al_ingresar", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hijos">¿Tiene Hijos?</Label>
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
                    <Label htmlFor="numero-hijos">¿Cuántos Hijos?</Label>
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
                      <Label htmlFor={`edad-hijo-${index}`}>Edad del Hijo {index + 1}</Label>
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
                <p className="text-sm text-muted-foreground">Información de residencia</p>
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

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    type="text"
                    placeholder="Ej: Calle 123 #45-67"
                    value={formData.Direccion}
                    onChange={(e) => updateFormData("Direccion", e.target.value)}
                    required
                  />
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

            {/* Sección: Tallas de Ropa */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-semibold text-primary">Tallas de Ropa</h3>
                <p className="text-sm text-muted-foreground">Información para dotación laboral</p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="talla-camisa">Talla Camisa</Label>
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
                      <SelectItem value="XXXL">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talla-pantalon">Talla Pantalón</Label>
                  <Select
                    value={formData.talla_pantalon}
                    onValueChange={(value) => updateFormData("talla_pantalon", value)}
                    required
                  >
                    <SelectTrigger id="talla-pantalon">
                      <SelectValue placeholder="Selecciona..." />
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
                  <Label htmlFor="talla-zapatos">Talla Zapatos</Label>
                  <Select
                    value={formData.talla_zapatos}
                    onValueChange={(value) => updateFormData("talla_zapatos", value)}
                    required
                  >
                    <SelectTrigger id="talla-zapatos">
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 20 }, (_, i) => i + 24).map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando Formulario...
                  </>
                ) : (
                  "Enviar Formulario"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                Tu información será tratada de manera confidencial y segura
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
