# Guía de Integración Frontend - API Selección

**Versión:** 2.0 - Actualizada con refactorización de estados y módulo de pruebas psicotécnicas  
**Fecha:** 2025-11-06

---

## 📋 Resumen Ejecutivo

- **Base URL desarrollo**: `http://localhost:5208`
- **Prefijo API**: `/api`
- **Autenticación**: JWT (en desarrollo, actualmente sin auth)
- **Formato respuesta**: JSON
- **Charset**: UTF-8

### 🎯 Flujo Principal de Selección

1. **Psicólogo crea Requerimiento** → Estado "CREADO"
2. **Psicólogo agrega Candidatos al requerimiento** → Se envía email automático con token
3. **Candidato completa formulario público** (por token) → Estado "FORMULARIO_COMPLETO"
4. **Psicólogo asigna prueba psicotécnica** → **AQUÍ selecciona Tipo de Normativa**
5. **Candidato realiza prueba** → Sistema calcula resultado con normativa asignada
6. **Psicólogo registra resultado final** → Estado "APROBADO" o "RECHAZADO"

### ⚠️ Regla Clave: Tipo de Normativa

**El tipo de normativa NO se asigna al requerimiento, se asigna al asignar la prueba al candidato.**

**Razón:** Un requerimiento puede tener candidatos de diferentes géneros y perfiles:
- Mismo requerimiento puede tener hombres y mujeres
- Mismo requerimiento puede tener auxiliares y profesionales
- La normativa CMT depende del **candidato individual**, no del requerimiento

**Tipos de Normativa CMT:**
- Auxiliares de oficina, administrativos, almacenista, auxiliar contable
- Profesionales en general
- Hombres en general
- Mujeres en general

---

## 🎯 Conceptos Clave

### Roles
- **Admin/Psicólogo**: Crea requerimientos, candidatos, asigna pruebas, registra resultados
- **Candidato público**: Accede por token, completa formulario, realiza pruebas

### Estados del Sistema
Tabla `SEL_ESTADO` con dos campos:
- `estCodigo`: Identificador de negocio ("CREADO", "FORMULARIO_COMPLETO", "APROBADO", "RECHAZADO")
- `estDescripcion`: Texto para UI ("Requerimiento creado", "Formulario completado")

### Token de Candidato
- GUID de 32 caracteres sin guiones
- Generado automáticamente al crear candidato
- Usado para acceso público al formulario

### Tipo de Normativa (Pruebas CMT)
- **NO se asigna al requerimiento** (un requerimiento puede tener candidatos de ambos sexos)
- **SE ASIGNA al asignar la prueba al candidato** según su perfil y género
- Tipos disponibles:
  - Auxiliares de oficina, administrativos, almacenista, auxiliar contable
  - Profesionales en general
  - Hombres en general
  - Mujeres en general

---

## 🎨 Flujos de UI Recomendados

### Crear Requerimiento

**Formulario debe incluir:**
```
┌─────────────────────────────────────────┐
│  Crear Nuevo Requerimiento              │
├─────────────────────────────────────────┤
│  Psicólogo:                             │
│  ├─ Documento: [____________] *         │
│  ├─ Nombre: [___________________] *     │
│  └─ Email: [____________________] *     │
│                                         │
│  Posición:                              │
│  ├─ Perfil básico: [______________] *   │
│  ├─ Rol objetivo: [_______________] *   │
│  └─ Área objetivo: [______________]     │
│                                         │
│  [Cancelar]  [Crear Requerimiento]     │
└─────────────────────────────────────────┘
```

**Comportamiento:**
1. Usuario completa formulario
2. Frontend valida campos requeridos
3. POST `/api/requerimientos`
4. Backend crea con estado "CREADO"
5. Redirigir a vista de detalle del requerimiento

### Crear Candidato y Asignar a Requerimiento

**Vista de detalle del requerimiento debe mostrar:**
```
┌────────────────────────────────────────────────┐
│  Requerimiento #1 - Desarrollador Senior       │
│  Estado: CREADO                                │
├────────────────────────────────────────────────┤
│  Psicólogo: María Perez                        │
│  Email: maria@super.com.co                     │
│                                                │
│  [+ Agregar Candidato]                         │
│                                                │
│  Candidatos (5):                               │
│  ┌──────────────────────────────────────────┐ │
│  │ Pedro Martínez - 1234567890              │ │
│  │ pedro@ejemplo.com | 3001112233           │ │
│  │ Formulario: ✓ | Resultado: APROBADO     │ │
│  │ [Ver] [Asignar Prueba] [Resultado]      │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Modal "Agregar Candidato":**
```
┌─────────────────────────────────────────┐
│  Agregar Candidato al Requerimiento     │
├─────────────────────────────────────────┤
│  Datos personales:                      │
│  ├─ Cédula: [____________] *            │
│  ├─ Nombre: [___________________] *     │
│  ├─ Email: [____________________] *     │
│  └─ Teléfono: [_________________] *     │
│                                         │
│  ℹ️  Al crear el candidato se enviará   │
│     automáticamente un email con el     │
│     link de acceso al formulario.       │
│                                         │
│  [Cancelar]  [Crear y Enviar Email]    │
└─────────────────────────────────────────┘
```

**Comportamiento:**
1. Usuario completa datos del candidato
2. Frontend valida:
   - Cédula: solo números, max 20
   - Email: formato válido
   - Teléfono: formato `^[0-9+\-\s()]+$`
3. POST `/api/candidatos` con `requerimientoId`
4. **Backend automáticamente:**
   - Genera token
   - Envía email al candidato
5. Frontend muestra confirmación:
   ```
   ✓ Candidato creado exitosamente
   ✓ Email enviado a pedro@ejemplo.com
   ```
6. Actualiza lista de candidatos

### Asignar Prueba Psicotécnica a Candidato

**⚠️ IMPORTANTE: El tipo de normativa se selecciona AQUÍ, no en el requerimiento**

**Flujo recomendado:**
```
┌─────────────────────────────────────────────┐
│  Asignar Prueba Psicotécnica                │
│  Candidato: Pedro Martínez (M, 28 años)     │
├─────────────────────────────────────────────┤
│  1. Seleccionar Prueba:                     │
│     ○ CMT - Cuestionario de Motivación      │
│       Versión: v1.0 (activa)                │
│     ○ Otra prueba disponible                │
│                                             │
│  2. Tipo de Normativa: *                    │
│     (Según perfil y género del candidato)   │
│     ┌───────────────────────────────────┐   │
│     │ ○ Auxiliares (oficina, admins)    │   │
│     │ ● Profesionales en general        │   │
│     │ ○ Hombres en general              │   │
│     │ ○ Mujeres en general              │   │
│     └───────────────────────────────────┘   │
│                                             │
│  3. Fecha límite (opcional):                │
│     [____/__/____]  [__:__]                 │
│                                             │
│  ℹ️  El tipo de normativa determina con     │
│     qué tabla de baremos se calificará      │
│     la prueba. Seleccione según el perfil   │
│     del candidato (rol + género).           │
│                                             │
│  [Cancelar]  [Asignar Prueba]              │
└─────────────────────────────────────────────┘
```

**Comportamiento:**
1. Frontend consulta candidato para obtener género y perfil
2. Muestra pruebas publicadas disponibles
3. **Usuario selecciona tipo de normativa** según:
   - **Auxiliares**: roles operativos (oficina, admin, almacén, contabilidad auxiliar)
   - **Profesionales**: roles técnicos/profesionales
   - **Hombres/Mujeres**: normativa específica por género
4. POST `/api/asignaciones`:
   ```json
   {
     "candidatoId": 15,
     "publicacionPruebaId": 1,
     "tipoNormativaId": 2,  // ← NORMATIVA ESPECÍFICA
     "fechaLimite": "2025-11-20T23:59:59Z"
   }
   ```
5. Backend guarda asignación con normativa
6. Frontend muestra confirmación

**¿Por qué NO en el requerimiento?**
- Un requerimiento puede tener candidatos de ambos sexos
- Candidatos del mismo requerimiento pueden tener diferentes roles (auxiliar vs profesional)
- La normativa debe ser específica por candidato individual

---

## 📧 Envío de Emails (IMPORTANTE)

### ✅ El backend envía emails automáticamente

Cuando se crea un candidato mediante `POST /api/candidatos`, **el backend envía automáticamente un email** al candidato con:
- Link de acceso: `{App:BaseUrl}/registro/{token}`
- Instrucciones para completar formulario
- Token de acceso

**El frontend NO debe enviar emails**. Solo debe:
1. Crear el candidato
2. Mostrar confirmación al admin
3. Confiar en que el email fue enviado

```javascript
// ✅ CORRECTO
const crearCandidato = async (datos) => {
  const candidato = await api.post('/candidatos', datos);
  toast.success(`Candidato creado. Email enviado a ${candidato.email}`);
  return candidato;
};

// ❌ INCORRECTO - No intentes enviar email desde el cliente
const crearCandidato = async (datos) => {
  const candidato = await api.post('/candidatos', datos);
  await enviarEmail(candidato.email); // ❌ NO HACER ESTO
  return candidato;
};
```

---

## � Ejemplos de Código React

### Hook para Tipos de Normativa

```javascript
// hooks/useTiposNormativa.js
import { useState, useEffect } from 'react';

export const useTiposNormativa = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const response = await fetch('http://localhost:5208/api/tiposnormativa');
        if (!response.ok) throw new Error('Error al cargar tipos de normativa');
        const data = await response.json();
        setTipos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return { tipos, loading, error };
};
```

### Componente: Modal Asignar Prueba con Normativa

```javascript
// components/AsignarPruebaModal.jsx
import React, { useState } from 'react';
import { useTiposNormativa } from '../hooks/useTiposNormativa';

const AsignarPruebaModal = ({ candidato, publicacionesPrueba, onAsignar, onCerrar }) => {
  const { tipos: tiposNormativa, loading: loadingTipos } = useTiposNormativa();
  const [formData, setFormData] = useState({
    publicacionPruebaId: '',
    tipoNormativaId: '',
    fechaLimite: ''
  });
  const [error, setError] = useState(null);

  const sugerirNormativa = () => {
    // Lógica para sugerir normativa según género y perfil
    if (!candidato.genero) return null;
    
    // Ejemplo: si es mujer, sugerir "Mujeres en general"
    if (candidato.genero === 'F') {
      return tiposNormativa.find(t => t.tipNombre.includes('Mujeres'));
    }
    // Si es hombre, sugerir "Hombres en general"
    if (candidato.genero === 'M') {
      return tiposNormativa.find(t => t.tipNombre.includes('Hombres'));
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.tipoNormativaId) {
      setError('Debe seleccionar un tipo de normativa');
      return;
    }

    try {
      const response = await fetch('http://localhost:5208/api/asignaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatoId: candidato.canId,
          publicacionPruebaId: parseInt(formData.publicacionPruebaId),
          tipoNormativaId: parseInt(formData.tipoNormativaId),
          fechaLimite: formData.fechaLimite || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al asignar prueba');
      }

      const asignacion = await response.json();
      onAsignar(asignacion);
    } catch (err) {
      setError(err.message);
    }
  };

  const sugerencia = sugerirNormativa();

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Asignar Prueba Psicotécnica</h2>
        <p className="candidato-info">
          Candidato: <strong>{candidato.nombreCompleto}</strong>
          {candidato.genero && ` (${candidato.genero === 'M' ? 'Masculino' : 'Femenino'})`}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Selección de Prueba */}
          <div className="form-group">
            <label>Prueba Publicada *</label>
            <select
              value={formData.publicacionPruebaId}
              onChange={(e) => setFormData({ ...formData, publicacionPruebaId: e.target.value })}
              required
            >
              <option value="">Seleccione una prueba...</option>
              {publicacionesPrueba.map(pub => (
                <option key={pub.pubId} value={pub.pubId}>
                  {pub.nombrePrueba} - {pub.codigoVersion}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Normativa */}
          <div className="form-group">
            <label>Tipo de Normativa * <InfoIcon tooltip="Seleccione según perfil y género del candidato" /></label>
            
            {sugerencia && (
              <div className="suggestion">
                ℹ️ Sugerencia: <strong>{sugerencia.tipNombre}</strong>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipoNormativaId: sugerencia.tipTipoNormativaId })}
                >
                  Usar esta
                </button>
              </div>
            )}

            {loadingTipos ? (
              <p>Cargando tipos de normativa...</p>
            ) : (
              <div className="radio-group">
                {tiposNormativa.map(tipo => (
                  <label key={tipo.tipTipoNormativaId} className="radio-option">
                    <input
                      type="radio"
                      name="tipoNormativa"
                      value={tipo.tipTipoNormativaId}
                      checked={formData.tipoNormativaId === tipo.tipTipoNormativaId.toString()}
                      onChange={(e) => setFormData({ ...formData, tipoNormativaId: e.target.value })}
                    />
                    <div>
                      <strong>{tipo.tipNombre}</strong>
                      <p className="description">{tipo.tipDescripcion}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Fecha Límite */}
          <div className="form-group">
            <label>Fecha Límite (opcional)</label>
            <input
              type="datetime-local"
              value={formData.fechaLimite}
              onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
            />
          </div>

          {/* Información importante */}
          <div className="info-box">
            <p>
              ⚠️ <strong>Importante:</strong> El tipo de normativa determina con qué tabla de baremos 
              se calificará la prueba. No puede modificarse después de la asignación.
            </p>
            <ul>
              <li><strong>Auxiliares:</strong> Personal operativo (oficina, admin, almacén, contable)</li>
              <li><strong>Profesionales:</strong> Personal técnico o universitario</li>
              <li><strong>Género específico:</strong> Normativa diferenciada por hombres/mujeres</li>
            </ul>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button type="button" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-primary">Asignar Prueba</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AsignarPruebaModal;
```

### Componente: Formulario Crear Requerimiento

```javascript
// components/CrearRequerimientoForm.jsx
import React, { useState } from 'react';

const CrearRequerimientoForm = ({ onCreado, onCancelar }) => {
  const [formData, setFormData] = useState({
    psicologoDocumento: '',
    psicologoNombre: '',
    psicologoEmail: '',
    perfilBasico: '',
    rolObjetivo: '',
    areaObjetivo: ''
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const validar = () => {
    const nuevosErrores = {};
    
    if (!formData.psicologoDocumento) {
      nuevosErrores.psicologoDocumento = 'El documento es requerido';
    }
    
    if (!formData.psicologoNombre) {
      nuevosErrores.psicologoNombre = 'El nombre es requerido';
    }
    
    if (!formData.psicologoEmail) {
      nuevosErrores.psicologoEmail = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.psicologoEmail)) {
      nuevosErrores.psicologoEmail = 'Email inválido';
    }
    
    if (!formData.perfilBasico) {
      nuevosErrores.perfilBasico = 'El perfil básico es requerido';
    }
    
    if (!formData.rolObjetivo) {
      nuevosErrores.rolObjetivo = 'El rol objetivo es requerido';
    }
    
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrores({});

    try {
      const response = await fetch('http://localhost:5208/api/requerimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear requerimiento');
      }

      const requerimiento = await response.json();
      onCreado(requerimiento);
    } catch (error) {
      setErrores({ general: error.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="crear-requerimiento-form">
      <h2>Crear Nuevo Requerimiento</h2>

      <fieldset>
        <legend>Datos del Psicólogo</legend>
        
        <div className="form-group">
          <label>Documento *</label>
          <input
            type="text"
            value={formData.psicologoDocumento}
            onChange={(e) => setFormData({ ...formData, psicologoDocumento: e.target.value })}
            className={errores.psicologoDocumento ? 'error' : ''}
          />
          {errores.psicologoDocumento && <span className="error-text">{errores.psicologoDocumento}</span>}
        </div>

        <div className="form-group">
          <label>Nombre Completo *</label>
          <input
            type="text"
            value={formData.psicologoNombre}
            onChange={(e) => setFormData({ ...formData, psicologoNombre: e.target.value })}
            className={errores.psicologoNombre ? 'error' : ''}
          />
          {errores.psicologoNombre && <span className="error-text">{errores.psicologoNombre}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.psicologoEmail}
            onChange={(e) => setFormData({ ...formData, psicologoEmail: e.target.value })}
            className={errores.psicologoEmail ? 'error' : ''}
          />
          {errores.psicologoEmail && <span className="error-text">{errores.psicologoEmail}</span>}
        </div>
      </fieldset>

      <fieldset>
        <legend>Datos de la Posición</legend>
        
        <div className="form-group">
          <label>Perfil Básico *</label>
          <textarea
            value={formData.perfilBasico}
            onChange={(e) => setFormData({ ...formData, perfilBasico: e.target.value })}
            className={errores.perfilBasico ? 'error' : ''}
            rows="3"
          />
          {errores.perfilBasico && <span className="error-text">{errores.perfilBasico}</span>}
        </div>

        <div className="form-group">
          <label>Rol Objetivo *</label>
          <input
            type="text"
            value={formData.rolObjetivo}
            onChange={(e) => setFormData({ ...formData, rolObjetivo: e.target.value })}
            className={errores.rolObjetivo ? 'error' : ''}
            placeholder="Ej: Desarrollador Senior, Auxiliar Contable"
          />
          {errores.rolObjetivo && <span className="error-text">{errores.rolObjetivo}</span>}
        </div>

        <div className="form-group">
          <label>Área Objetivo</label>
          <input
            type="text"
            value={formData.areaObjetivo}
            onChange={(e) => setFormData({ ...formData, areaObjetivo: e.target.value })}
            placeholder="Ej: Tecnología, Recursos Humanos"
          />
        </div>
      </fieldset>

      {errores.general && (
        <div className="error-message general">{errores.general}</div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Creando...' : 'Crear Requerimiento'}
        </button>
      </div>
    </form>
  );
};

export default CrearRequerimientoForm;
```

### Componente: Formulario Crear Candidato

```javascript
// components/CrearCandidatoForm.jsx
import React, { useState } from 'react';

const CrearCandidatoForm = ({ requerimientoId, onCreado, onCancelar }) => {
  const [formData, setFormData] = useState({
    cedulaCiudadania: '',
    nombreCompleto: '',
    email: '',
    telefono: ''
  });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const validar = () => {
    const nuevosErrores = {};
    
    if (!formData.cedulaCiudadania) {
      nuevosErrores.cedulaCiudadania = 'La cédula es requerida';
    } else if (!/^[0-9]+$/.test(formData.cedulaCiudadania)) {
      nuevosErrores.cedulaCiudadania = 'Solo números';
    } else if (formData.cedulaCiudadania.length > 20) {
      nuevosErrores.cedulaCiudadania = 'Máximo 20 dígitos';
    }
    
    if (!formData.nombreCompleto) {
      nuevosErrores.nombreCompleto = 'El nombre es requerido';
    } else if (formData.nombreCompleto.length > 200) {
      nuevosErrores.nombreCompleto = 'Máximo 200 caracteres';
    }
    
    if (!formData.email) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = 'Email inválido';
    } else if (formData.email.length > 150) {
      nuevosErrores.email = 'Máximo 150 caracteres';
    }
    
    if (!formData.telefono) {
      nuevosErrores.telefono = 'El teléfono es requerido';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.telefono)) {
      nuevosErrores.telefono = 'Formato inválido (solo números, +, -, (), espacios)';
    } else if (formData.telefono.length > 50) {
      nuevosErrores.telefono = 'Máximo 50 caracteres';
    }
    
    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrores({});

    try {
      const response = await fetch('http://localhost:5208/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          requerimientoId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Error al crear candidato');
      }

      const candidato = await response.json();
      onCreado(candidato);
    } catch (error) {
      setErrores({ general: error.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Agregar Candidato al Requerimiento</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cédula de Ciudadanía *</label>
            <input
              type="text"
              value={formData.cedulaCiudadania}
              onChange={(e) => setFormData({ ...formData, cedulaCiudadania: e.target.value })}
              className={errores.cedulaCiudadania ? 'error' : ''}
              placeholder="1234567890"
            />
            {errores.cedulaCiudadania && <span className="error-text">{errores.cedulaCiudadania}</span>}
          </div>

          <div className="form-group">
            <label>Nombre Completo *</label>
            <input
              type="text"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              className={errores.nombreCompleto ? 'error' : ''}
              placeholder="Pedro Martínez"
            />
            {errores.nombreCompleto && <span className="error-text">{errores.nombreCompleto}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errores.email ? 'error' : ''}
              placeholder="pedro@ejemplo.com"
            />
            {errores.email && <span className="error-text">{errores.email}</span>}
          </div>

          <div className="form-group">
            <label>Teléfono *</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              className={errores.telefono ? 'error' : ''}
              placeholder="3001112233"
            />
            {errores.telefono && <span className="error-text">{errores.telefono}</span>}
          </div>

          <div className="info-box">
            <p>
              ℹ️ Al crear el candidato se enviará automáticamente un email con el link de acceso 
              al formulario de registro.
            </p>
          </div>

          {errores.general && (
            <div className="error-message general">{errores.general}</div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onCancelar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? 'Creando...' : 'Crear y Enviar Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCandidatoForm;
```

---

## �🚀 Endpoints Principales

### 1. Requerimientos

#### Listar requerimientos
```http
GET /api/requerimientos
```

**Respuesta**:
```json
[
  {
    "reqId": 1,
    "psicologoNombre": "María Perez",
    "perfilBasico": "Desarrollador Senior",
    "rolObjetivo": "Tech Lead",
    "estado": {
      "estId": 1,
      "estCodigo": "CREADO",
      "estDescripcion": "Requerimiento creado",
      "estActivo": true
    },
    "fechaCreacion": "2025-11-06T10:30:00Z",
    "totalCandidatos": 5
  }
]
```

#### Crear requerimiento
```http
POST /api/requerimientos
Content-Type: application/json

{
  "psicologoDocumento": "123456789",
  "psicologoNombre": "María Perez",
  "psicologoEmail": "maria@super.com.co",
  "perfilBasico": "Perfil técnico",
  "rolObjetivo": "Desarrollador",
  "areaObjetivo": "Tecnología"
}
```

---

### 2. Candidatos

#### Crear candidato (🔔 Envía email automático)
```http
POST /api/candidatos
Content-Type: application/json

{
  "requerimientoId": 1,
  "cedulaCiudadania": "1234567890",
  "nombreCompleto": "Pedro Martínez",
  "email": "pedro@ejemplo.com",
  "telefono": "3001112233"
}
```

**Validaciones**:
- Cédula: requerida, max 20, solo números, única
- Email: requerido, válido, max 150
- Teléfono: requerido, max 50, formato `^[0-9+\-\s()]+$`
- Nombre: requerido, max 200

#### Completar formulario (Admin)
```http
POST /api/candidatos/{id}/formulario
Content-Type: application/json

{
  "estadoCivil": "Soltero",
  "genero": "M",
  "edadIngreso": 25,
  "municipio": "Manizales",
  "comuna": "Centro",
  "barrio": "Versalles",
  "direccion": "Calle 50 #25-10",
  "estrato": 3,
  "tieneHijo": false,
  "edadesHijos": [],
  "tallaCamisa": "M",
  "tallaPantalon": "32",
  "tallaZapato": "42"
}
```

**Validaciones formulario**:
- Edad ingreso: 1-99
- Estrato: 1-6
- Si `tieneHijo` = true, `edadesHijos` no puede estar vacío
- Cada edad en `edadesHijos` ≤ 50

#### Registrar resultado
```http
PATCH /api/candidatos/{id}/resultado
Content-Type: application/json

# Aprobar
{ "resultadoSeleccion": true }

# Rechazar
{
  "resultadoSeleccion": false,
  "motivoRechazo": "No cumple requisitos"
}
```

---

### 3. Flujo Público

#### Registro simple
```http
POST /api/publico/registro
Content-Type: application/json

{
  "cedulaCiudadania": "9876543210",
  "nombreCompleto": "Juan García",
  "email": "juan@ejemplo.com",
  "telefono": "3159876543"
}
```

#### Registro completo (candidato + formulario)
```http
POST /api/publico/registro-completo
Content-Type: application/json

{
  "cedulaCiudadania": "9876543210",
  "nombreCompleto": "Juan García",
  "email": "juan@ejemplo.com",
  "telefono": "3159876543",
  "estadoCivil": "Casado",
  "genero": "M",
  "edadIngreso": 30,
  "municipio": "Bogotá",
  "comuna": "Usaquén",
  "barrio": "Santa Bárbara",
  "direccion": "Cra 7 #156-30",
  "estrato": 4,
  "tieneHijo": true,
  "edadesHijos": [5, 8],
  "tallaCamisa": "L",
  "tallaPantalon": "34",
  "tallaZapato": "43"
}
```

#### Consultar candidato por token
```http
GET /api/publico/candidato/{token}
```

#### Completar formulario por token
```http
POST /api/publico/candidato/{token}/formulario
Content-Type: application/json

{
  "estadoCivil": "Soltero",
  "genero": "F",
  ...
}
```

---

### 4. Colaboradores (RRHH)

#### Consultar colaborador por documento
```http
GET /api/colaboradores/{numeroDocumento}
```

**Respuesta 200**:
```json
{
  "success": true,
  "data": {
    "numeroDocumento": "1056121362",
    "nombreCompleto": "Luis Miguel Cañon Salgado",
    "correoInstitucional": "miguel.sanchez@super.com.co",
    "telefonoCelular": "3155508627",
    "ciudadResidencia": "Manizales",
    "direccionResidencia": "Calle 77 #21-87",
    "genero": "Masculino",
    "estadoCivil": "Soltero/a",
    "tallaCamisa": "XL",
    "area": "DESARROLLO DEL TALENTO HUMANO",
    "rol": "LIDER ANALITICA DE DATOS",
    "contratoActivo": true
  }
}
```

**Respuesta 404**:
```json
{
  "success": false,
  "message": "No se encontró colaborador con documento 1234567890"
}
```

**Uso - Autocompletar formulario**:
```javascript
const buscarColaborador = async (cedula) => {
  const res = await fetch(`${API_BASE}/api/colaboradores/${cedula}`);
  
  if (res.status === 404) {
    // No es colaborador, continuar normal
    return null;
  }
  
  const { data } = await res.json();
  
  // Autocompletar
  setFormulario({
    nombreCompleto: data.nombreCompleto,
    email: data.correoInstitucional,
    telefono: data.telefonoCelular,
    genero: data.genero === 'Masculino' ? 'M' : 'F',
    estadoCivil: data.estadoCivil,
    municipio: data.ciudadResidencia,
    direccion: data.direccionResidencia,
    tallaCamisa: data.tallaCamisa
  });
  
  return data;
};
```

---

### 5. Documentos

#### Subir documento
```http
POST /api/documentos?candidatoId={candidatoId}
Content-Type: multipart/form-data

archivo: [file]
tipoDocumentoId: 2
observacion: "Hoja de vida"
```

**Ejemplo JavaScript**:
```javascript
const subirDocumento = async (candidatoId, file, tipoDocId, obs) => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('tipoDocumentoId', tipoDocId);
  formData.append('observacion', obs || '');

  const res = await fetch(`${API_BASE}/api/documentos?candidatoId=${candidatoId}`, {
    method: 'POST',
    body: formData
  });

  return await res.json();
};
```

#### Descargar documento
```http
GET /api/documentos/{id}
```

#### Eliminar documento (lógico)
```http
DELETE /api/documentos/{id}
```

---

### 6. Pruebas Psicotécnicas

#### ⚠️ Asignar prueba a candidato (CON NORMATIVA)

**Este es el momento de seleccionar el tipo de normativa según el perfil del candidato.**

```http
POST /api/asignaciones
Content-Type: application/json

{
  "candidatoId": 15,
  "publicacionPruebaId": 1,
  "tipoNormativaId": 2,  // ← OBLIGATORIO para pruebas CMT
  "fechaLimite": "2025-11-20T23:59:59Z"
}
```

**Tipos de Normativa disponibles:**

| ID | Nombre | Descripción | Cuándo usar |
|----|--------|-------------|-------------|
| 1 | Auxiliares | Auxiliares de oficina, administrativos, almacenista, auxiliar contable | Roles operativos/apoyo |
| 2 | Profesionales | Profesionales en general | Roles técnicos, universitarios |
| 3 | Hombres | Hombres en general | Normativa específica género M |
| 4 | Mujeres | Mujeres en general | Normativa específica género F |

**Consultar tipos disponibles:**
```http
GET /api/tipos-normativa
```

**Respuesta:**
```json
[
  {
    "tipTipoNormativaId": 1,
    "tipNombre": "Auxiliares de oficina, administrativos, almacenista, auxiliar contable",
    "tipDescripcion": "Baremos para personal auxiliar y administrativo",
    "tipActivo": true
  },
  {
    "tipTipoNormativaId": 2,
    "tipNombre": "Profesionales en general",
    "tipDescripcion": "Baremos para personal profesional",
    "tipActivo": true
  }
]
```

**Respuesta asignación:**
```json
{
  "apcId": 10,
  "candidatoId": 15,
  "nombreCandidato": "Pedro Martínez",
  "publicacionPruebaId": 1,
  "nombrePrueba": "CMT - Cuestionario de Motivación",
  "codigoVersion": "v1.0",
  "estadoAsignacion": "PENDIENTE",
  "fechaAsignacion": "2025-11-06T14:30:00Z",
  "fechaLimite": "2025-11-20T23:59:59Z",
  "intentosRealizados": 0,
  "tipoNormativa": {
    "tipTipoNormativaId": 2,
    "tipNombre": "Profesionales en general",
    "tipDescripcion": "Baremos para personal profesional",
    "tipActivo": true
  }
}
```

#### Listar asignaciones de candidato
```http
GET /api/asignaciones/candidato/{candidatoId}
```

#### Iniciar intento de prueba
```http
POST /api/intentos
Content-Type: application/json

{
  "asignacionPruebaCandidatoId": 10
}
```

#### Guardar respuestas (durante prueba)
```http
POST /api/intentos/{intentoId}/respuestas
Content-Type: application/json

{
  "respuestas": [
    {
      "itemPruebaId": 1,
      "opcionItemId": 5,
      "valorRanking": 1
    },
    {
      "itemPruebaId": 1,
      "opcionItemId": 8,
      "valorRanking": 2
    }
  ]
}
```

**Nota**: Para pruebas CMT de ranking, cada ítem requiere múltiples respuestas con `valorRanking` único (1, 2, 3, ..., N).

#### Finalizar intento
```http
POST /api/intentos/{intentoId}/finalizar
```

El backend calcula automáticamente el resultado.

#### Consultar resultado
```http
GET /api/resultados/intento/{intentoId}
```

---

## 🔧 Manejo de Errores

### Códigos HTTP
- **200 OK**: Operación exitosa (GET, PATCH)
- **201 Created**: Recurso creado (POST)
- **204 No Content**: Operación exitosa sin contenido (DELETE)
- **400 Bad Request**: Error de validación
- **404 Not Found**: Recurso no existe
- **500 Internal Server Error**: Error interno

### Estructura de error
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Bad Request",
  "status": 400,
  "detail": "La cédula ya está registrada en el sistema"
}
```

### Handler recomendado
```javascript
const handleApiError = async (response) => {
  if (response.ok) return await response.json();
  
  let errorMessage = 'Error desconocido';
  
  try {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      errorMessage = error.detail || error.message || errorMessage;
    } else {
      errorMessage = await response.text();
    }
  } catch {
    errorMessage = `Error ${response.status}: ${response.statusText}`;
  }
  
  throw new Error(errorMessage);
};
```

---

## ✅ Validaciones del Cliente

### Candidato
```javascript
const validarCandidato = (datos) => {
  const errores = {};
  
  if (!datos.cedula) {
    errores.cedula = 'La cédula es requerida';
  } else if (!/^[0-9]+$/.test(datos.cedula)) {
    errores.cedula = 'Solo números';
  } else if (datos.cedula.length > 20) {
    errores.cedula = 'Máximo 20 dígitos';
  }
  
  if (!datos.email) {
    errores.email = 'El email es requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
    errores.email = 'Formato inválido';
  }
  
  if (!datos.telefono) {
    errores.telefono = 'El teléfono es requerido';
  } else if (!/^[0-9+\-\s()]+$/.test(datos.telefono)) {
    errores.telefono = 'Formato inválido';
  }
  
  return Object.keys(errores).length > 0 ? errores : null;
};
```

### Formulario
```javascript
const validarFormulario = (datos) => {
  const errores = {};
  
  if (!datos.edadIngreso || datos.edadIngreso < 1 || datos.edadIngreso > 99) {
    errores.edadIngreso = 'Edad entre 1 y 99';
  }
  
  if (!datos.estrato || datos.estrato < 1 || datos.estrato > 6) {
    errores.estrato = 'Estrato entre 1 y 6';
  }
  
  if (datos.tieneHijo && (!datos.edadesHijos || datos.edadesHijos.length === 0)) {
    errores.edadesHijos = 'Debe especificar edades de hijos';
  }
  
  if (datos.edadesHijos?.some(edad => edad > 50)) {
    errores.edadesHijos = 'Edades deben ser ≤ 50';
  }
  
  return Object.keys(errores).length > 0 ? errores : null;
};
```

---

## 🎨 Componentes Recomendados

### EstadoBadge
```javascript
const EstadoBadge = ({ estado }) => {
  const getColor = (codigo) => {
    const colors = {
      'CREADO': 'blue',
      'FORMULARIO_COMPLETO': 'green',
      'APROBADO': 'success',
      'RECHAZADO': 'danger'
    };
    return colors[codigo] || 'gray';
  };
  
  return (
    <Badge color={getColor(estado.estCodigo)}>
      {estado.estDescripcion}
    </Badge>
  );
};
```

### FormularioCandidato con búsqueda de colaborador
```javascript
const FormularioCandidato = () => {
  const [formData, setFormData] = useState({});
  const [esColaborador, setEsColaborador] = useState(false);
  
  const handleCedulaBlur = async (e) => {
    const cedula = e.target.value;
    if (cedula.length < 7) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/colaboradores/${cedula}`);
      
      if (res.status === 404) {
        setEsColaborador(false);
        return;
      }
      
      const { data } = await res.json();
      setEsColaborador(true);
      
      setFormData(prev => ({
        ...prev,
        nombreCompleto: data.nombreCompleto,
        email: data.correoInstitucional,
        telefono: data.telefonoCelular,
        // ... más campos
      }));
      
      toast.success('✅ Colaborador encontrado - datos precargados');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <form>
      <Input
        label="Cédula"
        value={formData.cedula}
        onChange={e => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
        onBlur={handleCedulaBlur}
      />
      {esColaborador && (
        <Alert color="info">
          Este candidato es colaborador interno. Datos precargados desde RRHH.
        </Alert>
      )}
      {/* ... más campos */}
    </form>
  );
};
```

---

## ⚡ Optimización

### Caché de catálogos
```javascript
const useCatalogos = () => {
  const [catalogos, setCatalogos] = useState(() => {
    const cached = localStorage.getItem('catalogos');
    return cached ? JSON.parse(cached) : null;
  });
  
  useEffect(() => {
    if (catalogos) return;
    
    const cargar = async () => {
      const [estados, tiposDoc] = await Promise.all([
        fetch(`${API_BASE}/api/estados`).then(r => r.json()),
        fetch(`${API_BASE}/api/tiposdocumento`).then(r => r.json())
      ]);
      
      const data = { estados, tiposDoc };
      setCatalogos(data);
      localStorage.setItem('catalogos', JSON.stringify(data));
    };
    
    cargar();
  }, [catalogos]);
  
  return catalogos;
};
```

---

## 🔐 Seguridad (Futuro - JWT)

```javascript
const apiClient = async (url, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  return response;
};
```

---

## 📝 Checklist de Implementación

- [ ] **Servicios HTTP**
  - [ ] RequerimientoService
  - [ ] CandidatoService
  - [ ] PublicoService
  - [ ] DocumentoService
  - [ ] ColaboradorService
  - [ ] PruebaService

- [ ] **Componentes**
  - [ ] ListaRequerimientos
  - [ ] FormularioCandidato
  - [ ] FormularioPublico
  - [ ] SubirDocumento
  - [ ] AsignarPrueba
  - [ ] RealizarPrueba

- [ ] **Validación**
  - [ ] Validadores formularios
  - [ ] Manejo errores global
  - [ ] Feedback visual

- [ ] **Testing**
  - [ ] Tests E2E flujo completo
  - [ ] Tests unitarios validadores

---

## 📚 Recursos Adicionales

- **Archivo de pruebas HTTP**: `SeleccionApi/SeleccionApi.http`
- **Postman Collection**: `Testing/Postman/`
- **Documentación completa**: Ver archivos `.md` en el repositorio

---

¿Necesitas ejemplos específicos para algún framework (React, Angular, Vue)?
