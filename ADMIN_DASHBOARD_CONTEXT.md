# Contexto: Admin Dashboard (`/admin/dashboard`)

Documento de contexto para trabajar sobre la página de administración. Mapea las rutas frontend y backend involucradas, el flujo de autenticación y las fuentes de datos.

---

## 1. Arquitectura general

- **Frontend:** Next.js (App Router) en `undercodeec_nextjs/`. Export estático (`out/`).
- **Backend:** Express en `backend/server.js` (monolito, ~2800 líneas). Corre en `http://localhost:3002` en dev; en producción `NEXT_PUBLIC_API_URL` (api.undercodeec.com).
- **Base de datos:** PostgreSQL (`backend/db.js` / `db_pg.js`). Tablas relevantes: `orders` y `leads`.
- **Sesiones admin:** en memoria (`adminSessions` Map en server.js) — se pierden al reiniciar el servidor. El token se guarda en `localStorage` del navegador como `adminToken`.

---

## 2. Rutas Frontend (Next.js)

| Ruta | Archivo | Descripción |
|---|---|---|
| `/admin` | `undercodeec_nextjs/src/app/admin/page.jsx` | Login en 2 pasos: credenciales + reCAPTCHA Enterprise (acción `ADMIN_LOGIN`), luego código 2FA de 8 dígitos enviado por email. Al éxito guarda `adminToken` en localStorage y redirige a `/admin/dashboard`. |
| `/admin/dashboard` | `undercodeec_nextjs/src/app/admin/dashboard/page.jsx` | Panel principal. Client component (`'use client'`). Si no hay `adminToken` → redirige a `/admin`. Si alguna API responde 401 → borra token y redirige a `/admin`. |

### Estructura del dashboard (`page.jsx`)

Tres tabs controlados por estado `activeTab`:

1. **`transfers` (Transferencias Bancarias)** — tabla con: ID, Fecha, Plan, Monto, Estado (`payment_status`), Comprobante (link a `voucher_url`). Datos de `GET /api/admin/transfers`.
2. **`leads` (Formularios / Leads)** — tabla con: Fecha, Origen (`form_type`), Nombre, Contacto (email/teléfono), Detalles Técnicos (JSON parseado del campo `data`, excluyendo claves ya mostradas: name, email, phone, nombre, telefono, g-recaptcha-response, contactName, contactEmail, contactPhone). Datos de `GET /api/admin/leads`.
3. **`settings` (Configuraciones)** — formulario de cambio de contraseña → `POST /api/admin/change-password`.

Notas de implementación frontend:
- `fetchData()` hace ambos fetch en paralelo con `Promise.all`, una sola vez al montar.
- Logout es solo local (`localStorage.removeItem` + redirect); **no llama** a `POST /api/admin/logout` del backend.
- Estilos con Tailwind prefijado `tw-`, tema oscuro (#0f172a), gradiente purple→orange. Importa `slider.css` y anula estilos de `header` con un `<style>` inline.

---

## 3. Rutas Backend (Express — `backend/server.js`)

### Endpoints admin

| Método | Ruta | Auth | Línea aprox. | Descripción |
|---|---|---|---|---|
| POST | `/api/admin/login` | reCAPTCHA | Paso 1: verifica reCAPTCHA, rate-limit por email (lock 15 min), valida email (tiempo constante) y password con `bcrypt.compare` contra el hash de la tabla `admin_users`. Genera código 2FA de 8 dígitos, expira en 5 min, lo envía por email. Responde `{ success, requireVerification: true }`. |
| POST | `/api/admin/verify` | credenciales + código | Paso 2: re-valida credenciales (bcrypt) y código (tiempo constante, rate-limit propio). Al éxito emite token de sesión aleatorio guardado en `adminSessions` con TTL rolling. Responde `{ success, token }`. |
| POST | `/api/admin/logout` | `adminAuth` | Invalida la sesión del token actual (el frontend lo llama al cerrar sesión). |
| POST | `/api/admin/change-password` | `adminAuth` | Valida contraseña actual con bcrypt, exige nueva con 12+ chars, mayús/minús/números. Guarda el nuevo hash bcrypt en `admin_users` (ya NO escribe al `.env`), invalida las demás sesiones, notifica por email. |
| GET | `/api/admin/payments` | `adminAuth` | Todos los pagos: `SELECT * FROM orders ORDER BY created_at DESC` (tarjeta + transferencia). |
| POST | `/api/admin/payments/:id/status` | `adminAuth` | Cambia `payment_status` de un pago (`pending`/`approved`/`rejected`). |
| GET | `/api/admin/leads` | `adminAuth` | `SELECT * FROM leads ORDER BY created_at DESC`. |

**Credenciales admin:** viven en la tabla `admin_users` (email + `password_hash` bcrypt). Al arrancar, `ensureAdminUser()` migra automáticamente desde `ADMIN_EMAIL`/`ADMIN_PASSWORD` del `.env` si la tabla está vacía; después `ADMIN_PASSWORD` debe eliminarse del `.env`.

### Middleware `adminAuth` (~línea 2426)

- Exige header `Authorization: Bearer <token>` (token 32–256 chars).
- Busca el token en `adminSessions` (Map en memoria); valida expiración.
- Rolling refresh: extiende `expiresAt` en cada uso.
- Respuestas 401: "Acceso no autorizado" / "Token inválido" / "Sesión inválida o expirada" / "Sesión expirada".

### Endpoints públicos que alimentan los datos del dashboard

**Orders (tab Transferencias)** — escritas vía `saveOrderToDB()` (~línea 1757), llamada desde el flujo de pagos:
- `POST /api/create-payment` (~482), `GET /api/check-payment-status/:clientTxId` (~587), `POST /api/payphone-webhook` (~663), `POST /api/confirm-payment` (~797), `POST /api/send-order-emails` (~1808).
- `payment_status`: `'pending'` si `metodoPago === 'transferencia'`, `'approved'` en otro caso. El admin debe revisar el voucher manualmente — **no existe endpoint para aprobar/rechazar transferencias** actualmente.

**Leads (tab Formularios)** — escritas vía `saveLeadToDB(formType, name, email, phone, data)` (~línea 2407). Valores de `form_type`:

| `form_type` | Endpoint origen |
|---|---|
| `software` | `POST /api/send-software-request` (~1908) |
| `webapp` | `POST /api/send-webapp-request` (~2020) |
| `mobileapp` | `POST /api/send-mobileapp-request` (~2158) |
| `moodle` | `POST /api/send-moodle-request` (~2282) |
| `contacto` | `POST /api/send-contact` (~2712) |
| `marketing` | `POST /api/send-marketing` (~2747) |

El campo `data` guarda el `req.body` completo del formulario como JSON string.

---

## 4. Esquema de datos

### Tabla `orders` (definida en `database_schema.sql`)

```sql
id SERIAL PK
plan_name VARCHAR(255)
amount DECIMAL(10,2)
client_info JSONB          -- metadata completa del pedido
payment_status VARCHAR(50) -- approved | pending | rejected
payment_method VARCHAR(50) -- tarjeta | transferencia
voucher_url TEXT           -- comprobante subido (uploads/ del backend)
transaction_id VARCHAR(255)
created_at TIMESTAMPTZ
```

### Tabla `leads` (no está en `database_schema.sql`, inferida del código)

```sql
id SERIAL PK
form_type VARCHAR   -- software | webapp | mobileapp | moodle | contacto | marketing
name, email, phone
data TEXT/JSONB     -- req.body completo serializado
created_at TIMESTAMPTZ
```

---

## 5. Estado actual del dashboard (actualizado 2026-06-10)

Tab **Pagos** (reemplazó al tab Transferencias):
- Muestra TODOS los pagos (tarjeta PayPhone + transferencia) con tarjetas de resumen (total recaudado, conteos por método, pendientes).
- Filtros por método, estado y búsqueda libre; botón Refrescar.
- Modal de detalle con `client_info` completo y cambio de estado.
- Acciones Aprobar/Rechazar para pagos pendientes (POST `/api/admin/payments/:id/status`).

Limitaciones restantes:
- Sin paginación (trae todas las filas de golpe).
- Sesiones en memoria: reiniciar el backend cierra todas las sesiones admin.

## 6. Próximo módulo: Facturación electrónica SRI

Ver `SRI_FACTURACION_WORKFLOW.md` — plan completo para emitir facturas electrónicas autorizadas por el SRI desde el dashboard (integración directa con open-factura + firma .p12, ambiente de pruebas primero), con autocompletado desde `orders.client_info`.
