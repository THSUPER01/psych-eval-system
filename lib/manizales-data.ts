/**
 * Utilidades para trabajar con datos geográficos de Manizales
 * Barrios y comunas según datos oficiales
 */

import manizalesGeoData from "../data/manizales-barrios-comunas.json"

export interface BarrioData {
  comuna: string | null
  ident: number | null
  barrio: string | null
  codigo: number | null
  nombre: string | null
  objectId: number
}

// Usar tipo any para evitar problemas de codificación de caracteres
const geoData: any = manizalesGeoData

/**
 * Obtiene la lista única de comunas de Manizales
 */
export function getComunas(): string[] {
  const comunas = new Set<string>()
  
  geoData.features.forEach((feature: any) => {
    if (feature.properties.comuna && feature.properties.comuna !== null) {
      comunas.add(feature.properties.comuna)
    }
  })
  
  return Array.from(comunas).sort()
}

/**
 * Obtiene los barrios de una comuna específica
 */
export function getBarriosByComuna(comuna: string): BarrioData[] {
  return geoData.features
    .filter((feature: any) => feature.properties.comuna === comuna && feature.properties.nombre)
    .map((feature: any) => ({
      comuna: feature.properties.comuna,
      ident: feature.properties.ident,
      barrio: feature.properties.barrio,
      codigo: feature.properties["código"] || feature.properties.código,
      nombre: feature.properties.nombre,
      objectId: feature.properties.ObjectId,
    }))
    .sort((a: BarrioData, b: BarrioData) => (a.nombre || "").localeCompare(b.nombre || ""))
}

/**
 * Obtiene todos los barrios de Manizales
 */
export function getAllBarrios(): BarrioData[] {
  return geoData.features
    .filter((feature: any) => feature.properties.nombre && feature.properties.nombre !== null)
    .map((feature: any) => ({
      comuna: feature.properties.comuna,
      ident: feature.properties.ident,
      barrio: feature.properties.barrio,
      codigo: feature.properties["código"] || feature.properties.código,
      nombre: feature.properties.nombre,
      objectId: feature.properties.ObjectId,
    }))
    .sort((a: BarrioData, b: BarrioData) => (a.nombre || "").localeCompare(b.nombre || ""))
}

/**
 * Busca barrios por nombre (búsqueda parcial, case-insensitive)
 */
export function searchBarrios(query: string): BarrioData[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  if (!normalizedQuery) return []
  
  return geoData.features
    .filter((feature: any) => {
      const nombre = feature.properties.nombre?.toLowerCase() || ""
      const barrio = feature.properties.barrio?.toLowerCase() || ""
      return nombre.includes(normalizedQuery) || barrio.includes(normalizedQuery)
    })
    .map((feature: any) => ({
      comuna: feature.properties.comuna,
      ident: feature.properties.ident,
      barrio: feature.properties.barrio,
      codigo: feature.properties["código"] || feature.properties.código,
      nombre: feature.properties.nombre,
      objectId: feature.properties.ObjectId,
    }))
    .sort((a: BarrioData, b: BarrioData) => (a.nombre || "").localeCompare(b.nombre || ""))
}

/**
 * Obtiene información de un barrio por su código
 */
export function getBarrioByCodigo(codigo: number): BarrioData | null {
  const feature = geoData.features.find((f: any) => f.properties["código"] === codigo || f.properties.código === codigo)
  
  if (!feature) return null
  
  return {
    comuna: feature.properties.comuna,
    ident: feature.properties.ident,
    barrio: feature.properties.barrio,
    codigo: feature.properties["código"] || feature.properties.código,
    nombre: feature.properties.nombre,
    objectId: feature.properties.ObjectId,
  }
}

/**
 * Valida si un barrio existe en el sistema
 */
export function isValidBarrio(nombre: string): boolean {
  return geoData.features.some(
    (feature: any) => feature.properties.nombre?.toLowerCase() === nombre.toLowerCase()
  )
}

/**
 * Obtiene la comuna a la que pertenece un barrio
 */
export function getComunaByBarrio(nombreBarrio: string): string | null {
  const feature = geoData.features.find(
    (f: any) => f.properties.nombre?.toLowerCase() === nombreBarrio.toLowerCase()
  )
  
  return feature?.properties.comuna || null
}
