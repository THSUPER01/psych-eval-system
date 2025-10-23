# Requisitos de Backend para Notificaciones

Este documento define lo que necesita exponer el backend para que el módulo de notificaciones del Dashboard funcione correctamente.

El frontend ya está implementado con un servicio (`notificationsService`), un hook (`useNotifications`) y un componente (`NotificationBell`). A continuación se detalla el contrato esperado.

## Resumen rápido
- Base URL configurable con `NEXT_PUBLIC_MS_NOTIFICATIONS_URL`
- Autenticación: idealmente igual que otros microservicios (App-Token y/o JWT). Se recomienda validar el usuario en backend.
- Formato ISO-8601 para fechas (`createdAt`).
- Tipos de notificación: `info | warning | success | error`.
- Endpoints REST mínimos: listar, marcar una como leída, marcar todas como leídas.
- Opcional: canal tiempo real (SSE o WebSocket) para push.

## Variables de entorno (frontend)
- `NEXT_PUBLIC_MS_NOTIFICATIONS_URL` → URL base del microservicio de notificaciones.
  - Si no está definida, el frontend usa un mock con `localStorage` (para demo/desarrollo).

## Modelo de datos (contrato)
```ts
interface AppNotification {
  id: string
  titulo: string
  descripcion?: string
  type: 'info' | 'warning' | 'success' | 'error'
  createdAt: string   // fecha/hora en ISO-8601 (UTC recomendado)
  read: boolean
  link?: string       // ruta interna del dashboard para "ver detalle"
}
```

## Endpoints REST requeridos

### 1) Listar notificaciones del usuario
- Método: GET
- Ruta sugerida: `/Notificaciones/{documento}`
- Autenticación: misma política que otros MS (por ejemplo, header `App-Token` y validación del documento con JWT)
- Respuesta: puede ser `AppNotification[]` o `{ data: AppNotification[] }`. El frontend soporta ambas.
- Parámetros opcionales de paginación/filtrado:
  - `?limit=20&cursor=...`
  - `?onlyUnread=true`

Ejemplo de respuesta mínima:
```json
{
  "data": [
    {
      "id": "1056121362-1",
      "titulo": "Nuevo requerimiento asignado",
      "descripcion": "Requerimiento: Auxiliar de bodega (REQ-1023)",
      "type": "info",
      "createdAt": "2025-10-23T13:20:00.000Z",
      "read": false,
      "link": "/dashboard/selection/requerimientos"
    }
  ]
}
```

### 2) Marcar una notificación como leída
- Método: PATCH
- Ruta sugerida: `/Notificaciones/{id}/leer`
- Códigos: 200/204 en éxito

Sin body requerido (el ID en ruta es suficiente). Alternativamente, aceptar `{ documento: string }` si aplica validación.

### 3) Marcar todas como leídas
- Método: POST
- Ruta sugerida: `/Notificaciones/marcar-todas`
- Body requerido:
```json
{ "documento": "1056121362" }
```
- Códigos: 200/204 en éxito

## Reglas y validaciones
- `createdAt` debe ser ISO-8601. El frontend muestra tiempo relativo (p. ej., "hace 15 minutos").
- `type` debe ser uno de: `info | warning | success | error`.
- `link` (si viene) se usa para navegar en el dashboard al hacer clic en "Ver detalle".
- El backend debe filtrar/autorizar por usuario: cada documento solo accede a sus notificaciones.

## Errores esperados
- 401/403 si el documento o token no son válidos.
- 404 si no existe la notificación indicada en `/{id}/leer`.
- 429 si se aplica rate limiting.
- Respuesta de error con `message` legible es recomendable.

## Sugerencias de diseño (opcional)
- Paginación: cursor-based para escalabilidad.
- Estado adicional: `category`, `severity`, `metadata` para enriquecer UI futura.
- Orígenes: generar notificaciones desde eventos del sistema (por ejemplo, "candidato completó formulario").
- Retención: política de borrado o archivado (p. ej., 30-90 días).
- Internacionalización: textos de `titulo`/`descripcion` en español (con plantillas si aplica).

## Tiempo real (opcional pero recomendado)

### Opción A: SSE (Server-Sent Events)
- Endpoint sugerido: `GET /Notificaciones/stream/{documento}`
- Cabeceras: `Content-Type: text/event-stream`
- Eventos:
  - `notification:new` → payload `AppNotification`
  - `notification:read` → payload `{ id: string }`
- Reintentos automáticos con `retry:` y heartbeats periódicos.

### Opción B: WebSocket
- Canal por documento de usuario.
- Eventos sugeridos:
  - `notification:new`
  - `notification:read`
  - `notification:markAll`
- Considerar autenticación en el handshake y reconexión exponencial.

## Seguridad
- Usar el mismo esquema de seguridad que el resto de MS (por ejemplo, header `App-Token` + JWT).
- Validar el `documento` contra el JWT del usuario autenticado.
- Sanitizar campos de `titulo`/`descripcion` para evitar XSS si provienen de fuentes externas.

## Integración con el frontend actual
El frontend ya consume:
- `GET /Notificaciones/{documento}` → listar
- `PATCH /Notificaciones/{id}/leer` → marcar una
- `POST /Notificaciones/marcar-todas` → marcar todas

Al definir `NEXT_PUBLIC_MS_NOTIFICATIONS_URL`, la UI dejará de usar el mock local y pasará a consumir el backend real sin más cambios.

---

¿Quieres que dejemos preparado el canal SSE/WebSocket en el frontend para alternar de polling a tiempo real cuando el backend esté listo? Puedo agregar los hooks y el toggle de estrategia.