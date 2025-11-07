# 🔄 Ajuste del Modelo de Creación de Requerimientos

## 📋 Resumen de Cambios

Se ajustó el modelo de creación de requerimientos en toda la aplicación para que coincida exactamente con el formato esperado por la API. El cambio principal fue renombrar el campo `cargoObjetivo` a `rolObjetivo`.

## 🎯 Cambios Realizados

### 1. **Tipos de Datos** (`types/selection.types.ts`)
```typescript
// ANTES
export interface Requerimiento {
  cargoObjetivo: string
}

export interface CrearRequerimientoDto {
  cargoObjetivo: string
}

// DESPUÉS
export interface Requerimiento {
  rolObjetivo: string
}

export interface CrearRequerimientoDto {
  rolObjetivo: string
}
```

### 2. **Formulario de Creación** (`components/selection/CrearRequerimientoDialog.tsx`)
- Actualizado el schema de Zod para usar `rolObjetivo`
- Actualizado el formulario para usar `rolObjetivo`
- Actualizado el submit para enviar `rolObjetivo` a la API
- Etiqueta actualizada de "Cargo Objetivo" a "Rol Objetivo"

**Payloads enviado a la API:**
```json
{
  "psicologoDocumento": "1234567890",
  "psicologoNombre": "Dra. María González",
  "psicologoEmail": "maria.gonzalez@empresa.com",
  "perfilBasico": "Se requiere personal con experiencia en atención al cliente",
  "rolObjetivo": "Asesor Comercial",
  "areaObjetivo": "Ventas"
}
```

### 3. **Páginas Actualizadas**

#### ✅ `app/dashboard/selection/requerimientos/page.tsx`
- Actualizado filtro de búsqueda: `req.cargoObjetivo` → `req.rolObjetivo`
- Actualizado display en tabla: `{req.cargoObjetivo}` → `{req.rolObjetivo}`

#### ✅ `app/dashboard/selection/requerimientos/[id]/page.tsx`
- Actualizado título del header: `{requerimiento.cargoObjetivo}` → `{requerimiento.rolObjetivo}`
- Actualizado label de información: "Cargo Objetivo" → "Rol Objetivo"
- Actualizado display: `{requerimiento.cargoObjetivo}` → `{requerimiento.rolObjetivo}`

#### ✅ `app/dashboard/selection/page.tsx`
- Actualizado en la sección de Actividad Reciente: `req.cargoObjetivo` → `req.rolObjetivo`

#### ✅ `app/dashboard/selection/candidatos/page.tsx`
- Actualizado mapa de requisitos: `r.cargoObjetivo` → `r.rolObjetivo`
- Actualizado selector de filtro: `{r.cargoObjetivo}` → `{r.rolObjetivo}`

#### ✅ `app/dashboard/selection/resultados/page.tsx`
- Actualizado mapa de requisitos: `r.cargoObjetivo` → `r.rolObjetivo`
- Actualizado selector de filtro: `{r.cargoObjetivo}` → `{r.rolObjetivo}`

## 📊 Estructura del Modelo Final

### Request (POST /api/Requerimientos)
```json
{
  "psicologoDocumento": "string",
  "psicologoNombre": "string",
  "psicologoEmail": "string",
  "perfilBasico": "string",
  "rolObjetivo": "string",
  "areaObjetivo": "string"
}
```

### Response (Requerimiento)
```json
{
  "reqId": "number",
  "psicologoDocumento": "string",
  "psicologoNombre": "string",
  "psicologoEmail": "string",
  "perfilBasico": "string",
  "rolObjetivo": "string",
  "areaObjetivo": "string",
  "estado": {
    "estCodigo": "string",
    "estDescripcion": "string"
  },
  "fechaCreacion": "string",
  "totalCandidatos": "number"
}
```

## ✨ Beneficios

1. ✅ **Consistencia con API**: El modelo frontend coincide exactamente con el modelo esperado por el backend
2. ✅ **Validación Correcta**: Zod valida `rolObjetivo` con reglas apropiadas
3. ✅ **UI Actualizada**: Todas las etiquetas y displays usan la terminología correcta
4. ✅ **Sin Errores TypeScript**: Todos los tipos están correctamente actualizados

## 🧪 Validación

Todos los siguientes archivos han sido verificados sin errores de TypeScript:
- ✅ `types/selection.types.ts`
- ✅ `components/selection/CrearRequerimientoDialog.tsx`
- ✅ `app/dashboard/selection/requerimientos/page.tsx`
- ✅ `app/dashboard/selection/requerimientos/[id]/page.tsx`
- ✅ `app/dashboard/selection/page.tsx`
- ✅ `app/dashboard/selection/candidatos/page.tsx`
- ✅ `app/dashboard/selection/resultados/page.tsx`

## 📌 Notas Importantes

- El servidor de desarrollo continúa funcionando sin errores
- Todos los cambios son retrocompatibles con la estructura existente
- La aplicación está lista para enviar datos correctamente formateados a la API

