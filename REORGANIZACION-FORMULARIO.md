# Reorganización del Formulario del Candidato

## Cambios Realizados

Se ha reorganizado completamente el formulario del candidato (`candidate-form.tsx`) para mejorar la experiencia de usuario y la claridad visual del formulario.

## Estructura Anterior (Desordenada)

El formulario tenía todos los campos en un solo grid sin secciones claras:
- Estado Civil, Género, Edad, Municipio, Comuna, Barrio, Estrato, Dirección y Hijos
- Todo mezclado sin separación visual
- Difícil de navegar y completar

## Nueva Estructura (Organizada)

### 1. **Información Personal**
```
┌─────────────────────────────────────────────┐
│ Información Personal                        │
│ Datos demográficos básicos                  │
├─────────────────────────────────────────────┤
│ • Estado Civil                              │
│ • Género                                    │
│ • Edad al Ingresar                          │
│ • ¿Tiene Hijos?                             │
│ • ¿Cuántos Hijos? (si aplica)              │
└─────────────────────────────────────────────┘
```

### 2. **Edades de los Hijos** (Condicional)
```
┌─────────────────────────────────────────────┐
│ Edades de los Hijos                         │
│ Información sobre las edades de tus hijos   │
├─────────────────────────────────────────────┤
│ • Edad del Hijo 1                           │
│ • Edad del Hijo 2                           │
│ • ... (según cantidad seleccionada)         │
└─────────────────────────────────────────────┘
```

### 3. **Ubicación**
```
┌─────────────────────────────────────────────┐
│ Ubicación                                   │
│ Información de residencia                   │
├─────────────────────────────────────────────┤
│ • Municipio                                 │
│ • Comuna (solo si es Manizales)            │
│ • Barrio                                    │
│ • Dirección                                 │
│ • Estrato                                   │
└─────────────────────────────────────────────┘
```

### 4. **Tallas de Ropa**
```
┌─────────────────────────────────────────────┐
│ Tallas de Ropa                              │
│ Información para dotación laboral           │
├─────────────────────────────────────────────┤
│ • Talla Camisa                              │
│ • Talla Pantalón                            │
│ • Talla Zapatos                             │
└─────────────────────────────────────────────┘
```

## Mejoras Visuales Implementadas

### 1. Separadores de Sección
Cada sección tiene:
- **Título** en texto grande y color primario
- **Descripción** en texto pequeño y color secundario
- **Línea divisoria** (border-bottom) para separación visual

```tsx
<div className="border-b pb-2">
  <h3 className="text-lg font-semibold text-primary">Título Sección</h3>
  <p className="text-sm text-muted-foreground">Descripción</p>
</div>
```

### 2. Espaciado Mejorado
- **Entre secciones**: `space-y-8` (2rem)
- **Dentro de secciones**: `space-y-4` (1rem)
- **Entre campos**: `gap-4` (1rem)

### 3. Grid Responsivo
- **Desktop**: 2 columnas para la mayoría de campos
- **Mobile**: 1 columna automática
- **Tallas**: 3 columnas en desktop

### 4. Lógica Condicional Clara
- La sección "Edades de los Hijos" solo aparece si:
  - `formData.Hijos === "Sí"`
  - `formData.numero_hijos` tiene valor
  
- El campo "Comuna" solo aparece si:
  - `formData.Municipio === "Manizales"`

## Flujo de Completado

El usuario ahora sigue un flujo lógico y natural:

1. **Empieza con datos personales básicos**
   - Estado civil, género, edad
   - Información sobre hijos

2. **Si tiene hijos, captura edades**
   - Sección dedicada y separada
   - Campos dinámicos según cantidad

3. **Continúa con ubicación**
   - Municipio → Comuna (si aplica) → Barrio
   - Dirección y estrato agrupados

4. **Finaliza con tallas**
   - Toda la información de dotación junta
   - Fácil de completar de una vez

## Comparación Visual

### Antes
```
[Estado Civil] [Género]
[Edad] [Municipio]
[Comuna] [Barrio]
[Estrato] [Dirección]
[¿Hijos?] [¿Cuántos?]
--- sin separación visual ---
[Edad Hijo 1] [Edad Hijo 2]
--- sin separación visual ---
[Talla Camisa] [Talla Pantalón] [Talla Zapatos]
```

### Después
```
═══════════════════════════════════════
  INFORMACIÓN PERSONAL
  Datos demográficos básicos
───────────────────────────────────────
[Estado Civil] [Género]
[Edad] [¿Hijos?]
[¿Cuántos?]

═══════════════════════════════════════
  EDADES DE LOS HIJOS
  Información sobre las edades
───────────────────────────────────────
[Edad Hijo 1] [Edad Hijo 2]

═══════════════════════════════════════
  UBICACIÓN
  Información de residencia
───────────────────────────────────────
[Municipio] [Comuna]
[Barrio] [Dirección]
[Estrato]

═══════════════════════════════════════
  TALLAS DE ROPA
  Información para dotación laboral
───────────────────────────────────────
[Camisa] [Pantalón] [Zapatos]
```

## Beneficios

✅ **Mayor claridad**: Usuario sabe en qué sección está
✅ **Mejor navegación**: Secciones visualmente separadas
✅ **Flujo lógico**: Orden natural de completado
✅ **Menos errores**: Agrupación lógica reduce confusión
✅ **Mejor UX móvil**: Secciones más fáciles de scrollear
✅ **Profesional**: Aspecto más organizado y limpio

## Código Actualizado

El archivo `components/candidate/candidate-form.tsx` ahora tiene:
- 4 secciones principales con headers
- Espaciado consistente (`space-y-8` entre secciones)
- Grids responsivos (`md:grid-cols-2` y `md:grid-cols-3`)
- Condicionales claros para campos opcionales
- Sin cambios en la lógica de negocio o validación
