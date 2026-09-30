# Plan de implementación Google Ads, WhatsApp y CRM con revisión de Hermes

Fecha de revisión inicial: **28 de septiembre de 2026**. Último corte de ejecución: **29 de septiembre de 2026**, zona `America/Guayaquil`.

**C–F tienen implementación local y G avances parciales:** C conserva first/last consentidos; D prepara ingreso durable de WhatsApp; E registra hitos y recupera el outbox; F añade stop al ejecutar y diagnóstico Data Manager. G mejora la revocación y la normalización sin activar user data. Las migraciones aditivas se aplicaron sólo a DB sintéticas aisladas, nunca a la comercial. A sigue parcial; D/E/F/G necesitan decisiones y validación adicional. H añadió ensayos de recuperación, BFF→Nest→DB y cinco workers BullMQ; no existe GO de lanzamiento.

## Seguimiento por etapas

Última actualización de ejecución: **29/09/2026**, zona `America/Guayaquil`. C–F avanzaron en local; G tiene correcciones parciales y H una pasada de pre-QA sin servicios externos. Este documento conserva la evidencia histórica del 28/09 y separa implementación local, pruebas simuladas y gates aún desconocidos.

| Etapa | Estado actual | Trabajo completado | Trabajo pendiente |
|---|---|---|---|
| Revisión inicial / Implementation Plan | COMPLETADA | Arquitectura local, hallazgos, catálogo de cambios, gates y plan A–H documentados | Actualizar las conclusiones cuando cambie la evidencia |
| A — Verificación externa de solo lectura | **EN CURSO — PARCIAL** | Baseline, 39 pruebas, inventario local e histórico, configuración local sanitizada y lecturas HTTPS públicas | Evidencia actual de VPS, Cloud/Ads, GTM, GA4, Meta, consentimiento y decisiones comerciales/privacidad; detalle en sección 8, fase A |
| B — Correcciones locales P0 | **COMPLETADA EN LOCAL** | Guards de ID en Contacto/Marketing, notificaciones independientes, logs sanitizados y 29 pruebas nuevas; 64 pruebas de regresión/contrato aprobadas en total | Despliegue y verificación productiva siguen en sus gates; no forman parte de este change set |
| C — Contrato de atribución | **IMPLEMENTADA EN LOCAL; despliegue pendiente** | Contrato v2 first/last, `utm_id`, sesión consentida con 30 minutos de inactividad, receptor v1/v2, migración aditiva aplicada sólo en fixture sintético y pruebas de contrato | Migración/despliegue coordinados y verificación productiva; navegador automatizado no disponible en la ejecución de cierre; C.5 |
| D — Correlación WhatsApp/CRM | **IMPLEMENTADA Y PROBADA EN DB AISLADA; cierre pendiente** | Inbox, claim y fixture HMAC/atribución/replay; recuperación tras fallo de atribución en H-E02 | Reinicio real, fallas en otros pasos y validación desplegada |
| E — Cualificación e idempotencia | **IMPLEMENTACIÓN TÉCNICA + DB/REDIS AISLADOS; cierre pendiente** | Hitos/outbox, snapshot, cinco claims SQL, recuperación de cola y cinco workers reales en H-E05 | Regla comercial aprobada, reinicio y otros bordes de caídas distribuidas |
| F — Google Feedback / Data Manager | **IMPLEMENTACIÓN LOCAL + STOP AISLADO; Google pendiente** | Stop en processor con DB/Redis reales, diagnóstico separado, errores de red, status de solo lectura y panel triestado; F-E05 | Fixture `validateOnly` aprobado y Cloud/Ads/destino |
| G — Consentimiento / Enhanced Conversions | **PARCIAL EN LOCAL** | Teléfono internacional del `waId` existente, caducidad de 90 días, reapertura y revocación Meta en portada; G-E01–G-E03 | Política/Terms/EC, versión de despliegue y Tag Assistant; G-E04 |
| H — QA / decisión de lanzamiento | **PRE-QA LOCAL; lanzamiento bloqueado** | Suites, builds y 11 pruebas integradas DB/Redis; BFF→Nest→DB y cinco workers BullMQ aislados; cuatro fallos visuales web preexistentes | Reinicio/caídas restantes, recorrido completo en un caso, gates externos y GO humano; H-E01–H-E05 |

**Cómo actualizar:** `[x]` significa que se ejecutó la tarea en el alcance descrito; `[ ]` significa que está pendiente. La tarea puede estar completada aunque su resultado demuestre una carencia. Un gate sólo pasa a `PASS` cuando se acredita toda su condición. `HISTÓRICO` no acredita estado actual; `PARCIAL` no cierra la fase. Cada actualización debe incluir fecha, entorno, evidencia, resultado y siguiente dependencia. El avance a B–H se registra cuando empiece realmente esa etapa, sin marcar una fase como completa por tener su diseño escrito.

## Corte de ejecución — 29/09/2026

**Decisión actual: NO GO.** La implementación local y el fixture aislado reducen riesgo técnico, pero no sustituyen las decisiones comerciales, legales y de las cuentas externas.

- Hermes: `jest` completo aprobó **53 suites / 909 pruebas**; `nest build`, `prisma validate` y el ESLint acotado aprobaron. La integración D/E aprobó **2 suites / 4 pruebas** contra PostgreSQL y Redis sintéticos, incluyendo migraciones y recuperación de job huérfano.
- Web: selección de consentimiento, navegación y panel aprobó **32 pruebas**; `next build` aprobó con 37 páginas. La suite general registró 177 pruebas: 172 PASS, 4 fallos visuales/CSS preexistentes (servicios/footer/preloader/voxel) y 1 SKIP.
- El fixture usó `ads_d_test_phase_d_20260929` en `127.0.0.1:55433` y `ads_e_test_20260929_redis` en `127.0.0.1:56379`. Sus contenedores se eliminaron al finalizar y Docker Desktop se detuvo. No se usaron la DB comercial, `hermes-postgres` ni `hermes-redis` existentes.
- H-E02 añadió un segundo fixture aislado y llevó las suites D/E a **2 suites / 6 pruebas PASS**; simuló fallo de atribución después de persistir el mensaje y fallo de inserción en BullMQ después del commit del outbox. Sus recursos también se retiraron.
- H-E03 añadió dos casos y ejecutó **2 suites / 8 pruebas PASS** con PostgreSQL/Redis sintéticos: fallo antes del ACK durable seguido de redelivery, y validación del job recuperado mediante HTTP interceptado. Las tablas del fixture y Redis quedaron vacíos; se retiraron los contenedores.
- H-E04 enlazó referencia firmada→mensaje→lead `QUALIFIED`→outbox→HTTP interceptado en un mismo caso Hermes. La nueva ejecución obtuvo **2 suites / 9 pruebas PASS** en DB/Redis aislados; aún falta el tramo web BFF y el worker de cola real.
- H-E05 probó BFF→Nest→DB→webhook firmado y, en otro caso, cinco workers BullMQ contra un solo job SQL: **2 suites / 11 pruebas PASS**. GATE-HERMES-03 pasó en fixture local; el recorrido web→CRM→worker→HTTP en un solo caso permanece pendiente.
- No se aplicaron migraciones ni variables a entornos desplegados; no hubo llamadas Google/Meta ni envíos externos. El POST del fixture se interceptó y bloqueó, con `SEND=false`.
- Aún faltan la regla `QUALIFIED` de Ventas/Marketing, privacidad/retención/Terms/EC, identidades, scopes y destino Cloud/Ads, configuración GTM/GA4/Meta, validación en VPS y pruebas de caída/reinicio (HTTP→DB y expiración de cola). El recorrido completo web→referencia→webhook firmado→CRM→worker→HTTP simulado en un único caso tampoco está certificado.

## 1. Alcance, fuentes y estado de trabajo

Se leyeron el plan original y la auditoría previa, se contrastaron sus referencias con la web y con el backend real disponible en el workspace, y se ejecutaron pruebas con dependencias simuladas. La revisión inicial creó este documento y A lo actualizó. B modifica `backend/server.js` y crea su test. C modifica cinco fuentes web, dos fuentes Hermes, schema Prisma, una migración nueva y tres archivos de pruebas, además de este Markdown; evidencia histórica en C.2 y cierre v2 en C.5. Los cambios preexistentes y de B se preservan.

| Fuente | Estado utilizado | Función |
|---|---|---|
| [Plan original](../implementation_plan.md) | Archivo local preexistente, con cambios del usuario | Define las fases A–H, los gates y el alcance documental. |
| [Auditoría previa](google-ads-tracking-audit.md) | Informe del 28/09/2026 | Fuente principal; sus conclusiones se revisan cuando hay nueva evidencia. |
| Web, `D:\Documentos\undercodeec_nextjs` | `main`, HEAD `ca121ba`, más estado local | Captura, consentimiento, BFF, formularios y UI CRM. |
| Hermes, `D:\Documentos\Hermes` | `main`, HEAD `cc7d88e`, más estado local | NestJS, Prisma/PostgreSQL, Redis/BullMQ, webhook, leads y publicidad. |
| [Atribución y publicidad Hermes](../../Hermes/hermes-backend/docs/advertising-attribution.md), [estado del proyecto](../../Hermes/ProyectMD/estado-proyecto.md), [preflight VPS](../../Hermes/ProyectMD/vps-preflight.md) y [runbook 22/09](../../Hermes/hermes-backend/docs/deployment-vps-runbook-2026-09-22.md) | Informes locales históricos del 17–22/09/2026, incorporados durante A | Antecedentes de despliegue, migraciones, Cloud, identidad y acción Ads; no certifican su estado actual. |
| HTTPS público Hermes y portada UnderCodeEC | GET de solo lectura el 28/09/2026 | Esquema OpenAPI y recurso estático publicado; alcance y hashes en A-E06/A-E07. |
| Documentación oficial Google | Consultada durante esta revisión | Contratos y requisitos de API; no acredita configuración de las cuentas privadas. |

En las referencias siguientes, **W:** identifica una ruta relativa a `undercodeec_nextjs` y **H:** una ruta relativa a `Hermes/hermes-backend`. Las referencias de revisión inicial conservan su numeración histórica; los registros B y C identifican sus cambios actuales. Los nombres de variables se documentan sin sus valores.

### Cambios preexistentes preservados

En la web ya estaban modificados `implementation_plan.md` y presentes sin seguimiento `docs/google-ads-tracking-audit.md` y `.unlighthouse/undercodeec.com/`.

En Hermes ya estaban modificados:

- `src/auto-replies/auto-reply.service.ts` y su spec.
- `src/hermes/commercial-authority.service.ts` y su spec.
- `src/hermes/commercial-catalog.ts`.
- `src/hermes/commercial-claims.ts` y su spec.
- `src/hermes/commercial-policy.service.ts` y su spec.
- `src/hermes/hermes.service.ts` y su spec.

También existían sin seguimiento `src/hermes/monetary-values.ts` y `src/hermes/monetary-values.spec.ts`. No se atribuyen esos cambios a esta revisión. La llamada actual de `AutoReplyService` a la cualificación se evaluó incluyendo esos cambios locales; no se certifica que esa versión esté desplegada.

No se arrancó Express/Hermes contra DB real ni se aplicaron migraciones. A hizo GET públicos sin autenticación ni ejecución de JavaScript. C compiló y arrancó temporalmente Next sólo en loopback para seis comprobaciones en Chrome, con endpoint de atribución simulado y solicitudes externas de la página bloqueadas; el servidor y navegador de prueba se cerraron. No se renovaron tokens, autenticaron solicitudes externas, enviaron mensajes, crearon leads productivos o enviaron conversiones.

## 2. Correcciones a las conclusiones anteriores

| Conclusión anterior | Evidencia adicional | Conclusión actual |
|---|---|---|
| Backend Hermes no inspeccionable | Código disponible en el repositorio vecino | La implementación local ya se revisó. Despliegue, datos y configuración productiva siguen sin verificar. |
| No se puede demostrar un webhook Meta | `H:src/webhook/webhook.controller.ts:20`, `H:src/main.ts:11` | Existe `GET/POST /webhooks/meta/whatsapp` con raw body. |
| Persistencia CRM inferida desde UI | `H:prisma/schema.prisma:844`, `H:src/advertising/advertising.service.ts:60` | Hay tablas y escrituras reales de touch, atribución, conversión y job. No se ha verificado que las migraciones estén aplicadas en staging/producción. |
| Exportador Google desconocido | `H:src/advertising/google-data-manager.service.ts:149` | Existe un único cliente Data Manager y un worker BullMQ. Reutilizar y completar. |
| Hashing de first-party no demostrado | `H:src/advertising/google-data-manager.service.ts:229` | Existe normalización de email y SHA-256 HEX. Falta cobertura y hay una incompatibilidad con el teléfono que crea el webhook. |
| No hay idempotencia publicitaria demostrada | `H:prisma/schema.prisma:915`, `:937`, `:962` | Hay claves únicas y `transactionId` estable. No bastan para impedir reenvíos ni pérdidas entre DB y cola. |
| Campo reCAPTCHA incompatible en Contacto | `W:backend/server.js:653` | Ya hay middleware que transforma `g-recaptcha-response` en `recaptchaToken`, después del parser JSON y antes de las rutas. El fallo por nombre de campo no se sostiene. |

El middleware reCAPTCHA también está presente en HEAD `ca121ba`; esta diferencia es una **corrección de la auditoría**, no un arreglo realizado durante esta revisión ni un cambio posterior demostrado. La protección real de Google, sus claves y su evaluación de tokens no se probaron contra la API.

El prompt antiguo de `Safe Implementation`, que exige aplicar ambos arreglos sin cambios en su evidencia, **debe actualizarse antes de utilizarlo**: `FIX-RECAPTCHA-CONTRACT` queda como verificación de regresión; el arreglo de persistencia de Contacto/Marketing ya se completó en B y no debe aplicarse otra vez sin revisar el estado actual.

## 3. Arquitectura encontrada en Hermes

### 3.1 Registro de intención y referencia

El BFF web agrega `/advertising/contact-intents` a `HERMES_API_URL`. El controlador Nest declara `/api/advertising/contact-intents`. Por tanto la base del BFF debe incluir `/api` o el proxy debe realizar una reescritura equivalente. No hay un prefijo global de Nest que lo agregue automáticamente.

Evidencia: `W:src/app/api/attribution/whatsapp/route.ts:54`, `H:src/advertising/advertising.controller.ts:36`, `H:src/main.ts:11`. Comprobar esta composición con un fixture HTTP; no dar por válidas bases que producirían una ruta sin `/api` o con `/api/api`.

El receptor utiliza `X-Hermes-Attribution-Key`, comparación de longitud/tiempo constante, allowlist de origen cuando hay header `Origin` y cuota compartida en Redis. Si Redis falla, rechaza el registro. Evidencia: `H:src/advertising/attribution-registration.guard.ts:36`.

`createContactIntent`:

1. Genera `UC-` y 22 caracteres base32 a partir de bytes aleatorios.
2. Conserva en DB un HMAC-SHA256 de la referencia y sus cuatro últimos caracteres.
3. Guarda click IDs, cinco UTMs, landing sin query/hash, fecha y cuatro estados de consentimiento.
4. Crea `WHATSAPP_CLICK` con `verified=false` y clave `whatsapp-click:<touchId>`.
5. Devuelve referencia, expiración y sufijo del mensaje.

El TTL por defecto es 10.080 minutos —7 días— y el cálculo admite entre 5 minutos y 30 días. Debe validarse la configuración numérica, porque un valor no numérico puede producir una fecha inválida. `maxUses` es 1 por defecto en Prisma. Evidencia: `H:src/advertising/advertising.service.ts:48`, `:576`, `:601`, `H:prisma/schema.prisma:855`.

**Límite:** crear touch y clic son dos escrituras separadas. Si falla la segunda, la primera queda persistida pero el cliente no recibe la referencia. Un retry crea una nueva intención; no hay Idempotency-Key. El propio servicio Hermes conserva IDs aunque el DTO indique `adStorage=DENIED`; hoy confía en el filtro del BFF. La defensa adicional debe acordarse en el contrato de consentimiento.

### 3.2 Recepción WhatsApp y resolución de referencia

El GET compara `hub.mode=subscribe` y el verify token. El POST rechaza un raw body ausente o firma inválida. La firma se calcula con App Secret y HMAC-SHA256; se compara en tiempo constante. App Secret ausente cierra el acceso. Evidencia: `H:src/webhook/webhook.service.ts:55`, `:72`, `H:src/webhook/webhook.controller.ts:58`.

Después de validar la firma, el controlador inicia `processWebhook` sin esperar su finalización y devuelve `200 OK`. El procesamiento:

1. Comprueba si existe `Message.wamid`.
2. Hace upsert de Contact por `waId`.
3. Obtiene/reabre conversación con advisory lock por contacto.
4. Obtiene/crea el lead de la conversación.
5. Guarda mensaje inbound y publica su actualización.
6. Intenta resolver la referencia.
7. Continúa el flujo de campañas, handoff y respuesta automática.

`claimReference` usa una transacción PostgreSQL y un advisory lock por hash de referencia. Comprueba replay por `inboundMessageId`, existencia, vencimiento y usos; guarda atribución, incrementa consumo y crea `CONVERSATION_STARTED` si hay lead. Las referencias ausentes, inválidas, expiradas o usadas tienen resultados explícitos.

Evidencia: `H:src/webhook/webhook.service.ts:152`, `:171`, `:220`, `H:src/advertising/advertising.service.ts:107`.

**Límites relevantes:**

- La recepción HTTP no está ligada a una aceptación durable del trabajo inbound. Una caída tras el 200 puede perderlo.
- La unique de `wamid` protege la fila; el precheck no serializa todo el procesamiento. La recuperación de una colisión o de un fallo parcial no está demostrada con PostgreSQL concurrente.
- Un fallo de `claimReference` se captura y se continúa. El mensaje ya existe; el replay de Meta sale por el precheck y no vuelve a intentar la atribución.
- Contacto, conversación, lead y mensaje no se crean dentro de una única transacción del flujo completo. Sí hay transacciones y locks parciales; no afirmar atomicidad de todo el recorrido.
- Hay logs que incluyen `waId` y un fragmento de texto. No corresponde afirmar protección total de PII.

### 3.3 Regla actual de cualificación

Existen tres vías hacia `QUALIFIED`:

| Vía | Regla actual | Evidencia |
|---|---|---|
| Operador CRM | `update` acepta una transición permitida a QUALIFIED; no exige todos los datos comerciales mínimos | `H:src/leads/leads.service.ts:381`, `:450` |
| Conversación automática | Necesidad + servicio + al menos un contexto comercial; sólo etapas automáticamente promovibles | `H:src/leads/leads.service.ts:459`, `:602` |
| Reunión confirmada | `recordConfirmedMeeting` promueve el lead elegible de una reunión CONFIRMED | `H:src/leads/leads.service.ts:65` |

El contexto de la vía automática puede ser empresa, sector, ubicación, usuarios, número de productos, pagos, envíos, inventario, integraciones, presupuesto o plazo. Tener intención de compra aislada no basta. La llamada desde AutoReply también aplica su filtro de intención y excluye respuesta diagnóstica. Evidencia: `H:src/auto-replies/auto-reply.service.ts:1154`.

Después del commit, LeadsService emite `lead.qualified` en memoria. AdvertisingListener intenta persistir `LEAD_QUALIFIED`; si falla, escribe un log y termina. **La transición y el evento publicitario todavía no se confirman en la misma transacción.** Una caída o error puede dejar QUALIFIED sin conversión; repetir la misma etapa no vuelve a emitir automáticamente el evento.

Además, `CreateLeadDto.stage` permite crear directamente en QUALIFIED/WON y `create` sólo emite `lead.created`. Un cambio genérico a WON registra etapa/fecha pero no crea `CONTRACT_WON`. El endpoint comercial sí crea CONTRACT_WON y actualiza etapa/importes en su transacción. Hay vías de escritura con semántica distinta. Evidencia: `H:src/leads/dto/create-lead.dto.ts:12`, `H:src/leads/leads.service.ts:140`, `:411`, `H:src/advertising/advertising.service.ts:185`.

### 3.4 Eventos, jobs y exportador existente

| Componente | Garantía existente | Límite |
|---|---|---|
| `AdvertisingConversion` | Unique `idempotencyKey` y `(leadId,eventType)` | Una sola ocurrencia de cada tipo por lead; no modela múltiples contratos legítimos. |
| `AdvertisingSyncJob` | Una fila por `conversionId`, `validateOnly=true` por defecto | No es una outbox transaccional completa del negocio. |
| `recordLeadEvent` | Conversión, datos comerciales y audit log en una transacción | Llama `prepareSync` después del commit. |
| `prepareSync` | Upsert job y BullMQ `jobId=syncJob.id` | DB y Redis separados; no reconciliador encontrado. Reencola jobs existentes sin comprobar estado terminal. |
| BullMQ | 5 intentos, backoff exponencial; retiene completados 7 días con límite 5.000 | La retención de Redis no sustituye la deduplicación permanente de DB. |
| Data Manager | POST `events:ingest`, ADC, scope `datamanager`, `transactionId=idempotencyKey` | Sólo bloquea explícitamente CANCELLED; puede reenviar ACCEPTED/VALIDATED/SUBMITTED. |
| Diagnósticos | GET `requestStatus:retrieve`; SUCCESS/FAILED/PARTIAL_SUCCESS → estados propios | Faltan tests para esos resultados y la recuperación tras caída. |
| Revocación CRM | Marca atribución REVOKED, deniega datos publicitarios y cancela jobs | No revierte conversiones ya recibidas por Google. Carrera durante HTTP pendiente sin prueba. |

Evidencia: `H:prisma/schema.prisma:912`, `:937`, `:962`, `H:src/advertising/advertising.service.ts:245`, `:346`, `:380`, `:419`, `H:src/advertising/advertising.module.ts:18`, `H:src/advertising/google-data-manager.service.ts:49`, `:178`.

El worker no necesita ser reconstruido. Debe cerrarse la ventana de pérdida del evento cualificado, la creación/encolado posterior al commit y la recuperación de jobs pendientes.

### 3.5 Interruptores y alcance real de seguridad

| Control | Dónde se comprueba | Implicación |
|---|---|---|
| Mapping `exportEnabled` | `prepareSync` e `ingest` | Se verifica también al ejecutar. |
| Integración `conversionSyncEnabled` | `prepareSync` | `ingest` no lo revalida. |
| `ADVERTISING_GOOGLE_SYNC_ENABLED` | `prepareSync` | Controla la creación de trabajo en Redis; no detiene por sí solo un worker que ya tiene trabajo. |
| `ADVERTISING_GOOGLE_SEND_ENABLED` | Al crear la fila del job; status endpoint | No se revalida al ejecutar un job antiguo con `validateOnly=false`. |
| `adUserData` | `prepareSync` e `ingest` | Si no está GRANTED, no se exporta. |
| `ADVERTISING_GOOGLE_INCLUDE_USER_DATA` | Constructor del payload | Controla email/teléfono; click IDs pueden ir sin user data. |
| `ADVERTISING_GOOGLE_METRICS_ENABLED` | Reporting y scheduler | Descarga de métricas independiente de ingestión de conversiones. |

**Un status `realSendsEnabled=false` no garantiza que un job antiguo con `validateOnly=false` no pueda enviarse.** El test de la sonda P3 reproduce esa discrepancia con HTTP simulado. Antes de usar los interruptores como barrera de QA deben comprobarse en tiempo de ejecución.

### 3.6 First-party, moneda y estado de UI

El normalizador existente elimina whitespace, convierte email a minúsculas y aplica reglas Gmail/Googlemail; produce SHA-256 HEX en mayúsculas. El teléfono sólo se incluye si ya tiene `+` y dígitos compatibles. El webhook crea `Contact.phone=waId`, que son dígitos sin `+`. En ese caso se omite el teléfono; con click ID puede seguir habiendo elegibilidad, pero no matching telefónico. Sin click ID/email queda `NO_IDENTIFIER`. Evidencia: `H:src/webhook/webhook.service.ts:375`, `H:src/advertising/google-data-manager.service.ts:245`.

El dashboard suma valores de contratos sin agrupar por moneda, y los presenta junto con la moneda de la primera métrica. La ficha de contrato web usa EUR por defecto. Eso puede presentar totales/ROAS incoherentes en Ecuador. Evidencia: `H:src/advertising/advertising.service.ts:500`, `W:src/app/admin/crm/leads/[id]/page.jsx:393`, `:486`.

La UI muestra «Modo seguro» ante ausencia o error de status. `credentialsConfigured` de Hermes sólo verifica presencia de nombres de configuración y no demuestra autenticación ADC. `lastConversionSyncAt` se consume en UI, pero no aparece en el modelo ni en la respuesta implementada revisada. Además, `GET status` llama a `ensureIntegration`, que usa upsert y puede crear la configuración inicial: no tratar ese endpoint como lectura sin escrituras. Evidencia: `W:src/app/admin/crm/publicidad/page.jsx:317`, `:384`, `:386`, `H:src/advertising/advertising.service.ts:540`, `:562`.

## 4. Pruebas ejecutadas y límites de evidencia

Node: `v24.12.0`. Se inspeccionaron las suites antes de ejecutarlas. Son servicios con Prisma, cola, autenticación y HTTP simulados; no se inicializó AppModule.

### T1 — Backend Hermes

Directorio: `D:\Documentos\Hermes\hermes-backend`.

```powershell
node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/advertising/advertising.service.spec.ts src/advertising/google-data-manager.service.spec.ts src/advertising/google-ads-reporting.service.spec.ts src/leads/leads.service.spec.ts src/webhook/webhook.service.spec.ts --silent
```

Resultado: **5 suites aprobadas, 17 tests aprobados**. Cubren emisión/formato de referencia, claim correcto, expiración y replay lógico, ingest mock, request de reporting, creación/reutilización/cualificación de lead, firma HMAC y comportamiento de campañas/handoff.

El test del exportador es un único caso de éxito mock. No acredita aceptación real de Google, diagnósticos, cancelación, estado terminal, hashing, reintentos de red o concurrencia DB. Las suites no sustituyen una compilación global; no se ejecutó build en esta revisión documental.

### T2 — Web

Directorio: `D:\Documentos\undercodeec_nextjs`.

```powershell
node --test --test-reporter=tap tests/attribution.test.mjs tests/consent.test.mjs tests/advertising-dashboard.test.mjs tests/hermes-whatsapp-button.test.mjs
```

Resultado: **22 tests aprobados**. Validan parsing, sanitización, consentimiento, contrato Hermes y enlaces; algunos casos de UI sólo comprueban texto del código. No prueban recepción GA4, estado Ads ni persistencia CRM.

### P1–P4 — Sondas adicionales en memoria

Se ejecutaron desde stdin, sin crear archivos de test. En formularios se extrajeron con el AST de TypeScript el middleware, `saveLeadToDB` y los callbacks de dos rutas; se evaluaron en `vm` con DB, captcha y correo fake. En Hermes se usaron las clases reales mediante `ts-node/register/transpile-only`, con Prisma y cola fake, `accessToken` sustituido y `axios.post` interceptado. No se importó `backend/server.js` completo ni su DB.

| Sonda | Resultado reproducido | Alcance |
|---|---|---|
| P1: alias reCAPTCHA | El token sintético enviado como `g-recaptcha-response` llega al verificador mock como `recaptchaToken` | Confirma la compatibilidad local del middleware; no valida un token Google real. |
| P2: fallo DB | Contacto y Marketing devuelven HTTP 200/success y ejecutan dos correos mock aunque `db.query` falle | Fallo confirmado en ambos callbacks. Con DB fake correcta también hay success. |
| P3: replay/stop | `ingest` de un job ACCEPTED con `validateOnly=false`, integración sync desactivada y configuración de send no habilitada realiza 1 POST mock con `validateOnly=false` | Reproduce ausencia de guard terminal y runtime stop; no hubo request Google real. |
| P3b: preparación | `prepareSync` de ese job terminal añade 1 trabajo a la cola mock y conserva `validateOnly=false` aunque send no esté habilitado | No prueba cuándo BullMQ real admitiría el job: su retención temporal puede impedirlo mientras exista en Redis. |
| P4: teléfono | Sólo dígitos → sin userData; el mismo formato con `+` válido → identificador hash | Confirma la omisión de teléfonos creados por el webhook. |

**No ejecutado:** staging E2E, PostgreSQL/Redis aislados reales, webhook HTTP firmado con cinco replays concurrentes, Google validateOnly, Tag Assistant y DebugView. Se incluyen como aceptación futura. La suite global y sus cuatro fallos de diseño web son resultados de la auditoría previa, no pruebas reejecutadas aquí.

## 5. Reclasificación de hallazgos

Leyenda exigida por el plan:

- **A:** confirmado en código local; el arreglo puede probarse localmente. Que sea A no significa que un cambio CRM/publicitario sea de bajo riesgo.
- **B:** requería inspección Hermes; cubierta en el alcance de código, pendiente operación cuando se indique.
- **C:** requiere cuenta Google Ads/Google Cloud.
- **D:** requiere GTM.
- **E:** requiere GA4.
- **F:** requiere Meta/WhatsApp.
- **G:** requiere definición comercial o revisión de privacidad/legal.
- **H:** no requiere construir/cambiar esa pieza en esta fase.

| Hallazgo original | Clasificación actual | Acción |
|---|---|---|
| Hermes no auditado | B resuelto en código; C/F para operación | Revisar despliegue y migraciones, reutilizar implementación. |
| Contacto: incompatibilidad de token | H | Añadir cobertura de contrato; no aplicar arreglo basado en evidencia refutada. |
| Success sin persistencia | A, RESUELTO LOCALMENTE EN B para Contacto/Marketing | Verificar despliegue posteriormente; otros consumidores del helper conservan revisión pendiente. |
| Webhook ausente/desconocido | H para existencia; A/F para fiabilidad/despliegue | Completar ingreso durable y QA firmado. |
| Correlación referencia | H para algoritmo; A para recuperación | Cerrar fallos parciales; probar PostgreSQL concurrente. |
| Regla Qualified | A/G | Unificar vías, definir aceptación comercial y evento durable. |
| Idempotencia/outbox | A | Completar restricciones existentes, recuperación y guard de envío. |
| Data Manager inexistente/desconocido | H para construcción; A/C para completar | No crear segundo exportador. |
| First/last touch, utm_id | A/G | Contrato versionado web–Hermes y migración aditiva si se acuerda. |
| Query-only y tiempos | A | Capturar search params y separar visita/contacto. |
| Pérdida preconsentimiento | G/A | Aprobar continuidad/retención antes de persistir IDs. |
| GTM/GA4/Ads | C/D/E | Verificar destinos, publicación, imports y objetivos. |
| Enhanced Conversions | A/C/D/G | Reutilizar hash; reparar teléfono y verificar configuración/procedencia. |
| Consent/revocación | A/D/G | Unificar web estática/React y garantías del worker. |
| Formularios/pagos separados | A/G | Definir sistema autoritativo y una integración idempotente con Hermes. |
| Moneda/revenue | A/C/G | Separar moneda, contrato y cobro; no sumar USD/EUR. |
| Unknown vs disabled | A | Triestado explícito y status que refleje jobs/configuración efectiva. |
| PII/RBAC | A/D/F/G | RBAC existe; probarlo. Redactar logs y revisar variables GTM/URL. |
| Timeouts/rate-limit/observabilidad | A | P2 según topología; Redis existe en Hermes, cuota BFF por proceso. |
| Calendly/oportunidad | A/G | Definir evento y reconciliar IDs; no equiparar reserva cliente con hito CRM. |
| Assets/código histórico | H en este cambio | Inventario/limpieza separada, sin cambios de tracking indiscriminados. |
| Valor esperado/puja/multisesión/ajustes | G/C | P3 posterior a datos comerciales y medición fiables. |

## 6. Catálogo de cambios ejecutables

Los archivos siguientes son **allowlists por change set**. B y C ya se ejecutaron localmente, como se detalla en sección 8; las demás allowlists siguen siendo propuestas. Las rutas de nuevos tests/servicios se marcan como nuevas. No hay aprobación implícita de despliegues, cuentas o migraciones productivas.

### FIX-RECAPTCHA-CONTRACT

**Estado: COMPLETADO EN B como verificación local, sin cambio de contrato.** Alias, token canónico, ausente, inválido, score bajo y configuración ausente tienen cobertura permanente en el nuevo test.

- **Prioridad:** P0 de verificación. **Responsable:** desarrollo web. **Riesgo:** bajo. **Clasificación:** H. **Bloqueado por acceso externo:** no para mocks; sí para validación reCAPTCHA real.
- **Problema:** la evidencia de incompatibilidad del plan fue refutada. **Evidencia:** middleware `W:backend/server.js:653`, ruta `:4643`, sonda P1. **Archivos:** sólo nuevo `W:tests/contact-lead-contract.test.mjs`; no parche obligatorio a Form/backend.
- **Cambio mínimo:** cobertura del alias, nombre canónico, token ausente e inválido, sin bypass. **Cambio ideal futuro:** frontend utiliza el nombre canónico conservando compatibilidad con consumidores existentes si se aprueba esa uniformidad.
- **Dependencias:** registrar middleware y mocks sin importar DB. **Tests:** alias→verificador, token canónico prevalece, inválido/ausente rechaza, sin DB/correo. **Criterio de aceptación:** contrato actual demostrado; no documentar el alias como defecto.
- **Rollback:** retirar únicamente el test nuevo si se descarta; no modificar seguridad del captcha.

### FIX-LEAD-PERSISTENCE-BEFORE-SUCCESS

**Estado: IMPLEMENTADO Y PROBADO EN B, alcance Contacto/Marketing local.** El hallazgo siguiente conserva la evidencia previa al arreglo. Despliegue pendiente; otros formularios y deduplicación entre requests permanecen fuera del change set.

- **Prioridad:** P0. **Responsable:** desarrollo web/backend. **Riesgo:** bajo–medio. **Clasificación:** A. **Bloqueado por acceso externo:** no para implementación/mocks.
- **Problema:** Contacto/Marketing ignoran `null` de `saveLeadToDB`. **Evidencia:** `W:backend/server.js:3901`, `:4655`, `:4690`, P2. **Archivos:** `W:backend/server.js` y nuevo `W:tests/contact-lead-contract.test.mjs`. No requiere cambiar Form ni Marketing si se conservan contratos de respuesta.
- **Cambio mínimo:** comprobar ID persistido en ambos callbacks antes de correos/success; ante fallo devolver error, sin éxito cliente. Mantener separados guardado y entrega de correo para que un fallo posterior de email no provoque reenvío de un lead ya aceptado. Evitar cambiar globalmente el helper sin revisar todos sus consumidores.
- **Cambio ideal futuro:** idempotencia por envío y notificación durable/reintentable; conciliación con Hermes en change set propio.
- **Dependencias:** semántica explícita: éxito significa lead persistido; entrega de email tiene diagnóstico independiente. **Tests:** captcha inválido, DB falla, DB correcta, email falla después de guardar; 1 INSERT por request válido y 0 eventos de éxito ante DB fallida. **Criterio de aceptación:** DB failure nunca devuelve `status=success`/`success=true`; DB correcta no induce duplicado por error de correo.
- **Rollback:** revertir sólo el parche del change set desde una copia previa de esos archivos. No usar reset/checkout global ni borrar leads. Revertir reabre el defecto de tracking, por lo que bloquea lanzamiento.

### FIX-ADVERTISING-STATUS-UNKNOWN

- **Prioridad:** P0. **Responsable:** frontend CRM + backend Hermes. **Riesgo:** bajo para UI, medio para contrato status. **Clasificación:** A. **Bloqueado por acceso externo:** no para mocks; producción requiere lectura controlada del entorno.
- **Problema:** null/error equivale a «seguro»; flag global no expresa modo efectivo de jobs antiguos. **Evidencia:** `W:src/app/admin/crm/publicidad/page.jsx:317`, `H:src/advertising/advertising.service.ts:540`, P3. **Archivos:** página publicidad, `W:tests/advertising-dashboard.test.mjs`, `H:src/advertising/advertising.service.ts` y spec.
- **Cambio mínimo:** UNKNOWN/ENABLED/DISABLED; fallo de fetch muestra desconocido. Separar configuración declarada, autenticación no verificada y estado de trabajos. Hacer que GET status no aprovisione integración por upsert.
- **Cambio ideal futuro:** status incluye hora de observación, recuento de jobs reales pendientes y última aceptación verificable; definir `lastConversionSyncAt` o retirar ese campo de UI.
- **Dependencias:** FIX-GOOGLE-RUNTIME-STOP para que disabled sea operativo. **Tests:** loading, timeout, payload incompleto, true/false explícitos, GET sin creación. **Criterio de aceptación:** nunca indicador de seguridad verde cuando el modo es desconocido.
- **Rollback:** revertir la página/contrato conjuntamente; mantener la restricción de envío hasta reconfirmar el estado.

### ATTR-FIRST-LAST-TOUCH

**Estado: IMPLEMENTADO EN LOCAL EN C, 29/09.** El navegador conserva first/last consentidos, `utm_id` opcional y visita/contacto separados. Hermes usa last como touch operativo y guarda first en metadata; la migración aditiva de `utmId` está preparada sin aplicar. Ver C.5.

- **Prioridad:** P1. **Responsable:** web + Hermes + privacidad. **Riesgo:** medio. **Clasificación:** A/G. **Bloqueado por acceso externo:** sí para política; no para código/fixtures.
- **Problema:** un objeto reemplazable pierde first touch y campos; no hay utm_id; visitedAt recibe hora de clic. **Evidencia:** `W:src/components/Attribution/AttributionProvider.jsx:55`, `W:src/lib/attribution/hermes-contract.mjs:30`, `H:prisma/schema.prisma:844`. **Archivos:** provider, params/schema/hermes-contract, JS estático, DTO/service/spec advertising, schema Prisma y nueva migración aditiva sólo si el contrato añade columnas.
- **Cambio mínimo:** contrato v2 con first inmutable, last de campaña coherente, utm_id y `visitedAt` separado de `contactedAt`. No fusionar GCLID de campaña A con UTMs de campaña B para fabricar un touch híbrido. Definir qué significa una URL parcial.
- **Cambio ideal futuro:** historial consentido y selección de touch de atribución explícita. Hermes hoy selecciona la primera atribución confirmada al registrar el evento; documentar si se mantiene ese criterio.
- **Dependencias:** contrato/política aprobados; compatibilidad con clientes v1. **Tests:** A→B, partial→complete, URL sin campaña, recarga, estática→React, denied, payload v1/v2. **Criterio de aceptación:** first=A, last=B completo/coherente; tiempos conservados; no asociación cruzada accidental.
- **Rollback:** activar lector/cliente v1; dejar migración aditiva y datos intactos, sin downgrade destructivo.

### ATTR-QUERY-ONLY

**Estado: IMPLEMENTADO Y PROBADO LOCALMENTE EN C.** `useSearchParams` con observador bajo Suspense captura cambios sólo de query y actualiza last conservando first. Back/forward, query ajena y recarga tienen pruebas de componente; el navegador Chrome real del 28/09 probó sólo v1, y el smoke v2 permanece UNKNOWN por herramienta no disponible en el cierre.

- **Prioridad:** P1. **Responsable:** web. **Riesgo:** medio. **Clasificación:** A. **Bloqueado por acceso externo:** no.
- **Problema:** el efecto depende de pathname, no de search params. **Evidencia:** `W:src/components/Attribution/AttributionProvider.jsx:86`. **Archivos:** provider y nuevo test de navegador `W:tests/attribution-navigation.test.mjs`.
- **Cambio mínimo:** observar parámetros de navegación del router y verificar cambios de History que soporte el producto; aplicar el contrato de touch acordado.
- **Cambio ideal futuro:** funciones de captura compartidas entre React y HTML estático. **Dependencias:** ATTR-FIRST-LAST-TOUCH. **Tests:** misma ruta gclid=A→B, back/forward, query no publicitaria, recarga. **Criterio de aceptación:** el siguiente intent usa el touch esperado y una query ajena no borra atribución.
- **Rollback:** revertir efecto/captura, conservando lectura del storage versionado.

### ATTR-PRECONSENT-CONTINUITY

**Estado: RESUELTO EN EL CONTRATO LOCAL DE C.** Por decisión del usuario del 29/09, no se capturan IDs/UTMs antes del consentimiento; la continuidad entre documentos sólo existe después de aceptar mediante `sessionStorage`, caduca tras 30 minutos sin actividad y se retira al revocar. Una navegación a otro documento antes de consentir pierde la campaña. La validación legal global de regiones/términos continúa en G.

- **Prioridad:** P1. **Responsable:** producto + privacidad + web. **Riesgo:** alto en privacidad. **Clasificación:** G/A. **Bloqueado por acceso externo:** sí, política de tratamiento.
- **Problema:** cambio de documento antes de decidir consentimiento pierde la memoria inicial. **Evidencia:** auditoría previa T4 y captura actual estática/provider. **Archivos:** provider, JS estático, config/schema de consentimiento y test navegación nuevo.
- **Cambio mínimo:** documentar pérdida esperada o aprobar una continuidad concreta en el flujo; no introducir almacenamiento alternativo de IDs como supuesto arreglo neutral. **Cambio ideal futuro:** política regional y retención explícita con evidencia de retirada.
- **Dependencias:** decisión Ecuador/EEE, fase G. **Tests:** llegada etiquetada→navegación→aceptación/rechazo, document navigation y expiración. **Criterio de aceptación:** comportamiento coincide con política aprobada; denied no envía IDs.
- **Rollback:** desactivar continuidad añadida y borrar sólo su estado técnico según política; no conservar IDs rechazados en otro canal.

### FIX-INBOUND-DURABILITY

**Estado: IMPLEMENTADO EN CÓDIGO EN D (29/09), VALIDACIÓN CON DB AISLADA PENDIENTE.** El controller espera `MetaWebhookInbox.createMany(skipDuplicates)` antes del 200; un fallo de DB rechaza la petición para que Meta reintente. Un worker por lease recupera pendientes, fallidos y leases vencidos tras reinicio. Migración aditiva `20260929180000_meta_webhook_inbox` preparada sin aplicar. Pruebas unitarias de ACK y contención de cinco workers pasan; falta ejecutar la prueba integrada sobre PostgreSQL efímero y comprobar el callback real.

- **Prioridad:** P0. **Responsable:** Hermes/backend + IT. **Riesgo:** alto. **Clasificación:** A/F. **Bloqueado por acceso externo:** no para arreglo aislado; sí para validar callback/subscripción real.
- **Problema:** ACK 200 anterior a persistencia; errores quedan en logs. **Evidencia:** `H:src/webhook/webhook.controller.ts:66`, `H:src/webhook/webhook.service.ts:332`. **Archivos:** controller/service/module/spec webhook; nuevos `H:src/webhook/webhook.controller.spec.ts` y `H:test/advertising-flow.integration-spec.ts`; schema/migración sólo si se elige inbox durable en DB.
- **Cambio mínimo:** validar firma y aceptar durablemente el trabajo antes del 200; reusar infraestructura de cola y clave por wamid. Definir respuesta ante falla de persistencia/Redis para permitir reintento. No limitarse a cambiar la firma del callback a async sin tratamiento de errores internos.
- **Cambio ideal futuro:** inbox transaccional con estados/lease y recuperación completa de pasos. **Dependencias:** runtime aislado, política de raw payload y FIX-ATTRIBUTION-RECOVERY. **Tests:** firma mala, raw body alterado, challenge, caída antes/después de ACK, 5 replays y 5 requests concurrentes.
- **Criterio de aceptación:** ningún 200 de aceptación precede al registro durable; tras reinicio se procesa una sola vez lógicamente. **Rollback:** detener consumidor nuevo, conservar inbox, revertir ruta tras drenar/reconciliar de forma controlada.

### FIX-ATTRIBUTION-RECOVERY

**Estado: IMPLEMENTADO EN CÓDIGO EN D (29/09), VALIDACIÓN CON DB AISLADA PENDIENTE.** Touch y WHATSAPP_CLICK se crean en una transacción. El inbox conserva el resultado `missing/invalid/expired/used/confirmed`; ante fallo técnico reintenta el claim sobre el mismo mensaje/lead. Si se interrumpió el enrutamiento comercial, lo reanuda sin recrear el mensaje. Faltan los conteos reales y el ensayo de caída/reinicio en la DB efímera.

- **Prioridad:** P0. **Responsable:** Hermes. **Riesgo:** alto. **Clasificación:** A. **Bloqueado por acceso externo:** no para mocks/DB aislada.
- **Problema:** touch/clic separados y claim fallido no se recupera por replay. **Evidencia:** `H:src/advertising/advertising.service.ts:60`, `:84`, `H:src/webhook/webhook.service.ts:152`, `:220`. **Archivos:** advertising service/spec, webhook service/spec; integración nueva de fase D.
- **Cambio mínimo:** transacción para touch+clic; registrar tarea recuperable por inbound message sin volver a duplicar mensaje/lead. Procesar `used/expired/invalid` como resultado definitivo y fallos técnicos como reintentables.
- **Cambio ideal futuro:** idempotencia de contact-intent por clave de operación si se acuerda web–Hermes; referencia vinculada explícitamente al propósito. **Dependencias:** ingreso durable y contrato TTL. **Tests:** falla segundo INSERT→0 filas; message persistido→claim falla→reintento confirma; dos contactos intentan la misma referencia.
- **Criterio de aceptación:** una referencia tiene una asignación, fallo temporal se recupera y replay no reatribuye otro contacto. **Rollback:** mantener filas existentes y pausar/reconciliar tareas antes de revertir consumidor.

### CRM-QUALIFICATION-CONTRACT

- **Prioridad:** P0. **Responsable:** ventas + marketing + Hermes. **Riesgo:** alto, afecta señal de calidad. **Clasificación:** A/G. **Bloqueado por acceso externo:** sí, definición comercial aprobada.
- **Problema:** operador, IA y reunión tienen requisitos distintos. **Evidencia:** sección 3.3. **Archivos:** `H:src/leads/leads.service.ts` y spec; `H:src/auto-replies/auto-reply.service.ts` y spec; operaciones de reuniones y sus specs si cambian reglas; UI lead sólo si necesita datos nuevos.
- **Cambio mínimo:** acordar necesidad/servicio/contactabilidad/contexto, evidencia y quién confirma; decidir si reunión confirmada equivale a qualified. Registrar reason/source/version de la regla.
- **Cambio ideal futuro:** MQL/SQL separados con evaluación medible, sin equiparar score/tier IA con negocio. **Dependencias:** Sales owner asignado; revisión de cambios locales actuales. **Tests:** perfil incompleto no cualifica, completo sí, operador sin evidencia rechaza si la regla lo exige, reunión/tier aislados no saltan controles.
- **Criterio de aceptación:** una definición escrita y todos los caminos autorizados obedecen la misma semántica. **Rollback:** volver a regla anterior sin reexportar eventos históricos; dejar nuevas evidencias en auditoría.

### FIX-COMMERCIAL-STAGE-EVENT

- **Prioridad:** P0. **Responsable:** Hermes/ventas. **Riesgo:** alto. **Clasificación:** A/G. **Bloqueado por acceso externo:** sí para semántica; no para tests.
- **Problema:** alta en QUALIFIED y transición genérica WON no garantizan su hito comercial. **Evidencia:** `H:src/leads/leads.service.ts:140`, `:411`, DTO create `:12`. **Archivos:** lead service/DTO/spec, advertising service/spec; UI lead si se restringe flujo WON.
- **Cambio mínimo:** crear normalmente en NEW o aplicar el mismo comando validado a cualquier etapa inicial; exigir valor/moneda/referencia para el cierre que genere CONTRACT_WON. Evitar dos autoridades para un mismo hito.
- **Cambio ideal futuro:** comandos de dominio únicos con ocurrencias separadas para contratos legítimos múltiples. **Dependencias:** CRM-QUALIFICATION-CONTRACT, outbox. **Tests:** create QUALIFIED, update QUALIFIED, update WON, comando CONTRACT_WON, repetición y roles.
- **Criterio de aceptación:** toda transición comercial válida tiene evento durable exactamente una vez; WON incompleto no fabrica venta. **Rollback:** revertir validación conjuntamente con UI; conservar eventos existentes y no recrearlos.

### FIX-CONVERSION-OUTBOX

- **Prioridad:** P0. **Responsable:** Hermes + IT. **Riesgo:** alto. **Clasificación:** A. **Bloqueado por acceso externo:** no para DB/Redis aislados.
- **Problema:** evento Qualified posterior al commit; job posterior a conversión; Redis posterior al job. **Evidencia:** listener `H:src/advertising/advertising.listener.ts:13`, `H:src/advertising/advertising.service.ts:346`, `:398`, `:411`.
- **Archivos:** leads service/module/spec, advertising service/listener/module/processor/spec; schema sólo si faltan estados/lease. Nuevo `H:src/advertising/advertising-reconciliation.service.ts` y spec; integración nueva de fase E.
- **Cambio mínimo:** evento durable junto a transición; crear intención de envío durable en la misma transacción apropiada. Completar `AdvertisingSyncJob` como outbox/reconciliador usando las tablas existentes, con claim atómico y recuperación de PENDING/QUEUED huérfanos.
- **Cambio ideal futuro:** snapshot de destino/payload/versión y métricas de antigüedad; dispatcher por lease. **Dependencias:** reglas de negocio y guard terminal. **Tests:** caída tras cada commit/enqueue, Redis caído, reinicio, dos dispatchers, listener falla, conversión antes de atribución.
- **Criterio de aceptación:** negocio/evento/intención durable coherentes; trabajo pendiente recuperable; ningún evento perdido por depender de EventEmitter. **Rollback:** pausar dispatcher, conservar outbox; revertir código sin borrar eventos ni jobs.

### FIX-GOOGLE-TERMINAL-REPLAY

- **Prioridad:** P0. **Responsable:** Hermes. **Riesgo:** alto. **Clasificación:** A. **Bloqueado por acceso externo:** no para mocks; la aceptación Google posterior requiere C.
- **Problema:** ingest no protege estados terminales; replay puede modificar timestamp/valor; un job único no implica un envío único. **Evidencia:** `H:src/advertising/google-data-manager.service.ts:62`, `H:src/advertising/advertising.service.ts:274`, `:398`, P3/P3b.
- **Archivos:** data-manager service/spec, advertising service/spec, processor; nuevo `H:src/advertising/advertising.processor.spec.ts`.
- **Cambio mínimo:** transición/claim condicional de estados en DB; ACCEPTED/VALIDATED/CANCELLED no reingestan; SUBMITTED recupera diagnósticos. Replay del mismo hito conserva timestamp, destino y valor. Resolver colisiones de create por unique/P2002 sin perder el resultado lógico.
- **Cambio ideal futuro:** ajustes explícitos versionados y snapshot inmutable; occurrence/contract ID cuando haya varios contratos. **Dependencias:** outbox, política de ajustes. **Tests:** 5 ejecuciones concurrentes, accepted tras expirar Redis, caída HTTP→DB, update del mismo evento con otro valor.
- **Criterio de aceptación:** 1 evento/1 job lógico; no reenvío de terminal ni ajuste accidental. Una incertidumbre de transporte sólo se resuelve con el mismo ID/payload y reconciliación; no prometer exactamente un request HTTP en toda caída distribuida.
- **Rollback:** pausar ingestión, conservar claves/estado; nunca borrar job accepted para permitir un retry.

### FIX-GOOGLE-RUNTIME-STOP

- **Prioridad:** P0. **Responsable:** Hermes + IT. **Riesgo:** alto. **Clasificación:** A. **Bloqueado por acceso externo:** no para código/mocks.
- **Problema:** los interruptores no se revalidan al ejecutar jobs antiguos. **Evidencia:** sección 3.5 y P3. **Archivos:** data-manager service/spec, advertising service/spec, processor/spec.
- **Cambio mínimo:** inmediatamente antes de HTTP, comprobar mapping, integración, sync global, send global y consentimiento. Si send real está deshabilitado, no emitir un request con validateOnly=false; elegir stop o validación explícita sin cambiar silenciosamente eventos comerciales.
- **Cambio ideal futuro:** estado operativo persistido y observado por workers, contador de trabajos reales y procedimiento para solicitudes ya en vuelo. **Dependencias:** política de stop y outbox. **Tests:** job antiguo false con send apagado, integración apagada, mapping apagado, revoked, configuración cambia antes de dispatch.
- **Criterio de aceptación:** 0 requests reales después de que el worker observe el stop; documentar requests ya en vuelo. **Rollback:** detener workers y reconciliar jobs; no habilitar envíos como paso de rollback.

### GOOGLE-CONTRACT-DIAGNOSTICS

- **Prioridad:** P1. **Responsable:** Hermes + Ads/Cloud. **Riesgo:** medio–alto. **Clasificación:** A/C. **Bloqueado por acceso externo:** sí para validateOnly/destino; no para pruebas.
- **Problema:** contrato existente con cobertura escasa y fallo de red sin HTTP tratado como permanente. **Evidencia:** `H:src/advertising/google-data-manager.service.ts:178`, `:291`, spec de un caso.
- **Archivos:** data-manager service/spec y processor/spec; reporting service/spec sólo para su contrato de autenticación/versionado.
- **Cambio mínimo:** tests de estados oficiales, warning, requestId ausente/invalid, 400/401/403, 429/5xx y timeout/ECONNRESET. Diagnosticar SUBMITTED sin reingestar; validar propietario/IDs/destino. Mantener endpoint GET y enum FAILED, que ya son correctos.
- **Cambio ideal futuro:** diagnóstico estructurado por destino y alertas; reconciliación operativa y clasificación exhaustiva de errores. **Dependencias:** guards/outbox, API habilitada, identidad y acción correctas.
- **Tests:** mocks deterministas y luego fixture aprobado en validateOnly. **Criterio de aceptación:** distinguir VALIDATED de ACCEPTED y HTTP aceptado de procesamiento final; no inventar diagnóstico de requests validateOnly.
- **Rollback:** revertir cliente manteniendo exportación pausada y requestIds; no enviar fixtures en modo real.

### EC-NORMALIZATION

- **Prioridad:** P1. **Responsable:** Hermes + privacidad. **Riesgo:** medio–alto. **Clasificación:** A/C/G. **Bloqueado por acceso externo:** sí para términos/procedencia/configuración.
- **Problema:** teléfonos inbound sin `+` se omiten; hashes tienen poca cobertura. **Evidencia:** `H:src/webhook/webhook.service.ts:375`, `H:src/advertising/google-data-manager.service.ts:229`, P4. **Archivos:** data-manager service/spec; helper nuevo sólo si se acuerda extraer normalización.
- **Cambio mínimo:** normalizador de exportación que convierta wa_id internacional validado a E.164 sin alterar el dato CRM arbitrariamente. Validar procedencia y consentimiento. Reusar SHA-256/HEX existentes.
- **Cambio ideal futuro:** vectores documentados por campo/versión y trazabilidad de consentimiento; no añadir hash/PII a GA4.
- **Dependencias:** consentimiento/términos y decisión de incluir userData. **Tests:** Gmail con puntos/sufijo, otros dominios, whitespace, números con/sin formato admitido, inválidos, denied, flag off, hashes conocidos. **Criterio de aceptación:** formatos admitidos producen hash esperado; inválidos se omiten/controlan sin crear identidad ficticia.
- **Rollback:** desactivar inclusión de userData por procedimiento de operación; conservar matching por click ID autorizado y datos originales.

### CONSENT-POLICY-REVOCATION

- **Prioridad:** P1. **Responsable:** privacidad + web + Hermes. **Riesgo:** alto. **Clasificación:** A/D/G. **Bloqueado por acceso externo:** sí, política y GTM/Tag Assistant.
- **Problema:** versión/renovación divergente, reapertura estática insuficiente, Meta revoke faltante y memoria de touch retenida; contrato acepta fecha sólo dentro de ventana actual. **Evidencia:** `W:src/lib/consent/config.mjs:15`, `W:public/landing-primary/js/consent-attribution.js:201`, `W:src/components/Attribution/AttributionProvider.jsx:88`, `W:src/lib/attribution/schema.mjs:96`.
- **Archivos:** config/ConsentManager/provider/schema/JS estático, tests consent/navigation; advertising service/spec para enforcement/revocación.
- **Cambio mínimo:** misma versión/validez y ajuste reabrible; revoke Google/Meta consistente; limpiar touch en memoria y storage. Aplicar política de IDs también en receptor Hermes. Definir relación entre revocación web y contacto CRM sin uniones inseguras.
- **Cambio ideal futuro:** consent ledger por finalidad/identidad autorizada y retención regional. **Dependencias:** Legal, stop runtime, revisión GTM. **Tests:** nueva sesión, analytics-only, advertising-only, denied, grant→revoke→grant, 91 días, estática↔React, admin SPA, revoke con job en cola.
- **Criterio de aceptación:** estados/default/update correctos y jobs no exportan datos rechazados. **Rollback:** restaurar versión compatible y política previa sin conceder consentimiento por defecto; no recuperar IDs revocados.

### CRM-WEB-LEAD-RECONCILIATION

- **Prioridad:** P1. **Responsable:** backend web + Hermes + ventas. **Riesgo:** alto. **Clasificación:** A/G. **Bloqueado por acceso externo:** sí, sistema de registro y tratamiento comercial.
- **Problema:** formularios/pagos locales carecen de vínculo autoritativo con touch/contacto/lead Hermes. **Evidencia:** `W:backend/db.js:41`, `W:src/components/Contact/Form.jsx:109`, `W:src/components/Marketing/marketingForm.mjs:1`.
- **Archivos:** server/form/MarketingPrimaryContent/marketingForm; contratos attribution; integración Hermes nueva y tests sólo tras diseño de identidad. No editar pagos/facturación sin un change set dedicado.
- **Cambio mínimo:** identificar evento/ID local estable, sistema autoritativo y enlace determinista con consentimiento; envío durable e idempotente a Hermes. **Cambio ideal futuro:** reconciliación de formulario/pedido/contrato/cobro con una oportunidad, múltiples operaciones y auditoría.
- **Dependencias:** persistencia de formulario, contrato touch, definición comercial y privacidad. **Tests:** submit repetido, fallo CRM, dos formularios del mismo contacto, pago repetido, sin touch, denied. **Criterio de aceptación:** un lead lógico trazable y un resultado financiero coherente, sin matching por coincidencia temporal/IP.
- **Rollback:** pausar integración conservando IDs/outbox; no borrar contactos ni alterar pagos aprobados.

### CRM-CURRENCY-VALUE

- **Prioridad:** P1. **Responsable:** finanzas + Ads + Hermes/web. **Riesgo:** medio. **Clasificación:** A/C/G. **Bloqueado por acceso externo:** sí, definición y moneda de cuenta.
- **Problema:** defaults EUR y sumas multimoneda; valor contratado difiere de cobro. **Evidencia:** sección 3.6. **Archivos:** publicidad/ficha lead y tests; advertising service/DTO/spec.
- **Cambio mínimo:** moneda explícita por hito, USD para Ecuador cuando lo confirme negocio; separar métricas/totales por currency, sin ROAS mezclado. Definir importe contractual, ingreso recibido y valor de propuesta.
- **Cambio ideal futuro:** expected value validado por tasa de cierre/margen y ajustes financieros explícitos. **Dependencias:** acciones Google y semántica CONTRACT_WON. **Tests:** USD/EUR juntos, valor 0, moneda ausente, propuesta/contrato/cobro, múltiples contratos. **Criterio de aceptación:** cada valor tiene significado/moneda; no sumar divisas sin una conversión documentada.
- **Rollback:** revertir presentación/validación conservando valores originales; nunca recalcular exportaciones históricas silenciosamente.

### OBS-ATTRIBUTION-OPS

- **Prioridad:** P2, con redacción PII antes de QA externo. **Responsable:** IT + web/Hermes. **Riesgo:** medio. **Clasificación:** A/D/F/G. **Bloqueado por acceso externo:** sí para topología y revisión de logs/variables GTM.
- **Problema:** fallback silencioso, timeouts desalineados, cuota BFF por proceso, logs de mensajes/pagos, retención no demostrada. **Evidencia:** `W:src/lib/attribution/whatsapp-client.mjs:27`, BFF `:96`, `H:src/webhook/webhook.service.ts:254`, `W:backend/server.js:1423`.
- **Archivos:** whatsapp-client/BFF/JS estático, tests attribution; webhook/logger y tests; logging de pagos sólo en change set separado con equipo de pagos.
- **Cambio mínimo:** contadores sin payload/PII, server timeout inferior al cliente, proxy/IP y cuotas correctos; redactar logs relevantes. **Cambio ideal futuro:** métricas de cola/referencia perdida, retention jobs, alertas y reconciliación CRM–Ads.
- **Dependencias:** topología, política de retención y outbox. **Tests:** timeout, storage bloqueado, proxy headers, dos réplicas, payload con PII no aparece en log. **Criterio de aceptación:** degradación observable sin datos sensibles; no afirmar políticas aplicadas sólo por código.
- **Rollback:** revertir instrumentación sin restaurar logging sensible; mantener acceso comercial/fallback.

### CALENDLY-OPPORTUNITY

- **Prioridad:** P2. **Responsable:** ventas + Hermes/web. **Riesgo:** medio. **Clasificación:** A/G. **Bloqueado por acceso externo:** sí, reglas y configuración del proveedor.
- **Problema:** `schedule_complete`, reunión confirmada y oportunidad no tienen equivalencia única aprobada; conversión MEETING_CONFIRMED manual y cualificación por Calendar son caminos distintos. **Evidencia:** `W:public/landing-primary/js/demo-local.js:65`, `H:src/leads/leads.service.ts:65`, advertising operator events.
- **Archivos:** demo-local/tests, servicios de reuniones/advertising y specs si se acuerda reconciliación. **Cambio mínimo:** definir equivalencia y ID de reserva/reunión; evitar contar dos veces un hecho. **Cambio ideal futuro:** Opportunity con ocurrencia/owner y evidencia comercial.
- **Dependencias:** reglas cualificación, APIs proveedor y outbox. **Tests:** reserva repetida, reprogramación, cancelación, reunión de operador y Calendar. **Criterio de aceptación:** un mismo hito tiene un ID y una decisión de exportación. **Rollback:** desactivar integración, mantener reuniones y señales históricas.

### DEFER-P3-OPTIMIZATION

- **Prioridad:** P3. **Responsable:** marketing/finanzas/privacidad. **Riesgo:** alto. **Clasificación:** C/G/H en esta fase. **Bloqueado por acceso externo:** sí.
- **Problema:** faltan datos reconciliados para valor esperado, puja por valor, atribución multisesión y ajustes posteriores. **Evidencia:** límites anteriores y auditoría §§19–20. **Archivos:** ninguno autorizado actualmente; diseño posterior en Hermes y Ads.
- **Cambio mínimo:** mantener propuesta documentada, sin implementar/activar pujas ni fingerprinting. **Cambio ideal futuro:** optimización por calidad/margen con policy de ajustes y matching determinista consentido.
- **Dependencias:** QA A–H, volumen/calidad, owner Ads y finanzas. **Tests:** evaluación offline y conciliación antes de configurar campañas. **Criterio de aceptación:** propuesta futura usa datos comerciales reales; autorización separada para cambio externo. **Rollback:** conservar objetivos/versiones anteriores de campañas y nunca borrar historial para ocultar diferencias.

## 7. Matriz de gates

`PASS` sólo vale para el alcance expresado. `FAIL` es una carencia local demostrada; `UNKNOWN` requiere evidencia. La columna **Externo** identifica cuentas/despliegue/decisiones empresariales fuera del checkout. Un gate local desconocido puede cerrarse con infraestructura aislada, sin acceso productivo.

| Gate | Owner | Evidencia requerida | Estado | Externo | Bloquea |
|---|---|---|---|---|---|
| GATE-HERMES-01 | Hermes | Comprobar si Hermes ya dispone de exportador Data Manager/Google: código, módulo y worker identificados | PASS: existe localmente | No | Construir otro exportador |
| GATE-HERMES-02 | IT/Hermes | SHA desplegado, migraciones aplicadas, ruta base/proxy, workers y flags observados sin secretos | UNKNOWN: rutas públicas observadas hoy (A-E06); SHA/migraciones/runtime actuales pendientes | Sí | Staging productivo y lanzamiento |
| GATE-HERMES-03 | Hermes/web | BFF→Nest→DB aislada devuelve referencia resoluble con IDs correlacionables | PASS en fixture aislado H-E05: Next BFF v2→controlador/guard Nest→PostgreSQL, referencia usada por callback firmado, 1 consumo/atribución/mensaje; despliegue no verificado | No | QA integrado |
| GATE-META-01 | Hermes | Raw body y HMAC presentes; firma válida/inválida cubierta por unit test | PASS: código/unit | No | Certificar existencia del receptor |
| GATE-META-02 | IT/Meta owner | App/WABA/número, callback, suscripción messages, verify challenge y permisos efectivos | UNKNOWN: ruta declarada públicamente (A-E06); registro y permisos Meta pendientes | Sí | Operación inbound real |
| GATE-META-03 | Hermes | Registro durable antes del ACK y recuperación de fallo/replay concurrente | UNKNOWN: fixture firmado, replays y fallo inyectado de escritura antes del ACK PASS D-E05/H-E03; caída/reinicio real pendiente | No | Correlación fiable |
| GATE-ATTR-01 | Hermes | Touch+clic atómicos y claim recuperable tras error | UNKNOWN: fixture PostgreSQL aislado PASS D-E05; fault injection por paso pendiente | No | Atribución fiable |
| GATE-CRM-01 | Ventas/Marketing | Regla Qualified y equivalencia de reunión/operador/IA firmadas | UNKNOWN | Sí | Señal de calidad Ads |
| GATE-CRM-02 | Hermes | Toda transición/alta comercial válida produce hito durable y consistente | UNKNOWN: flujos locales, unit tests y fixture DB E-E05; regla Qualified y escenarios completos de caída pendientes | No | Feedback CRM |
| GATE-OUTBOX-01 | Hermes/IT | Commit negocio/evento/job y reconciliación DB–Redis tras caídas | UNKNOWN: CRM/SQL y job Redis huérfano recuperado en aislado E-E05/H-E02; H-E03 validó HTTP mock tras recuperación; caídas en cada borde pendientes | No | Feedback fiable |
| GATE-DEDUP-01 | Hermes | 5 replays/concurrencia, guard terminal, snapshot estable y colisiones controladas | UNKNOWN: cinco claims SQL, snapshot y Redis E-E05; cinco workers BullMQ y un POST mock PASS H-E05; replay HTTP ambiguo pendiente | No | Evitar envíos/ajustes accidentales |
| GATE-STOP-01 | IT/Hermes | Job antiguo false no envía cuando interruptores actuales están apagados | PASS en fixture aislado E/F-E05: processor+DB+Redis y flag SEND off, 0 POST; despliegue no verificado | No | QA Google y activación |
| GATE-DM-01 | Hermes | Cliente ingest existente, ID estable y validateOnly en test HTTP mock | PASS: contrato mock ampliado F-E02; no valida credenciales ni destino | No | Certificar existencia del dry run |
| GATE-DM-02 | Cloud/Ads owner | Proyecto, API enabled, identidad/scopes, acceso Ads y propietario de acción | UNKNOWN: antecedentes 17/09 y metadata local disponibles (A-E04/A-E05); estado actual pendiente | Sí | Autenticación Google |
| GATE-DM-03 | Hermes/Ads | Fixture aprobado pasa validateOnly; exportador/reintentos corregidos; warnings revisados | UNKNOWN | Sí | Uploads offline |
| GATE-ADS-01 | Ads owner | Auto-tagging y preservación de parámetros en redirects desplegados | UNKNOWN | Sí | Atribución Ads |
| GATE-ADS-02 | Ads owner | Conversion Actions: owner/ID/type/category/count/value/window/destination | UNKNOWN: acción offline identificada históricamente (A-E04); inventario actual completo pendiente | Sí | Destino de feedback |
| GATE-ADS-03 | Ads owner | Primary/Secondary efectivos de cada acción | UNKNOWN: Secondary reportado el 17/09 (A-E04); estado efectivo actual pendiente | Sí | Bidding |
| GATE-ADS-04 | Ads owner | Account-default y goals por campaña; etapa elegida para optimizar | UNKNOWN | Sí | Bidding |
| GATE-ADS-05 | Ads owner | Custom goals sin clics/microeventos usados accidentalmente para pujar | UNKNOWN | Sí | Bidding |
| GATE-GA4-01 | GA4/Ads owner | Enlace propiedad–cuenta correcto y listado de imports | UNKNOWN | Sí | Reporting/deduplicación |
| GATE-GA4-02 | GA4/Dev | Stream correcto y DebugView: una acción/una recepción, sin PII | UNKNOWN | Sí | Medición web |
| GATE-GTM-01 | GTM owner | Export JSON versión Live y mapa evento→trigger→tag→destino | UNKNOWN: script público con referencia al contenedor observado (A-E07); export Live pendiente | Sí | Medición web/consentimiento |
| GATE-CONSENT-01 | Web/privacidad | Versión, validez, reapertura y revocación estática/React consistentes | UNKNOWN: caducidad/reapertura/revoke locales G-E02; versión efectiva de despliegue y navegador/Tag Assistant pendientes | No | QA de consentimiento |
| GATE-CONSENT-02 | GTM/privacidad | Tag Assistant default/update de cuatro señales y navegación pública→admin | UNKNOWN | Sí | Publicación/lanzamiento |
| GATE-LEGAL-01 | Privacidad/empresa | Finalidad/retención/revocación/regiones y Customer Data Terms decididos | UNKNOWN | Sí | Uso first-party y España |
| GATE-EC-01 | Ads/privacidad | Setting EC efectivo, fuentes de user data y procedencia autorizada | UNKNOWN | Sí | Enhanced Conversions |
| GATE-PII-01 | IT/Dev | Logs sin waId/texto sensible; payloads/URLs/GA4 revisados; RBAC probado | FAIL: logging Hermes pendiente; errores DB/SMTP del change set web sanitizados en B | No | QA externo |
| GATE-VALUE-01 | Finanzas/Dev | Valores por moneda y definición de contrato/cobro, sin suma USD/EUR | FAIL | No | Feedback de valor |
| GATE-FORM-01 | Web backend | En Contacto/Marketing, DB failure no devuelve success y email failure no reintenta INSERT ni devuelve falso error | PASS: código y contrato local B-E03; despliegue web pendiente de verificación en H; sin garantía de deduplicación entre requests | No | generate_lead fiable en esos dos formularios |
| GATE-RECAPTCHA-01 | Web backend | Alias actual llega a verificador mock y middleware precede rutas | PASS: contrato local con prueba permanente B-E03 | No | Cerrar hallazgo refutado |
| GATE-QA-01 | QA/Dev | Recorrido web→referencia→fixture firmado→CRM→job→HTTP Google mock | UNKNOWN: H-E04 unió Hermes→HTTP mock; H-E05 probó web BFF→Nest→webhook y cinco workers por separado; falta un único recorrido completo | No | QA final |
| GATE-LAUNCH-01 | Marketing/Dirección | Geo Ecuador, objetivos, presupuesto y GO explícito documentados | UNKNOWN | Sí | Activación de campañas |

**17 gates externos siguen pendientes de cierre con evidencia actual suficiente.** La fase A añade evidencia parcial e histórica a seis de ellos; no convierte ninguno en `PASS` externo. Hay **2 cambios locales acotados** identificados como de bajo riesgo relativo: persistencia antes de success y presentación UNKNOWN en la UI. Sólo el primero pertenece al change set inicial de Phase B; los cambios de contrato/status Hermes y de workers tienen su propia fase/revisión. El arreglo de nombres reCAPTCHA no se cuenta, porque no es necesario según el código actual.

## 8. Fases de implementación

### Phase A — External Read-Only Verification

**Estado de ejecución: EN CURSO — PARCIAL, 28/09/2026.** Se completaron las ocho tareas de inspección/documentación disponibles y quedan ocho grupos de comprobación externa. Ningún cambio de las fases B–H se ejecutó en esta etapa.

**Preconditions:** este documento y repositorios identificados; owners de Ads/GTM/GA4/Meta/Cloud/privacidad disponibles para aportar evidencia. Esta revisión ya cubrió la inspección local de Hermes, no su despliegue.

**Allowed files:** evidencia documental en este plan. En una ejecución posterior, capturas/export sanitizados sólo en una ubicación acordada. **Forbidden files:** todo código fuente, `.env`, credenciales, migraciones, campañas/tags/publicaciones, DB productiva.

**Tests before:** T1/T2 y comparar hashes/estado Git. **Implementation steps:** confirmar SHA/rutas/migraciones sin mutar servicios; obtener GTM Live; inventariar Ads/GA4/imports/goals; verificar callback y permisos Meta; identificar Cloud/destino/identity; cerrar decisiones de negocio/privacidad.

No llamar automáticamente GET status de Hermes como si no escribiera: su implementación actual contiene upsert. No ejecutar el comando manual «sync metrics», porque escribe métricas y configura actividad externa. La validación de credenciales y validateOnly pertenece a Phase F, después de los guards.

**Tests after:** confrontar cada evidencia con gate/owner/fecha/entorno. **Rollback:** no aplica a lectura; retirar únicamente evidencias erróneas, preservando trazabilidad. **Definition of done:** componentes existentes y accesos pendientes separados; ningún UNKNOWN se vuelve PASS por una suposición.

#### A.1 Checklist de ejecución

| Marca | ID | Tarea | Estado / resultado | Evidencia |
|---|---|---|---|---|
| [x] | A-01 | Registrar repositorios, SHA, estado Git y baseline de archivos | COMPLETADA; cambios previos identificados y preservados | A-E01/A-E08 |
| [x] | A-02 | Ejecutar T1 de Hermes con dependencias simuladas | COMPLETADA; 5 suites / 17 pruebas PASS | A-E02 |
| [x] | A-03 | Ejecutar T2 de web con dependencias simuladas | COMPLETADA; 22 pruebas PASS | A-E03 |
| [x] | A-04 | Contrastar componentes existentes y ruta BFF→Hermes en código | COMPLETADA; reutilizar receptor/exportador actuales; base requiere `/api` | Sección 3 y A-E06 |
| [x] | A-05 | Inventariar antecedentes de VPS/Cloud/Ads | COMPLETADA; evidencia HISTÓRICA separada de la actual | A-E04 |
| [x] | A-06 | Leer configuración local permitida y localizar recursos públicos | COMPLETADA; sin autenticación externa ni writes; límites anotados | A-E05/A-E06/A-E07 |
| [x] | A-07 | Actualizar gates y seguimiento por etapas con evidencia fechada | COMPLETADA; 17 gates externos conservan UNKNOWN | Secciones 7, 8 y 12 |
| [x] | A-08 | Verificar la integridad de repositorios y documentación al terminar | COMPLETADA; hashes previos conservados; sólo se actualiza este Markdown | A-E08 |
| [ ] | A-09 | Verificar VPS actual: SHA, imagen, migraciones, rutas y workers/flags | PENDIENTE DE ACCESO; no se dispone de un alias/usuario SSH identificado | GATE-HERMES-02 |
| [ ] | A-10 | Inventariar Cloud y Ads actuales: identidad, APIs, destino, actions/goals/redirects | PENDIENTE DE EVIDENCIA ACTUAL; la metadata local y los informes antiguos no cierran cuentas privadas | GATE-DM-02 y GATE-ADS-01–05 |
| [ ] | A-11 | Revisar GTM Live: versión, tags, triggers, variables y destinos | PENDIENTE DE EXPORT; no se encontró JSON Live en los documentos revisados | GATE-GTM-01 |
| [ ] | A-12 | Verificar GA4: propiedad/stream, enlace Ads, imports y recepción de diagnóstico | PENDIENTE DE ACCESO/EVIDENCIA; no se ejecutó DebugView | GATE-GA4-01/02 |
| [ ] | A-13 | Verificar configuración Meta y evidencia de challenge/suscripción | PENDIENTE DE ACCESO/EVIDENCIA; la ruta pública no acredita registro Meta | GATE-META-02 |
| [ ] | A-14 | Obtener definición comercial aprobada de Qualified y etapa de optimización | PENDIENTE DE DECISIÓN DE VENTAS/MARKETING | GATE-CRM-01; decisión requerida por ADS-04 |
| [ ] | A-15 | Obtener decisiones de privacidad/Customer Data Terms y setting EC efectivo | PENDIENTE DE DECISIÓN/EVIDENCIA; sólo se observaron flags locales | GATE-LEGAL-01/GATE-EC-01 |
| [ ] | A-16 | Recibir evidencia de Consent Mode desplegado en Tag Assistant | PENDIENTE DE DIAGNÓSTICO; leer el script no ejecuta default/update en un navegador | GATE-CONSENT-02 |

La comprobación de `validateOnly` (GATE-DM-03) se mantiene en F; el GO de campañas (GATE-LAUNCH-01) se mantiene en H. Son gates externos del plan completo, pero no pruebas que se deban ejecutar durante A. No se ha cerrado ninguno de ellos.

#### A.2 Evidencia obtenida el 28/09/2026

**A-E01 — Baseline local, 22:01, America/Guayaquil.** Web en `main`, SHA `ca121bac372be7d3806938d5ac200d0e33cf01cb`; Hermes en `main`, SHA `cc7d88e6815b955e40789ee8755f1b17b36da395`. Se tomó un digest SHA-256 agregado del contenido de todos los archivos rastreados y hashes individuales de los archivos preexistentes sin seguimiento relevantes. La lista de cambios previos de sección 1 se conserva. Estos SHA identifican los checkouts, no producción.

**A-E02 — T1, Hermes local.** Se volvió a ejecutar la selección de sección 4: advertising, Data Manager, reporting Ads, leads y webhook. Resultado: **5 suites / 17 pruebas aprobadas**, exit code 0. Prisma, HTTP/Google y cola se simulan. Acredita el contrato probado por esas suites; no prueba DB desplegada, credenciales o entrega externa.

**A-E03 — T2, web local.** Se volvió a ejecutar la selección attribution, consent, advertising dashboard y Hermes WhatsApp button de sección 4. Resultado: **22 pruebas aprobadas**, exit code 0. No se inició Express/Next, no se creó un lead y no se ejecutaron tags reales.

**A-E04 — Antecedentes encontrados en documentos locales, HISTÓRICOS.** El informe de atribución y el estado del proyecto reportan, con fecha **17/09/2026**:

- Proyecto Cloud `p-key-…b9ig` con Data Manager y Google Ads API habilitadas; OAuth/ADC con scopes `datamanager`, `adwords` y `cloud-platform`.
- Consulta GAQL local y, posteriormente, desde producción con HTTP 200; identidad existente con acceso Ads y `Service Usage Consumer`; ADC montado como secreto de solo lectura. Conservar esa identidad en futuras verificaciones; el informe indica que no se cree ni invite una segunda cuenta de servicio.
- Despliegue de atribución con commits `92c834f` y `38e890a`; migraciones `20260916170000_conversation_guard_support` y `20260917123000_advertising_attribution` reportadas como aplicadas.
- Acción `…0817`, «Hermes - Lead cualificado», tipo `UPLOAD_CLICKS`, Secondary; integración y mapping de `LEAD_QUALIFIED` reportados como configurados, con sincronización/envío/métricas apagados.
- Primera validación real Data Manager pendiente; el documento contiene estados generales anteriores que aún indican ADC pendiente y un checklist posterior del mismo día que lo declara completado por el operador. Se conserva esta diferencia como antecedente, sin certificar su vigencia.

El preflight del **21/09** cita el SHA `5c992224aeda2d332098a1ec59e489ea837ed931` y puerto SSH 2223; el runbook del **22/09** cita `8da7d06b4cc6415dd7d8c28444983576b226d424` como referencia de un despliegue futuro. Ninguno demuestra el SHA actual. La plantilla Compose actual publica el backend en `127.0.0.1:3003`, usa env files externos y no permite concluir cómo está montado ADC en la VPS real. Los informes anteriores de puertos expuestos y el template posterior se deben contrastar con el runtime.

**A-E05 — Metadata local permitida.** Se observaron herramientas `ssh`, `gcloud`, Docker y Node disponibles, sin ejecutar operaciones de autenticación o despliegue. No se encontró `%USERPROFILE%/.ssh/config`; esto sólo acredita ausencia de ese perfil, no ausencia de todo acceso SSH.

En el `.env` local de Hermes, `ADVERTISING_GOOGLE_SYNC_ENABLED`, `ADVERTISING_GOOGLE_SEND_ENABLED`, `ADVERTISING_GOOGLE_METRICS_ENABLED` y `ADVERTISING_GOOGLE_INCLUDE_USER_DATA` tienen valor `false`; moneda USD y zona `America/Guayaquil`. El proyecto y la acción configurados coinciden con los identificadores históricos revisados; existen IDs de cuenta objetivo y MCC configurados, sin comprobar su acceso actual. **El archivo al que apunta `GOOGLE_APPLICATION_CREDENTIALS` no existe en esta estación.** Separadamente, existe un ADC de gcloud local de tipo `authorized_user` con refresh token presente; no se imprimió su contenido, no se renovó el token y no se comprobó su vigencia, scopes ni permisos. La presencia de ese otro archivo no resuelve la ruta que tiene configurada Hermes.

En el único `.env` web encontrado entre `.env`, `.env.local` y `.env.production` no se encontraron `HERMES_API_URL` ni `HERMES_ATTRIBUTION_KEY`. No se consultó el entorno del proceso desplegado: las variables pueden provisionarse por otros mecanismos. Por tanto **no se concluye que producción carezca de esas variables**. Se documenta la dependencia para el entorno integrado posterior, sin editar ningún `.env`.

**A-E06 — Lectura HTTPS pública Hermes.** `GET https://hermes.undercodeec.com/api/docs-json` respondió **HTTP 200**, `application/json`, OpenAPI `3.0.0`, **69 paths**, cuerpo de **49 502 bytes**. Se observaron en el esquema `/api/advertising/contact-intents`, `/api/advertising/status` y `/webhooks/meta/whatsapp`. SHA-256 del cuerpo: `dce4100534647547db81e8449348eb6a82a0e2c1c38501dbac9be58e7ea2519c`.

Esta lectura prueba que ese esquema está expuesto hoy en el host público. No ejecuta las rutas comerciales y no acredita su funcionamiento, JWT, challenge, suscripción Meta, DB, worker, permisos Cloud o correspondencia con el SHA local. **No se llamó a `/api/advertising/status`**, cuyo código actual hace un upsert.

**A-E07 — Lecturas HTTPS públicas UnderCodeEC.** La portada `GET https://undercodeec.com/` respondió **HTTP 200**, sin redirección, y referencia `/landing-primary/js/consent-attribution.js`. El HTML inicial no contiene IDs GTM/GA4/Ads ni `dataLayer`; no se infiere por ello ausencia de tags, porque no se ejecutó JavaScript.

`GET https://undercodeec.com/landing-primary/js/consent-attribution.js` respondió **HTTP 200**, **10 892 bytes**; su cuerpo coincide exactamente con el archivo local revisado. SHA-256: `3384b8ff673de25f40e7290b847bffe58d3adaaaa5196f4b90ab8f5a7208b203`. Contiene la referencia al contenedor `GTM-WX7H…` y carga condicional por preferencias. La evidencia acredita ese recurso estático publicado; no acredita el código React desplegado, contenido/version ID de GTM Live, firing de tags, Consent Mode observado ni destinos privados. No se ejecutaron scripts ni se enviaron eventos de analytics/Ads/Meta.

**A-E08 — Verificación de integridad al cerrar la ejecución parcial de A, HISTÓRICA.** En ese momento los digests agregados de archivos rastreados se conservaron respecto de A-E01. B cambia después `backend/server.js`, por lo que el digest web de esta tabla ya no identifica su contenido actual. Se calcularon con SHA-256 agregando, en el orden de `git ls-files -z`, la ruta UTF-8 y los bytes del archivo:

| Repositorio | SHA-256 agregado de archivos rastreados | Resultado |
|---|---|---|
| Hermes | `58e4ebc64042700e5b396f5d10cab990dbb45227ea27852982e250d8097bac26` | SIN CAMBIOS |
| Web | `59f561e2e6b70937a0059f4659e1929dd8a9f4ab07c3ce90b046f6aef554b660` | SIN CAMBIOS |

También se conservan los hashes de `monetary-values.ts`, su spec y la auditoría Markdown preexistente. Este plan continúa sin seguimiento en Git y es el único archivo editado por esta etapa. No se hicieron commits, despliegues ni modificaciones de sistemas externos. La verificación documental comprueba enlaces locales añadidos, las 33 filas de gates, las ocho fases y la concordancia del checklist con el registro de evidencia.

#### A.3 Qué falta para cerrar la fase A

| Dependencia | Evidencia de solo lectura necesaria | Responsable | Siguiente acción al disponer de ella |
|---|---|---|---|
| Acceso VPS existente | Alias/host/usuario identificados; SHA e imagen actuales; lista de migraciones aplicadas; configuración/proxy/flags filtrados | IT/Hermes | Inspeccionar sin restart, deploy, migraciones ni lectura completa de secretos/env |
| Cloud/Ads | Exports o capturas actuales fechadas de APIs, identidad/scopes/permisos, owner/destino y actions/goals/custom goals/auto-tagging | Cloud/Ads owner | Contrastar con A-E04 y cerrar sólo los gates cuya condición completa esté acreditada |
| GTM Live | Export JSON de la versión publicada, con version ID y fecha | GTM owner | Reconstruir mapa evento→trigger→tag→destino, consentimiento y exclusión admin |
| GA4 | Propiedad/stream, enlace Ads, imports y evidencia de diagnóstico sin PII | GA4 owner | Revisar unicidad y destinos; separar capturas recibidas de una prueba ejecutada en esta sesión |
| Meta | Configuración callback/messages, permisos y challenge existente de prueba, con IDs parcialmente ocultos | Meta owner/IT | Contrastar ruta pública con la configuración real, sin enviar WhatsApp ni cambiar la app |
| Qualified / optimización | Definición comercial aprobada, datos mínimos, autoridades y etapa elegida | Ventas/Marketing | Documentar la equivalencia operador/IA/reunión y dependencias de E |
| Privacidad / EC | Finalidades, retención/revocación, Customer Data Terms y setting EC efectivo | Privacidad/Ads | Registrar la decisión y dependencias de G; sin aceptar términos desde esta etapa |
| Consent Mode | Evidencia actual default/update de las cuatro señales, consentimiento/revocación y navegación pública→admin | GTM/Privacidad | Comparar con el comportamiento esperado y registrar GATE-CONSENT-02 |

Se solicitó al usuario identificar el acceso SSH existente o las rutas de exports disponibles, sin pedir secretos. **La falta de respuesta no se trata como acceso concedido ni como evidencia de estado.** Mientras esas dependencias no estén resueltas, A conserva estado `EN CURSO — PARCIAL`. La instrucción posterior de continuar permitió ejecutar B por la excepción de arreglos locales acotados; no cierra A-09–A-16 ni sus gates.

### Phase B — Deterministic Local P0 Fixes

**Estado de ejecución: COMPLETADA EN LOCAL, 28/09/2026.** Se ejecutó el change set inicial de Contacto/Marketing y verificación reCAPTCHA autorizado al solicitar la siguiente etapa. No requiere los accesos privados pendientes de A. La implementación productiva no se certifica con estos tests.

**Preconditions:** aceptación del change set acotado; evidencia P2 vigente. `FIX-RECAPTCHA-CONTRACT` sólo verifica el contrato actual. No depende de publicar GTM o conectar Google.

**Allowed files:** `W:backend/server.js`, nuevo `W:tests/contact-lead-contract.test.mjs`. Si se decide posteriormente uniformar el nombre canónico, autorizar `W:src/components/Contact/Form.jsx` en un change set separado. **Forbidden files:** attribution/consent, Hermes, pagos/facturación, DB schema, env, credentials, dependencias y configuración Ads/Meta.

**Tests before:** ejecutar T2 y el harness seguro equivalente a P1/P2. **Implementation steps:** guardar baseline; comprobar ID guardado en Contacto/Marketing; definir éxito basado en persistencia; tratar correo fallido sin false failure del lead; registrar fallos sin token/PII; añadir tests permanentes relevantes sin importar DB real.

**Tests after:** `node --test tests/contact-lead-contract.test.mjs`, T2 y suite backend ya auditada como segura cuando cambien consumidores compartidos. No arrancar Express para el test: importar `backend/db.js` inicia conexión e inicialización de tablas.

**Rollback:** revertir exclusivamente el change set y test, preservando modificaciones previas. **Definition of done:** falla DB→error y cero correo/success; DB correcta→un lead lógico y éxito; alias/invalid/absent protegidos; cero sistemas externos modificados.

#### B.1 Checklist completado

| Marca | ID | Tarea | Resultado / evidencia |
|---|---|---|---|
| [x] | B-01 | Releer allowlist y conservar cambios previos | Sólo server, test nuevo y este documento; B-E01/B-E05 |
| [x] | B-02 | Ejecutar T2 antes del cambio | 22/22 PASS; B-E02 |
| [x] | B-03 | Reproducir P1/P2 en un harness permanente sin DB real | 29 casos iniciales: 17 PASS y 12 FAIL esperados; B-E02 |
| [x] | B-04 | Exigir ID persistido en Contacto/Marketing antes de correo/success | Error HTTP 500 y cero correos ante DB fallida/ID ausente; B-E03 |
| [x] | B-05 | Separar éxito del guardado y notificaciones | Cada correo se intenta independientemente; SMTP fallido conserva HTTP 200 y un solo INSERT; B-E03 |
| [x] | B-06 | Registrar errores del change set sin mensaje privado de DB/SMTP | Tests con errores sintéticos que contienen token/email/password no aparecen en logs; B-E03 |
| [x] | B-07 | Verificar reCAPTCHA sin cambiar contrato ni frontend | Alias/canónico, precedencia, orden del middleware y rechazo cubiertos; B-E03 |
| [x] | B-08 | Ejecutar regresión web/backend y revisar sintaxis/diff | 53 tests web + 11 backend PASS; script comercial PASS; B-E04 |
| [x] | B-09 | Actualizar gates, integridad y seguimiento por fases | FORM PASS local acotado, RECAPTCHA PASS; A sigue parcial; B-E05 |

#### B.2 Cambio realizado

| Archivo | Cambio | Alcance |
|---|---|---|
| [Backend web](../backend/server.js) | Guard de ID en Contacto (`:4655`) y Marketing (`:4697`); error antes de correos cuando no se acredita guardado; manejo independiente del correo de negocio | Conserva las formas JSON de éxito/error que consume cada frontend |
| `backend/server.js`, helpers `:742` y `:3913` | Logs de fallo de confirmación y DB con texto fijo, sin `err.message`/`error.message` | Retorna el mismo resultado del helper y conserva el comportamiento best-effort de la confirmación; sólo cambia el diagnóstico del error |
| [Pruebas de formularios](../tests/contact-lead-contract.test.mjs) | 29 casos que ejecutan callbacks, middleware y helpers reales extraídos con TypeScript AST en `vm` | DB, assessment reCAPTCHA y SMTP fake; process.env sintético; sin importar servidor/DB ni abrir sockets |
| Este documento | Estado, resultados, evidencias, límites y gates actualizados | Registro de ejecución de B; no modifica el plan original del usuario |

El helper compartido de persistencia conserva SQL, valores, retorno de ID y retorno `null` ante excepción. Sólo se sanea el log de error. Su adaptador MySQL en `backend/db.js` ya transforma placeholders y `RETURNING id` en `insertId`; se leyó sin importarlo y no se modificó.

#### B.3 Evidencias y verificación

**B-E01 — Baseline local, 28/09/2026 23:01, America/Guayaquil.** Web y Hermes conservaban los SHA de A. `backend/server.js` no tenía cambios previos y su SHA-256 era `8c832e1b441f5a8d2d0b9a903ac2622be346008bde2c0c64515513225e8c2e02`; el test nuevo no existía. Se guardaron hashes de los archivos rastreados y los archivos relevantes sin seguimiento ajenos a la allowlist. `.unlighthouse/` queda fuera de ese digest; no se ejecutó ni modificó.

**B-E02 — Antes del arreglo.** T2 volvió a pasar con **22 pruebas**. El test nuevo se ejecutó contra el servidor original: **29 pruebas, 17 PASS y 12 FAIL esperados**. Reprodujo éxito HTTP 200 cuando la DB rechaza o no devuelve ID, HTTP 500 después de guardar si falla la notificación de negocio y exposición del mensaje privado de error SMTP de confirmación. Los valores de prueba son sintéticos; no se usaron datos de clientes.

**B-E03 — Después del arreglo.** Las **29 pruebas nuevas pasan**. Para ambas rutas se cubren: DB que rechaza, filas vacías/ID ausente/ID null, un guardado correcto, fallo del primer y segundo correo, alias del widget, prevalencia del token canónico, token ausente/no string, token rechazado, score bajo y configuración reCAPTCHA ausente. Un caso adicional comprueba parser JSON→middleware de alias→ambas rutas. Los correos se intentan después del INSERT; cuando uno falla no se repite el INSERT ni se devuelve falso fracaso del lead.

**B-E04 — Regresión y comandos ejecutados.** Todo lo siguiente terminó con exit code 0:

```powershell
# Desde D:\Documentos\undercodeec_nextjs: 53 pruebas PASS
node --test --test-reporter=spec tests/contact-lead-contract.test.mjs tests/attribution.test.mjs tests/consent.test.mjs tests/advertising-dashboard.test.mjs tests/hermes-whatsapp-button.test.mjs tests/marketing-form.test.mjs

# Desde D:\Documentos\undercodeec_nextjs\backend: 11 pruebas PASS + script comercial PASS
npm test

# Desde la raíz web
node --check backend/server.js
git diff --check -- backend/server.js
```

Son **64 pruebas de Node aprobadas en el conjunto posterior al cambio**, más el script de assertions comercial. Los 22 casos de T2 iniciales no se vuelven a sumar. No se ejecutó la suite web global ni se requiere build Next para este cambio exclusivo del backend CommonJS. El `git diff --check` global señaló espacios finales preexistentes en `implementation_plan.md:11–15`; la revisión del archivo cambiado pasa y ese documento del usuario permanece intacto. Los avisos npm por configuración pnpm no impidieron la suite.

**B-E05 — Integridad al cerrar B, HISTÓRICA.** En ese momento se conservaron SHA y contenido ajeno a su allowlist. C modifica después otros archivos de ambos repositorios; sus digests actuales se verifican con C-E06, sin reutilizar estos como baseline de C. Digest SHA-256 agregado, calculado en orden de rutas únicas ordenadas concatenando ruta UTF-8 y bytes, excluyendo los tres archivos permitidos de B y `.unlighthouse/`:

| Repositorio | Digest del contenido preservado | Resultado |
|---|---|---|
| Web | `ab927eaaa54fc5438fcea68b19cac32608037ce19750fe957190cac6c2d4af0d` | SIN CAMBIOS FUERA DEL CHANGE SET |
| Hermes | `3e9e8a167d797138086eb94fd8cccdf95153e8e1286a7ba948ad123b8983e185` | SIN CAMBIOS |

No se editaron `.env`, credenciales, schema, dependencias, frontend, pagos ni código Hermes. No se aplicaron migraciones, hicieron commits/despliegues, enviaron correos reales, crearon leads productivos ni modificaron Google/Meta/GTM.

#### B.4 Límites, rollback y siguiente etapa

El cierre de B significa **corrección del contrato local de Contacto/Marketing**, con DB/SMTP/reCAPTCHA simulados. No demuestra el despliegue, una inserción real, entrega de correo, recepción de `generate_lead` en GA4 o creación de un lead en Hermes. El frontend Contacto sólo emite `generate_lead` después de `response.ok` y `status=success`; el helper Marketing exige respuesta exitosa. No se cambiaron esos consumidores.

Un INSERT por request en el test no garantiza idempotencia entre dos requests, pérdida de respuesta HTTP o doble clic. Los correos siguen sin outbox/reintento durable; un fallo SMTP queda en el log saneado. Las rutas de Software (`:3430`), WebApp (`:3547`), MobileApp (`:3681`) y Moodle (`:3806`) todavía ignoran el ID de `saveLeadToDB`; se identificaron al revisar consumidores y quedan para un change set posterior de persistencia de esos formularios. Su cierre no se incluye en B ni se atribuye al PASS acotado de FORM-01. El gate PII global sigue FAIL por los hallazgos pendientes en Hermes y otros flujos.

Para revertir B, revisar y revertir únicamente sus hunks en `backend/server.js` y el test creado, preservando cambios posteriores y los preexistentes; actualizar FORM-01 y el estado de B. El hash de B-E01 permite comprobar la restauración del servidor original si no hay cambios posteriores. No usar reset global ni borrar leads; el rollback reabre el defecto de éxito sin guardado.

**Siguiente etapa de implementación: C — Attribution Contract.** Antes del cambio dependiente se deben fijar las decisiones de first/last touch, campañas parciales, tiempos y continuidad/retención preconsentimiento descritas en sus preconditions. C no se ejecutó durante B. Las evidencias externas de A continúan pendientes y conservan sus estados.

### Phase C — Attribution Contract

**Estado de ejecución: IMPLEMENTADA EN LOCAL, 29/09/2026.** Las nueve tareas del 28/09 y las cinco tareas dependientes de C se ejecutaron tras la decisión del usuario del 29/09. Se añadió una columna y una migración aditiva aplicada sólo en el fixture sintético D-E05, nunca en un entorno desplegado. La evidencia de navegador real del cierre y la verificación desplegada permanecen pendientes; ver C.5.

**Preconditions:** definición de first/last, campañas parciales, tiempo de visita/contacto, continuidad preconsentimiento y compatibilidad v1/v2. Privacidad decide conservación/retención antes del cambio dependiente.

**Allowed files W:** `src/components/Attribution/AttributionProvider.jsx`, `src/lib/attribution/params.mjs`, `schema.mjs`, `hermes-contract.mjs`, `src/app/api/attribution/whatsapp/route.ts`, `public/landing-primary/js/consent-attribution.js`, tests attribution y nuevo navigation test.

**Allowed files H:** `src/advertising/dto/advertising.dto.ts`, `advertising.service.ts`, spec, `prisma/schema.prisma` y una migración nueva aditiva sólo tras cerrar contrato. **Forbidden files:** migraciones históricas/editadas, configuración/env, exportador Google, campañas y motores comerciales.

**Tests before:** T1/T2. **Implementation steps:** fixture contrato versionado; separar datos y timestamps; first/last sin mezclas de campañas; añadir utm_id acordado; observar query-only; alinear ambas experiencias; mantener filtros denied. Preparar migración revisable, sin ejecutarla en producción.

**Tests after:** URL A→B, navegación sin campaign, recarga, back/forward, partial UTMs, consent denied/granted/tardío, BFF y DTO v1/v2. **Rollback:** cliente v1/lector compatible, mantener columnas aditivas. **Definition of done:** touch coherente/estable por política y contrato compatible en web y Hermes.

#### C.1 Checklist de ejecución

| Marca | ID | Tarea | Estado / evidencia |
|---|---|---|---|
| [x] | C-01 | Registrar SHA, estado y hashes; preservar B y cambios previos | COMPLETADA; C-E01/C-E06 |
| [x] | C-02 | Ejecutar T1/T2 y contrato de formularios antes de cambiar | COMPLETADA; 51 pruebas web y 17 Hermes PASS; C-E02 |
| [x] | C-03 | Observar query-only sin forzar toda la página a Suspense | COMPLETADA en snapshot v1; test de componente y Chrome/Next local; C-E03/C-E05 |
| [x] | C-04 | Separar hora de visita de hora de contacto | COMPLETADA con `visitedAt` opcional y fallback legado; C-E03 |
| [x] | C-05 | Alinear metadata estática/React y evitar mezcla entre snapshots | COMPLETADA; filtros, landing y tiempo de visita coherentes, sin almacenamiento alternativo; C-E03 |
| [x] | C-06 | Rechazar persistencia de IDs/UTMs en Hermes sin adStorage GRANTED | COMPLETADA para DENIED/UNSPECIFIED; Prisma mock prueba ausencia de campos; C-E03 |
| [x] | C-07 | Verificar clientes actuales, mapper y DTO estricto | Verificación v1 del 28/09 en C-E03; receptor v2 añadido después en C-E07 |
| [x] | C-08 | Ejecutar regresión, lint, build y navegador local | COMPLETADA; 92 tests Node/Jest, 6 casos Chrome, 37 páginas compiladas; C-E04/C-E05 |
| [x] | C-09 | Actualizar estado, gates, límites y comprobar integridad | COMPLETADA; C-E06 y este registro |
| [x] | C-10 | Cerrar semántica de first/last y de campañas parciales | Decisión del usuario 29/09: first elegible inmutable, last de campaña más reciente, parcial independiente |
| [x] | C-11 | Cerrar continuidad/retención y retirada de memoria antes/después del consentimiento | Decisión del usuario 29/09: sólo tras aceptar, sesión de pestaña, 30 minutos sin actividad y borrado al revocar |
| [x] | C-12 | Implementar fixture y contrato v2 con first/last y `utm_id` | Implementado en React, portada estática, BFF y mapper; pruebas C-E07 |
| [x] | C-13 | Ajustar DTO/persistencia v2 y preparar migración aditiva si se necesitan columnas | DTO v1/v2 y servicio Hermes; `utmId` en schema Prisma y migración nueva aplicada sólo en fixture sintético, no en despliegue; C-E07/D-E05 |
| [x] | C-14 | Completar QA local first/last, v1/v2 y consentimiento tardío según la política elegida | Pruebas de contrato y navegación simulada; build/lint PASS. El navegador real de esta revisión quedó UNKNOWN por herramienta no disponible; C-E08/C-E09 |

#### C.2 Cambios y contrato v1 implementados el 28/09 (registro histórico)

| Archivo | Cambio ejecutado | Límite |
|---|---|---|
| [Provider de atribución](../src/components/Attribution/AttributionProvider.jsx) | Observador de `useSearchParams`/pathname bajo Suspense; captura de query-only; fecha de visita tomada del touch; tolera storage bloqueado | Conserva un único snapshot y el almacenamiento v1 existente |
| [Helpers de parámetros](../src/lib/attribution/params.mjs) | Lectura sanitizada de snapshot, fecha válida y captura sin fusionar campañas; URL sin campaña conserva snapshot; recarga idéntica conserva su fecha | No incorpora `utm_id`, first/last ni una nueva duración de retención |
| [Schema del BFF](../src/lib/attribution/schema.mjs) | `visitedAt` opcional, fecha válida y no posterior a `occurredAt`; denied elimina IDs/UTMs y usa hora de contacto como fallback | Mantiene el resto del contrato y whitelist; no acepta campos v2 |
| [Mapper Hermes](../src/lib/attribution/hermes-contract.mjs) | Envía `visitedAt` conservado cuando existe, con fallback a `occurredAt` del cliente legado | Usa el campo que ya admite el DTO Hermes |
| [Script de la portada](../public/landing-primary/js/consent-attribution.js) | Mismos filtros de click ID, metadata completa de sesión, fecha estable y snapshot vigente al construir intent | No publica assets ni crea continuidad entre documentos previa al consentimiento |
| [Servicio Hermes](../../Hermes/hermes-backend/src/advertising/advertising.service.ts) | Sólo incluye gclid/gbraid/wbraid y los cinco UTMs cuando `adStorage=GRANTED` | Referencia, metadata operativa y evento de clic conservan su funcionamiento; no cambia exportador ni outbox |
| [Test de atribución](../tests/attribution.test.mjs), [test de navegación](../tests/attribution-navigation.test.mjs), [spec Hermes](../../Hermes/hermes-backend/src/advertising/advertising.service.spec.ts) | 24 casos nuevos en total: 18 web y 6 Hermes; harness de hooks/router, VM estática y ValidationPipe real | Tests usan datos, DB y HTTP simulados; el test SSR usa React real |

El contrato de navegador sigue usando `occurredAt` como hora del contacto. El nuevo `visitedAt` es **opcional**: conserva la hora `capturedAt` del snapshot; el mapper transmite esa visita al campo existente de Hermes. El evento `WHATSAPP_CLICK` de Hermes mantiene su hora de creación/recepción servidor. No se añadió un campo `contactedAt` en DB ni se declara persistida la hora de contacto cliente exacta.

Los clientes antiguos sin `visitedAt` siguen siendo válidos para el BFF nuevo, que mantiene el fallback previo. Los clientes nuevos necesitan la versión nueva del BFF, porque el BFF antiguo rechaza campos desconocidos; preparar un despliegue coordinado de BFF y assets/React. Esta sesión sólo produjo el cambio local. El DTO Hermes no requiere actualización para este campo y se probó con y sin él.

Cuando la nueva URL tiene parámetros publicitarios válidos, reemplaza íntegramente el snapshot actual; no hereda el GCLID de A en una campaña B parcial. Si no contiene campaña válida, conserva el snapshot anterior. Esto conserva la semántica de **un único touch** mientras se decide v2; volver A→B→A no acredita un first inmutable y los tests no lo presentan como tal.

#### C.3 Evidencia y pruebas

**C-E01 — Baseline local, 28/09/2026 23:15, America/Guayaquil.** Los SHA siguen siendo los de A/B. Se registraron hashes de los archivos permitidos y un digest del resto de cada repo, incluyendo el servidor y test de B. Ningún archivo de atribución ni servicio advertising tenía cambios previos; los cambios comerciales de Hermes se conservan.

**C-E02 — Antes de implementar.** Selección web de T2 más el test de B: **51/51 PASS**. Selección Hermes de T1: **5 suites / 17 pruebas PASS**. Los resultados históricos anteriores no se volvieron a sumar.

**C-E03 — Cobertura del cambio.** Después: **69 pruebas web y 23 Hermes, todas PASS**. Los 18 casos web nuevos cubren metadata/captura/tiempos, query-only, snapshots parciales, back/forward, reload, consent denied, storage bloqueado, estática↔React y Suspense SSR. El scheduler de hooks simula el router y ejecuta el componente real; la VM ejecuta el script estático real con DOM/storage/fetch fake. Los 6 casos Hermes nuevos cubren DENIED/UNSPECIFIED, hora de visita frente a clic, DTO con/sin visita y rechazo estricto de `schemaVersion=2` no implementado. Los contratos existentes siguen aprobados. No es una prueba de PostgreSQL real.

**C-E04 — Compilación, lint y sintaxis.** `next build` de Next **16.1.2**, con telemetría de build desactivada, terminó con exit code 0: compilación, TypeScript y **37/37 páginas estáticas** generadas. Lint de provider/helpers web y servicio/spec Hermes pasó; Prettier se aplicó sólo al spec permitido de Hermes. Sintaxis JS y revisión scoped del diff pasaron. El aviso de antigüedad de Browserslist no impidió el build; no se actualizaron dependencias. `next-env.d.ts` y `tsconfig.json` conservaron su contenido.

```powershell
# Raíz web: 69 pruebas PASS
node --test --test-reporter=spec tests/attribution.test.mjs tests/attribution-navigation.test.mjs tests/consent.test.mjs tests/advertising-dashboard.test.mjs tests/hermes-whatsapp-button.test.mjs tests/contact-lead-contract.test.mjs
node node_modules/eslint/bin/eslint.js src/components/Attribution/AttributionProvider.jsx src/lib/attribution/params.mjs src/lib/attribution/schema.mjs src/lib/attribution/hermes-contract.mjs
$env:NEXT_TELEMETRY_DISABLED='1'
node node_modules/next/dist/bin/next build
node --check public/landing-primary/js/consent-attribution.js

# Hermes/hermes-backend: 5 suites / 23 pruebas PASS
node node_modules/jest/bin/jest.js --runInBand --runTestsByPath src/advertising/advertising.service.spec.ts src/advertising/google-data-manager.service.spec.ts src/advertising/google-ads-reporting.service.spec.ts src/leads/leads.service.spec.ts src/webhook/webhook.service.spec.ts --silent
node node_modules/eslint/bin/eslint.js src/advertising/advertising.service.ts src/advertising/advertising.service.spec.ts
```

**C-E05 — Navegador real local.** Se inició temporalmente Next con la imagen compilada en `127.0.0.1:3127`. Puppeteer/Chrome **148.0.7778.97**, headless, comprobó seis casos: captura inicial, `history.pushState` cambiando sólo query, back, forward, `replaceState` con query ajena y reload con fecha de visita conservada. **Resultado: PASS.** Hubo **cinco requests sintéticos** de contacto interceptados y respondidos por un mock en el navegador, sin llamar al BFF real ni a Hermes. Las **siete solicitudes externas de la página se bloquearon** y `window.open` fue sustituido por un destino ficticio: cero WhatsApp externo, leads productivos y conversiones. El navegador se cerró y el servidor de prueba se detuvo. Es una prueba frontend/Next de navegador, no web→DB→Google ni GTM/GA4 Live.

El observador sigue el patrón documentado para [useSearchParams con Suspense](https://nextjs.org/docs/app/api-reference/functions/use-search-params). La integración de History con hooks del router está descrita en [Native History API de Next](https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api) y se verificó en el navegador local.

**C-E06 — Integridad del alcance al 28/09 (histórica).** En esa ejecución sólo se editaron los diez archivos inventariados en C.2, contando este plan y el test nuevo; seis eran fuentes de aplicación y tres pruebas. Los digests siguientes corresponden a ese momento anterior al cierre v2 del 29/09, no al estado actual:

| Repositorio | Digest preservado | Resultado |
|---|---|---|
| Web | `a253d0bffb1f97ef911dfa07751e9f280211c347b4ae0eebacde4a60e5fa0c41` | SIN CAMBIOS FUERA DEL CHANGE SET |
| Hermes | `cc3fdd780c0adc6dfdac9b568574728e000684399f52739115cdef0901c36c6d` | SIN CAMBIOS FUERA DEL CHANGE SET |

No se editaron el BFF route, DTO, schema Prisma, migraciones, `.env`, keys, exportador, campañas, motores comerciales ni dependencias. `.next` contiene artefactos generados de build fuera de Git. No se hicieron commits ni despliegues.

#### C.4 Política elegida para v2

El usuario aprobó el 29/09 la propuesta conservadora de first/last y sesión consentida, con caducidad de 30 minutos sin actividad. Se concretan así las reglas locales:

| Tema | Regla implementada | Límite |
|---|---|---|
| First touch | Primer snapshot publicitario después de aceptar, estable durante la sesión válida | El v1 previo representa un touch conocido, no un historial first/last reconstruido |
| Last touch | Última URL etiquetada distinta; query ajena no sustituye campaña y recarga idéntica conserva fecha | Repetir exactamente URL y ruta no registra otra visita de campaña |
| URL parcial | Nuevo snapshot independiente sin heredar IDs/UTMs de A | Evita un GCLID A asociado a campaña B |
| Tiempos | Cada touch tiene `visitedAt`; `occurredAt` es hora del contacto cliente | El evento `WHATSAPP_CLICK` conserva hora del servidor |
| `utm_id` | Opcional, validado como UTM; columna `utmId` para last y metadata para first | No se inventa ni se usa como identidad personal |
| Antes de consentir | No conservar touch publicitario en memoria ni storage; si cambia de documento antes de aceptar, se pierde | Sólo puede capturar la URL todavía visible al aceptar |
| Retención/retirada | `sessionStorage` de pestaña, invalidez tras 30 minutos sin actividad; borrar estado v1/v2 al revocar | La purga por caducidad ocurre en el siguiente acceso; una pestaña suspendida puede conservar bytes hasta entonces. No hay continuidad entre pestañas |
| Compatibilidad | BFF/Hermes aceptan v1 y v2; v1 permanece un touch único | Desplegar receptor/migración antes del emisor v2 |
| Persistencia | Last en campos operativos de `advertising_touches`, first en metadata JSON; columna aditiva `utmId` | Migración preparada, no ejecutada en DB real |
| Selección comercial | Last web es touch operativo de la referencia; first web queda como contexto | La regla existente de primera atribución confirmada por lead no se modifica |

La decisión de C limita el estado publicitario del navegador; no aprueba Customer Data Terms, Enhanced Conversions, plazos de conservación en Hermes ni tratamiento para España/EEE. Esos puntos siguen en los gates de G y A.

El formato v2 incluye versión explícita y snapshots `firstTouch`/`lastTouch`, cada uno con parámetros filtrados, landing y hora de visita. Denied elimina ambos touches en el BFF y en Hermes; v1 continúa aceptado sin fabricar historial.

**Rollback local de C:** revertir sólo sus hunks preservando B y cambios previos del usuario. Si se aplicó la migración en otro entorno, conservar la columna aditiva y los datos históricos; volver al emisor v1 y al lector compatible. No borrar atribuciones/CRM ni aplicar reset global.

#### C.5 Cierre local v2, 29/09/2026

**C-E07 — Implementación.** `params.mjs` y ambos clientes web conservan first/last en sesión consentida, capturan `utm_id`, eliminan memoria/storage al revocar e invalidan sesiones tras 30 minutos sin actividad (purga física en el siguiente acceso). El schema BFF acepta v1 y v2; v2 valida cada touch, tiempos, whitelist y consentimiento. El mapper envía los dos snapshots separados. El DTO Hermes acepta v1/v2; el servicio persiste last en los campos operativos, `utmId` como columna aditiva y first en `metadata` sólo con `adStorage=GRANTED`. La migración nueva `20260929120000_attribution_v2_utm_id` está escrita y validada por Prisma, sin ejecutar sobre una base real. No se cambiaron exportador, workers, campañas, env ni credenciales.

**C-E08 — Pruebas del cierre.** Selección web de atribución/consentimiento/formularios/dashboard: **85/85 PASS**. Selección Hermes de advertising, Data Manager, reporting, leads y webhook: **5 suites / 26 pruebas PASS**. Web y Hermes lint de fuentes modificadas PASS; `next build` compiló TypeScript y generó 37/37 páginas; `nest build`, `prisma validate` y sintaxis del script estático PASS. La suite web general reportó 174 pruebas: 169 PASS, 4 FAIL de CSS/visual de servicios/footer/preloader/voxel sin archivos de esa área modificados por C y 1 SKIP. Por ello no se declara verde la suite global. Las pruebas del cierre usan reloj/storage/HTTP/Prisma simulados; no prueban DB o red productiva.

**C-E09 — Navegador y despliegue.** Se inició Next local desde el build, pero la herramienta de navegador no ofreció ninguna instancia (`No browser is available`); el servidor se detuvo. No se repitió la prueba Chrome real C-E05 del contrato v1 con el emisor v2: **UNKNOWN** para ese smoke test. El despliegue requiere primero migración aditiva y Hermes receptor, luego BFF y finalmente assets/React emisores; no se ejecutó aquí. QA productiva, consentimiento/GTM Live y gates externos siguen pendientes. Un `PASS` local de C no autoriza inversión ni declara cerrado el circuito Ads→CRM.

**Límite de revocación:** el borrado inmediato de C afecta al estado publicitario del navegador. La revocación de un contacto en Hermes cancela exportaciones y marca estados, pero actualmente conserva los IDs históricos del touch y, con v2, también el first touch en `metadata`. Su política de supresión/retención en backend requiere el gate de G; C no presenta el borrado del navegador como borrado de registros CRM.

### Phase D — WhatsApp/CRM Correlation

**Estado de ejecución: IMPLEMENTADA Y PROBADA EN POSTGRESQL AISLADO; CIERRE PENDIENTE (29/09).**

**D-E01 — Ingreso durable.** `WebhookController.receive` valida HMAC sobre raw body y espera la escritura del inbox PostgreSQL antes de ACK. Los mensajes se identifican por `wamid`; los estados se guardan por hash de payload. `WebhookService.scan` usa claim condicional, token y lease de 5 minutos, procesa pendientes/fallidos y recupera leases tras reinicio. La migración aditiva se aplicó sólo al fixture PostgreSQL sintético D-E05; no está aplicada en ningún entorno comercial o desplegado. Los payloads del inbox contienen datos de contacto: la retención y supresión backend siguen sujetas a G/GATE-LEGAL-01.

**D-E02 — Atribución y recuperación.** `createContactIntent` guarda touch y clic en una única transacción. La atribución devuelve estados finales `missing/invalid/expired/used/confirmed` al inbox. Un error técnico queda `FAILED` para reintento; si el mensaje ya existe, se reintenta el claim sin recrear mensaje/lead. Si falló un paso de enrutamiento posterior al mensaje, se reanuda la ruta comercial con los métodos de encolado/handoff existentes. El error de atribución no bloquea la atención inicial.

**D-E03 — Evidencia local.** `jest` para controller, webhook, advertising y leads: 37 pruebas pasan (ACK/falla de persistencia, challenge, HMAC/bits alterados, recovery simulado, 5 workers concurrentes, estados de referencia y transacción). `nest build`, Prisma validate y ESLint de archivos tocados pasan. `test/advertising-flow.integration-spec.ts` prepara conteos de una referencia/dos contactos/replays secuenciales y concurrentes sin gateways de salida.

**D-E04 — Límite de evidencia inicial.** Al terminar D no había daemon Docker y la integración PostgreSQL no se pudo ejecutar. D-E05 registra la prueba posterior en un contenedor aislado. Persisten los ensayos de caída/reinicio y fallo en cada paso; no se usaron callbacks Meta reales ni se envió WhatsApp.

**D-E05 — PostgreSQL aislado, 29/09/2026.** Se inició Docker Desktop y se creó **sólo** `ads_d_test_phase_d_20260929_pg` en `127.0.0.1:55433`, con base sintética `ads_d_test_phase_d_20260929`. `prisma migrate deploy` aplicó las 17 migraciones en esa base, incluidas C/D/E; **no** se aplicaron a la DB comercial. `test/advertising-flow.integration-spec.ts` pasó (1 test) con HMAC sintético, dos contactos y replays concurrentes; gateways de salida simulados. Después, conteos de `advertising_conversions`, `advertising_sync_jobs`, `meta_webhook_inbox` y `leads` fueron `0|0|0|0`. GATE-META-03 y GATE-ATTR-01 siguen UNKNOWN porque no se inyectaron todas las caídas/reinicios.

**Preconditions:** DB/Redis efímeros sin datos comerciales y red saliente bloqueada; permisos para fixture local, App Secret sintético; callbacks reales sólo en la validación externa posterior.

**Allowed files H:** webhook controller/service/module/spec, nuevo controller spec; advertising service/spec; `leads.service.ts/spec` si la asociación necesita cambios; nuevo `test/advertising-flow.integration-spec.ts`; schema/migración aditiva sólo para persistencia durable aprobada.

**Allowed files W:** BFF/whatsapp-client y tests sólo si hay ajuste de contrato/ruta/timeout. **Forbidden files:** App Secret real, Meta registration/config, mensajes reales, tokens, IA/commercial policy no relacionada y segundo receptor webhook.

**Tests before:** T1; fixtures de HMAC y referencia actuales. **Implementation steps:** aceptación durable antes de ACK; touch+clic transaccionales; recuperación de claim; deduplicación de wamid; no bloquear atención comercial por atribución caída, pero registrar/reintentar su estado.

**Tests after:** challenge válido/inválido, firma válida/mala/body modificado, referencia missing/invalid/expired/used, dos contactos, 5 replays y 5 concurrentes, fallos por paso y reinicio. Verificar counts y IDs en DB aislada.

**Rollback:** pausar consumidor, drenar/reconciliar, conservar inbox/mensajes/referencias. **Definition of done:** 1 mensaje/1 conversación/1 lead aplicable, máximo 1 consumo y hito, cero envío outbound durante fixtures; fallos temporales recuperables.

### Phase E — Qualification and Idempotency

**Estado de ejecución: IMPLEMENTACIÓN TÉCNICA Y VALIDACIÓN DB/REDIS AISLADA; CIERRE PENDIENTE (29/09/2026).**

**E-E01 — Hitos y autoridad CRM.** La creación/transición a `QUALIFIED`, la cualificación por conversación y la reunión confirmada guardan `LEAD_QUALIFIED` y `AdvertisingSyncJob` en la misma transacción del lead. El cierre manual `WON` exige importe positivo, moneda y referencia; guarda `CONTRACT_WON` e intención de envío en esa transacción. `LOST` guarda `CONTRACT_LOST`. La creación directa en `WON` se rechaza. Un cambio posterior del importe/referencia de un cierre registrado se rechaza como conflicto, sin ajuste silencioso. La regla actual de conversación/reunión/manual se conserva hasta recibir la definición aprobada por Ventas/Marketing; esto no cierra GATE-CRM-01.

**E-E02 — Outbox, replay y diagnóstico.** `AdvertisingSyncJob` se crea junto a la conversión y el reconciliador examina conversiones antiguas sin job y jobs `PENDING/QUEUED/RETRYING/SUBMITTED`. Una atribución tardía se enlaza antes de encolar. El procesador reclama el job con una transición condicional; un estado terminal no reingesta. El replay conserva hora, valor y referencia; un conflicto `P2002` recupera el evento lógico existente y comprueba sus valores. El primer destino elegible se guarda en `destinationSnapshot`, columna JSONB aditiva; el cliente usa ese destino en reintentos. Para jobs legados sin snapshot usa el mapping vigente hasta la primera preparación; validar su migración/reconciliación en DB aislada. La recuperación de `SUBMITTED` vuelve a encolar diagnóstico GET sin repetir ingest. Estas defensas no garantizan exactamente una solicitud HTTP ante una caída después de enviar y antes de guardar respuesta.

**E-E03 — Evidencia local.** `jest` completo Hermes: **53 suites / 909 pruebas PASS**; selección de 6 suites relacionadas: **55 pruebas PASS**. `nest build`, `prisma validate` y ESLint de los archivos TypeScript de E pasan. Las pruebas cubren rutas automática/manual/reunión/create, `WON` incompleto, `LOST`, replay con valor distinto, cinco claims concurrentes, cola fallida/completada, Redis simulado caído, atribución tardía, diagnóstico pendiente y estados terminales. HTTP Google/Prisma/cola están simulados; no hubo envíos reales ni cambios de flags.

**E-E04 — Pendientes para cerrar la fase.** La migración `20260929233000_advertising_destination_snapshot` está aplicada **sólo en la DB sintética** de D-E05; producción/despliegue siguen sin tocar. E-E05 cubre commit y recuperación SQL–Redis aislados; H-E05 añadió cinco workers de cola. Faltan fault injection en cada borde, reinicio real y caída HTTP→DB. Tampoco hay decisión escrita de Ventas/Marketing sobre los mínimos de `QUALIFIED` y si la reunión confirmada basta. GATE-CRM-01/02, GATE-OUTBOX-01 y GATE-DEDUP-01 continúan **UNKNOWN**; no se habilita exportación productiva.

**E-E05 — PostgreSQL + Redis aislados, 29/09/2026.** `test/advertising-outbox.integration-spec.ts` pasó **3 pruebas** usando la misma DB sintética y un Redis nuevo `ads_e_test_20260929_redis` ligado sólo a `127.0.0.1:56379`; no se usaron `hermes-postgres` ni `hermes-redis` existentes. Alta `QUALIFIED` y cierre `WON` dejaron una conversión y un outbox por hito; `WON` incompleto dejó el lead en `PROPOSAL`. Cinco claims SQL simultáneos dieron **1 ganador**. Tras borrar deliberadamente el job de la cola sintética, el reconciliador lo regeneró desde SQL con el mismo ID y snapshot del destino. El processor de un job antiguo `validateOnly=false`, con `SEND` actual apagado, produjo **0 POST** (Axios interceptado). Los conteos sintéticos se limpiaron a `0|0|0|0` para conversiones/jobs/inbox/leads. Repetidas juntas, las suites D/E pasaron **2 suites / 4 pruebas**; después se retiraron exclusivamente los dos contenedores de fixture y se detuvo Docker Desktop para restaurar su estado inicial. Estas pruebas no demuestran un envío Google ni exactamente un HTTP ante caída distribuida.

**Preconditions:** Sales/Marketing aprueban regla de cualificación y cierre; D estable; equipo revisa cambios preexistentes de Hermes antes de tocar AutoReply.

**Allowed files H:** lead service/module/DTO/spec, advertising service/listener/module/processor/spec, servicios/tests de reuniones sólo si afecta su regla, AutoReply/spec sólo si se necesita homologar qualification; nuevo reconciliador/spec y test integración. Schema y nueva migración aditiva para estados/lease si el diseño lo exige.

**Forbidden files:** capturas de datos reales, correos/Telegram/n8n outbound durante tests, env, exportaciones productivas y catálogo/claims comerciales ajenos al cambio.

**Tests before:** T1; suites de reuniones/AutoReply específicas después de revisar que son mock. **Implementation steps:** autoridad única de transición/hito; evento en la transacción de negocio; completar tablas actuales como outbox; dispatcher recuperable; freeze de timestamp/valor/destino; conflicto unique controlado; terminal guard.

**Tests after:** manual/automático/reunión/create/update, regla incompleta/completa, WON incompleto, 5 workers/replays, DB/Redis caído, cola expirada, cambio de valor explícito y atribución llegada después del evento. **Rollback:** pausar dispatch; no borrar filas ni cambiar IDs históricos. **Definition of done:** un evento lógico, outbox durable y ausencia de reenvío/ajuste accidental, con recuperación por estado.

### Phase F — Google Feedback / Data Manager

**Estado de ejecución: IMPLEMENTACIÓN LOCAL Y STOP AISLADO; VALIDACIÓN GOOGLE EXTERNA PENDIENTE (29/09/2026).**

**F-E01 — Stop y lectura.** Data Manager reconsulta job, mapping, integración y consentimiento, y comprueba flags `SYNC`/`SEND` antes y después de obtener el token, inmediatamente antes de `events:ingest`. Un job histórico con `validateOnly=false` no genera POST si `SEND` está apagado. El GET de estado de Hermes usa `findUnique`, sin crear integración, y el panel web distingue configuración desactivada de estado desconocido por fallo de lectura. Las solicitudes ya iniciadas antes de observar un stop siguen siendo un límite de concurrencia.

**F-E02 — Contrato y diagnósticos simulados.** `validateOnly=true` acepta respuesta vacía sin inventar `requestId`; un POST real con HTTP 200 sin ID queda en `FAILED/MISSING_REQUEST_ID` para revisión, sin reenvío automático. Se conservan `fieldWarnings`. 400/401/403 quedan permanentes; 429/5xx y `ECONNRESET`/`ETIMEDOUT` se clasifican como temporales. `requestStatus:retrieve` se ejecuta sólo para `SUBMITTED`, mapea `PROCESSING/SUCCESS/PARTIAL_SUCCESS/FAILED` y un error del GET no convierte el job en nuevo ingest. El endpoint POST, `validateOnly` y los estados se contrastaron con la [referencia oficial de events.ingest](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest) y la [referencia de requestStatus.retrieve](https://developers.google.com/data-manager/api/reference/rest/v1/requestStatus/retrieve).

**F-E03 — Evidencia local.** Suite Hermes completa: **53 suites / 909 pruebas PASS**; `nest build` y ESLint de servicios/specs F PASS. Panel web: 2 pruebas de contrato PASS, lint PASS y `next build` de 37 páginas PASS. La suite web general terminó con 177 pruebas: 172 PASS, 4 FAIL de CSS/visual en servicios/footer/preloader/voxel ya observados en C, y 1 SKIP. No se hizo POST a Google; Axios, DB y cola se simularon.

**F-E04 — Límite.** No hay evidencia actual de API/identidad/scopes/acción/propietario/flags en QA ni fixture autorizado para llamar `validateOnly` contra Google. GATE-DM-02/03 continúan UNKNOWN. Ninguna conversión real se envió ni se habilitó.

**F-E05 — Stop integrado aislado.** El último caso de E-E05 llamó el processor real con Prisma/PostgreSQL y BullMQ/Redis aislados, un job `validateOnly=false` y `SEND=false` actual. El guard en Data Manager rechazó `RUNTIME_STOP` antes de `axios.post`; el mock de Axios prohibía cualquier outbound. GATE-STOP-01 pasa en ese alcance aislado; no acredita los flags ni workers desplegados.

**Preconditions:** E estable; runtime stop corregido; env de QA provisionado por IT; Cloud/API/scopes/destino y acción verificados. Resolver consentimiento/first-party de G antes del caso de validateOnly que incluya userData. Aunque F anteceda G en el listado, la validación dependiente espera sus gates.

**Allowed files H:** cliente Data Manager/spec, processor/spec, advertising service/spec; reporting/spec sólo si una evidencia confirma gap. **Allowed files W:** publicidad page/tests para triestado y contrato status; API helper únicamente si cambia ese contrato. **Forbidden files:** segundo cliente Google, UploadClickConversions nuevo, conversiones reales sintéticas, edición de acciones/goals/campañas, secretos.

**Tests before:** T1, sondas P3/P3b convertidas en tests, revisión de todos los jobs/flags de QA. **Implementation steps:** runtime guards; estados/errores/diagnósticos; status sin upsert; mocks; preparar fixture aprobado con IDs sintéticos sólo para pruebas permitidas de validación; `validateOnly=true` explícito. Revisar HTTP/warnings y detenerse antes de envío real.

Un request validateOnly correcto no prueba atribución comercial ni estado ACCEPTED. Los diagnósticos posteriores reales requieren otro caso legítimo y autorización para el evento externo; no usar QA para generar ventas/conversiones artificiales.

**Tests after:** mocked 429/5xx/timeout/auth/schema/diagnostics; 0 request real con flag off; validación Google sin aplicar cambios cuando exista acceso y se autorice ese fixture. **Rollback:** detener trabajadores/salida externa, preservar requestIds y jobs; revertir código sin abrir send. **Definition of done:** contrato mock completo y evidencia validateOnly, distinción VALIDATED/SUBMITTED/ACCEPTED, ninguna conversión real de QA.

### Phase G — Consent / Enhanced Conversions

**Estado de ejecución: PARCIAL EN LOCAL; POLÍTICA Y VALIDACIÓN EXTERNA PENDIENTES (29/09/2026).**

**G-E01 — Identificadores en exportación.** Con `ADVERTISING_GOOGLE_INCLUDE_USER_DATA=true` y `adUserData=GRANTED`, el exportador normaliza el `phone` existente a E.164 si ya tiene `+` válido o si coincide exactamente con el `waId` internacional guardado por el webhook; rechaza dígitos CRM arbitrarios sin procedencia corroborada. Hashea SHA-256/HEX sin modificar el teléfono CRM. La [guía de formato de Google](https://developers.google.com/data-manager/api/devguides/concepts/formatting) exige E.164 y hashing. El flag local sigue apagado; la procedencia/Customer Data Terms y EC efectivo no se presumen aprobados.

**G-E02 — Consentimiento web local.** Portada estática y React invalidan decisiones almacenadas de más de 90 días y conservan `default` denegado. Ambos permiten reabrir preferencias tras decidir; la portada comunica `revoke` y `grant` a Meta cuando cambia publicidad y retira el touch de sesión al revocar. La ventana de 90 días coincide con la validación de fechas ya existente en el BFF. La versión React puede aún venir de `NEXT_PUBLIC_CONSENT_POLICY_VERSION`, mientras la portada fija la versión por defecto: confirmar el valor efectivo y unificar despliegue antes de cerrar GATE-CONSENT-01.

**G-E03 — Evidencia local.** Tests nuevos cubren caducidad a 91 días, reapertura/revocación Meta estática, hash E.164 de `waId` corroborado y rechazo de teléfono local ambiguo. Pruebas de consentimiento/navegación: 30 PASS; tests Hermes y builds en F-E03 incluyen estos cambios. `node --check` de la portada y lint de los archivos web modificados pasan. Son mocks, no Tag Assistant ni Meta Pixel real.

**G-E04 — Límite.** Privacidad/Legal no ha fijado finalidad, regiones, retención/backend suppression ni aceptado Customer Data Terms; Ads no confirmó Enhanced Conversions ni las fuentes first-party. No se publicaron tags ni se activó user data. GATE-LEGAL-01, GATE-EC-01 y GATE-CONSENT-02 siguen UNKNOWN; GATE-CONSENT-01 queda UNKNOWN hasta verificar versión y comportamiento en navegador desplegado.

**Preconditions:** privacidad/Legal aprueban finalidad, regiones/retención, términos y procedencia first-party; GTM Live disponible para revisión; normalización/consentimiento no habilitados por presunción.

**Allowed files W:** config/ConsentManager/provider/schema/JS estático; tests consent/navigation/attribution. **Allowed files H:** servicio advertising y Data Manager/spec o helper normalizador nuevo aprobado. **Forbidden files:** aceptar términos o publicar GTM desde el agente, hashes/PII en GA4, env/keys, modificaciones globales del teléfono operativo sin contrato.

**Tests before:** T2 y P4. **Implementation steps:** normalizador exportación; vectores hash; misma policy/edad en ambas webs; reapertura/revocation; filtro receptor; cancelación/revisión runtime; recopilar evidence default/update de Tag Assistant.

**Tests after:** grant/deny/revoke/regrant por finalidad, aged consent, navegación admin, e164/email, flags/include denied, carrera job→revoke; revisar network/logs sin PII. **Rollback:** desactivar userData y revertir UI compatible sin otorgar permisos nuevos. **Definition of done:** estados trazables/coherentes y matching con formatos autorizados; España permanece pendiente de gate específico de privacidad.

### Phase H — Final Pre-Launch QA

**Estado de ejecución: PRE-QA LOCAL; RECORRIDO INTEGRADO Y DECISIÓN DE LANZAMIENTO PENDIENTES (29/09/2026).**

**H-E01 — Pre-QA sin envíos.** Se ejecutaron `jest` completo de Hermes (53 suites / 909 PASS), `nest build`, `next build` (37 páginas), selección de consentimiento/navegación/panel (32 PASS), lint de fuentes modificadas y sintaxis del script estático. La suite web global reportó 172 PASS, 4 FAIL visuales/CSS preexistentes y 1 SKIP. D/E pasaron cuatro tests integrados con DB/Redis aislados según D-E05/E-E05, pero faltan los escenarios de falla/reinicio. Reglas comerciales, privacidad, Cloud/Ads, GTM/GA4 y Meta siguen sin evidencia final. No se ejecutó Tag Assistant/DebugView, no se inició una campaña y **no existe GO**.

**H-E02 — Recuperación local aislada, 29/09/2026, `America/Guayaquil`.** Se ampliaron exclusivamente `H:test/advertising-flow.integration-spec.ts` y `H:test/advertising-outbox.integration-spec.ts`. Un callback firmado con HMAC sintético devolvió ACK con una fila `PENDING` durable y cero mensajes antes del escaneo; un fallo inyectado de `claimReference` dejó un mensaje y el inbox `FAILED`, sin consumir la referencia. Tras vencer su lease, otro escaneo confirmó la atribución con **1 mensaje, 1 consumo y 1 atribución**. En el segundo caso, un fallo simulado de `Queue.add` después del commit dejó el job SQL `QUEUED`; el reconciliador lo repuso en BullMQ real del fixture conservando **1 job SQL**. Esto ensaya recuperación por lease/escaneo dentro del proceso de prueba, no reinicio del sistema operativo ni caída HTTP→DB.

Se usaron sólo `ads_h_test_20260929_pg` (`127.0.0.1:55434`, DB `ads_d_test_h_20260929`) y `ads_h_test_20260929_redis` (`127.0.0.1:56380`). `prisma migrate deploy` aplicó 17 migraciones sólo a esa DB. Las dos suites integradas pasaron **6/6**; `prisma validate`, `nest build` y ESLint de los dos fixtures pasaron. Antes de retirar los contenedores, los conteos `advertising_conversions|advertising_sync_jobs|meta_webhook_inbox|leads|messages|contacts` fueron `0|0|0|0|0|0`. Se retiraron ambos contenedores y se detuvo Docker Desktop. No se usaron DB/Redis comerciales ni se hicieron llamadas externas. Persisten reinicio real, cinco workers BullMQ, caída HTTP→DB, recorrido web→webhook→CRM→HTTP simulado y todos los gates externos; la decisión sigue **NO GO**.

**H-E03 — ACK fallido y HTTP interceptado, 29/09/2026, `America/Guayaquil`.** Se ampliaron los dos fixtures H ya permitidos. En `advertising-flow.integration-spec.ts`, un fallo inyectado en `metaWebhookInbox.createMany` hizo fallar el callback firmado antes del ACK; no quedaron inbox ni mensaje. La redelivery con el mismo `wamid` creó **1 inbox, 1 mensaje, 1 conversación y 1 lead**. El fixture limpia el mock compartido de `enqueue` antes de cada caso para que el conteo de una prueba no dependa del orden. En `advertising-outbox.integration-spec.ts`, un job SQL recuperado después del rechazo de `Queue.add` se validó con `validateOnly=true`: `accessToken` y `axios.post` estuvieron interceptados, se comprobó `transactionId` y destino, y el job terminó `VALIDATED`. Este segundo caso usa un lead de fixture distinto al del webhook; **no** acredita todavía el recorrido web→webhook→CRM→HTTP unido ni un request a Google.

Se usaron sólo `ads_h_e03_20260929_pg` (`127.0.0.1:55436`, DB `ads_d_test_h_e03_20260929`) y `ads_h_e03_20260929_redis` (`127.0.0.1:56381`), ligados a loopback. `prisma migrate deploy` aplicó 17 migraciones sólo a esa DB. Las dos suites integradas pasaron **8/8**; 71 unit tests focalizados, `nest build` y ESLint de los dos fixtures también pasaron. La comprobación global `tsc --noEmit` falló en specs ajenas al cambio, mientras `nest build` aprobó; no se atribuye ese resultado a H-E03. Antes de retirar los contenedores, los conteos `advertising_conversions|advertising_sync_jobs|meta_webhook_inbox|leads|messages|contacts` fueron `0|0|0|0|0|0` y Redis reportó 0 claves. Se retiraron ambos contenedores y se cerró Docker Desktop. No se usaron DB/Redis comerciales ni se hicieron llamadas externas. GATE-META-03, GATE-OUTBOX-01 y GATE-QA-01 conservan estado UNKNOWN por reinicio real, caídas distribuidas y el recorrido completo pendiente; la decisión sigue **NO GO**.

**H-E04 — Recorrido Hermes unido, 29/09/2026, `America/Guayaquil`.** Se amplió sólo `H:test/advertising-flow.integration-spec.ts`. Una intención con GCLID sintético y consentimiento de fixture produjo una referencia real del servicio; el callback firmado con HMAC sobre raw body creó el mensaje, consumió la referencia y enlazó el lead. `LeadsService.update` promovió ese mismo lead a `QUALIFIED` y confirmó conversión/outbox en PostgreSQL. `AdvertisingService.prepareSync` preparó el destino y encoló mediante un mock; `GoogleDataManagerService.ingest` usó token y `axios.post` interceptados, envió `validateOnly=true` con `transactionId`/GCLID/destino esperados y dejó el job en `VALIDATED`. Se comprobó un mensaje y una atribución. Esto une el circuito **dentro de Hermes**; no ejercita la ruta web BFF ni un worker BullMQ real y no llama a Google.

Se usaron sólo `ads_h_e04_20260929_pg` (`127.0.0.1:55437`, DB `ads_d_test_h_e04_20260929`) y `ads_h_e04_20260929_redis` (`127.0.0.1:56382`), ligados a loopback. `prisma migrate deploy` aplicó 17 migraciones sólo a esa DB. Las dos suites pasaron **9/9** y el build/lint acotado aprobaron. Los conteos de conversiones, jobs, inbox, leads, mensajes, contactos, mappings, integraciones y audit logs quedaron `0|0|0|0|0|0|0|0|0`; Redis reportó 0 claves. Se retiraron los dos contenedores y se cerró Docker Desktop. GATE-QA-01 permanece UNKNOWN hasta validar web BFF y ejecución real del worker; la decisión sigue **NO GO**.

**H-E05 — BFF y workers aislados, 29/09/2026, `America/Guayaquil`.** Se ampliaron sólo los dos fixtures H ya permitidos. Con `ADS_H_WEB_ROOT` apuntando al build actual, Next sirvió `/api/attribution/whatsapp` en loopback con `HERMES_API_URL` terminado en `/api`; un módulo Nest mínimo ejecutó el controlador de intenciones, el guard de clave/origen/cuota Redis y el servicio real contra PostgreSQL sintético. Un POST web v2 consentido obtuvo HTTP 201 y una referencia opaca; se comprobaron `gclid`, `utmId` y sufijo en el touch persistido. El callback HMAC firmado usó esa referencia: quedó **1 mensaje, 1 consumo y 1 atribución**. Esto cierra GATE-HERMES-03 sólo para el fixture local. No acredita el proxy, variables, migraciones ni versión desplegados.

En otro caso, cinco instancias `Worker` de BullMQ procesaron cinco entradas de cola para el mismo `CONTRACT_WON` SQL. El claim condicional permitió **1 solicitud `axios.post` interceptada** con `validateOnly=true`, `transactionId` y destino esperados; el job terminó `VALIDATED` y quedó una sola fila outbox. El token y el endpoint Google se simularon, sin red externa. Esta prueba no representa caída después del POST y antes del commit de estado, por lo que GATE-DEDUP-01 permanece UNKNOWN.

Se usaron sólo `ads_h_e05_20260929_pg` (`127.0.0.1:55438`, DB `ads_d_test_h_e05_20260929`) y `ads_h_e05_20260929_redis` (`127.0.0.1:56383`), ligados a loopback. `prisma migrate deploy` aplicó 17 migraciones sólo a esa DB. Las dos suites terminaron **11/11 PASS** sin handles abiertos; `next build` generó 37 páginas, `nest build` y ESLint de fixtures aprobaron. Los conteos de touches, conversiones, jobs, inbox, leads, mensajes, contactos, atribuciones, mappings e integraciones fueron `0|0|0|0|0|0|0|0|0|0`. Redis conservaba 1 clave de cuota `advertising:intent:*` con TTL, no un job de cola. Se retiraron los dos contenedores y se cerró Docker Desktop. Faltan reinicio real, caída HTTP→DB, caducidad de cola, recorrido web→CRM→worker→HTTP unido y gates externos; la decisión sigue **NO GO**.

**Preconditions:** P0 y P1 aplicables resueltos, reglas/moneda/autoridad comercial definidas, evidencia externa completa; campaña revisada por Marketing. **Allowed files:** plan y reporte de QA sanitizado acordado; tests de fixture ya allowlisted. **Forbidden files:** fixes improvisados fuera de scope, producción sintética, publicar GTM/campañas/Ads sin instrucción separada.

**Tests before:** suites relevantes de las fases modificadas; verificar entornos/flags y destinos. **Implementation steps:** recorrido aislado completo, Tag Assistant/DebugView autorizados, revisión acciones/goals/custom goals y conciliación; registrar responsable/fecha/evidence por gate. Elaborar GO/NO GO humano.

**Tests after:** matriz de sección 9 con counts/IDs, 0 P0 abiertos y 0 UNKNOWN de gates requeridos. **Rollback:** mantener/situar campañas pausadas por responsable autorizado; detener exportador si falla y conservar evidencia. **Definition of done:** QA local y externo demostrados, señales de negocio únicas y GO escrito para Ecuador. Activar campañas es una acción posterior; completar este plan no las activa.

## 9. QA integral y contrato de eventos

### 9.1 Entorno de prueba obligatorio

Antes de arrancar Nest/Express completos, confirmar que `DATABASE_URL`, MySQL y `REDIS_URL` apuntan a recursos aislados. No copiar `.env` productivo ni confiar en su nombre. La suite integration actual del proyecto puede utilizar infraestructura real: inspeccionar su setup antes de reutilizarla.

Bloquear red saliente de Google/Meta/IA/mail/Telegram/n8n en pruebas locales; sustituir gateways y token provider. Arrancar un módulo de test mínimo. Para webhook fixture, usar App Secret de prueba generado localmente. Registrar IDs internos, counts, estado y hashes de artefactos; no texto de cliente, números reales, click IDs reales ni tokens.

### 9.2 Recorridos web

| Caso | Secuencia | Aceptación futura |
|---|---|---|
| Consent denied | URL sintética→rechazar→WhatsApp mock | Sin IDs/UTMs publicitarios en persistencia/export fuera de policy; 1 evento según consentimiento de medición. |
| Consent granted | URL→aceptar→3 páginas→WhatsApp mock | Touch esperado, 1 intención y 1 clic por interacción normal. |
| Consent tardío | URL→otra página→aceptar | Resultado acordado con privacidad, sin almacenamiento oculto. |
| First/last | Campaña A→B | First=A, last=B coherente. |
| Campaña parcial | A completa→URL con UTMs parciales | Política explícita; no GCLID A disfrazado de campaña B. |
| Query-only | Misma ruta A→B, back/forward | Touch de la navegación observada. |
| Reload/direct | Recarga y URL sin parámetros | No conversión nueva por visita; no resetea first arbitrariamente. |
| Doble clic | Doble clic rápido con API pendiente | Máximo 1 intención simultánea por operación; identidad de retry definida. |
| BFF timeout | Hermes fake tarda | Contacto fallback disponible, diagnóstico sin PII, trabajos huérfanos recuperables. |
| Captcha inválido | Submit token ausente/inválido mock | Error, 0 DB writes, 0 success events. |
| DB error | Captcha OK→DB fake falla | Error, 0 correo, 0 generate_lead. |
| DB correcta | Captcha OK→DB fake OK | 1 fila, 1 resultado de éxito, 1 evento de cliente. |
| Correo error | DB persistió→SMTP fake falla | Lead aceptado y diagnóstico de notificación; no duplicado inducido por falsa respuesta fallida. |

URL sintética local de ejemplo:

```text
/?gclid=TEST_GCLID_001&utm_source=google&utm_medium=cpc&utm_campaign=qa_ecuador&utm_id=qa_001&utm_term=software_a_medida&utm_content=search_ad_a
```

Repetir separado con `gbraid=TEST_GBRAID_001` y `wbraid=TEST_WBRAID_001`. Estos valores no son clicks reales y nunca se enviarán como conversiones aplicadas a Google.

### 9.3 Correlación backend y concurrencia

El fixture Meta debe ir al controller de test con raw body real y HMAC calculado sobre exactamente esos bytes. La firma buena no basta si se sustituye accidentalmente por `JSON.stringify(body)` después del parser. El caso debe contener referencia emitida por el servicio de test, no una que invente el test sin registro previo.

| Ejecución | Counts esperados en DB aislada |
|---|---|
| Mismo wamid ×5 secuencial y ×5 concurrente | 1 mensaje, 1 conversación aplicable, 1 lead aplicable, 1 consumo, máximo 1 CONVERSATION_STARTED |
| Referencia válida por dos contactos | Sólo un claim; sin asignación al segundo |
| Expirada/invalid/used | No atribución nueva indebida; resultado registrado |
| Claim falla después de persistir mensaje | Recovery posterior completa atribución sin duplicar mensaje |
| QUALIFIED con dos operadores/workers | 1 evento lógico y 1 outbox/job |
| Redis falla tras commit | Dispatcher recupera y encola intención durable |
| Job ACCEPTED vuelve tras caducar Redis | 0 nuevo ingest mock |
| Job false con flags apagados | 0 request mock `validateOnly=false` |
| Evento de valor repetido idéntico | Valor/timestamp/destino no cambian |
| Corrección de valor | Comando/versión explícitos y audit log; nunca replay automático |

### 9.4 Semántica recomendada para acciones Google

Esta tabla es una propuesta para aprobación de Marketing, no estado leído de Ads ni configuración aplicada.

| Hecho | Fuente autoritativa | Uso inicial propuesto | Valor |
|---|---|---|---|
| WhatsApp click | Web/intención, sin confirmar mensaje | Secondary; fuera de custom goals de puja | Sin valor de venta |
| Conversation started | Inbound firmado y atribuido | Secondary | Sin valor ficticio |
| Form lead / generate_lead | Persistencia confirmada | Secondary | Sin valor comercial inventado |
| Qualified lead | Regla y transición durable Hermes | Secondary durante validación; candidato Primary después de revisión | Posterior a análisis de negocio |
| Meeting confirmed | Reunión/hito con ID reconciliado | Secondary | Diferenciar de reserva cliente |
| Proposal sent | Hito comercial | Secondary | Propuesta ≠ ingreso |
| Contract won | Contrato completo, moneda/referencia | Medición obligatoria; estrategia Primary posterior según volumen | Importe definido por finanzas |
| Contract lost | CRM | Señal interna, fuera de objetivo positivo | Sin venta positiva |

Un único hecho no debe convertirse en dos Primary por tag web e import GA4/CRM distintos. `isPrimary` del mapping Hermes es metadata local: no cambia las conversion actions en Google. La revisión de custom goals es obligatoria aunque una acción figure Secondary.

### 9.5 Evidencia que falta recibir de sistemas externos

| Sistema | Artefacto concreto | Owner |
|---|---|---|
| Hermes desplegado | SHA, migraciones, rutas/proxy y configuración efectiva sanitizada de workers/jobs | IT/Hermes |
| Meta | Callback, suscripción, App/WABA/Phone Number ID parcialmente ocultos y challenge de test | Meta owner/IT |
| GTM | JSON de versión Live y version ID, mapa tags/triggers/variables/consent/exclusión admin | GTM owner |
| GA4 | Web stream/propiedad correctos, enlace Ads, DebugView sin PII y lista de imports | GA4 owner |
| Ads | Auto-tagging, actions/goals/custom goals, owner/destinos, currency/timezone y campañas revisadas | Ads owner |
| Cloud/Data Manager | Proyecto/API enabled/identity/scopes/acceso actuales para A; resultado validateOnly redactado en F | Cloud/Ads/Hermes |
| Ventas/Marketing | Definición Qualified, meeting/opportunity, etapa de bidding elegida y responsable | Sales/Marketing |
| Privacidad/Finanzas | Finalidades/retención/revoke/EEE/términos y significado valor/moneda/contrato/cobro | Responsables respectivos |

No se necesita entregar secretos, OAuth JSON, bearer tokens, App Secret, bases de clientes o GCLID reales para documentar esos checks.

## 10. Contraste con documentación oficial

Las páginas públicas verifican requisitos generales; cada gate externo requiere evidencia de la cuenta concreta. Las fechas futuras o históricas mencionadas en el plan original no se usan como sustituto de esa comprobación. El plan original dice «29 de septiembre»; la fecha local de esta revisión es el **28 de septiembre de 2026**.

| Tema | Resultado del contraste y aplicación | Fuente oficial |
|---|---|---|
| Auto-tagging | Añade GCLID a la URL; revisar ajuste y redirects reales | [Auto-tagging](https://support.google.com/google-ads/answer/1752125?hl=en) |
| Primary/Secondary y goals | Primary participa según goal elegido; Secondary dentro de custom goal puede participar en bidding | [Conversion actions](https://support.google.com/google-ads/answer/11461796?hl=en) |
| Ads–GA4 | Verificar propiedad/cuenta y permisos de enlace/imports | [Vincular Ads y Analytics](https://support.google.com/analytics/answer/9379420?hl=en) |
| DebugView | Comprobar eventos de dispositivo debug; recepción no se infiere de dataLayer | [DebugView](https://support.google.com/analytics/answer/7201382?hl=en) |
| Consent Mode | Default/update de cuatro señales; validar en la web y tags desplegados | [Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) |
| EC for Leads | Feedback offline y datos propios mejoran medición si están configurados/autorizados | [Enhanced Conversions for Leads](https://support.google.com/google-ads/answer/15713840?hl=en) |
| EC 2026 | Fuentes simultáneas desde abril; setting web/leads unificado desde junio. El plan original asignaba abril a la unificación | [Actualización de settings](https://support.google.com/google-ads/answer/16884284?hl=en) |
| OCI legacy | Desde 15/06/2026, restricción para integradores sin actividad previa en la ventana indicada; no construir nueva OCI basada en acceso supuesto a UploadClickConversions | [Deprecaciones Ads API](https://developers.google.com/google-ads/api/docs/deprecations) |
| Reporting Ads | Developer tokens retirados el 09/09/2026; acceso depende del proyecto Cloud. Su ausencia no demuestra un fallo del reporting Hermes | [Developer token y acceso Cloud](https://developers.google.com/google-ads/api/docs/api-policy/developer-token) |
| Data Manager: acceso | API habilitada, identidad con acceso y scope datamanager; ADC admitido | [Configurar acceso](https://developers.google.com/data-manager/api/devguides/quickstart/set-up-access) |
| Ingestión offline | operatingAccount debe ser owner de acción; type UPLOAD_CLICKS, IDs adecuados; validateOnly no aplica cambios | [Enviar eventos offline](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/send-events) |
| transactionId | Deduplicación dentro de una acción y tratamiento de cambios de valor requieren política explícita | [Migración y equivalencias](https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/upgrade) |
| User data | Formato por campo, E.164 con `+`, reglas Gmail y hash SHA-256/encoding | [Formato user data](https://developers.google.com/data-manager/api/devguides/concepts/formatting) |
| Diagnóstico | GET requestStatus:retrieve; enum `FAILED`, no `FAILURE`. El cliente actual usa la forma correcta | [Referencia requestStatus](https://developers.google.com/data-manager/api/reference/rest/v1/requestStatus/retrieve) |

La guía de ingestión aclara que diagnósticos recuperables corresponden a requests exitosos sin `validateOnly=true`; el éxito de validación no acredita una conversión aplicada. No se copiaron ejemplos de quickstart de audiencias como si fueran el contrato de eventos.

No se pudo recuperar durante esta sesión la página pública de Meta de getting-started de webhooks. La revisión de autenticidad/challenge se basa en el código y el test HMAC local; no se certifica la configuración de Meta ni se afirma un contraste actualizado completo con esa página.

## 11. Riesgos, exclusiones y decisión operativa

**GO para revisar este plan y preparar change sets locales. NO GO para declarar cerrado el circuito comercial o activar inversión sólo con estas pruebas.**

B resuelve localmente la persistencia falsa y el falso fracaso por SMTP de Contacto/Marketing. D/E/F implementan inbox antes del ACK, recuperación de atribución, snapshot/outbox y stop de ejecución, con evidencia de fixture aislado; todavía no se demostraron fallas en cada borde, reinicios reales, cinco workers ni el recorrido integrado completo. Otros formularios conservan revisión de persistencia pendiente, como se detalla en B.4. Las reglas comerciales y los sistemas externos conservan sus gates pendientes.

La revisión resolvió la existencia local de Hermes/Meta/Data Manager/normalización/idempotencia, pero **no demuestra** que este checkout sea el servicio desplegado, que sus migraciones estén aplicadas, que las credenciales funcionen o que Google atribuya conversiones. Los resultados de pruebas antiguas de otros informes no se presentan como resultados de esta sesión.

No se autoriza aquí limpiar legacy/assets, cambiar SEO/estilos/demos, actualizar dependencias, editar `.env`, aceptar términos, publicar GTM, configurar Ads/Meta, enviar WhatsApp o desplegar. Esas acciones no son necesarias para completar esta revisión documental.

El rollback general de futuros change sets debe preservar datos y cambios previos: pausar dispatch cuando afecte feedback, revertir sólo el parche revisado, mantener tablas/migraciones aditivas y reconciliar eventos pendientes. No borrar conversiones/jobs para provocar reenvío, ni resetear repositorios completos.

La secuencia actual es: **A parcial; B–F implementadas en local; G parcial; H en pre-QA** → decisiones comercial/legal y configuración externa → pruebas de caída/reinicio y recorrido integrado → validación desplegada → decisión empresarial explícita. El cierre local no cierra los gates externos ni sustituye el smoke test real de navegador pendiente. Ecuador es el mercado inicial propuesto; España exige revisión específica posterior. No se ha consultado ni cambiado el estado actual de las campañas.

## 12. Entrega y trazabilidad

| Entregable | Resultado |
|---|---|
| Revisión local Hermes | Completada, con límites operativos documentados |
| Plan ejecutable A–H | Completado |
| Ejecución de fase A, 28/09/2026 | EN CURSO — PARCIAL; 8 tareas completadas y 8 grupos externos pendientes |
| Ejecución de fase B, 28/09/2026 | COMPLETADA EN LOCAL; nueve tareas marcadas y 64 pruebas posteriores PASS más script comercial |
| Ejecución de fase C, 28–29/09/2026 | IMPLEMENTADA EN LOCAL; 14 tareas marcadas; cierre v2: 85 web y 26 Hermes PASS, build/lint/Prisma PASS; smoke Chrome v2 UNKNOWN |
| Ejecución de fase D, 29/09/2026 | IMPLEMENTADA Y PROBADA EN PostgreSQL SINTÉTICO; 2 pruebas integradas PASS; falta falla/reinicio y despliegue |
| Ejecución de fase E, 29/09/2026 | IMPLEMENTACIÓN TÉCNICA Y DB/Redis SINTÉTICOS; 2 pruebas integradas PASS; faltan regla Qualified y caídas distribuidas |
| Ejecución de fase F, 29/09/2026 | IMPLEMENTADA LOCALMENTE; stop y diagnósticos aislados; falta fixture Google autorizado y configuración externa |
| Ejecución de fase G, 29/09/2026 | PARCIAL EN LOCAL; caducidad/reapertura/revocación y normalización; faltan legal/EC/Tag Assistant |
| Ejecución de fase H, 29/09/2026 | PRE-QA LOCAL; 11 pruebas integradas en DB/Redis aislados, BFF→Nest→DB y cinco workers BullMQ; no existe GO |
| Catálogo de cambios con evidencia, allowlists, tests, dependencias y rollback | Completado |
| Gates externos | 17 pendientes de cierre; seis con evidencia parcial/histórica añadida durante A |
| Cambios locales acotados identificados | 2; Phase B inicial incluye persistencia, recap sólo verificación |
| Tests realizados | A: 39 PASS; B: 64 PASS más script comercial; C 28/09: 69 web + 23 Hermes y 6 casos Chrome v1; C 29/09: 85 web + 26 Hermes PASS, navegador v2 UNKNOWN; D/E inicial: 2 suites / 4 PASS; H-E02: 2 suites / 6 PASS; H-E03: 2 suites / 8 PASS con PostgreSQL/Redis sintéticos y 71 unit focalizados; H-E04: 2 suites / 9 PASS; H-E05: 2 suites / 11 PASS, `next build` de 37 páginas y `nest build`; F/H: Hermes 53 suites / 909 PASS y web seleccionada 32 PASS; cifras por ejecución, sin sumarlas como tests distintos |
| Código fuente modificado por estas etapas | B–G: fuentes web y Hermes, schema Prisma y migraciones aditivas; el detalle verificable está en las secciones B–G y sus evidencias D-E05–G-E03 |
| Archivos creados / editados | A: plan; B–G: código, pruebas, schema/migraciones aditivas y el mismo plan; cada fase identifica sus archivos y allowlists |
| Sistemas externos modificados | 0 |

Antes de aplicar cualquier change set, volver a leer Git y confirmar evidencia/allowlist del ID. Si un hallazgo ha cambiado —como ocurrió con reCAPTCHA—, ajustar el plan y evitar implementar un arreglo sin fundamento.

```text
PLAN_CREATED
PHASE_A_STATUS=IN_PROGRESS_PARTIAL
PHASE_A_TASKS_COMPLETED=8
PHASE_A_PENDING_EXTERNAL_GROUPS=8
PHASE_B_STATUS=COMPLETED_LOCAL
PHASE_B_TASKS_COMPLETED=9
PHASE_B_NODE_TESTS_PASSED=64
PHASE_C_STATUS=IMPLEMENTED_LOCAL
PHASE_C_TASKS_COMPLETED=14
PHASE_C_PENDING_DEPENDENT_TASKS=0
PHASE_C_WEB_TESTS_PASSED=85
PHASE_C_HERMES_TESTS_PASSED=26
PHASE_C_BROWSER_V1_CASES_PASSED_28_SEP=6
PHASE_C_BROWSER_V2=UNKNOWN_NO_BROWSER_AVAILABLE
PHASE_C_BUILD=PASS
PHASE_C_LINT=PASS
PHASE_D_STATUS=IMPLEMENTED_LOCAL_VALIDATED_ISOLATED_CLOSURE_PENDING
PHASE_E_STATUS=IMPLEMENTED_LOCAL_VALIDATED_ISOLATED_CLOSURE_PENDING
PHASE_F_STATUS=IMPLEMENTED_LOCAL_GOOGLE_VALIDATION_PENDING
PHASE_G_STATUS=PARTIAL_LOCAL
PHASE_H_STATUS=PRE_QA_LOCAL_NO_GO
PHASE_H_ISOLATED_INTEGRATION_TESTS_PASSED=11
FORM_GATE=PASS_LOCAL_CONTACT_MARKETING
EXTERNAL_GATES_REQUIRED=17
EXTERNAL_GATES_CLOSED=0
SAFE_LOCAL_CHANGES_IDENTIFIED=2
AWAITING_CURRENT_READ_ONLY_EVIDENCE
```
