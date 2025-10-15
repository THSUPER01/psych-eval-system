/**
 * Utilidades de validación para formularios del sistema
 * Validaciones contextuales para datos colombianos
 */

export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * Valida que la edad esté en un rango laboral apropiado (18-65 años)
 */
export function validateEdad(edad: string): ValidationResult {
  const edadNum = parseInt(edad)
  
  if (isNaN(edadNum)) {
    return { isValid: false, message: "La edad debe ser un número válido" }
  }
  
  if (edadNum < 18) {
    return { isValid: false, message: "Debes ser mayor de 18 años" }
  }
  
  if (edadNum > 65) {
    return { isValid: false, message: "La edad debe ser menor a 65 años" }
  }
  
  return { isValid: true }
}

/**
 * Valida formato de teléfono colombiano
 * Formatos aceptados: 3001234567, 300 123 4567, 300-123-4567
 */
export function validateTelefono(telefono: string): ValidationResult {
  // Remover espacios, guiones y paréntesis
  const cleanPhone = telefono.replace(/[\s\-()]/g, "")
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(cleanPhone)) {
    return { isValid: false, message: "El teléfono solo debe contener números" }
  }
  
  // Teléfonos móviles en Colombia empiezan con 3 y tienen 10 dígitos
  if (cleanPhone.startsWith("3") && cleanPhone.length === 10) {
    return { isValid: true }
  }
  
  // Teléfonos fijos en Caldas (área 6) tienen 7 dígitos (sin código)
  if (cleanPhone.length === 7) {
    return { isValid: true }
  }
  
  // Teléfonos fijos con código de área (6) + 7 dígitos = 8 dígitos
  if (cleanPhone.startsWith("6") && cleanPhone.length === 8) {
    return { isValid: true }
  }
  
  return { 
    isValid: false, 
    message: "Formato inválido. Usa: 3001234567 (móvil) o 8801234 (fijo)" 
  }
}

/**
 * Valida formato de correo electrónico
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Formato de correo inválido" }
  }
  
  // Validar que el dominio no contenga caracteres especiales raros
  const domain = email.split("@")[1]
  if (domain && domain.includes("..")) {
    return { isValid: false, message: "Dominio de correo inválido" }
  }
  
  return { isValid: true }
}

/**
 * Valida que el número de hijos coincida con las edades proporcionadas
 */
export function validateEdadesHijos(
  numeroHijos: string,
  edadesHijos: string[]
): ValidationResult {
  const numHijos = parseInt(numeroHijos)
  
  if (isNaN(numHijos) || numHijos < 1) {
    return { isValid: false, message: "Número de hijos inválido" }
  }
  
  // Validar que todas las edades estén completas
  const edadesCompletas = edadesHijos.filter(edad => edad.trim() !== "")
  
  if (edadesCompletas.length !== numHijos) {
    return { 
      isValid: false, 
      message: `Debes ingresar las edades de los ${numHijos} hijo(s)` 
    }
  }
  
  // Validar que todas las edades sean números válidos y razonables
  for (let i = 0; i < edadesCompletas.length; i++) {
    const edad = parseInt(edadesCompletas[i])
    
    if (isNaN(edad)) {
      return { 
        isValid: false, 
        message: `Edad del hijo ${i + 1} debe ser un número válido` 
      }
    }
    
    if (edad < 0 || edad > 50) {
      return { 
        isValid: false, 
        message: `Edad del hijo ${i + 1} debe estar entre 0 y 50 años` 
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Valida que todos los campos requeridos estén completos
 */
export function validateRequiredField(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} es requerido` }
  }
  return { isValid: true }
}

/**
 * Valida que la dirección tenga un formato mínimo aceptable
 */
export function validateDireccion(direccion: string): ValidationResult {
  if (!direccion || direccion.trim() === "") {
    return { isValid: false, message: "La dirección es requerida" }
  }
  
  if (direccion.trim().length < 5) {
    return { isValid: false, message: "La dirección es muy corta (mínimo 5 caracteres)" }
  }
  
  // Validar que contenga al menos un número (común en direcciones colombianas)
  if (!/\d/.test(direccion)) {
    return { 
      isValid: false, 
      message: "La dirección debe incluir números (Ej: Calle 25 #10-15)" 
    }
  }
  
  return { isValid: true }
}

/**
 * Valida que el nombre completo tenga al menos nombre y apellido
 */
export function validateNombreCompleto(nombre: string): ValidationResult {
  if (!nombre || nombre.trim() === "") {
    return { isValid: false, message: "El nombre completo es requerido" }
  }
  
  const palabras = nombre.trim().split(/\s+/)
  
  if (palabras.length < 2) {
    return { 
      isValid: false, 
      message: "Debes ingresar al menos nombre y apellido" 
    }
  }
  
  // Validar que solo contenga letras, espacios y caracteres latinos
  if (!/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]+$/.test(nombre)) {
    return { 
      isValid: false, 
      message: "El nombre solo debe contener letras" 
    }
  }
  
  return { isValid: true }
}

/**
 * Valida el formato de tallas de ropa
 */
export function validateTalla(talla: string, tipo: 'camisa' | 'pantalon' | 'zapatos'): ValidationResult {
  if (!talla || talla.trim() === "") {
    return { isValid: false, message: `La talla de ${tipo} es requerida` }
  }
  
  const tallasValidasCamisa = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const tallasValidasPantalon = ['28', '30', '32', '34', '36', '38', '40', '42', '44']
  
  if (tipo === 'camisa' && !tallasValidasCamisa.includes(talla)) {
    return { isValid: false, message: "Talla de camisa inválida" }
  }
  
  if (tipo === 'pantalon' && !tallasValidasPantalon.includes(talla)) {
    return { isValid: false, message: "Talla de pantalón inválida" }
  }
  
  if (tipo === 'zapatos') {
    const tallaNum = parseInt(talla)
    if (isNaN(tallaNum) || tallaNum < 24 || tallaNum > 45) {
      return { isValid: false, message: "Talla de zapatos debe estar entre 24 y 45" }
    }
  }
  
  return { isValid: true }
}

/**
 * Valida que se haya seleccionado un municipio válido
 */
export function validateMunicipio(municipio: string): ValidationResult {
  const municipiosValidos = ['Manizales', 'Villamaría']
  
  if (!municipio || !municipiosValidos.includes(municipio)) {
    return { isValid: false, message: "Debes seleccionar un municipio válido" }
  }
  
  return { isValid: true }
}

/**
 * Valida que se haya seleccionado una comuna (solo para Manizales)
 */
export function validateComuna(municipio: string, comuna: string): ValidationResult {
  if (municipio === 'Manizales') {
    if (!comuna || comuna.trim() === "") {
      return { isValid: false, message: "Debes seleccionar una comuna" }
    }
  }
  
  return { isValid: true }
}

/**
 * Valida que se haya seleccionado un barrio
 */
export function validateBarrio(barrio: string): ValidationResult {
  if (!barrio || barrio.trim() === "") {
    return { isValid: false, message: "Debes seleccionar un barrio" }
  }
  
  return { isValid: true }
}

/**
 * Valida que se haya seleccionado un estrato válido (1-6)
 */
export function validateEstrato(estrato: string): ValidationResult {
  const estratosValidos = ['1', '2', '3', '4', '5', '6']
  
  if (!estrato || !estratosValidos.includes(estrato)) {
    return { isValid: false, message: "Debes seleccionar un estrato válido (1-6)" }
  }
  
  return { isValid: true }
}
