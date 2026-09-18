# Undercodeec

Sitio corporativo y plataforma comercial de Undercodeec. El repositorio contiene un frontend Next.js 16, una API Express 5, pagos PayPhone, administración, asistente comercial y el frontend del CRM Hermes.

La facturación electrónica SRI existe como implementación en desarrollo, pero su puesta en operación queda como trabajo futuro. No debe habilitarse en producción hasta completar la certificación en `celcer`.

## Requisitos

- Node.js 22 LTS
- pnpm 10
- MySQL o MariaDB
- Servicios externos y credenciales según [config/backend.env.example](config/backend.env.example)
- API Hermes solo si se utilizará `/admin/crm`

## Desarrollo local

Instala y configura el frontend:

```powershell
pnpm install --frozen-lockfile
Copy-Item config/frontend.env.example .env.local
pnpm dev
```

En otra terminal instala y ejecuta la API:

```powershell
npm --prefix backend install
Copy-Item config/backend.env.example backend/.env
npm --prefix backend run dev
```

Valores locales predeterminados:

- Frontend: `http://localhost:3000`
- API principal: `http://localhost:3001`
- Hermes: `http://localhost:3003/api`

No confirmes archivos `.env`, certificados, contraseñas ni claves privadas. Los ejemplos contienen únicamente marcadores.

## Validación

Antes de integrar o desplegar ejecuta:

```powershell
pnpm lint
pnpm build
npm --prefix backend test
```

Para validar sintaxis de un archivo del backend:

```powershell
node --check backend/server.js
```

La plantilla `config/github-ci.yml.example` ejecuta lint, build, comprobación de sintaxis y pruebas del backend. Para activarla debe copiarse a `.github/workflows/ci.yml` usando credenciales de GitHub con permiso `workflow`.

## Arquitectura

| Área | Ubicación | Responsabilidad |
|---|---|---|
| Next.js | `src/app` | Rutas públicas, administración y proxy Hermes |
| Componentes | `src/components` | Interfaz, asistente y flujos comerciales |
| API | `backend/server.js` | Pagos, chat, autenticación, formularios y administración |
| Datos | `backend/db.js` | Tablas MySQL/MariaDB y compatibilidad de consultas |
| Estado PayPhone | `backend/paymentStateStore.js` | Órdenes, tokens de consulta y aprobaciones persistentes |
| Facturación futura | `backend/invoicing` | Implementación SRI aún no habilitada para operación |

El proxy `/api/hermes/*` usa `HERMES_API_URL` en el servidor. Así el navegador puede conservar `NEXT_PUBLIC_HERMES_API_URL=/api/hermes` sin exponer la dirección interna de Hermes ni depender de una regla externa de Nginx.

## Atribución publicitaria y privacidad

El sitio incluye una capa local de consentimiento para Google Tag Manager y Meta Pixel. El estado inicial de Consent Mode v2 es denegado y las etiquetas opcionales se cargan únicamente después de la elección correspondiente. GTM es la única vía de carga de GA4 para evitar el pageview duplicado que producía la antigua etiqueta directa.

Los enlaces comerciales al número de WhatsApp aprobado solicitan una referencia opaca mediante `POST /api/attribution/whatsapp`. La ruta valida el payload y llama a Hermes con una credencial exclusiva del servidor. Si Hermes no está configurado, responde tarde o rechaza la solicitud, WhatsApp se abre con el mensaje original.

Variables adicionales:

- `HERMES_ATTRIBUTION_KEY`: credencial dedicada que debe coincidir con `AD_ATTRIBUTION_INTEGRATION_KEY` en Hermes.
- `ATTRIBUTION_ALLOWED_ORIGINS`: orígenes web permitidos, separados por comas.
- `ATTRIBUTION_REQUEST_TIMEOUT_MS`: timeout de la llamada servidor a servidor.
- `NEXT_PUBLIC_CONSENT_POLICY_VERSION`: versión que invalida preferencias antiguas cuando cambia la política.

El panel autenticado incorpora `/admin/crm/publicidad` y consume el contrato desplegado de Hermes bajo `/advertising/*`: resumen, estado, configuración, mapeos, métricas, historial del lead, hitos comerciales y revocación. La interfaz muestra “Pendiente de conexión” cuando Hermes todavía no tiene métricas; UnderCodeEC no consulta Google directamente ni almacena una copia del modelo publicitario del CRM.

## Despliegue y rollback

El artefacto debe construirse con `pnpm build` y ejecutarse con `pnpm start`. La API se inicia con `npm --prefix backend start`. El proxy inverso de referencia está en `nginx.conf.example`.

Procedimiento mínimo:

1. Ejecutar todas las validaciones de la sección anterior.
2. Guardar la revisión Git actualmente desplegada.
3. Desplegar frontend y backend desde la misma revisión.
4. Verificar `/`, `/api/health`, `/admin/crm/` y un acceso administrativo sin realizar cobros reales.
5. Si falla una comprobación, volver a la revisión anterior y reiniciar ambos procesos.

Las tablas se crean de forma idempotente al iniciar la API. Antes de cambios de esquema en producción se debe generar una copia de seguridad de la base de datos.

## Alcance pendiente

- Las pruebas automáticas cubren autenticación OTP, playbook comercial y estado local/persistente de PayPhone; las transacciones reales, SMTP, Drive, Gemini/TTS y base de datos requieren un entorno de integración con credenciales.
- La publicación efectiva del CRM depende de desplegar esta revisión y configurar `HERMES_API_URL`.
- SRI permanece como mejora futura hasta disponer de datos del emisor, certificado `.p12` y evidencia completa de autorización, XML, RIDE y correo en `celcer`.

El estado verificable y sus prioridades se mantienen en [markdown/estado-proyecto.md](markdown/estado-proyecto.md).
