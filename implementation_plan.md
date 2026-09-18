# Plan de implementación: atribución publicitaria en UnderCodeEC

## Estado de implementación local

Actualizado el 17 de septiembre de 2026:

- `IMPLEMENTADO`: Consent Mode v2 denegado por defecto, gestor de preferencias, carga condicionada de GTM y Meta Pixel, y eliminación de la carga directa duplicada de GA4.
- `IMPLEMENTADO`: captura permitida de click IDs/UTM, conservación temporal condicionada, validación cerrada y exclusión de datos publicitarios cuando no existe consentimiento.
- `IMPLEMENTADO`: BFF `/api/attribution/whatsapp`, autenticación servidor a servidor, timeout, validación, rate limit local de defensa y errores sanitizados.
- `IMPLEMENTADO`: referencia opcional en el botón global y enlaces comerciales `wa.me`, con fallback sin referencia y exclusión del enlace para compartir el blog.
- `IMPLEMENTADO`: sección `/admin/crm/publicidad` y cliente de endpoints publicitarios de Hermes, con estados verificado, estimado, pendiente y no disponible.
- `PROBADO`: pruebas locales del frontend, backend, lint focalizado y build de producción.
- `VERIFICADO EN CÓDIGO DE HERMES`: contrato HTTP real para intenciones, panel, mapeos, métricas, historial, hitos comerciales y revocación.
- `PENDIENTE`: CMP/textos aprobados, rate limit compartido de infraestructura, prueba multidispositivo y revisión jurídica.
- `NO DESPLEGADO`, `NO PROBADO CONTRA LA INSTANCIA REAL DE HERMES` y `NO VALIDADO CON GOOGLE`.

## 1. Propósito

Implementar en este repositorio la parte web de la atribución de campañas de Google Ads que llevan al visitante desde UnderCodeEC hasta una conversación de WhatsApp atendida por Hermes.

El alcance se limita a `D:\Documentos\undercodeec_nextjs`. Hermes es un sistema relacionado, pero independiente. Sus cambios internos no forman parte de este trabajo.

UnderCodeEC debe:

- capturar los identificadores publicitarios y parámetros UTM recibidos por la web;
- respetar el consentimiento antes de activar etiquetas o persistir información cuando corresponda;
- solicitar al servidor una referencia opaca para el contacto por WhatsApp;
- añadir la referencia al mensaje sin incluir datos publicitarios ni personales;
- continuar abriendo WhatsApp si el servicio de atribución falla;
- mostrar en el panel CRM los datos que Hermes exponga mediante una API autenticada;
- conservar el diseño, SEO, accesibilidad y flujos actuales.

## 2. Límite del proyecto

### 2.1 Incluido en UnderCodeEC

1. Auditar y corregir las etiquetas existentes en `src/app/layout.tsx`.
2. Integrar una plataforma de consentimiento o conectarse explícitamente con la que se configure mediante GTM.
3. Configurar Consent Mode v2 con estado denegado por defecto cuando sea aplicable.
4. Capturar `gclid`, `gbraid`, `wbraid`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term`.
5. Conservar temporalmente la atribución en el navegador conforme al consentimiento y la retención aprobada.
6. Crear un endpoint BFF del mismo origen para pedir a Hermes una referencia sin exponer secretos.
7. Adaptar los CTA comerciales de WhatsApp para utilizar esa referencia.
8. Medir el clic como interacción, sin declararlo conversación, lead o venta.
9. Crear la pantalla `Publicidad y atribución` en `/admin/crm`, consumiendo endpoints autenticados de Hermes.
10. Añadir pruebas del código de este repositorio y documentación de configuración, despliegue y rollback.

### 2.2 Fuera de alcance: responsabilidad de Hermes

No se debe implementar aquí:

- cambios en NestJS, Prisma o PostgreSQL de Hermes;
- modelos de atribución, conversión o sincronización de Hermes;
- procesamiento del webhook de WhatsApp Cloud API;
- resolución de referencias contra contactos, leads u oportunidades;
- reglas de primer/último contacto o atribución por oportunidad;
- cambios en la IA, handoff humano o pipeline comercial;
- registro de reuniones, propuestas, contratos, pagos o ingresos en Hermes;
- BullMQ, Redis, reintentos o idempotencia de trabajos de Hermes;
- exportación de conversiones mediante Google Data Manager API;
- consultas mediante Google Ads API;
- credenciales privadas de Google Ads o Google Cloud;
- cambios en campañas masivas de WhatsApp;
- migraciones o despliegues del repositorio Hermes.

Estas funciones solo aparecerán como contratos externos o dependencias de integración.

### 2.3 Exclusiones adicionales

- Crear o modificar campañas, presupuestos o pujas de Google Ads.
- Remarketing y Customer Match.
- Crear un CRM nuevo o duplicar datos comerciales en MySQL.
- Crear leads o conversaciones al pulsar un enlace.
- Acceder desde el navegador a Google Data Manager o Google Ads API.
- Desplegar a producción sin autorización explícita.

## 3. Auditoría preliminar

Estado observado en el código local el 17 de septiembre de 2026; debe volver a verificarse antes de implementar.

### 3.1 Arquitectura reutilizable

- Next.js 16 y React 19 en `src/`.
- API Express 5 en `backend/server.js`.
- Panel CRM en `src/app/admin/crm`.
- Cliente de Hermes en `src/lib/hermes/api.js`.
- Proxy de mismo origen en `src/app/api/hermes/[...path]/route.ts`.
- URL privada configurada mediante `HERMES_API_URL`.
- Pruebas del frontend con `node:test` en `tests/`.

### 3.2 Medición y consentimiento

`src/app/layout.tsx` carga globalmente:

- Google Tag Manager `GTM-WX7HLGTV`;
- Google Analytics 4 directo `G-99Z5CCZ3RK`;
- Meta Pixel `1528924045213380`;
- variantes `noscript` de GTM y Meta.

No se encontró una CMP ni una inicialización explícita de Consent Mode v2. Las etiquetas se cargan sin esperar preferencias. Existe riesgo de doble medición si GTM también instala GA4; se debe inspeccionar el contenedor publicado antes de retirar o conservar la etiqueta directa.

También hay llamadas dispersas a `ReactGA` y `window.fbq`. Deben pasar gradualmente por una sola capa que respete el consentimiento.

### 3.3 Enlaces de WhatsApp

El acceso global está en:

- `src/components/HermesWhatsAppButton/index.jsx`
- `src/components/HermesWhatsAppButton/config.mjs`

Hay más enlaces `wa.me` en navegación, footers, landings, hosting, marketing y el asistente comercial. Los CTA de ventas deben participar en la atribución. El enlace para compartir una publicación del blog no es contacto comercial y queda excluido. El código legado o no montado no se modificará sin comprobar su uso.

El botón global registra actualmente `WhatsAppHermesClick` en Meta Pixel, pero usa una URL estática y no solicita referencia.

### 3.4 Integración con Hermes

El proxy `/api/hermes/*` está orientado al CRM autenticado. La intención pública de WhatsApp debe usar un BFF específico, con payload permitido, límites y timeout propios; no debe exponer un token administrativo ni ampliar ciegamente el proxy genérico.

El dashboard consume actualmente resumen, embudo, leads, conversaciones y campañas. No existe aún un contrato local para atribución o informes publicitarios.

## 4. Arquitectura propuesta

```text
Visitante con click IDs/UTM
        |
        v
UnderCodeEC (navegador)
  - consentimiento
  - captura permitida
  - conservación temporal
        |
        | POST mismo origen
        v
UnderCodeEC BFF (Next.js)
  - validación y timeout
  - credencial servidor a servidor
        |
        v
Hermes API (dependencia externa)
  - persiste intención
  - devuelve referencia UC-...
        |
        v
UnderCodeEC abre WhatsApp
  - con referencia si está disponible
  - sin referencia si hubo un fallo
```

La confirmación de la conversación, su asociación comercial y cualquier envío a Google ocurren fuera de este repositorio.

### 4.1 Componentes previstos

Los nombres se ajustarán a las convenciones vigentes durante la implementación:

- `src/components/Consent/ConsentProvider.*`: estado de consentimiento.
- `src/components/Consent/ConsentBanner.*`: aceptar, rechazar y configurar.
- `src/lib/analytics/consent.*`: Consent Mode v2.
- `src/lib/analytics/events.*`: capa única de eventos.
- `src/lib/attribution/params.*`: lista permitida y validación.
- `src/lib/attribution/storage.*`: conservación temporal.
- `src/components/AttributionBootstrap.*`: captura al entrar o navegar.
- `src/app/api/attribution/whatsapp/route.ts`: BFF público limitado.
- `src/components/HermesWhatsAppButton/*`: referencia y fallback.
- `src/lib/hermes/api.js`: métodos autenticados del dashboard.
- `src/app/admin/crm/publicidad/page.jsx`: pantalla publicitaria.
- `src/app/admin/crm/_components/CrmShell.jsx`: entrada de navegación.

No se creará una tabla local que replique atribuciones de Hermes. El navegador solo tendrá almacenamiento temporal; Hermes seguirá siendo la fuente de verdad comercial.

## 5. Contrato externo verificado en el código de Hermes

Contrato observado el 17 de septiembre de 2026 en el repositorio relacionado de Hermes. UnderCodeEC implementa únicamente el cliente y el adaptador; la verificación del código no equivale a una prueba contra la instancia desplegada.

### 5.1 Registrar intención

```http
POST {HERMES_API_URL}/advertising/contact-intents
X-Hermes-Attribution-Key: <AD_ATTRIBUTION_INTEGRATION_KEY de Hermes>
Content-Type: application/json
```

```json
{
  "gclid": "valor-opcional",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "valor-opcional",
  "utmContent": "valor-opcional",
  "utmTerm": "valor-opcional",
  "landingPage": "https://undercodeec.com/es",
  "visitedAt": "2026-09-17T18:30:00.000Z",
  "consent": {
    "analyticsStorage": "GRANTED",
    "adStorage": "GRANTED",
    "adUserData": "DENIED",
    "adPersonalization": "DENIED",
    "source": "UNDERCODEEC_WEB:valor-versionado",
    "recordedAt": "2026-09-17T18:29:50.000Z"
  }
}
```

Respuesta:

```json
{
  "reference": "UC-ABCDEFGHJKLMNPQRSTUVWX",
  "expiresAt": "2026-09-18T18:30:00.000Z",
  "messageSuffix": "Referencia: UC-ABCDEFGHJKLMNPQRSTUVWX"
}
```

Propiedades verificadas:

- la referencia es opaca, aleatoria y no contiene datos personales ni publicitarios;
- cumple exactamente `^UC-[A-Z2-7]{22}$`;
- Hermes controla expiración, unicidad y consumo;
- una intención no equivale a conversación, lead o conversión confirmada;
- no se devuelven datos personales.

El BFF devolverá al navegador solo `reference` y `expiresAt`, con `Cache-Control: no-store`.

### 5.2 Datos del dashboard

Endpoints autenticados existentes:

```text
GET  /advertising/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD
GET  /advertising/status
PUT  /advertising/integration                         # ADMIN
GET  /advertising/mappings
PUT  /advertising/mappings                            # ADMIN
GET  /advertising/metrics?from=YYYY-MM-DD&to=YYYY-MM-DD
POST /advertising/metrics/sync                        # ADMIN
GET  /advertising/leads/:leadId/history
POST /advertising/leads/:leadId/events
POST /advertising/contacts/:contactId/revoke          # ADMIN
```

`dashboard` devuelve `connectionStatus`, totales `verified`, datos opcionales `advertising` y ratios `calculated`. `status` expone configuración, credenciales configuradas, `realSendsEnabled`, mapeos y conteos de sincronización. La interfaz traduce valores `null` a “No disponible” y no accede directamente a Google; consultas, reconciliación y cálculos comerciales pertenecen a Hermes.

## 6. Reglas de captura y privacidad

1. Leer únicamente parámetros permitidos e ignorar el resto.
2. Preservar valores válidos como fueron recibidos, aplicando límites de formato y longitud.
3. No inventar click IDs cuando no existan.
4. Guardar solo el `pathname` aprobado, no la URL completa con parámetros arbitrarios.
5. No incluir nombre, teléfono, correo, formularios ni texto libre.
6. No escribir click IDs, UTM o referencias en logs o errores.
7. Emitir el consentimiento por defecto antes de cargar etiquetas:

```js
gtag("consent", "default", {
  ad_storage: "denied",
  analytics_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied"
});
```

8. Bloquear también Meta Pixel antes del consentimiento aplicable.
9. Dar igual visibilidad a aceptar y rechazar, permitir reabrir preferencias y revocar.
10. Someter retención, base jurídica, textos y clasificación de tecnologías a revisión jurídica para España. Este plan no certifica cumplimiento.
11. No sobrescribir una atribución válida con valores vacíos. La política final de primera/última visita depende de la regla acordada con Hermes.

## 7. Comportamiento del CTA

1. El visitante activa un CTA comercial.
2. El sitio envía al BFF únicamente el payload permitido.
3. Se aplica un timeout corto.
4. Con referencia válida, se genera:

   `Hola, quisiera obtener información sobre los servicios de Undercodeec. Referencia: UC-7K4M9Q2X`

5. Se abre `https://wa.me/<numero>?text=<mensaje codificado>`.
6. Ante timeout, error, rate limit o respuesta inválida, se abre WhatsApp con el texto original.
7. `whatsapp_click` se registra solo como interacción y cuando el consentimiento lo permita.
8. El sitio nunca registra `conversation_started`, `lead_qualified` ni una venta.

La solución debe evitar el bloqueo de popups y probarse en iOS Safari, Android Chrome y escritorio.

## 8. Seguridad del BFF

- Solo `POST`.
- Esquema cerrado y límites por campo.
- Límite estricto del cuerpo y solo JSON.
- Verificación de `Origin` y `Host`.
- Timeout y cancelación de la llamada a Hermes.
- `Cache-Control: no-store`.
- Errores sanitizados.
- Rate limiting en una capa compartida de producción, no solo en memoria.
- Secreto independiente de los tokens del CRM.
- Ningún secreto en variables `NEXT_PUBLIC_*`.

Variables previstas:

```dotenv
HERMES_API_URL=
HERMES_ATTRIBUTION_KEY=
ATTRIBUTION_ALLOWED_ORIGINS=
ATTRIBUTION_REQUEST_TIMEOUT_MS=
NEXT_PUBLIC_CONSENT_POLICY_VERSION=
```

Se reutilizará `HERMES_API_URL` para evitar configuraciones contradictorias.

## 9. Entregas

### Entrega 0: decisiones previas

- Revisar el contenedor GTM publicado.
- Confirmar la CMP para España.
- Mantener versionado el contrato verificado de la sección 5.
- Definir retención, atribución y dominios de producción.
- Clasificar los CTA como comerciales, compartir contenido o legado.
- Confirmar el número comercial, porque el repositorio contiene números diferentes.

### Entrega 1: consentimiento y medición

- Establecer Consent Mode v2 antes de las etiquetas.
- Integrar banner/CMP.
- Evitar doble instalación de GA4.
- Bloquear Meta y eventos no esenciales cuando corresponda.
- Crear una API interna única de eventos.
- Documentar configuración manual de GTM, GA4 y Meta.

Criterio: aceptar, rechazar y revocar funcionan sin duplicar pageviews.

### Entrega 2: captura

- Implementar parseo permitido y límites.
- Capturar en rutas públicas, incluidas `/es` y `/ec`.
- Conservar temporalmente según consentimiento.
- Evitar que navegación interna borre el origen válido.
- Probar click IDs, UTM, ausencia de parámetros y entradas inválidas.

Criterio: se construye un payload válido sin enviar todavía datos reales.

### Entrega 3: referencia y WhatsApp

- Crear el BFF.
- Implementar cliente con timeout y fallback.
- Adaptar primero `HermesWhatsAppButton`.
- Migrar después los CTA comerciales activos a un helper común.
- Excluir el botón de compartir publicaciones.

Criterio: los CTA priorizados abren WhatsApp con referencia cuando Hermes responde y sin ella cuando falla.

### Entrega 4: dashboard

- Añadir `Publicidad y atribución` a la navegación.
- Consumir endpoints autenticados de Hermes.
- Mostrar inversión, conversaciones, leads, reuniones, propuestas, contratos e ingresos cuando existan.
- Calcular ratios solo con datos, moneda y período compatibles.
- Diferenciar verificado, estimado, pendiente y no disponible.
- Mostrar `Pendiente de conexión` si Hermes no tiene métricas de Google.

Criterio: funciona con mocks y con el contrato real, sin acceder directamente a Google.

### Entrega 5: estabilización

- Ejecutar pruebas, lint y build.
- Revisar accesibilidad, responsive y regresiones.
- Verificar que no haya secretos o click IDs en bundles y logs.
- Documentar configuración, despliegue y rollback.
- Preparar una prueba controlada sin desplegarla ni ejecutarla en producción sin autorización.

## 10. Pruebas de UnderCodeEC

### 10.1 Automatizadas

1. Captura de cada parámetro permitido.
2. Preservación de valores válidos y rechazo de entradas fuera de límite.
3. Visita sin identificadores.
4. Consentimiento aceptado, rechazado y revocado.
5. Etiquetas bloqueadas antes del consentimiento.
6. Ausencia de pageviews duplicados.
7. Payload sin PII ni parámetros desconocidos.
8. Respuesta válida del BFF.
9. Timeout, `4xx`, `5xx` y JSON inválido de Hermes.
10. Fallback sin referencia.
11. Validación del formato de referencia.
12. Doble clic desde la perspectiva del cliente.
13. Exclusión del enlace para compartir el blog.
14. `unavailable` mostrado como no disponible, no cero.
15. Autenticación y expiración de sesión del dashboard.
16. Regresión del botón de WhatsApp y CRM existentes.

Hermes se simulará con mocks. Pruebas de webhook, Prisma, BullMQ, conversiones y Google API no pertenecen a este repositorio.

### 10.2 Manuales

#### Preparación obligatoria

- Desplegar esta revisión de UnderCodeEC y configurar `HERMES_API_URL`, `HERMES_ATTRIBUTION_KEY`, `ATTRIBUTION_ALLOWED_ORIGINS` y `NEXT_PUBLIC_CONSENT_POLICY_VERSION`.
- Confirmar que `HERMES_ATTRIBUTION_KEY` coincide con `AD_ATTRIBUTION_INTEGRATION_KEY` en Hermes.
- Usar una cuenta CRM `ADMIN` para configuración y una `SALES_AGENT` para verificar restricciones de rol.
- Mantener en Hermes `ADVERTISING_GOOGLE_SEND_ENABLED=false`. Para la prueba de validación, habilitar temporalmente `ADVERTISING_GOOGLE_SYNC_ENABLED=true` y `conversionSyncEnabled=true`.
- El CRM puede mostrar `realSendsEnabled`, pero el endpoint de estado de Hermes no expone `ADVERTISING_GOOGLE_SYNC_ENABLED`; ese indicador debe verificarse en la configuración operativa de Hermes.
- Mantener `metricsSyncEnabled=false` y no ejecutar “Sincronizar métricas” durante esta prueba controlada.

#### Recorrido de interfaz CRM

1. Iniciar sesión mediante OTP y confirmar que aparece `Publicidad y atribución` en la navegación.
2. Abrir `/admin/crm/publicidad` y comprobar rango de fechas, resumen verificado, indicadores calculados, estado de conexión, configuración, mapeos y tabla de campañas.
3. Verificar que, sin métricas, la interfaz dice `No disponible` o `PENDING_CONNECTION` y no muestra ceros inventados.
4. Confirmar que el banner indica modo seguro y que `realSendsEnabled` está desactivado antes de cualquier prueba.
5. Como `SALES_AGENT`, confirmar que configuración, mapeos, sincronización de métricas y revocación no son editables; el registro de hitos sí debe estar disponible.
6. Abrir un lead y comprobar el panel `Atribución e hitos verificables`, el identificador enmascarado, consentimiento, referencia abreviada, historial y estado del trabajo de sincronización.
7. Revisar escritorio, Android Chrome e iPhone Safari; incluir navegación, foco, formularios, scroll, tablas y textos largos.

#### Flujo controlado extremo a extremo

1. Entrar desde un clic real de Google Ads que incluya `gclid`, `gbraid` o `wbraid`.
2. Aceptar la categoría publicitaria y verificar que Consent Mode informa `ad_user_data=GRANTED`.
3. Pulsar un CTA comercial de WhatsApp y confirmar que el mensaje incluye una sola referencia con formato `UC-[A-Z2-7]{22}`.
4. Enviar realmente el mensaje desde WhatsApp. Un clic sin mensaje enviado no cuenta como conversación.
5. Esperar la confirmación de Hermes y abrir el lead correspondiente en el CRM.
6. Cambiar la etapa del lead a `Calificado`; Hermes debe producir `LEAD_QUALIFIED` por sus reglas internas.
7. Actualizar el panel del lead y confirmar que el historial muestra `LEAD_QUALIFIED`, `VALIDATED` y `validateOnly`.
8. Volver a dejar `conversionSyncEnabled=false` y `ADVERTISING_GOOGLE_SYNC_ENABLED=false` al terminar.

#### Casos negativos y privacidad

- Rechazar consentimiento: no deben persistirse click IDs/UTM ni agregarse referencia al mensaje.
- Reabrir preferencias, aceptar y revocar; las etiquetas deben responder al cambio sin duplicar pageviews.
- Simular timeout, error `4xx`/`5xx` o Hermes no disponible: WhatsApp debe abrir con el mensaje original.
- Pulsar dos veces el CTA: no debe filtrarse un click ID ni agregarse más de una referencia al texto.
- Compartir una publicación del blog por WhatsApp: no debe solicitar ni adjuntar referencia comercial.
- Confirmar en red, consola y logs que no aparecen secretos, click IDs completos, correo, teléfono ni texto libre.

### 10.3 Comandos

```powershell
pnpm test
pnpm lint
pnpm build
pnpm --dir backend test
git diff --check
```

No se usarán credenciales productivas ni se enviarán conversiones ficticias.

## 11. Criterios de aceptación

UnderCodeEC puede marcarse como implementado cuando:

- el consentimiento controla las etiquetas aprobadas;
- no existe doble medición conocida de GA4;
- solo se capturan parámetros permitidos;
- el navegador no recibe secretos de Hermes o Google;
- los CTA comerciales agregan una referencia válida;
- un fallo no impide abrir WhatsApp;
- un clic no se declara conversación, lead o venta;
- el dashboard representa correctamente datos y ausencias;
- pruebas, lint y build terminan correctamente;
- variables y acciones manuales están documentadas.

Esto no valida el flujo completo. La aceptación extremo a extremo requiere una campaña controlada, un mensaje realmente enviado, resolución en Hermes, un hito comercial y el diagnóstico de Google. Es una validación conjunta y externa.

## 12. Estados de entrega

- `IMPLEMENTADO`: el código existe en UnderCodeEC.
- `PROBADO`: pasó pruebas locales o con mocks.
- `DESPLEGADO`: está instalado en un entorno identificado.
- `INTEGRADO CON HERMES`: se verificó contra una instancia real.
- `VALIDADO CON GOOGLE`: Google confirmó o diagnosticó el evento.

No se debe inferir un estado a partir de otro.

## 13. Bloqueos externos

1. Acceso de lectura o informe del contenedor GTM.
2. Selección y configuración de la CMP.
3. Revisión jurídica para España.
4. Confirmación del número comercial de WhatsApp.
5. Confirmación operativa de formato y expiración en la instancia desplegada.
6. Secreto compartido y URL de la instancia real de Hermes.
7. Dominios y rate limiting de producción.
8. Entorno controlado para la prueba extremo a extremo.

Estos bloqueos no autorizan cambios en Hermes desde este repositorio.

## 14. Entrega final

Se documentará:

1. archivos modificados;
2. decisiones de consentimiento y medición;
3. versión del contrato de Hermes;
4. variables de entorno sin secretos;
5. pruebas y resultados;
6. configuración manual pendiente;
7. despliegue y rollback;
8. riesgos y limitaciones;
9. estado real según la sección 12;
10. tareas que siguen perteneciendo a Hermes.

No se realizarán commits, migraciones externas ni despliegues salvo solicitud explícita.
