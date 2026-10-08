# Estado del proyecto Undercodeec

**Corte documental:** 2026-10-05, America/Guayaquil.

**Checkout revisado:** `main`, `f511eb2e6ec16ab4b4040392bdea06957e09afb7`.

**Última evidencia registrada de release web activa:** 2026-10-04, `3ca3a8ec22b36c3822be0871fa41cfb30f88153a`.

**Dictamen:** el checkout actual compila y pasa sus pruebas locales. La web tiene una release productiva confirmada, pero el ajuste `f511eb2` del login aún no tiene despliegue confirmado. Los recorridos con pagos, Hermes/Meta, Google Ads y otros servicios externos no están certificados de extremo a extremo.

Este archivo es el estado consolidado del **repositorio web y su API Express**. La información de Hermes como servicio independiente procede de los documentos de integración citados; no se infiere su despliegue a partir de un build de Next.js. Las afirmaciones de producción siempre llevan fecha y revisión. Una prueba local o un commit en `main` no demuestra que un proceso en el VPS esté sirviendo ese código.

## Cómo leer el estado

| Nivel | Significado en este documento |
|---|---|
| Implementado | Existe en el checkout indicado y se puede ubicar en código. |
| Probado | Una comprobación repetible pasó; se indica si usa mocks, servicios sintéticos o un servicio real. |
| Desplegado | Hay evidencia fechada de que la revisión corre en un entorno público o en el VPS. |
| Certificado E2E | Se observó el recorrido completo con sus servicios y datos reales, incluidos efectos secundarios y fallos relevantes. |

**No hay certificación E2E general.** La última comprobación de release web no identifica por sí sola el SHA cargado por la API Express ni la imagen/contenedor Hermes. El funcionamiento de rutas públicas o assets tampoco certifica pagos, campañas o conversiones.

## Resumen ejecutivo por área

| Área | Código y pruebas de este checkout | Última evidencia de despliegue | Brecha principal |
|---|---|---|---|
| Web pública, contenido y SEO | Next.js 16.1.2 / React 19.2.3; build y pruebas locales pasan. | Web `3ca3a8e` activa el 04/10. | Validar visual, rendimiento y SEO de la release actual en navegadores y buscadores. |
| CRM web y acceso | OTP dual, shell y módulos presentes; build, tests de host y login. | El login con Dala de `3ca3a8e` se reportó activo el 04/10. El adaptador refinado de `f511eb2` no está confirmado en producción. | Probar login, roles, sesiones y UI con API y Hermes reales. |
| Inbox, calendario, campañas y publicidad | Clientes y pantallas implementados; pruebas de contrato y lógica local. | Su código web está incluido en `3ca3a8e`; disponibilidad funcional de cada módulo no constatada. | Verificar endpoints, permisos, migraciones y datos reales de Hermes. |
| PayPhone y transferencia Express | Flujos, protecciones y pruebas unitarias presentes. | `api-undercodeec` estaba online el 04/10; no hay SHA cargado documentado para este corte. | Pago y aprobación reales, idempotencia y efectos secundarios tras reinicio. |
| Consentimiento y atribución | Contrato web first/last touch, GTM/Meta y BFF a Hermes probados localmente. | Código web incluido en `3ca3a8e`; activación efectiva de etiquetas/servicios no acreditada. | Tag Assistant/DebugView, política y recorrido Ads→WhatsApp→CRM→Google. |
| Facturación SRI | Implementación de desarrollo conservada. | Sin evidencia de habilitación productiva. | Iniciativa futura: certificado, emisor y certificación `celcer`. |

## Evidencia reproducida el 2026-10-05

| Comprobación | Resultado | Alcance real |
|---|---|---|
| `pnpm test` | **160 pasan, 0 fallan, 1 omitida** de 161. | Contratos y lógica frontend. La omitida es el proxy real del calendario, que exige fixture Hermes y Next local configurados. |
| `npm --prefix backend test` | **14 pasan, 0 fallan**; `test_chat_commercial_playbook.js` también pasa. | OTP, PayPhone, limpieza, privacidad del login y helpers de transferencia; no cobra ni usa DB/SMTP reales. |
| `pnpm lint` | **0 errores, 172 advertencias**. | ESLint revisa `src` y `next.config.ts`; las advertencias incluyen imágenes heredadas, símbolos sin uso y estilos globales. Sustituye la cifra antigua de 210. |
| `node --check backend/server.js` | Pasa. | Sintaxis de la entrada Express; no arranca la API. |
| `pnpm build` | Pasa compilación, TypeScript y prerender de **38 páginas**. | Build local de Next.js 16.1.2; incluye `/admin/crm/login/dala-embed`, `/api/hermes/[...path]` y `/api/attribution/whatsapp`. No es una prueba HTTP/E2E. |

La prueba omitida puede ejecutarse por separado con el fixture descrito en [Calendario CRM](../docs/crm-calendar.md). No se ejecutó en este corte. No se inició Express contra MySQL/MariaDB ni Hermes contra PostgreSQL/Redis de producción. Tampoco se hicieron cobros, envíos de correo, Drive, Gemini/TTS, Meta o Data Manager.

## Arquitectura y experiencia pública actual

- La aplicación activa es Next.js/React. El piloto `apps/web` con Astro y dependencias sin uso se retiró el 16/09; [la auditoría de estabilización](../docs/maintenance/react-stabilization-audit.md) documenta los límites de esa limpieza. El build limita los workers con `experimental.cpus: 1` para el VPS.
- La URL `/` se reescribe antes de resolver páginas a `public/landing-primary/index.html`. Esa portada estática incluye el asistente comercial de planes y pagos, orb/animaciones, control de privacidad y captura de atribución. `src/app/page.tsx` sigue en el proyecto, pero la reescritura determina la respuesta de `/`.
- Las páginas Next visibles incluyen `/servicios`, `/marketing-para-tu-negocio`, `/software-para-tu-negocio`, `/aplicaciones-moviles`, `/contacto`, `/hosting`, `/blog`, `/nuestra-trayectoria`, `/ec`, `/es` y `/undercodeec`. Las revisiones de septiembre actualizaron composición, diseño, modo nocturno donde corresponde, contenido regional y recorridos móviles. Ecuador usa su landing propia; España reutiliza la composición de marketing y tiene metadatos/JSON-LD regionales.
- La demo Dala se conserva como recurso local en `public/demos/dala/`; su animación original alimenta también el login CRM. El micrositio estático experimental `public/demos-offbrand` y la ruta Next `/demos` fueron retirados después de su prototipo de septiembre: no figuran como funcionalidad actual. El checkout conserva recursos de referencia en `desing/`.
- `sitemap.xml` enumera rutas principales y posts; `/noticias` queda fuera por ser placeholder. `robots.txt` excluye rutas administrativas, pago, portal y contratos. La ruta de assets de la portada `/landing-primary/*` devuelve `X-Robots-Tag: noindex, nofollow` para evitar competir con `/`. Esto describe el código, no una auditoría actual de indexación.
- El acceso comercial visible se dirige al WhatsApp de Hermes. La referencia opaca `UC-...` se añade al mensaje cuando el BFF de atribución la obtiene; si Hermes falla, WhatsApp se abre con el mensaje base. El botón se oculta en `/admin`, `/contratos` y `/undercodeec`. El asistente web de IA dejó de ser el punto de entrada global; su código y endpoints backend permanecen para otros recorridos.

### Consentimiento, analítica y atribución

- La experiencia Next y la portada estática comparten una política versionada de consentimiento. Consent Mode v2 parte denegado; preferencias antiguas o corruptas se invalidan y la elección caduca a los 90 días. El visitante puede reabrirla y revocar Meta. GTM es la vía prevista para GA4; la carga directa que duplicaba `pageview` se retiró del flujo principal.
- La captura admite `gclid`, `gbraid`, `wbraid`, UTM y `utm_id`, filtra valores malformados, conserva primer y último toque elegibles de forma independiente y elimina identificadores publicitarios si no hay consentimiento. La sesión de atribución caduca tras 30 minutos de inactividad; se conserva el instante de visita separado del instante del contacto.
- `POST /api/attribution/whatsapp` valida origen, tamaño, esquema y cuota local, y solicita a Hermes una referencia mediante `HERMES_ATTRIBUTION_KEY` privado. El contrato del BFF se probó, pero las cuotas en memoria son por instancia y no hay certificación de la correlación completa con un mensaje Meta real.
- El plan de publicidad [A–H](../docs/google-ads-implementation-plan.md) registra correcciones locales en web y Hermes y pruebas con DB/Redis **sintéticos**. La evidencia de 01/10 atribuye las acciones de conversión al MCC y separa `conversionCustomerId` de la cuenta child en código de Hermes, pero no acredita migración productiva ni una llamada `validateOnly=true` a Google. Los flags de envío publicitario se mantuvieron apagados en ese corte. Sigue **NO GO** para declarar operativas conversiones offline o activar campañas Ads basándose sólo en estas pruebas.

## CRM Hermes: acceso, módulos y dependencias

**Actualización local del 08/10/2026:** Inbox incorpora la creación de un handoff manual desde una conversación activa, con motivo y detalle interno, antes de tomar la atención. El editor se habilita al operador asignado cuando el handoff está en progreso y la ventana de 24 horas sigue abierta; Hermes vuelve a validar estas condiciones. La compilación de Next.js y ESLint dirigido pasaron. Es un cambio local pendiente de verificación en la release servida. El alcance y la evidencia de Fase 0/0A están en el plan `D:/Documentos/Hermes/hermes-backend/docs/hermes-learning-loop-plan.md`.

El frontend usa `/api/hermes/[...path]` como proxy del mismo origen. `HERMES_API_URL` es privado y debe contener la base `/api`; el navegador usa `/api/hermes`. El proxy valida segmentos y métodos, reenvía autorización, evita caché y transmite `conversations/events` como stream sin buffering. Para multimedia de campañas y adjuntos de inbox tiene límites de tiempo y manejo de cuerpo específicos. El proxy HTTP fue observado con `/api/hermes/docs/` en septiembre; eso no acredita cada recurso autenticado.

- En producción, `/admin/*` sólo debe responder bajo `admincrm.undercodeec.com`; el layout devuelve 404 en otros hosts. `/admin` redirige al login CRM y `/admin/dashboard` a `/admin/crm/administracion/`.
- El operador escribe su correo; la respuesta de solicitud OTP no revela el autorizado. El OTP de ocho dígitos produce una prueba breve para Hermes y un token administrativo independiente. El shell sólo carga datos protegidos tras validar ambas sesiones. La prueba local cubre privacidad y lógica OTP; falta un recorrido completo con correo y ambas APIs del entorno desplegado.
- El shell ofrece Resumen, Publicidad y atribución, Pipeline, Inbox, Calendario, Campañas y Administración. La barra lateral es plegable. Administración conserva pagos, formularios, facturas, uso de IA y configuración del panel anterior.
- El inbox permite tomar/resolver handoffs, responder, cerrar y reabrir conversaciones; presenta incidentes de Hermes que requieren revisión humana. Recibe eventos por streaming con reconexión y recurre a sondeo para novedades, mostrando avisos de mensajes de distintas conversaciones. La configuración Nginx de streaming y la disponibilidad real del canal deben verificarse en la release servida.
- El calendario `/admin/crm/calendario/` consulta reuniones asignadas de Hermes, muestra semana 07:00–21:00 y agenda móvil, mantiene accesibles las reuniones fuera de horario, filtra estados y refresca cada 30 segundos si la pestaña está visible. Permite visualizar Ecuador, España peninsular y Canarias con DST; `PENDING` se etiqueta «En verificación». Hay pruebas de fechas, render y contrato; faltan revisión visual, teclado/lector de pantalla y persistencia PostgreSQL real.
- Campañas permite elegir plantillas aprobadas, previsualizar CSV con duplicados/consentimiento, importar aptos en lotes de 500, y ejecutar explícitamente iniciar/pausar/reanudar/cancelar. La multimedia VIDEO admite MP4 de hasta 16 MB, biblioteca y URL HTTPS permitida por Hermes. La UI no inicia una campaña al importarla. No se registra una prueba real con un destinatario consentido y Meta.
- Publicidad muestra resumen, métricas, mappings, estado de integración e historial del lead desde Hermes. La UI distingue `accountId`, `loginAccountId` y `conversionCustomerId`. Un estado «pendiente de conexión» no significa métricas reales disponibles. Antes de guardar o activar conversiones deben revisarse el owner de acciones, los snapshots/jobs previos y los gates externos del plan Ads.
- La revisión de transferencias dentro del inbox usa endpoints de Hermes para consultar el comprobante, iniciar revisión y aprobar/rechazar con referencia y estado esperado. Es un circuito distinto de la aprobación de órdenes de transferencia en la API Express; su conciliación y efecto financiero entre sistemas no están certificados.
- El login usa la animación WebGL original de Dala. `3ca3a8e` integró el iframe y quedó en la release web reportada el 04/10. `f511eb2` lo ajusta a `/admin/crm/login/dala-embed/`, que sirve HTML local sin menú ni scroll y con `noindex`; este último cambio pasa tests/build locales, pero no tiene despliegue confirmado en la evidencia disponible.

## API Express, pagos y servicios

- `backend/server.js` contiene rutas de salud, PayPhone, chat/autenticación, formularios, administración, pagos y facturas. MySQL/MariaDB conserva órdenes, leads, sesiones de chat, usuarios, facturas y `payment_states`; las tablas se inicializan de forma idempotente en `backend/db.js`. La entrada sigue siendo un archivo grande y requiere separación por dominios y migraciones versionadas.
- PayPhone crea el enlace, emite un token opaco de estado asociado a `clientTransactionId`, sondea `GET /api/check-payment-status/:clientTxId` y acepta sólo mensajes de la ventana/origen esperados. El webhook y la confirmación comparten un reclamo exclusivo para evitar procesamiento simultáneo; `paymentStateStore` guarda estado en DB con fallback en memoria. La portada ahora espera confirmación backend antes de cerrar el popup y registrar `purchase`, y espera a que el runtime de reCAPTCHA Enterprise esté listo.
- Los tests actuales verifican token, expiración, limpieza, estado pendiente y reclamo. No acreditan pago real, reverso/cancelación, webhook duplicado bajo concurrencia real, reinicio entre creación y aprobación, ni exactamente una orden/correo/carpeta por cobro. El incidente antiguo `paymentSessions is not defined` se corrigió en `09f50f5` y no se trata como incidencia abierta sin observación nueva.
- Para transferencias, la portada solicita datos y comprobante; Express limita subida a JPG/PNG/PDF y 10 MB, comprueba que la URL del voucher sea propia y guarda la orden `pending`. La ruta administrativa permite aprobación/rechazo; en la primera aprobación asigna un `transaction_id` estable `transfer-<id>`, solicita la creación de carpeta y devuelve un evento `purchase` sin PII para el `dataLayer` del administrador sólo si hay consentimiento de medición. No se emite compra al subir el voucher. El evento en el navegador del administrador **no hereda la atribución de la sesión original del cliente**; la alternativa server-side/offline exige decisión y contrato propios. Véase [aprobación de transferencias](../docs/payment-transfer-approval.md).
- El asistente comercial backend conserva chat, usuarios, lead capture, playbook, Gemini, análisis de URL y TTS; los formularios de contacto/marketing guardan el lead antes de responder éxito y aceptan el token reCAPTCHA del widget. El playbook y las rutas de formulario tienen pruebas con dobles. No hay evidencia en este corte de SMTP, Drive, Gemini/TTS, reCAPTCHA Google o DB comercial de extremo a extremo.
- La administración Express sigue teniendo sesiones, OTP y límites de frecuencia en memoria de proceso. La variable `ADMIN_PASSWORD` sólo debe usarse para bootstrap cuando no existe administrador; `backend/server.js` advierte si sigue presente después. Revisar y retirarla del entorno con inventario previo, sin publicar su valor.
- El código SRI de XML, firma, SOAP, RIDE, correo y gestión de facturas permanece bajo `backend/invoicing/`, pero **no se considera operación actual**. Para retomarlo faltan datos definitivos del emisor, certificado `.p12` fuera de Git, pruebas de claves/XML/totales y autorización real en `celcer` antes de evaluar producción.

## Producción y operación: evidencia del 04/10/2026

El [registro de sesión y despliegue](../implementation_plan.md) documenta una divergencia que reemplaza el runbook del 03/09: `/var/www/html/undercodeec` tenía código reciente, mientras PM2 servía una release anterior. Se desplegó la web `3ca3a8e` como release independiente y se introdujeron enlaces `current` y `previous`.

| Componente | Estado registrado el 04/10 | Límite de la evidencia |
|---|---|---|
| Web `web-undercodeec` | Online en puerto 3000; `cwd=/var/www/current`, apuntando a `/var/www/releases/undercodeec-3ca3a8ec22b36c3822be0871fa41cfb30f88153a`. | No incluye `f511eb2`; comprobar SHA activo antes de una nueva afirmación de producción. |
| Rollback web | `/var/www/previous` conserva `49d343c`; script `/usr/local/sbin/deploy-web-undercodeec` instala, construye, valida `BUILD_ID`, cambia enlaces de forma atómica y recarga sólo la web. | Se validó sintaxis y se observó la release activa; no consta un ensayo de rollback completo. |
| API `api-undercodeec` | Online en puerto 3002 desde `/var/www/html/undercodeec/backend`. | No fue reiniciada en el despliegue web ni se documentó SHA exacto del proceso. |
| Hermes `hermes-app` | Contenedor en `127.0.0.1:3003`. | No se documentó imagen/SHA ni migraciones productivas en ese corte. |
| Nginx y assets | `/_next/static/` usa `/var/www/current/.next/static/`; un chunk devolvió HTTP 200 y SHA-256 igual al archivo de la release. Se corrigieron permisos de lectura y se retiró del directorio cargado un vhost `.bak` duplicado. `nginx -t` pasó sin conflicto. | Verificación puntual de asset y configuración; repetir tras cada despliegue. |

Para la **web**, usar el script de releases y confirmar `readlink -f /var/www/current`, `readlink -f /var/www/previous`, `pm2 describe web-undercodeec`, `nginx -t`, HTML y un asset `/_next/static/` de la release nueva. Construir en `/var/www/html/undercodeec` no cambia lo que sirve PM2 web. Para la **API**, registrar SHA/tiempo de arranque y desplegar su proceso por separado. Hermes tiene su propio ciclo de Docker y no se actualiza al recargar la web. Mantener respaldos Nginx fuera de `sites-enabled/*`, porque ese patrón también carga archivos `.bak`.

La evidencia del 03/09 (`09f50f5`: recuperación inicial de rutas, proxy y fix de PayPhone) es histórica. El 04/10 aporta una arquitectura de ejecución más reciente y sustituye la instrucción anterior de que frontend y API se sirven necesariamente desde el mismo directorio/revisión. La coherencia entre versiones sigue siendo un requisito de cada cambio de contrato.

## Cambios principales desde el último estado del 03/09

| Periodo / commits representativos | Resultado vigente |
|---|---|
| 04–16/09 · `975f424`, `350d928`, `1a61022`, `108661d` | Multimedia VIDEO de campañas; entrada web por WhatsApp Hermes; portada primaria; retiro del piloto Astro/dependencias sin uso. Los prototipos estáticos de demos anteriores quedaron sustituidos o retirados. |
| 17–20/09 · `35f20bf`, `70ddb3e`, `9894271`, `9e9a3bb` | Panel de publicidad, consentimiento y BFF de atribución; protección de host CRM; eventos en tiempo real, reapertura e incidentes del inbox. |
| 23–28/09 · `54337f5`, `3a1ad1c`, `4c1d91d`, `ca121ba` | Contenido/SEO regional de Ecuador y España, páginas principales y calendario CRM con zonas horarias. |
| 30/09–02/10 · `7bf28e5`, `59fc180`, `783afe6`, `3e0197e`, `49d343c` | Contrato consentido first/last, reCAPTCHA/PayPhone, aprobación de transferencia Express, campo de conversion customer en UI y revisión de transferencia Hermes en inbox. |
| 03–04/10 · `3ca3a8e`, `f511eb2` | Login Dala integrado y luego refinado; `3ca3a8e` confirmado como release web activa, `f511eb2` sólo acreditado en este checkout. |

Los detalles de Phase A–H de Google Ads, los experimentos sustituidos y los commits intermedios permanecen en `git log` y en sus documentos temáticos. Esta tabla resume el resultado vigente; no constituye evidencia de despliegue por commit.

## Pendientes priorizados

### P0 — confirmar versión y recorridos de negocio

1. Registrar SHA/`BUILD_ID` que sirve `web-undercodeec`, SHA realmente cargado por `api-undercodeec`, imagen/SHA de Hermes y migraciones aplicadas. Desplegar `f511eb2` sólo cuando se decida incluir el refinamiento del login; comprobar UI, assets y rollback de esa release.
2. Validar login OTP completo con correo autorizado, prueba Hermes, token administrativo, roles, expiración y host `admincrm.undercodeec.com` en el entorno desplegado.
3. Certificar PayPhone con pago aprobado, cancelación, webhook duplicado y reinicio entre creación/confirmación; contar una sola orden, correo y carpeta por pago y cero efectos de compra al cancelar.
4. Certificar transferencia Express y revisión Hermes con comprobante real controlado, aprobación/rechazo, transición repetida/concurrente, carpeta y conciliación. Acordar si la compra se atribuirá al cliente original y cómo se deduplicará.
5. Ejecutar una campaña Hermes/Meta de un solo destinatario `OPTED_IN`, con plantilla y multimedia aprobadas, sin tratar la importación como envío; validar permisos, métricas y pausas.
6. Cerrar los gates de Ads/atribución: migraciones y config Hermes, consentimiento/política, GTM/GA4/Meta, propietario y destino de conversiones, `validateOnly` real en QA aislado y decisión humana de lanzamiento. No activar envío por el solo hecho de que la UI exista.

### P1 — calidad operativa y cobertura

1. Ejecutar E2E de contacto/marketing, chat y compra con DB, reCAPTCHA, SMTP, Drive y servicios IA del entorno de integración; cubrir errores y reinicios. Añadir pruebas API para rutas administrativas y formularios que hoy tienen sólo dobles.
2. Probar calendario e inbox con Hermes desplegado: streaming Nginx, reconexión, permisos, datos persistidos, zonas/DST, móvil, teclado y lector de pantalla. La prueba opcional del proxy de calendario está omitida en la suite general.
3. Externalizar o persistir sesiones administrativas, OTP, rate limits y cuota del BFF de atribución si se operará con varias instancias; definir observabilidad, alertas y smoke posterior al despliegue por proceso.
4. Activar CI desde `config/github-ci.yml.example` si el repositorio aún no tiene workflow, e incluir `pnpm test` en la puerta de calidad. Actualizar `README.md`: sus requisitos/alcance y el enlace final `markdown/estado-proyecto.md` ya no describen correctamente este archivo ni la operación de releases.
5. Verificar consumidores y retirar `ADMIN_PASSWORD` del entorno después del bootstrap; mantener secretos y `.p12` fuera de Git.

### P2 — rendimiento y mantenimiento

1. Resolver las 172 advertencias actuales de lint con prioridad en páginas activas; usar `next/image` cuando corresponda y retirar símbolos/residuos comprobados.
2. Medir Lighthouse/Unlighthouse de la release web actual y revisar peso de imágenes, vídeo y modelos 3D antes de retirar recursos; contrastar con la portada estática y móvil reales.
3. Separar `backend/server.js` por dominios y versionar migraciones de MySQL/MariaDB. Mantener SRI como iniciativa independiente con sus propios criterios de certificación.

## Criterio de salida del alcance actual

El proyecto podrá declararse listo para operación comercial integral cuando la revisión servida por cada proceso esté identificada, CI y build aprueben, OTP/CRM y los dos medios de pago pasen sus recorridos reales con idempotencia, el circuito WhatsApp/atribución tenga gates y consentimiento cerrados, se observen errores en producción y se haya ensayado rollback. Las pantallas implementadas y las pruebas sintéticas no sustituyen ese criterio. **SRI no lo bloquea** porque sigue fuera del alcance operativo actual.

## Fuentes y regla documental

- Código de este checkout: `next.config.ts`, `src/app`, `src/components`, `src/lib`, `public/landing-primary`, `backend`, `package.json` y `tests`.
- Pruebas ejecutadas el 05/10: comandos y resultados de la tabla de evidencia; las cifras históricas de 7/9 pruebas backend, 35/37 rutas o 210 advertencias quedan reemplazadas.
- Producción y recuperación del 04/10: [registro de sesión](../implementation_plan.md). Calendario: [documento técnico](../docs/crm-calendar.md). Transferencias: [decisión de compra](../docs/payment-transfer-approval.md). Atribución: [plan Ads](../docs/google-ads-implementation-plan.md) y [auditoría](../docs/google-ads-tracking-audit.md).
- Toda actualización futura debe fechar código/revisión, prueba, entorno y observación de despliegue por separado. `KEYWORDS.md`, los planes de implementación y los logs son fuentes temáticas o históricas, no sustituyen este estado consolidado.
