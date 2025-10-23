# 🎨 Guía de Integración Frontend - Dashboard Administrativo

## 📋 Tabla de Contenidos

1. [Información General](#información-general)
2. [Autenticación y Seguridad](#autenticación-y-seguridad)
3. [Estructura del Dashboard](#estructura-del-dashboard)
4. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
5. [Consumo de APIs](#consumo-de-apis)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Componentes Sugeridos](#componentes-sugeridos)
8. [Gestión de Estado](#gestión-de-estado)
9. [Ejemplos de Código](#ejemplos-de-código)
10. [Mejores Prácticas](#mejores-prácticas)

---

## 📌 Información General

### Stack Tecnológico Recomendado

**Frontend Framework:**
- React 18+ con TypeScript
- Next.js 14+ (App Router) - Recomendado para SSR/SSG
- O Vue 3 + TypeScript + Nuxt 3

**State Management:**
- TanStack Query (React Query) para cache y sincronización
- Zustand o Jotai para estado global ligero
- Context API para temas simples

**UI Libraries:**
- shadcn/ui + Radix UI + Tailwind CSS (Recomendado)
- O Material-UI (MUI)
- O Ant Design

**Validación:**
- Zod para schemas y validación de formularios
- React Hook Form para manejo de formularios

**HTTP Client:**
- Axios con interceptors
- O TanStack Query con fetch

**Otras Herramientas:**
- date-fns o dayjs para fechas
- react-dropzone para upload de archivos
- recharts o chart.js para gráficos
- react-table o TanStack Table para tablas complejas

---



## 🏗️ Estructura del Dashboard

### Jerarquía de Rutas Sugerida

```
/
├── /login                          # Página de login (futuro)
├── /dashboard                      # Dashboard principal
│   ├── /                          # Home/Estadísticas generales
│   ├── /requerimientos            # Gestión de requerimientos
│   │   ├── /                     # Lista
│   │   ├── /nuevo                # Crear
│   │   ├── /:id                  # Detalle/Editar
│   │   └── /:id/candidatos       # Candidatos del requerimiento
│   ├── /candidatos                # Gestión de candidatos
│   │   ├── /                     # Lista
│   │   ├── /nuevo                # Crear
│   │   ├── /:id                  # Detalle/Editar
│   │   └── /:id/documentos       # Documentos del candidato
│   ├── /pruebas-psicotecnicas     # Gestión de pruebas
│   │   ├── /                     # Lista de pruebas
│   │   ├── /nueva                # Crear prueba
│   │   ├── /:id                  # Detalle de prueba
│   │   ├── /:id/versiones        # Versiones de prueba
│   │   └── /:id/versiones/:versionId/items  # Items/preguntas
│   ├── /asignaciones              # Asignación de pruebas
│   │   ├── /                     # Lista
│   │   └── /nueva                # Asignar prueba
│   ├── /resultados                # Resultados de pruebas
│   │   ├── /                     # Lista
│   │   └── /:id                  # Detalle del resultado
│   ├── /catalogos                 # Maestros/Catálogos
│   │   ├── /estados              # Estados
│   │   └── /tipos-documento      # Tipos de documento
│   └── /perfil                    # Perfil del usuario
└── /publico                       # Área pública (candidatos)
    └── /formulario/:token         # Formulario público
```

### Layout Principal

```typescript
// app/dashboard/layout.tsx (Next.js ejemplo)
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## 📦 Módulos y Funcionalidades

### 1. Dashboard Home - Estadísticas

**Métricas a Mostrar:**
- Total de requerimientos activos
- Total de candidatos registrados
- Candidatos pendientes de evaluación
- Pruebas psicotécnicas completadas (hoy/semana/mes)
- Gráficos de tendencias

**Endpoints:**
```typescript
// Estos endpoints no existen aún - habría que crearlos
GET /api/estadisticas/resumen
GET /api/estadisticas/tendencias?periodo=mes
```

**Componente Ejemplo:**
```typescript
// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}% vs mes anterior
            </p>
          )}
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
}
```

---

### 2. Gestión de Requerimientos

#### **2.1 Lista de Requerimientos**

**Endpoint:** `GET /api/Requerimientos`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "reqId": 1,
      "psicologoDocumento": "1234567890",
      "psicologoNombre": "Dra. María González",
      "psicologoEmail": "maria.gonzalez@empresa.com",
      "perfilBasico": "Se requiere personal con experiencia...",
      "cargoObjetivo": "Asesor Comercial",
      "areaObjetivo": "Ventas",
      "estado": {
        "estCodigo": "CREADO",
        "estDescripcion": "Requerimiento Creado"
      },
      "fechaCreacion": "2025-10-20T10:30:00Z",
      "totalCandidatos": 5
    }
  ]
}
```

**Hook Personalizado:**
```typescript
// hooks/useRequerimientos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface Requerimiento {
  reqId: number;
  psicologoDocumento: string;
  psicologoNombre: string;
  cargoObjetivo: string;
  areaObjetivo: string;
  estado: { estCodigo: string; estDescripcion: string };
  totalCandidatos: number;
}

export function useRequerimientos() {
  return useQuery<Requerimiento[]>({
    queryKey: ['requerimientos'],
    queryFn: async () => {
      const { data } = await api.get('/Requerimientos');
      return data.data || data;
    },
  });
}

export function useRequerimientosPorPsicologo(documento: string) {
  return useQuery<Requerimiento[]>({
    queryKey: ['requerimientos', 'psicologo', documento],
    queryFn: async () => {
      const { data } = await api.get(`/Requerimientos/psicologo/${documento}`);
      return data.data || data;
    },
    enabled: !!documento,
  });
}

export function useCrearRequerimiento() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (datos: CrearRequerimientoDto) => {
      const { data } = await api.post('/Requerimientos', datos);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requerimientos'] });
    },
  });
}
```

**Componente de Lista:**
```typescript
// components/requerimientos/RequerimientosTable.tsx
import { useRequerimientos } from '@/hooks/useRequerimientos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function RequerimientosTable() {
  const { data: requerimientos, isLoading } = useRequerimientos();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Cargo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Área
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Psicólogo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Candidatos
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requerimientos?.map((req) => (
            <tr key={req.reqId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{req.cargoObjetivo}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.areaObjetivo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.psicologoNombre}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={getEstadoVariant(req.estado.estCodigo)}>
                  {req.estado.estDescripcion}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {req.totalCandidatos}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/dashboard/requerimientos/${req.reqId}`}>
                  <Button variant="ghost" size="sm">Ver</Button>
                </Link>
                <Link href={`/dashboard/requerimientos/${req.reqId}/candidatos`}>
                  <Button variant="ghost" size="sm">Candidatos</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### **2.2 Crear Requerimiento**

**Endpoint:** `POST /api/Requerimientos`

**Body:**
```json
{
  "psicologoDocumento": "1234567890",
  "psicologoNombre": "Dra. María González",
  "psicologoEmail": "maria.gonzalez@empresa.com",
  "perfilBasico": "Se requiere personal con experiencia...",
  "cargoObjetivo": "Asesor Comercial",
  "areaObjetivo": "Ventas"
}
```

**Formulario:**
```typescript
// components/requerimientos/FormularioRequerimiento.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrearRequerimiento } from '@/hooks/useRequerimientos';

const schema = z.object({
  psicologoDocumento: z.string().min(5, 'Documento requerido'),
  psicologoNombre: z.string().min(3, 'Nombre requerido'),
  psicologoEmail: z.string().email('Email inválido'),
  perfilBasico: z.string().min(10, 'Descripción del perfil requerida'),
  cargoObjetivo: z.string().min(3, 'Cargo requerido'),
  areaObjetivo: z.string().min(3, 'Área requerida'),
});

type FormData = z.infer<typeof schema>;

export function FormularioRequerimiento() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const crearMutation = useCrearRequerimiento();

  const onSubmit = async (data: FormData) => {
    try {
      await crearMutation.mutateAsync(data);
      // Mostrar toast de éxito
      // Redirigir a lista
    } catch (error) {
      // Mostrar toast de error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Documento del Psicólogo
          </label>
          <input
            {...register('psicologoDocumento')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.psicologoDocumento && (
            <p className="mt-1 text-sm text-red-600">{errors.psicologoDocumento.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre del Psicólogo
          </label>
          <input
            {...register('psicologoNombre')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.psicologoNombre && (
            <p className="mt-1 text-sm text-red-600">{errors.psicologoNombre.message}</p>
          )}
        </div>
      </div>

      {/* Más campos... */}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">Cancelar</Button>
        <Button type="submit" disabled={crearMutation.isPending}>
          {crearMutation.isPending ? 'Guardando...' : 'Crear Requerimiento'}
        </Button>
      </div>
    </form>
  );
}
```

---

### 3. Gestión de Candidatos

#### **3.1 Lista de Candidatos**

**Endpoints:**
- `GET /api/Candidatos` - Todos los candidatos
- `GET /api/Candidatos/requerimiento/:id` - Candidatos de un requerimiento

**Hook:**
```typescript
// hooks/useCandidatos.ts
export function useCandidatos(requerimientoId?: number) {
  const endpoint = requerimientoId 
    ? `/Candidatos/requerimiento/${requerimientoId}`
    : '/Candidatos';

  return useQuery({
    queryKey: ['candidatos', requerimientoId],
    queryFn: async () => {
      const { data } = await api.get(endpoint);
      return data.data || data;
    },
  });
}

export function useMarcarLinkEnviado(candidatoId: number) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await api.post(`/Candidatos/${candidatoId}/marcar-link-enviado`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatos'] });
    },
  });
}
```

#### **3.2 Detalle de Candidato**

**Endpoint:** `GET /api/Candidatos/:id`

**Componente:**
```typescript
// components/candidatos/DetalleCandidato.tsx
export function DetalleCandidato({ candidatoId }: { candidatoId: number }) {
  const { data: candidato } = useQuery({
    queryKey: ['candidato', candidatoId],
    queryFn: async () => {
      const { data } = await api.get(`/Candidatos/${candidatoId}`);
      return data.data || data;
    },
  });

  if (!candidato) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Nombre Completo</dt>
              <dd className="text-base text-gray-900">{candidato.nombreCompleto}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-base text-gray-900">{candidato.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd className="text-base text-gray-900">{candidato.telefono}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Token de Acceso</dt>
              <dd className="text-base text-gray-900 font-mono">{candidato.tokenAcceso}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Formulario Completo */}
      {candidato.formularioCompleto && candidato.formulario && (
        <Card>
          <CardHeader>
            <CardTitle>Formulario Completo</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Estado Civil</dt>
                <dd className="text-base text-gray-900">{candidato.formulario.estadoCivil}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Género</dt>
                <dd className="text-base text-gray-900">{candidato.formulario.genero}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Edad de Ingreso</dt>
                <dd className="text-base text-gray-900">{candidato.formulario.edadIngreso} años</dd>
              </div>
              {/* Más campos... */}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentosList candidatoId={candidatoId} />
        </CardContent>
      </Card>

      {/* Pruebas Asignadas */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas Psicotécnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <AsignacionesList candidatoId={candidatoId} />
        </CardContent>
      </Card>
    </div>
  );
}
```

#### **3.3 Enviar Link al Candidato**

**Flujo:**
1. Crear candidato → Sistema genera token
2. Psicólogo copia link: `https://app-candidatos.com/formulario?token={token}`
3. Psicólogo marca como enviado

**Componente:**
```typescript
// components/candidatos/EnviarLinkModal.tsx
export function EnviarLinkModal({ candidato }: { candidato: Candidato }) {
  const [copied, setCopied] = useState(false);
  const marcarMutation = useMarcarLinkEnviado(candidato.canId);
  
  const linkFormulario = `${process.env.NEXT_PUBLIC_APP_URL}/formulario?token=${candidato.tokenAcceso}`;

  const copiarLink = () => {
    navigator.clipboard.writeText(linkFormulario);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const marcarEnviado = async () => {
    await marcarMutation.mutateAsync();
    // Cerrar modal
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Link al Candidato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link de Registro
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={linkFormulario}
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
              />
              <Button onClick={copiarLink} variant="outline">
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Instrucciones</AlertTitle>
            <AlertDescription>
              1. Copie el link y envíelo al candidato por email/WhatsApp<br/>
              2. El candidato podrá completar su formulario usando este link<br/>
              3. Marque como "Link Enviado" una vez enviado
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={marcarEnviado} disabled={marcarMutation.isPending}>
              Marcar como Enviado
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### 4. Gestión de Pruebas Psicotécnicas

#### **4.1 Lista de Pruebas**

**Endpoint:** `GET /api/pruebas-psicotecnicas`

**Componente:**
```typescript
// components/pruebas/PruebasTable.tsx
export function PruebasTable() {
  const { data: pruebas } = useQuery({
    queryKey: ['pruebas-psicotecnicas'],
    queryFn: async () => {
      const { data } = await api.get('/pruebas-psicotecnicas');
      return data.data || data;
    },
  });

  return (
    <div className="space-y-4">
      {pruebas?.map((prueba) => (
        <Card key={prueba.ppsId}>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="text-lg font-semibold">{prueba.nombrePrueba}</h3>
              <p className="text-sm text-gray-500">{prueba.descripcion}</p>
              <div className="mt-2 flex gap-2">
                <Badge>{prueba.codigoPrueba}</Badge>
                <Badge variant={prueba.activo ? 'success' : 'secondary'}>
                  {prueba.activo ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/pruebas-psicotecnicas/${prueba.ppsId}/versiones`}>
                <Button variant="outline">Ver Versiones</Button>
              </Link>
              <Link href={`/dashboard/pruebas-psicotecnicas/${prueba.ppsId}`}>
                <Button>Editar</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### **4.2 Crear/Editar Items (Preguntas)**

**Endpoint:** `POST /api/pruebas-psicotecnicas/:pruebaId/versiones/:versionId/items`

**Componente con Array de Opciones:**
```typescript
// components/pruebas/FormularioItem.tsx
import { useFieldArray } from 'react-hook-form';

const itemSchema = z.object({
  ordenItem: z.number().min(1),
  enunciado: z.string().min(5),
  tipoItem: z.enum(['OPCION_MULTIPLE', 'LIKERT', 'ABIERTA']),
  obligatorio: z.boolean(),
  opciones: z.array(z.object({
    ordenOpcion: z.number(),
    textoOpcion: z.string(),
    valorPuntuacion: z.number(),
    codigoOpcion: z.string().optional(),
  })),
});

export function FormularioItem({ versionId }: { versionId: number }) {
  const { control, register, handleSubmit } = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      ordenItem: 1,
      tipoItem: 'OPCION_MULTIPLE',
      obligatorio: true,
      opciones: [
        { ordenOpcion: 1, textoOpcion: '', valorPuntuacion: 1 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'opciones',
  });

  const onSubmit = async (data) => {
    await api.post(`/pruebas-psicotecnicas/versiones/${versionId}/items`, data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campos del item */}
      <div>
        <label>Enunciado de la Pregunta</label>
        <textarea {...register('enunciado')} className="w-full" rows={3} />
      </div>

      <div>
        <label>Tipo de Pregunta</label>
        <select {...register('tipoItem')} className="w-full">
          <option value="OPCION_MULTIPLE">Opción Múltiple</option>
          <option value="LIKERT">Escala Likert</option>
          <option value="ABIERTA">Respuesta Abierta</option>
        </select>
      </div>

      {/* Opciones de respuesta */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="font-medium">Opciones de Respuesta</label>
          <Button
            type="button"
            onClick={() => append({ 
              ordenOpcion: fields.length + 1,
              textoOpcion: '',
              valorPuntuacion: 0,
            })}
          >
            + Agregar Opción
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  {...register(`opciones.${index}.textoOpcion`)}
                  placeholder="Texto de la opción"
                  className="w-full"
                />
              </div>
              <div className="w-32">
                <input
                  {...register(`opciones.${index}.valorPuntuacion`, { valueAsNumber: true })}
                  type="number"
                  placeholder="Puntaje"
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
              >
                🗑️
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit">Guardar Item</Button>
    </form>
  );
}
```

#### **4.3 Carga Masiva de Items**

**Recomendación:** Crear endpoint para importación masiva

```typescript
// Endpoint futuro sugerido
POST /api/pruebas-psicotecnicas/versiones/:id/items/importar
Content-Type: application/json

{
  "items": [
    {
      "ordenItem": 1,
      "enunciado": "...",
      "tipoItem": "OPCION_MULTIPLE",
      "opciones": [...]
    },
    // ... 185 items más
  ]
}
```

**Componente de Importación:**
```typescript
// components/pruebas/ImportarItems.tsx
export function ImportarItems({ versionId }: { versionId: number }) {
  const [file, setFile] = useState<File | null>(null);
  
  const importarMutation = useMutation({
    mutationFn: async (items: any[]) => {
      // Podría ser JSON o CSV parseado
      await api.post(`/pruebas-psicotecnicas/versiones/${versionId}/items/importar`, {
        items,
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const items = JSON.parse(text); // O parsear CSV
    
    await importarMutation.mutateAsync(items);
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <input
        type="file"
        accept=".json,.csv"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-gray-600">
          <UploadIcon className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-medium">Cargar Items desde Archivo</p>
          <p className="text-sm mt-2">JSON o CSV con formato estándar</p>
        </div>
      </label>

      {importarMutation.isPending && <LoadingSpinner />}
      {importarMutation.isSuccess && (
        <Alert className="mt-4">Items importados exitosamente</Alert>
      )}
    </div>
  );
}
```

---

### 5. Asignación de Pruebas a Candidatos

#### **5.1 Asignar Prueba**

**Endpoint:** `POST /api/asignaciones`

**Formulario:**
```typescript
// components/asignaciones/FormularioAsignacion.tsx
export function FormularioAsignacion() {
  const { data: candidatos } = useCandidatos();
  const { data: publicaciones } = usePublicacionesActivas();
  
  const { register, handleSubmit } = useForm({
    defaultValues: {
      candidatoId: 0,
      publicacionPruebaId: 0,
      fechaLimite: '',
    },
  });

  const asignarMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/asignaciones', data);
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => asignarMutation.mutate(data))}>
      <div className="space-y-4">
        <div>
          <label>Candidato</label>
          <select {...register('candidatoId', { valueAsNumber: true })}>
            <option value={0}>Seleccione...</option>
            {candidatos?.map((c) => (
              <option key={c.canId} value={c.canId}>
                {c.nombreCompleto} - {c.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Prueba Publicada</label>
          <select {...register('publicacionPruebaId', { valueAsNumber: true })}>
            <option value={0}>Seleccione...</option>
            {publicaciones?.map((p) => (
              <option key={p.pubId} value={p.pubId}>
                {p.nombrePrueba} - v{p.codigoVersion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Fecha Límite</label>
          <input type="datetime-local" {...register('fechaLimite')} />
        </div>

        <Button type="submit" disabled={asignarMutation.isPending}>
          Asignar Prueba
        </Button>
      </div>
    </form>
  );
}
```

---

### 6. Visualización de Resultados

#### **6.1 Lista de Resultados**

**Endpoint:** `GET /api/resultados/candidato/:id`

**Componente:**
```typescript
// components/resultados/ResultadosTable.tsx
export function ResultadosTable({ candidatoId }: { candidatoId: number }) {
  const { data: resultados } = useQuery({
    queryKey: ['resultados', 'candidato', candidatoId],
    queryFn: async () => {
      const { data } = await api.get(`/resultados/candidato/${candidatoId}`);
      return data.data || data;
    },
  });

  return (
    <div className="space-y-4">
      {resultados?.map((resultado) => (
        <Card key={resultado.rprId}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{resultado.nombrePrueba}</h3>
                <p className="text-sm text-gray-500">
                  Finalizado: {formatDate(resultado.fechaFinalizacion)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {resultado.puntajeTotal}
                </div>
                <p className="text-sm text-gray-500">
                  {resultado.porcentajeAcierto}%
                </p>
              </div>
            </div>

            {resultado.observaciones && (
              <p className="mt-4 text-sm text-gray-700">
                {resultado.observaciones}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <Link href={`/dashboard/resultados/${resultado.rprId}`}>
                <Button variant="outline" size="sm">Ver Detalle</Button>
              </Link>
              <Button variant="outline" size="sm">Descargar PDF</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### **6.2 Detalle de Resultado con Respuestas**

**Endpoint:** `GET /api/resultados/intento/:id/respuestas`

```typescript
// components/resultados/DetalleRespuestas.tsx
export function DetalleRespuestas({ intentoId }: { intentoId: number }) {
  const { data: respuestas } = useQuery({
    queryKey: ['respuestas', intentoId],
    queryFn: async () => {
      const { data } = await api.get(`/resultados/intento/${intentoId}/respuestas`);
      return data.data || data;
    },
  });

  return (
    <div className="space-y-6">
      {respuestas?.map((respuesta, index) => (
        <Card key={respuesta.ritId}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-1">
                <p className="text-base font-medium text-gray-900 mb-2">
                  {respuesta.enunciadoItem}
                </p>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Respuesta:</span>{' '}
                    {respuesta.textoOpcion || respuesta.respuestaAbierta}
                  </p>
                  {respuesta.puntajeObtenido !== null && (
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">Puntaje:</span>{' '}
                      {respuesta.puntajeObtenido}
                    </p>
                  )}
                  {respuesta.tiempoRespuestaSeg && (
                    <p className="text-sm text-gray-500 mt-1">
                      Tiempo: {respuesta.tiempoRespuestaSeg}s
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🔄 Flujos de Usuario Completos

### Flujo 1: Psicólogo Crea Requerimiento y Candidatos

```typescript
// Pseudo-código del flujo ideal
const FlujoPsicologoRequerimiento = () => {
  // 1. Psicólogo inicia sesión
  await authService.login(email, password);

  // 2. Crea un requerimiento
  const requerimiento = await api.post('/Requerimientos', {
    psicologoDocumento: '1234567890',
    cargoObjetivo: 'Asesor Comercial',
    // ...
  });

  // 3. Agrega candidatos al requerimiento
  const candidato = await api.post('/Candidatos', {
    requerimientoId: requerimiento.data.reqId,
    nombreCompleto: 'Juan Pérez',
    email: 'juan@email.com',
    telefono: '3001234567',
  });

  // 4. Copia y envía link al candidato
  const link = `${APP_URL}/formulario?token=${candidato.data.tokenAcceso}`;
  // Psicólogo envía link por email/WhatsApp

  // 5. Marca como enviado
  await api.post(`/Candidatos/${candidato.data.canId}/marcar-link-enviado`);

  // 6. Espera a que candidato complete formulario

  // 7. Revisa candidatos del requerimiento
  const candidatos = await api.get(`/Candidatos/requerimiento/${requerimiento.data.reqId}`);

  // 8. Asigna prueba psicotécnica
  await api.post('/asignaciones', {
    candidatoId: candidato.data.canId,
    publicacionPruebaId: 1,
    fechaLimite: '2025-12-31T23:59:59Z',
  });

  // 9. Espera a que candidato complete prueba

  // 10. Revisa resultados
  const resultados = await api.get(`/resultados/candidato/${candidato.data.canId}`);
};
```

### Flujo 2: Candidato Completa Formulario y Prueba

```typescript
// Página pública: /formulario?token=abc123
const FormularioCandidato = () => {
  const token = useSearchParams().get('token');

  // 1. Consultar datos del candidato
  const { data: candidato } = useQuery({
    queryKey: ['candidato-publico', token],
    queryFn: async () => {
      const { data } = await api.get(`/publico/candidato/${token}`);
      return data.data;
    },
  });

  // 2. Mostrar formulario
  const onSubmit = async (formData) => {
    await api.post(`/publico/candidato/${token}/formulario`, formData);
    // Mostrar mensaje de éxito
  };

  // 3. Ver pruebas asignadas
  const { data: pruebas } = useQuery({
    queryKey: ['pruebas-asignadas', token],
    queryFn: async () => {
      const { data } = await api.get(`/publico/candidato/${token}/pruebas`);
      return data.data;
    },
  });

  // 4. Iniciar prueba
  const iniciarPrueba = async (asignacionId) => {
    const { data } = await api.post(
      `/publico/candidato/${token}/pruebas/${asignacionId}/iniciar`
    );
    // Redirigir a interfaz de prueba
  };

  // 5. Responder preguntas
  const responder = async (asignacionId, respuestas) => {
    await api.post(
      `/publico/candidato/${token}/pruebas/${asignacionId}/responder`,
      { respuestas }
    );
  };

  // 6. Finalizar prueba
  const finalizar = async (asignacionId) => {
    await api.post(
      `/publico/candidato/${token}/pruebas/${asignacionId}/finalizar`
    );
    // Mostrar mensaje de confirmación
  };
};
```

---

## 🧩 Componentes Reutilizables Sugeridos

### 1. Selector de Candidatos

```typescript
// components/shared/CandidatoSelector.tsx
interface CandidatoSelectorProps {
  requerimientoId?: number;
  value: number;
  onChange: (candidatoId: number) => void;
}

export function CandidatoSelector({
  requerimientoId,
  value,
  onChange,
}: CandidatoSelectorProps) {
  const { data: candidatos } = useCandidatos(requerimientoId);

  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
      <option value={0}>Seleccione un candidato</option>
      {candidatos?.map((c) => (
        <option key={c.canId} value={c.canId}>
          {c.nombreCompleto} - {c.email}
        </option>
      ))}
    </select>
  );
}
```

### 2. Badge de Estado

```typescript
// components/shared/EstadoBadge.tsx
export function EstadoBadge({ codigo }: { codigo: string }) {
  const variants = {
    CREADO: 'bg-gray-100 text-gray-800',
    LINK_ENVIADO: 'bg-blue-100 text-blue-800',
    FORMULARIO_COMPLETO: 'bg-green-100 text-green-800',
    EN_EVALUACION: 'bg-yellow-100 text-yellow-800',
    APROBADO: 'bg-green-500 text-white',
    RECHAZADO: 'bg-red-500 text-white',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[codigo] || ''}`}>
      {codigo.replace(/_/g, ' ')}
    </span>
  );
}
```

### 3. Loading Spinner

```typescript
// components/shared/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );
}
```

---

## 📝 Gestión de Estado Global

### Store de Usuario (Zustand)

```typescript
// store/useUserStore.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    set({ user: null });
    authService.logout();
  },
}));
```

### Query Client Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 🎨 Mejores Prácticas

### 1. Manejo de Errores Consistente

```typescript
// lib/errorHandler.ts
export function handleApiError(error: any) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 'Error desconocido';
    toast.error(message);
  } else {
    toast.error('Error de conexión');
  }
}

// En componentes
try {
  await mutation.mutateAsync(data);
  toast.success('Operación exitosa');
} catch (error) {
  handleApiError(error);
}
```

### 2. Validación de Formularios

```typescript
// Usar Zod para definir schemas reutilizables
// schemas/candidato.schema.ts
export const candidatoSchema = z.object({
  nombreCompleto: z.string().min(3).max(200),
  email: z.string().email().max(150),
  telefono: z.string().regex(/^[0-9+\-\s()]+$/).max(50),
});
```

### 3. Tipos TypeScript Centralizados

```typescript
// types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface Requerimiento {
  reqId: number;
  psicologoDocumento: string;
  psicologoNombre: string;
  cargoObjetivo: string;
  // ...
}

// Exportar todos los tipos de la API
```

### 4. Paginación y Filtros

```typescript
// hooks/useRequerimientosPaginados.ts
export function useRequerimientosPaginados(
  page: number,
  pageSize: number,
  filters?: { estado?: string; psicologo?: string }
) {
  return useQuery({
    queryKey: ['requerimientos', page, pageSize, filters],
    queryFn: async () => {
      // Cuando se implemente paginación en la API
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...filters,
      });
      const { data } = await api.get(`/Requerimientos?${params}`);
      return data;
    },
  });
}
```

---

## 📦 Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=https://localhost:7162/api
NEXT_PUBLIC_APP_URL=https://app-candidatos.com

# Futuro: cuando se implemente autenticación
NEXT_PUBLIC_AUTH_ENABLED=true
JWT_SECRET=your-secret-key
```

---

## 🚀 Deploy y Producción

### Checklist Pre-Producción

- [ ] Implementar autenticación JWT en la API
- [ ] Habilitar CORS para el dominio del frontend
- [ ] Configurar HTTPS en ambos lados
- [ ] Implementar rate limiting
- [ ] Agregar logs de auditoría
- [ ] Configurar backups de base de datos
- [ ] Testing end-to-end
- [ ] Documentación de APIs con Swagger
- [ ] Monitoreo de errores (Sentry)
- [ ] Analytics (Google Analytics, Mixpanel)

---

## 📚 Recursos Adicionales

**Documentación de la API:**
- Swagger UI: `https://localhost:7162/swagger` (solo desarrollo)
- Archivo HTTP de pruebas: `SeleccionApi.http` y `PruebasPsicotecnicas.http`

**Repositorio:**
- Backend: `SeleccionApi`
- Frontend: (crear repo separado recomendado)

**Contacto Técnico:**
- Revisar `ARCHITECTURE.md` y `IMPLEMENTACION_PRUEBAS_PSICOTECNICAS.md`

---

## 🎯 Próximos Pasos de Desarrollo

1. **Backend:**
   - [ ] Implementar JWT authentication
   - [ ] Crear endpoint de estadísticas
   - [ ] Endpoint de importación masiva de items
   - [ ] Endpoint de exportación de resultados (PDF)

2. **Frontend:**
   - [ ] Setup inicial del proyecto (Next.js + TypeScript)
   - [ ] Implementar layout y navegación
   - [ ] Módulo de requerimientos
   - [ ] Módulo de candidatos
   - [ ] Módulo de pruebas psicotécnicas
   - [ ] Interfaz pública para candidatos
   - [ ] Dashboard de estadísticas

3. **Testing:**
   - [ ] Unit tests (Vitest o Jest)
   - [ ] Integration tests (Testing Library)
   - [ ] E2E tests (Playwright o Cypress)

---

**¡Éxito con la implementación! 🚀**
