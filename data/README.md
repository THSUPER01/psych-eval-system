# Datos Geográficos - Manizales y Villamaría

Este directorio contiene datos geográficos y estáticos utilizados en la aplicación.

## Archivos

### `manizales-barrios-comunas.json`

Archivo JSON con la división administrativa completa de Manizales:
- **Comunas**: 12 comunas principales
- **Barrios**: ~300 barrios y sectores
- **Estructura**: Cada feature incluye:
  - `comuna`: Nombre de la comuna
  - `barrio`: Nombre del barrio principal
  - `nombre`: Nombre específico del sector
  - `codigo`: Código único del sector
  - `ident`: Identificador del barrio principal
  - `objectId`: ID único del feature

### `villamaria-barrios.json`

Archivo JSON con la división administrativa de Villamaría:
- **Barrios**: 55 barrios
- **Nota**: Villamaría no tiene división por comunas
- **Estructura**: Cada feature incluye:
  - `barrio`: Nombre del barrio
  - `nombre`: Nombre del sector
  - `codigo`: Código único del sector
  - `objectId`: ID único del feature

## Uso

### Manizales

Para usar estos datos en la aplicación, importa las utilidades desde `@/lib/manizales-data.ts`:

```typescript
import { getComunas, getBarriosByComuna, searchBarrios } from "@/lib/manizales-data"

// Obtener todas las comunas
const comunas = getComunas()

// Obtener barrios de una comuna específica
const barrios = getBarriosByComuna("Palogrande")

// Buscar barrios por nombre
const resultados = searchBarrios("La Enea")
```

### Villamaría

Para usar los datos de Villamaría, importa desde `@/lib/villamaria-data.ts`:

```typescript
import { getAllBarriosVillamaria, searchBarriosVillamaria } from "@/lib/villamaria-data"

// Obtener todos los barrios
const barrios = getAllBarriosVillamaria()

// Buscar barrios por nombre
const resultados = searchBarriosVillamaria("Villa")
```

## Estructura del proyecto

```
data/
├── README.md                       # Este archivo
├── manizales-barrios-comunas.json  # Datos geográficos de Manizales
└── villamaria-barrios.json         # Datos geográficos de Villamaría
```

## Comunas de Manizales

1. Atardeceres
2. San José
3. Cumanday
4. La Estación
5. Ciudadela del Norte
6. Ecoturístico Cerro de Oro
7. Tesorito
8. Palogrande
9. Universitaria
10. La Fuente
11. La Macarena
12. Doce

## Notas

- Los datos provienen de fuentes oficiales de la Alcaldía de Manizales
- Última actualización: 2020
- El archivo GeoJSON no incluye geometrías (solo propiedades administrativas)
- Se usa para autocompletar campos de dirección en formularios
