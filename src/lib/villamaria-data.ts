/**
 * Utilidades para trabajar con datos geográficos de Villamaría
 * Barrios según datos oficiales del municipio
 */

import villamariaGeoData from "../data/villamaria-barrios.json"

export interface BarrioVillamariaData {
  barrio: string | null
  codigo: number | null
  nombre: string | null
  objectId: number
}

// Usar tipo any para evitar problemas de codificación de caracteres
const geoData: any = villamariaGeoData

/**
 * Obtiene todos los barrios de Villamaría ordenados alfabéticamente
 */
export function getAllBarriosVillamaria(): BarrioVillamariaData[] {
  return geoData.features
    .filter((feature: any) => feature.properties.nombre && feature.properties.nombre !== null)
    .map((feature: any) => ({
      barrio: feature.properties.barrio,
      codigo: feature.properties.codigo,
      nombre: feature.properties.nombre,
      objectId: feature.properties.ObjectId,
    }))
    .sort((a: BarrioVillamariaData, b: BarrioVillamariaData) => 
      (a.nombre || "").localeCompare(b.nombre || "")
    )
}

/**
 * Busca barrios por nombre (búsqueda parcial, case-insensitive)
 */
export function searchBarriosVillamaria(query: string): BarrioVillamariaData[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return []
  
  return geoData.features
    .filter((feature: any) => {
      const nombre = feature.properties.nombre?.toLowerCase() || ""
      const barrio = feature.properties.barrio?.toLowerCase() || ""
      return nombre.includes(normalizedQuery) || barrio.includes(normalizedQuery)
    })
    .map((feature: any) => ({
      barrio: feature.properties.barrio,
      codigo: feature.properties.codigo,
      nombre: feature.properties.nombre,
      objectId: feature.properties.ObjectId,
    }))
    .sort((a: BarrioVillamariaData, b: BarrioVillamariaData) => 
      (a.nombre || "").localeCompare(b.nombre || "")
    )
}

/**
 * Obtiene información de un barrio por su código
 */
export function getBarrioByCodigoVillamaria(codigo: number): BarrioVillamariaData | null {
  const feature = geoData.features.find((f: any) => f.properties.codigo === codigo)
  
  if (!feature) return null
  
  return {
    barrio: feature.properties.barrio,
    codigo: feature.properties.codigo,
    nombre: feature.properties.nombre,
    objectId: feature.properties.ObjectId,
  }
}

/**
 * Valida si un nombre de barrio existe en Villamaría
 */
export function isValidBarrioVillamaria(nombre: string): boolean {
  return geoData.features.some(
    (feature: any) => 
      feature.properties.nombre && 
      feature.properties.nombre.toLowerCase() === nombre.toLowerCase()
  )
}
