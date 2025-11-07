# Guía de Integración Frontend - Sistema de Candidatos

**Fecha:** 2025-11-06  
**Versión:** 1.0  
**API Base URL:** `https://tu-api.com/api` (reemplazar con URL real)

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Autenticación por Token](#autenticación-por-token)
3. [Flujo 1: Registro Público (Candidato Independiente)](#flujo-1-registro-público-candidato-independiente)
4. [Flujo 2: Proceso de Selección (Psicólogo → Candidato)](#flujo-2-proceso-de-selección-psicólogo--candidato)
5. [Estados del Candidato](#estados-del-candidato)
6. [Ejemplos de Código Frontend](#ejemplos-de-código-frontend)
7. [DTOs Completos](#dtos-completos)
8. [Manejo de Errores](#manejo-de-errores)
9. [Casos de Uso Completos](#casos-de-uso-completos)

---

## Introducción

Este sistema maneja dos flujos principales:

### ✅ Flujo Público
Personas interesadas en trabajar en la empresa **se registran por cuenta propia** desde la web pública.

### ✅ Flujo de Selección
Un **psicólogo crea un requerimiento**, agrega candidatos, y ellos completan su información mediante un **token único**.

### 🔑 Concepto Clave: El Token

**El token es la llave de acceso del candidato.**

- ✅ Generado automáticamente al crear el candidato
- ✅ Es único y de 32 caracteres (Guid sin guiones)
- ✅ Se usa para **saludar**, **consultar datos** y **completar formulario**
- ✅ **No requiere autenticación** (acceso público mediante el token)
- ✅ Se envía automáticamente por email al candidato

---

## Autenticación por Token

### ¿Cómo funciona?

El candidato **NO necesita usuario/contraseña**. Solo necesita su **token**.

```
┌─────────────────┐
│  Usuario ingresa│
│  a la URL con   │
│  su token       │
└────────┬────────┘
         │
         ▼
  yourapp.com/candidato/5d7a3c9f43f54b1c9f4d0a9b1f3e0c2a
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend extrae el token de la URL  │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ GET /api/publico/candidato/{token}       │
│                                          │
│ Respuesta: Datos del candidato          │
│  - Nombre completo                       │
│  - Email                                 │
│  - Estado actual (CAND_REGISTRADO, etc.) │
│  - Si tiene formulario completado        │
└──────────────────────────────────────────┘
```

### Ejemplo de Saludo al Candidato

Cuando el candidato ingresa a la URL con su token, el frontend puede mostrar:

```javascript
// Extraer token de la URL
const token = window.location.pathname.split('/').pop(); 
// O usar React Router: const { token } = useParams();

// Consultar datos del candidato
const response = await fetch(`https://tu-api.com/api/publico/candidato/${token}`);
const data = await response.json();

if (data.success) {
  const candidato = data.data;
  
  // Mostrar saludo personalizado
  console.log(`¡Hola ${candidato.nombreCompleto}!`);
  console.log(`Estado actual: ${candidato.estado.estDescripcion}`);
  console.log(`Email: ${candidato.email}`);
  console.log(`Formulario completado: ${candidato.formularioCompletado ? 'Sí' : 'No'}`);
  
  // Decidir qué mostrar según el estado
  if (!candidato.formularioCompletado) {
    // Mostrar formulario para completar
  } else {
    // Mostrar resumen de información
  }
}
```

**Respuesta de la API:**

```json
{
  "success": true,
  "data": {
    "canId": 42,
    "requerimientoId": 5,
    "cedulaCiudadania": "1234567890",
    "nombreCompleto": "Juan Pérez García",
    "email": "juan.perez@email.com",
    "telefono": "3001234567",
    "token": "5d7a3c9f43f54b1c9f4d0a9b1f3e0c2a",
    "estado": {
      "estId": 14,
      "estCodigo": "CAND_REGISTRADO",
      "estDescripcion": "Candidato Registrado",
      "estActivo": true
    },
    "linkEnviado": true,
    "fechaEnvioLink": "2025-11-06T10:30:00Z",
    "formularioCompletado": false,
    "fechaCompletado": null,
    "resultadoSeleccion": null,
    "motivoRechazo": null,
    "fechaResultado": null,
    "usuarioResultado": null,
    "fechaCreacion": "2025-11-06T10:25:00Z",
    "formulario": null,
    "documentos": []
  }
}
```

---

## Flujo 1: Registro Público (Candidato Independiente)

Este flujo es para personas que **encuentran la página web** de la empresa y quieren **postularse sin tener un requerimiento previo**.

### Opción A: Registro Simple + Completar Después

```
┌──────────────────────────┐
│ 1. Candidato llena       │
│    formulario básico:    │
│    - Cédula              │
│    - Nombre              │
│    - Email               │
│    - Teléfono            │
└────────┬─────────────────┘
         │
         ▼
POST /api/publico/registro
         │
         ▼
┌──────────────────────────────────┐
│ 2. API crea candidato            │
│    - Genera token único          │
│    - Envía email automático      │
│    - Estado: CAND_REGISTRADO     │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ 3. Frontend recibe token         │
│    - Guarda en localStorage      │
│    - Redirige a formulario       │
│      completo                    │
└────────┬─────────────────────────┘
         │
         ▼
POST /api/publico/candidato/{token}/formulario
         │
         ▼
┌──────────────────────────────────┐
│ 4. Candidato completa datos:     │
│    - Estado civil, género        │
│    - Dirección, estrato          │
│    - Hijos, tallas               │
│    - Estado: FORMULARIO_COMPLETO │
└──────────────────────────────────┘
```

#### Paso 1: Registro Simple

**Request:**
```javascript
POST /api/publico/registro
Content-Type: application/json

{
  "cedulaCiudadania": "1234567890",
  "nombreCompleto": "María González",
  "email": "maria.gonzalez@email.com",
  "telefono": "3009876543"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registro exitoso. Usa el token proporcionado para completar tu información.",
  "data": {
    "canId": 50,
    "requerimientoId": null,
    "cedulaCiudadania": "1234567890",
    "nombreCompleto": "María González",
    "email": "maria.gonzalez@email.com",
    "telefono": "3009876543",
    "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "estado": {
      "estId": 14,
      "estCodigo": "CAND_REGISTRADO",
      "estDescripcion": "Candidato Registrado",
      "estActivo": true
    },
    "linkEnviado": true,
    "fechaEnvioLink": "2025-11-06T14:30:00Z",
    "formularioCompletado": false,
    "fechaCreacion": "2025-11-06T14:30:00Z",
    "formulario": null,
    "documentos": []
  }
}
```

**Código Frontend (React ejemplo):**
```javascript
async function registroSimple(datos) {
  try {
    const response = await fetch('https://tu-api.com/api/publico/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedulaCiudadania: datos.cedula,
        nombreCompleto: datos.nombre,
        email: datos.email,
        telefono: datos.telefono
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Guardar token localmente
      localStorage.setItem('candidatoToken', result.data.token);
      
      // Redirigir a completar formulario
      window.location.href = `/candidato/${result.data.token}/formulario`;
      
      // O usar React Router:
      // navigate(`/candidato/${result.data.token}/formulario`);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error en registro:', error);
    alert('Error al registrar. Inténtalo de nuevo.');
  }
}
```

#### Paso 2: Completar Formulario

**Request:**
```javascript
POST /api/publico/candidato/{token}/formulario
Content-Type: application/json

{
  "estadoCivil": "Soltero",
  "genero": "Femenino",
  "edadIngreso": 28,
  "municipio": "Medellín",
  "comuna": "El Poblado",
  "barrio": "Manila",
  "direccion": "Calle 10 # 43A-30 Apt 501",
  "estrato": 4,
  "tieneHijo": true,
  "edadesHijos": [3, 5],
  "tallaCamisa": "M",
  "tallaPantalon": "8",
  "tallaZapato": "37"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Formulario completado exitosamente",
  "data": {
    "forId": 25,
    "candidatoId": 50,
    "estadoCivil": "Soltero",
    "genero": "Femenino",
    "edadIngreso": 28,
    "municipio": "Medellín",
    "comuna": "El Poblado",
    "barrio": "Manila",
    "direccion": "Calle 10 # 43A-30 Apt 501",
    "estrato": 4,
    "tieneHijo": true,
    "cantidadHijo": 2,
    "edadesHijos": [3, 5],
    "tallaCamisa": "M",
    "tallaPantalon": "8",
    "tallaZapato": "37"
  }
}
```

**Código Frontend (React ejemplo):**
```javascript
async function completarFormulario(token, datosFormulario) {
  try {
    const response = await fetch(`https://tu-api.com/api/publico/candidato/${token}/formulario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estadoCivil: datosFormulario.estadoCivil,
        genero: datosFormulario.genero,
        edadIngreso: parseInt(datosFormulario.edad),
        municipio: datosFormulario.municipio,
        comuna: datosFormulario.comuna,
        barrio: datosFormulario.barrio,
        direccion: datosFormulario.direccion,
        estrato: parseInt(datosFormulario.estrato),
        tieneHijo: datosFormulario.tieneHijos,
        edadesHijos: datosFormulario.tieneHijos ? datosFormulario.edadesHijos : [],
        tallaCamisa: datosFormulario.tallaCamisa,
        tallaPantalon: datosFormulario.tallaPantalon,
        tallaZapato: datosFormulario.tallaZapato
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('¡Formulario completado exitosamente!');
      // Redirigir a página de confirmación
      window.location.href = `/candidato/${token}/confirmacion`;
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error al completar formulario:', error);
  }
}
```

---

### Opción B: Registro Completo (Todo en una petición)

Si prefieres que el candidato llene **todo de una vez** (datos básicos + formulario completo):

```
┌──────────────────────────┐
│ Candidato llena          │
│ formulario COMPLETO:     │
│ - Datos básicos          │
│ - Datos de formulario    │
└────────┬─────────────────┘
         │
         ▼
POST /api/publico/registro-completo
         │
         ▼
┌──────────────────────────────────┐
│ API crea candidato + formulario  │
│ - Token único                    │
│ - Email automático               │
│ - Estado: FORMULARIO_COMPLETO    │
└──────────────────────────────────┘
```

**Request:**
```javascript
POST /api/publico/registro-completo
Content-Type: application/json

{
  "nombreCompleto": "Pedro Ramírez",
  "email": "pedro.ramirez@email.com",
  "telefono": "3201234567",
  "estadoCivil": "Casado",
  "genero": "Masculino",
  "edadIngreso": 32,
  "municipio": "Bello",
  "comuna": "Centro",
  "barrio": "Parque",
  "direccion": "Carrera 50 # 30-20",
  "estrato": 3,
  "tieneHijo": true,
  "edadesHijos": [5, 8, 10],
  "tallaCamisa": "L",
  "tallaPantalon": "32",
  "tallaZapato": "42"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Registro completado exitosamente. Tu información ha sido guardada.",
  "data": {
    "canId": 51,
    "requerimientoId": null,
    "cedulaCiudadania": null,
    "nombreCompleto": "Pedro Ramírez",
    "email": "pedro.ramirez@email.com",
    "telefono": "3201234567",
    "token": "x9y8z7w6v5u4t3s2r1q0p9o8n7m6l5k4",
    "estado": {
      "estId": 15,
      "estCodigo": "CAND_FORMULARIO_COMPLETO",
      "estDescripcion": "Formulario Completo",
      "estActivo": true
    },
    "linkEnviado": true,
    "fechaEnvioLink": "2025-11-06T15:00:00Z",
    "formularioCompletado": true,
    "fechaCompletado": "2025-11-06T15:00:00Z",
    "formulario": {
      "forId": 26,
      "candidatoId": 51,
      "estadoCivil": "Casado",
      "genero": "Masculino",
      "edadIngreso": 32,
      "municipio": "Bello",
      "comuna": "Centro",
      "barrio": "Parque",
      "direccion": "Carrera 50 # 30-20",
      "estrato": 3,
      "tieneHijo": true,
      "cantidadHijo": 3,
      "edadesHijos": [5, 8, 10],
      "tallaCamisa": "L",
      "tallaPantalon": "32",
      "tallaZapato": "42"
    },
    "documentos": []
  }
}
```

**Código Frontend (React ejemplo):**
```javascript
async function registroCompleto(datos) {
  try {
    const response = await fetch('https://tu-api.com/api/publico/registro-completo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombreCompleto: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        estadoCivil: datos.estadoCivil,
        genero: datos.genero,
        edadIngreso: parseInt(datos.edad),
        municipio: datos.municipio,
        comuna: datos.comuna,
        barrio: datos.barrio,
        direccion: datos.direccion,
        estrato: parseInt(datos.estrato),
        tieneHijo: datos.tieneHijos,
        edadesHijos: datos.tieneHijos ? datos.edadesHijos : [],
        tallaCamisa: datos.tallaCamisa,
        tallaPantalon: datos.tallaPantalon,
        tallaZapato: datos.tallaZapato
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const token = result.data.token;
      localStorage.setItem('candidatoToken', token);
      
      alert('¡Registro completado! Revisa tu email para acceder con tu token.');
      
      // Redirigir a confirmación
      window.location.href = `/candidato/${token}/confirmacion`;
    }
  } catch (error) {
    console.error('Error en registro completo:', error);
  }
}
```

---

## Flujo 2: Proceso de Selección (Psicólogo → Candidato)

Este es el flujo formal de selección donde un **psicólogo** gestiona todo el proceso.

```
┌─────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO                       │
└─────────────────────────────────────────────────────────┘

1️⃣ PSICÓLOGO: Crear Requerimiento
   POST /api/requerimientos
   ↓
   Estado: CREADO

2️⃣ PSICÓLOGO: Agregar Candidatos al Requerimiento
   POST /api/candidatos (por cada candidato)
   ↓
   - Se genera token único por candidato
   - Se envía email automático con el token
   - Estado candidato: CAND_REGISTRADO

3️⃣ CANDIDATO: Recibe email con link
   yourapp.com/candidato/{token}
   ↓
   - Frontend consulta: GET /api/publico/candidato/{token}
   - Muestra saludo: "Hola Juan Pérez"
   - Muestra formulario para completar

4️⃣ CANDIDATO: Completa formulario
   POST /api/publico/candidato/{token}/formulario
   ↓
   - Estado candidato: CAND_FORMULARIO_COMPLETO
   - Estado requerimiento: FORMULARIO_COMPLETO

5️⃣ PSICÓLOGO: Asigna Pruebas Psicotécnicas (opcional)
   POST /api/asignaciones-pruebas
   ↓
   Estado candidato: CAND_EN_EVALUACION

6️⃣ CANDIDATO: Realiza Pruebas
   - GET /api/publico/candidato/{token}/pruebas
   - POST /api/publico/candidato/{token}/pruebas/{id}/iniciar
   - POST /api/publico/candidato/{token}/pruebas/{id}/responder
   - POST /api/publico/candidato/{token}/pruebas/{id}/finalizar

7️⃣ PSICÓLOGO: Registra Resultado Final
   PATCH /api/candidatos/{id}/resultado
   ↓
   Estado candidato: CAND_APROBADO o CAND_RECHAZADO
   Estado requerimiento: RESULTADO_REGISTRADO
```

### Paso 1: Psicólogo Crea Requerimiento

**Request:**
```javascript
POST /api/requerimientos
Content-Type: application/json
Authorization: Bearer {jwt_token} // Futuro: cuando se implemente auth

{
  "psicologoDocumento": "987654321",
  "psicologoNombre": "Dra. Ana López",
  "psicologoEmail": "ana.lopez@empresa.com",
  "perfilBasico": "Operario de producción",
  "rolObjetivo": "Operario",
  "areaObjetivo": "Producción"
}
```

**Response (201 Created):**
```json
{
  "reqId": 10,
  "psicologoDocumento": "987654321",
  "psicologoNombre": "Dra. Ana López",
  "psicologoEmail": "ana.lopez@empresa.com",
  "perfilBasico": "Operario de producción",
  "rolObjetivo": "Operario",
  "areaObjetivo": "Producción",
  "estado": {
    "estId": 1,
    "estCodigo": "CREADO",
    "estDescripcion": "Creado",
    "estActivo": true
  },
  "fechaCreacion": "2025-11-06T09:00:00Z",
  "candidatos": []
}
```

### Paso 2: Psicólogo Agrega Candidatos

**Request:**
```javascript
POST /api/candidatos
Content-Type: application/json

{
  "requerimientoId": 10,
  "cedulaCiudadania": "1122334455",
  "nombreCompleto": "Carlos Martínez",
  "email": "carlos.martinez@email.com",
  "telefono": "3101234567"
}
```

**Response (201 Created):**
```json
{
  "canId": 60,
  "requerimientoId": 10,
  "cedulaCiudadania": "1122334455",
  "nombreCompleto": "Carlos Martínez",
  "email": "carlos.martinez@email.com",
  "telefono": "3101234567",
  "token": "abc123def456ghi789jkl012mno345pq",
  "estado": {
    "estId": 14,
    "estCodigo": "CAND_REGISTRADO",
    "estDescripcion": "Candidato Registrado",
    "estActivo": true
  },
  "linkEnviado": true,
  "fechaEnvioLink": "2025-11-06T09:15:00Z",
  "formularioCompletado": false,
  "fechaCreacion": "2025-11-06T09:15:00Z",
  "formulario": null,
  "documentos": []
}
```

**📧 Email enviado automáticamente al candidato:**
```
De: sistema@empresa.com
Para: carlos.martinez@email.com
Asunto: Bienvenido al proceso de selección

Hola Carlos Martínez,

Te damos la bienvenida al proceso de selección de nuestra empresa.

Para completar tu información, ingresa al siguiente enlace:
https://empresa.com/candidato/abc123def456ghi789jkl012mno345pq

Tu token de acceso es: abc123def456ghi789jkl012mno345pq

Saludos,
Equipo de Recursos Humanos
```

### Paso 3: Candidato Accede con su Token

El candidato hace clic en el link del email y el frontend:

**1. Extrae el token de la URL:**
```javascript
// URL: https://empresa.com/candidato/abc123def456ghi789jkl012mno345pq
const token = window.location.pathname.split('/').pop();
```

**2. Consulta datos del candidato:**
```javascript
GET /api/publico/candidato/abc123def456ghi789jkl012mno345pq
```

**Response:**
```json
{
  "success": true,
  "data": {
    "canId": 60,
    "requerimientoId": 10,
    "cedulaCiudadania": "1122334455",
    "nombreCompleto": "Carlos Martínez",
    "email": "carlos.martinez@email.com",
    "telefono": "3101234567",
    "token": "abc123def456ghi789jkl012mno345pq",
    "estado": {
      "estId": 14,
      "estCodigo": "CAND_REGISTRADO",
      "estDescripcion": "Candidato Registrado",
      "estActivo": true
    },
    "linkEnviado": true,
    "fechaEnvioLink": "2025-11-06T09:15:00Z",
    "formularioCompletado": false,
    "fechaCompletado": null,
    "formulario": null,
    "documentos": []
  }
}
```

**3. Muestra pantalla de bienvenida:**
```javascript
function PantallaCandidato({ token }) {
  const [candidato, setCandidato] = useState(null);
  
  useEffect(() => {
    async function cargarCandidato() {
      const response = await fetch(`/api/publico/candidato/${token}`);
      const data = await response.json();
      
      if (data.success) {
        setCandidato(data.data);
      }
    }
    
    cargarCandidato();
  }, [token]);
  
  if (!candidato) return <div>Cargando...</div>;
  
  return (
    <div>
      <h1>¡Hola {candidato.nombreCompleto}!</h1>
      <p>Bienvenido al proceso de selección.</p>
      <p><strong>Tu estado actual:</strong> {candidato.estado.estDescripcion}</p>
      
      {!candidato.formularioCompletado ? (
        <div>
          <p>Por favor completa el siguiente formulario:</p>
          <FormularioCandidato token={token} />
        </div>
      ) : (
        <div>
          <p>✅ Tu formulario ya está completo.</p>
          <button onClick={() => verResumen()}>Ver mi información</button>
        </div>
      )}
    </div>
  );
}
```

### Paso 4: Candidato Completa Formulario

(Igual que en Flujo 1 - Paso 2)

```javascript
POST /api/publico/candidato/{token}/formulario
```

Después de completar el formulario, el estado cambia automáticamente a `CAND_FORMULARIO_COMPLETO`.

### Paso 5: Psicólogo Asigna Pruebas (Opcional)

```javascript
POST /api/asignaciones-pruebas
Content-Type: application/json

{
  "candidatoId": 60,
  "pruebaId": 3,
  "fechaLimite": "2025-11-10T23:59:59Z",
  "intentosPermitidos": 2
}
```

El candidato verá las pruebas asignadas:

```javascript
GET /api/publico/candidato/{token}/pruebas
```

### Paso 6: Psicólogo Registra Resultado

**Candidato APROBADO:**
```javascript
PATCH /api/candidatos/60/resultado
Content-Type: application/json

{
  "resultadoSeleccion": true
}
```

**Candidato RECHAZADO:**
```javascript
PATCH /api/candidatos/60/resultado
Content-Type: application/json

{
  "resultadoSeleccion": false,
  "motivoRechazo": "No cumple con experiencia mínima requerida"
}
```

**Response:**
```json
{
  "canId": 60,
  "nombreCompleto": "Carlos Martínez",
  "estado": {
    "estId": 17,
    "estCodigo": "CAND_APROBADO",
    "estDescripcion": "Aprobado",
    "estActivo": true
  },
  "resultadoSeleccion": true,
  "motivoRechazo": null,
  "fechaResultado": "2025-11-06T16:30:00Z",
  "usuarioResultado": "SYSTEM"
}
```

---

## Estados del Candidato

| Código | Descripción | Cuándo se asigna |
|--------|-------------|------------------|
| `CAND_REGISTRADO` | Candidato Registrado | Al crear el candidato (registro inicial) |
| `CAND_FORMULARIO_COMPLETO` | Formulario Completo | Al completar el formulario |
| `CAND_EN_EVALUACION` | En Evaluación | Al asignar pruebas psicotécnicas |
| `CAND_APROBADO` | Aprobado | Al registrar resultado positivo |
| `CAND_RECHAZADO` | Rechazado | Al registrar resultado negativo |

### Lógica de Renderizado según Estado

```javascript
function ComponenteSegunEstado({ candidato }) {
  switch (candidato.estado.estCodigo) {
    case 'CAND_REGISTRADO':
      return <FormularioPendiente />;
    
    case 'CAND_FORMULARIO_COMPLETO':
      return <EsperandoEvaluacion />;
    
    case 'CAND_EN_EVALUACION':
      return <ListaPruebas candidatoToken={candidato.token} />;
    
    case 'CAND_APROBADO':
      return <MensajeAprobado />;
    
    case 'CAND_RECHAZADO':
      return <MensajeRechazado motivo={candidato.motivoRechazo} />;
    
    default:
      return <div>Estado desconocido</div>;
  }
}
```

---

## Ejemplos de Código Frontend

### React: Hook Personalizado para Candidato

```javascript
import { useState, useEffect } from 'react';

function useCandidato(token) {
  const [candidato, setCandidato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchCandidato() {
      try {
        setLoading(true);
        const response = await fetch(`/api/publico/candidato/${token}`);
        const data = await response.json();
        
        if (data.success) {
          setCandidato(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Error al cargar datos del candidato');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (token) {
      fetchCandidato();
    }
  }, [token]);
  
  return { candidato, loading, error };
}

// Uso:
function PaginaCandidato() {
  const { token } = useParams();
  const { candidato, loading, error } = useCandidato(token);
  
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!candidato) return <div>Candidato no encontrado</div>;
  
  return (
    <div>
      <h1>Hola {candidato.nombreCompleto}</h1>
      <p>Estado: {candidato.estado.estDescripcion}</p>
      {/* Resto del componente */}
    </div>
  );
}
```

### Vue.js: Composable para Candidato

```javascript
import { ref, onMounted } from 'vue';

export function useCandidato(token) {
  const candidato = ref(null);
  const loading = ref(true);
  const error = ref(null);
  
  async function cargarCandidato() {
    try {
      loading.value = true;
      const response = await fetch(`/api/publico/candidato/${token}`);
      const data = await response.json();
      
      if (data.success) {
        candidato.value = data.data;
      } else {
        error.value = data.message;
      }
    } catch (err) {
      error.value = 'Error al cargar candidato';
      console.error(err);
    } finally {
      loading.value = false;
    }
  }
  
  onMounted(() => {
    if (token) {
      cargarCandidato();
    }
  });
  
  return { candidato, loading, error };
}

// Uso en componente:
<script setup>
import { useCandidato } from '@/composables/useCandidato';
import { useRoute } from 'vue-router';

const route = useRoute();
const token = route.params.token;
const { candidato, loading, error } = useCandidato(token);
</script>

<template>
  <div v-if="loading">Cargando...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="candidato">
    <h1>Hola {{ candidato.nombreCompleto }}</h1>
    <p>Estado: {{ candidato.estado.estDescripcion }}</p>
  </div>
</template>
```

### Angular: Servicio de Candidato

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface CandidatoDto {
  canId: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  token: string;
  estado: EstadoDto;
  formularioCompletado: boolean;
  // ... más propiedades
}

export interface EstadoDto {
  estId: number;
  estCodigo: string;
  estDescripcion: string;
  estActivo: boolean;
}

@Injectable({ providedIn: 'root' })
export class CandidatoService {
  private baseUrl = 'https://tu-api.com/api';
  
  constructor(private http: HttpClient) {}
  
  obtenerPorToken(token: string): Observable<CandidatoDto | null> {
    return this.http.get<ApiResponse<CandidatoDto>>(
      `${this.baseUrl}/publico/candidato/${token}`
    ).pipe(
      map(response => response.success ? response.data! : null)
    );
  }
  
  completarFormulario(token: string, datos: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/publico/candidato/${token}/formulario`,
      datos
    );
  }
  
  registroSimple(datos: any): Observable<CandidatoDto | null> {
    return this.http.post<ApiResponse<CandidatoDto>>(
      `${this.baseUrl}/publico/registro`,
      datos
    ).pipe(
      map(response => response.success ? response.data! : null)
    );
  }
  
  registroCompleto(datos: any): Observable<CandidatoDto | null> {
    return this.http.post<ApiResponse<CandidatoDto>>(
      `${this.baseUrl}/publico/registro-completo`,
      datos
    ).pipe(
      map(response => response.success ? response.data! : null)
    );
  }
}

// Uso en componente:
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidatoService, CandidatoDto } from './candidato.service';

@Component({
  selector: 'app-candidato',
  template: `
    <div *ngIf="loading">Cargando...</div>
    <div *ngIf="candidato">
      <h1>Hola {{ candidato.nombreCompleto }}</h1>
      <p>Estado: {{ candidato.estado.estDescripcion }}</p>
    </div>
  `
})
export class CandidatoComponent implements OnInit {
  token: string = '';
  candidato: CandidatoDto | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private candidatoService: CandidatoService
  ) {}
  
  ngOnInit() {
    this.token = this.route.snapshot.params['token'];
    
    this.candidatoService.obtenerPorToken(this.token).subscribe({
      next: (data) => {
        this.candidato = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar candidato:', err);
        this.loading = false;
      }
    });
  }
}
```

---

## DTOs Completos

### CandidatoDto (Respuesta completa)

```typescript
interface CandidatoDto {
  canId: number;
  requerimientoId: number | null;
  cedulaCiudadania: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  token: string | null;
  
  estado: EstadoDto | null;
  
  linkEnviado: boolean;
  fechaEnvioLink: string | null; // ISO 8601
  
  formularioCompletado: boolean;
  fechaCompletado: string | null; // ISO 8601
  
  resultadoSeleccion: boolean | null; // null=pendiente, true=aprobado, false=rechazado
  motivoRechazo: string | null;
  fechaResultado: string | null; // ISO 8601
  usuarioResultado: string | null;
  
  fechaCreacion: string; // ISO 8601
  
  formulario: FormularioCandidatoDto | null;
  documentos: DocumentoCandidatoDto[];
}
```

### EstadoDto

```typescript
interface EstadoDto {
  estId: number;
  estCodigo: string;
  estDescripcion: string;
  estActivo: boolean;
}
```

### FormularioCandidatoDto (Respuesta)

```typescript
interface FormularioCandidatoDto {
  forId: number;
  candidatoId: number;
  estadoCivil: string | null;
  genero: string | null;
  edadIngreso: number | null; // 1-99
  municipio: string | null;
  comuna: string | null;
  barrio: string | null;
  direccion: string | null;
  estrato: number | null; // 1-6
  tieneHijo: boolean;
  cantidadHijo: number | null;
  edadesHijos: number[]; // Ejemplo: [3, 5, 8]
  tallaCamisa: string | null; // Ejemplo: "M", "L", "XL"
  tallaPantalon: string | null; // Ejemplo: "32", "34"
  tallaZapato: string | null; // Ejemplo: "38", "42"
}
```

### CrearFormularioCandidatoDto (Request)

```typescript
interface CrearFormularioCandidatoDto {
  estadoCivil?: string;
  genero?: string;
  edadIngreso?: number; // 1-99
  municipio?: string;
  comuna?: string;
  barrio?: string;
  direccion?: string;
  estrato?: number; // 1-6
  tieneHijo: boolean;
  edadesHijos: number[]; // Si tieneHijo=false, debe ser []
  tallaCamisa?: string;
  tallaPantalon?: string;
  tallaZapato?: string;
}
```

### FormularioPublicoDto (Registro Completo)

```typescript
interface FormularioPublicoDto {
  // Datos del candidato
  nombreCompleto: string;
  email: string;
  telefono: string;
  
  // Datos del formulario
  estadoCivil?: string;
  genero?: string;
  edadIngreso?: number;
  municipio?: string;
  comuna?: string;
  barrio?: string;
  direccion?: string;
  estrato?: number;
  tieneHijo: boolean;
  edadesHijos: number[];
  tallaCamisa?: string;
  tallaPantalon?: string;
  tallaZapato?: string;
}
```

---

## Manejo de Errores

### Códigos de Estado HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| `200 OK` | Éxito | Operación exitosa |
| `201 Created` | Creado | Candidato/formulario creado |
| `204 No Content` | Sin contenido | Eliminación exitosa |
| `400 Bad Request` | Petición inválida | Validación falla, datos incorrectos |
| `404 Not Found` | No encontrado | Token inválido, candidato no existe |
| `500 Internal Server Error` | Error del servidor | Error inesperado |

### Estructura de Respuestas de Error

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error",
  "error": "Detalles técnicos del error (solo en desarrollo)"
}
```

### Ejemplos de Errores Comunes

#### Token Inválido

**Request:**
```
GET /api/publico/candidato/token-invalido-12345
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No se encontró ningún candidato con ese token"
}
```

#### Cédula Duplicada

**Request:**
```javascript
POST /api/publico/registro
{
  "cedulaCiudadania": "1234567890", // Ya existe
  "nombreCompleto": "Test",
  "email": "test@email.com",
  "telefono": "3001112233"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "La cédula ya está registrada"
}
```

#### Formulario Incompleto (sin hijos especificados)

**Request:**
```javascript
POST /api/publico/candidato/{token}/formulario
{
  "tieneHijo": true,
  "edadesHijos": [] // ❌ Error: debe tener al menos un hijo
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Si tiene hijos, debe especificar al menos una edad"
}
```

#### Resultado Sin Motivo de Rechazo

**Request:**
```javascript
PATCH /api/candidatos/60/resultado
{
  "resultadoSeleccion": false
  // ❌ Falta "motivoRechazo"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "El motivo de rechazo es obligatorio cuando el resultado es negativo"
}
```

### Manejo de Errores en Frontend

```javascript
async function handleApiCall(apiFunction) {
  try {
    const response = await apiFunction();
    const data = await response.json();
    
    if (!data.success) {
      // Mostrar mensaje de error al usuario
      alert(data.message);
      return null;
    }
    
    return data.data;
  } catch (error) {
    console.error('Error en llamada a API:', error);
    alert('Error de conexión. Por favor intenta de nuevo.');
    return null;
  }
}

// Uso:
const candidato = await handleApiCall(() => 
  fetch(`/api/publico/candidato/${token}`)
);

if (candidato) {
  // Procesar datos
}
```

---

## Casos de Uso Completos

### Caso 1: Candidato Público Registra y Completa Formulario

```javascript
// PASO 1: Registro simple
async function registrarCandidato(formData) {
  const response = await fetch('/api/publico/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cedulaCiudadania: formData.cedula,
      nombreCompleto: formData.nombre,
      email: formData.email,
      telefono: formData.telefono
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    const token = result.data.token;
    
    // Guardar token
    localStorage.setItem('miToken', token);
    
    // Redirigir a formulario
    window.location.href = `/formulario?token=${token}`;
  }
}

// PASO 2: Completar formulario
async function completarFormulario(formData) {
  const token = localStorage.getItem('miToken');
  
  const response = await fetch(`/api/publico/candidato/${token}/formulario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      estadoCivil: formData.estadoCivil,
      genero: formData.genero,
      edadIngreso: parseInt(formData.edad),
      municipio: formData.municipio,
      comuna: formData.comuna,
      barrio: formData.barrio,
      direccion: formData.direccion,
      estrato: parseInt(formData.estrato),
      tieneHijo: formData.tieneHijos === 'si',
      edadesHijos: formData.tieneHijos === 'si' ? formData.edades : [],
      tallaCamisa: formData.tallaCamisa,
      tallaPantalon: formData.tallaPantalon,
      tallaZapato: formData.tallaZapato
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    alert('¡Formulario completado exitosamente!');
    window.location.href = `/confirmacion?token=${token}`;
  }
}
```

### Caso 2: Candidato Accede por Email y Ve su Estado

```javascript
// URL del email: https://empresa.com/candidato/abc123...

// El frontend extrae el token:
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || window.location.pathname.split('/').pop();

// Cargar datos del candidato
async function cargarDashboard() {
  const response = await fetch(`/api/publico/candidato/${token}`);
  const result = await response.json();
  
  if (result.success) {
    const candidato = result.data;
    
    // Mostrar información personalizada
    document.getElementById('nombre').textContent = candidato.nombreCompleto;
    document.getElementById('estado').textContent = candidato.estado.estDescripcion;
    
    // Mostrar sección según estado
    switch (candidato.estado.estCodigo) {
      case 'CAND_REGISTRADO':
        document.getElementById('seccion-formulario').style.display = 'block';
        break;
      
      case 'CAND_FORMULARIO_COMPLETO':
        document.getElementById('seccion-espera').style.display = 'block';
        break;
      
      case 'CAND_EN_EVALUACION':
        cargarPruebas(token);
        break;
      
      case 'CAND_APROBADO':
        document.getElementById('seccion-aprobado').style.display = 'block';
        break;
      
      case 'CAND_RECHAZADO':
        document.getElementById('seccion-rechazado').style.display = 'block';
        document.getElementById('motivo').textContent = candidato.motivoRechazo;
        break;
    }
  }
}

async function cargarPruebas(token) {
  const response = await fetch(`/api/publico/candidato/${token}/pruebas`);
  const result = await response.json();
  
  if (result.success) {
    const pruebas = result.data;
    // Renderizar lista de pruebas...
  }
}
```

### Caso 3: Psicólogo Gestiona Requerimiento Completo

```javascript
// PASO 1: Crear requerimiento
async function crearRequerimiento(datos) {
  const response = await fetch('/api/requerimientos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify({
      psicologoDocumento: datos.documento,
      psicologoNombre: datos.nombre,
      psicologoEmail: datos.email,
      perfilBasico: datos.perfil,
      rolObjetivo: datos.rol,
      areaObjetivo: datos.area
    })
  });
  
  const result = await response.json();
  const requerimientoId = result.reqId;
  
  return requerimientoId;
}

// PASO 2: Agregar candidatos
async function agregarCandidato(requerimientoId, datosCandidato) {
  const response = await fetch('/api/candidatos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify({
      requerimientoId: requerimientoId,
      cedulaCiudadania: datosCandidato.cedula,
      nombreCompleto: datosCandidato.nombre,
      email: datosCandidato.email,
      telefono: datosCandidato.telefono
    })
  });
  
  const result = await response.json();
  
  // El candidato recibe email automático con su token
  console.log('Candidato creado con token:', result.token);
}

// PASO 3: Ver candidatos del requerimiento
async function verCandidatos(requerimientoId) {
  const response = await fetch(`/api/candidatos/requerimiento/${requerimientoId}`, {
    headers: { 'Authorization': `Bearer ${getJwtToken()}` }
  });
  
  const candidatos = await response.json();
  
  // Mostrar en tabla
  candidatos.forEach(c => {
    console.log(`
      ${c.nombreCompleto}
      Estado: ${c.estado.estDescripcion}
      Formulario: ${c.formularioCompletado ? 'Completo' : 'Pendiente'}
    `);
  });
}

// PASO 4: Registrar resultado
async function registrarResultado(candidatoId, aprobado, motivo = null) {
  const response = await fetch(`/api/candidatos/${candidatoId}/resultado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getJwtToken()}`
    },
    body: JSON.stringify({
      resultadoSeleccion: aprobado,
      motivoRechazo: motivo
    })
  });
  
  const result = await response.json();
  
  if (result.canId) {
    alert(`Resultado registrado: ${aprobado ? 'APROBADO' : 'RECHAZADO'}`);
  }
}
```

---

## Validaciones del Backend

El backend valida automáticamente los siguientes campos:

### Validaciones de Candidato

- **Cédula**: Obligatoria, máx 20 caracteres, solo números, única en BD
- **Nombre**: Obligatorio, máx 200 caracteres
- **Email**: Obligatorio, formato válido, máx 150 caracteres
- **Teléfono**: Obligatorio, máx 50 caracteres, formato `^[0-9+\-\s()]+$`

### Validaciones de Formulario

- **EdadIngreso**: 1-99
- **Estrato**: 1-6
- **TieneHijo**: Si es `true`, `EdadesHijos` no puede estar vacío
- **EdadesHijos**: Cada edad debe ser ≤ 50
- **Municipio**: Máx 100 caracteres
- **Comuna**: Máx 100 caracteres
- **Barrio**: Máx 150 caracteres
- **Dirección**: Máx 200 caracteres

### Validaciones de Resultado

- Si `ResultadoSeleccion = false` (rechazado), **MotivoRechazo** es obligatorio
- Si `ResultadoSeleccion = true` (aprobado), **NO** debe enviarse MotivoRechazo

---

## Notas Importantes

### 🔒 Seguridad

- El token es público pero **único y difícil de adivinar** (32 caracteres aleatorios)
- En el futuro, se implementará autenticación JWT para endpoints administrativos
- El token **no expira** (a menos que se desactive el candidato)

### 📧 Envío de Emails

- Los emails se envían **automáticamente** al crear un candidato
- Si el envío falla, el candidato se crea igualmente (se registra en logs)
- El psicólogo puede re-enviar el link manualmente si es necesario

### 🔄 Actualización de Formulario

- El candidato **puede actualizar** su formulario múltiples veces
- Cada actualización sobrescribe los datos anteriores
- La fecha de última modificación se guarda automáticamente

### 📊 Estados Automáticos

- Los estados cambian **automáticamente** según las acciones
- No es necesario actualizar estados manualmente
- Excepto `CAND_EN_EVALUACION`, que se asigna al asignar pruebas

---

## Soporte y Contacto

Para dudas sobre la integración:

- **Email técnico**: dev@empresa.com
- **Documentación Swagger**: `https://tu-api.com/swagger`
- **Repositorio**: [Link al repo]

---

**Última actualización:** 2025-11-06  
**Versión del documento:** 1.0  
**Autor:** Equipo de Desarrollo - Sistema de Selección
