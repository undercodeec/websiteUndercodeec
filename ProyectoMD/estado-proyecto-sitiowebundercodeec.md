# Estado del proyecto Undercodeec

> Actualización de producción: 2026-09-03 (America/Guayaquil). La actualización final de este documento prevalece sobre afirmaciones anteriores que indicaban que el CRM, proxy o despliegue seguían pendientes.

**Última actualización:** 2026-09-03 (America/Guayaquil)
**Estado global:** frontend, API Express y proxy Hermes desplegados desde la ruta correcta; las certificaciones E2E externas siguen pendientes.

## Veredicto ejecutivo

El repositorio compila para producción, TypeScript pasa y ESLint no reporta errores. Se corrigieron los 43 errores de lint que bloqueaban la línea base de calidad, se añadieron pruebas y CI, se documentó la operación, se incorporó el proxy de Hermes y se reforzó PayPhone con polling autenticado y estado persistente.

No se declara el sistema completamente certificado. PayPhone, correo, Google Drive, Gemini/TTS, base de datos y Hermes todavía necesitan pruebas end-to-end en un entorno con credenciales reales. Los cambios de esta actualización aún deben desplegarse para corregir la divergencia observada en producción.

La facturación electrónica SRI queda fuera del alcance operativo actual y se mantiene como mejora futura. No forma parte del criterio de salida de esta etapa.

## Cambios completados hasta el 2026-08-10

### Calidad y automatización

- Se corrigieron los 43 errores de ESLint: tipado del blog, reglas de Hooks, enlaces internos, render puro y configuración moderna de Swiper.
- El lint termina con **0 errores y 210 advertencias**. Las advertencias restantes son principalmente 138 usos heredados de `<img>`, 66 símbolos no utilizados, 4 dependencias de Hooks y 2 hojas de estilo globales.
- Se corrigió una dependencia implícita de `prop-types` que impedía un build limpio y una fuga de listener en `CountTo`.
- Se preparó `config/github-ci.yml.example` para ejecutar instalación reproducible, lint, build, sintaxis y pruebas. Su activación requiere credenciales de GitHub con permiso `workflow`.
- El script raíz de lint ahora revisa únicamente `src` y `next.config.ts`, sin recorrer artefactos generados.

### PayPhone

- El asistente comercial ya no depende únicamente de `postMessage`: consulta el estado cada dos segundos, valida origen y ventana emisora, limita el polling a diez minutos y maneja cierre, timeout y popup bloqueado.
- El backend emite al asistente un token opaco ligado al `clientTransactionId`; el fragmento que lo transporta se elimina antes de abrir PayPhone.
- Órdenes pendientes, hashes de tokens de sesión y aprobaciones de webhook se guardan en la tabla `payment_states` de MySQL/MariaDB, además del fallback en memoria.
- Un reclamo atómico con arrendamiento evita que webhook, confirmación y fallback procesen a la vez el mismo pedido en una o varias instancias.
- Se añadieron pruebas de autorización, expiración, orden pendiente, aprobación y reclamo exclusivo.

**Estado:** implementación local reforzada y probada de forma unitaria; falta certificar pagos reales de éxito, cancelación, webhook duplicado y reinicio.

### CRM Hermes

- Se implementó `/api/hermes/[...path]` como proxy dinámico del mismo origen.
- El proxy usa la variable privada `HERMES_API_URL`, reenvía solo cabeceras necesarias, aplica timeout, no almacena respuestas y valida los segmentos de ruta.
- El frontend puede conservar `NEXT_PUBLIC_HERMES_API_URL=/api/hermes` sin depender de una regla de proxy externa.
- Se centralizó el acceso administrativo en `/admin/crm/login/`: un único OTP crea la sesión Hermes y la sesión administrativa, manteniendo tokens separados para cada API.
- Las rutas `/admin` quedaron excluidas del telón de transición global, por lo que el login CRM abre sin preload.
- El dashboard solo carga datos reales después de validar ambas sesiones. La barra superior incluye notificaciones de handoffs pendientes, actualización cada 60 segundos y avisos opcionales del navegador para nuevas prioridades.
- Se retiraron el acceso temporal y los datos de demostración: no existe una ruta de vista previa que omita el OTP y los módulos operativos conservan la protección de sesión.
- `/admin` redirige al login central y `/admin/dashboard` redirige al módulo `/admin/crm/administracion/`.
- El shell CRM integra Resumen, Pipeline, Inbox y Administración; este último conserva pagos, formularios, facturas, uso de IA y configuración del panel anterior.

**Estado:** solución unificada implementada, compilada y validada localmente; falta configurar Hermes, probar el OTP contra servicios reales y desplegar esta revisión. La última observación pública, realizada el 2026-08-02, devolvía 404 en `/admin/crm/`.

### Documentación y configuración

- `README.md` documenta arquitectura, desarrollo, validación, despliegue y rollback.
- `config/frontend.env.example` y `config/backend.env.example` contienen el inventario canónico de variables sin secretos.
- La configuración SRI está separada y comentada como trabajo futuro.

## Evidencia local actual

| Validación | Resultado | Evidencia |
|---|---:|---|
| Build Next.js 16.1.2 | Aprobado | Compilación, TypeScript y generación de 34 páginas completadas; login y administración CRM centralizados, proxy Hermes incluido como ruta dinámica. |
| Acceso CRM local | Aprobado | `/admin/crm/login/` responde HTTP 200, conserva el OTP unificado, abre sin preload y no muestra accesos temporales. |
| ESLint | Aprobado con deuda | 0 errores y 210 advertencias. |
| Sintaxis backend | Aprobada | 22 archivos JavaScript propios pasan `node --check`. |
| Pruebas unitarias backend | Aprobadas | 7 de 7 pruebas pasan: OTP Hermes y estado PayPhone. |
| Playbook comercial | Aprobado | `test_chat_commercial_playbook.js` pasa. |
| CI | Preparado | Plantilla versionada; activación remota pendiente por permiso `workflow`. |
| PayPhone real | Pendiente | No se realizó ningún cobro durante esta actualización. |
| Servicios externos | Pendiente | No se enviaron correos ni se invocaron Drive, Gemini/TTS o Hermes reales. |

## Estado por área

### Sitio público y SEO

El build es estable y las rutas públicas, metadatos, sitemap y contenido estático siguen presentes. La deuda principal son las advertencias de imágenes heredadas y los activos grandes de `public/`. Las mediciones de rendimiento guardadas son antiguas y deben repetirse después del despliegue.

**Estado:** implementado y compilado; rendimiento actual no certificado.

### Backend y datos

La API Express mantiene más de cuarenta endpoints. El estado crítico de PayPhone ya puede sobrevivir reinicios y compartirse entre instancias mediante MySQL/MariaDB. Las sesiones administrativas, OTP y límites de frecuencia todavía usan memoria local. `backend/server.js` continúa siendo un monolito grande.

**Estado:** operativo en código y mejorado; aún requiere pruebas de arranque e integración contra una base real.

### Administración

El login visible está centralizado en `/admin/crm/login/`. El dashboard anterior se integra como módulo Administración dentro del shell CRM e incluye pagos, formularios, facturación, métricas de IA y configuración. El acceso temporal fue retirado y el panel solo solicita datos reales tras validar la sesión. No se hizo login real ni consulta a la base desplegada en esta actualización.

**Estado:** centralización implementada y build local aprobado; validación end-to-end con correo, Hermes y base real pendiente.

### Asistente comercial

Los modos ChatBot e IA, autenticación, persistencia, captura de leads, playbook, Gemini, análisis de URL, TTS y generación de cobros siguen implementados. El cierre de PayPhone ahora dispone del mismo tipo de polling autenticado del flujo principal.

**Estado:** lógica principal implementada y playbook probado; servicios externos y conversión real pendientes.

### Facturación electrónica SRI — mejora futura

El código existente de XML, firma, SOAP, estados, RIDE, correo y administración se conserva, pero no se habilita como operación actual. Faltan datos definitivos del emisor, contraseña, certificado `.p12` y evidencia en `celcer`.

Cuando se retome esta mejora se deberá:

1. Completar los datos del emisor y custodiar el `.p12` fuera de Git.
2. Mantener `SRI_AMBIENTE=1` durante toda la certificación.
3. Añadir pruebas unitarias de clave de acceso, XML, firma y totales.
4. Obtener autorizaciones reales en `celcer` y comparar XML, RIDE y correo.
5. Diseñar migración, monitoreo y rollback antes de evaluar producción.

**Estado:** implementación en desarrollo, operación aplazada. No habilitar en producción.

## Pendientes priorizados del alcance actual

### P0 — despliegue y validación real

1. Desplegar frontend y backend desde la misma revisión y configurar `HERMES_API_URL`.
2. Ejecutar PayPhone end-to-end: éxito, cancelación, webhook duplicado y reinicio entre creación y confirmación.
3. Validar que cada pago aprobado produzca una sola orden, un solo correo y una sola carpeta; verificar también que cancelar no produzca efectos secundarios.
4. Probar CRM Hermes y administración con usuarios y base del entorno desplegado.

### P1 — cobertura y operación

1. Añadir pruebas de API para chat, autenticación, formularios y endpoints administrativos.
2. Crear una prueba E2E del recorrido comercial completo.
3. Persistir o externalizar sesiones administrativas, OTP y rate limits si habrá más de una instancia.
4. Añadir monitoreo de errores, alertas y comprobación automática posterior al despliegue.

### P2 — rendimiento y mantenibilidad

1. Migrar gradualmente las 138 imágenes señaladas por ESLint a `next/image` donde sea apropiado.
2. Eliminar símbolos y componentes residuales para reducir las advertencias restantes.
3. Comprimir o retirar los activos de aproximadamente 25–112 MB.
4. Repetir Lighthouse/Unlighthouse sobre la revisión desplegada.
5. Dividir `backend/server.js` por dominios y formalizar migraciones versionadas.

## Criterio de salida de esta etapa

El alcance actual podrá considerarse listo cuando:

- build, lint sin errores y pruebas se mantengan aprobados en CI;
- la misma revisión esté desplegada en frontend y backend;
- PayPhone pase los cuatro escenarios reales definidos en P0;
- CRM y panel administrativo funcionen en el entorno desplegado;
- exista monitoreo y un rollback ensayado;
- la configuración requerida esté cargada de forma segura.

SRI no bloquea este criterio: se gestionará como iniciativa futura independiente.

## Actualización 2026-09-03 — campañas Hermes (America/Guayaquil)

Commit de implementación: `e755780 feat(crm): add WhatsApp campaign operator workspace`.

### Implementado localmente

- Nueva sección protegida `/admin/crm/campanas` y detalle de campaña dentro del shell CRM.
- Cliente centralizado ampliado mediante `/api/hermes/*`; no hay acceso directo a Meta, PostgreSQL, Gemini ni secretos.
- Selector de plantillas aprobadas, CSV local con preview de válidos, inválidos, duplicados, consentimiento y aptos; importación JSON en lotes máximos de 500.
- Acciones explícitas de iniciar, pausar, reanudar y cancelar. La UI no inicia campañas al importar.
- Teléfonos parcialmente enmascarados en detalle de destinatarios.

### Probado y pendiente

- `pnpm lint`: 0 errores y 210 advertencias heredadas, sin errores nuevos de campañas.
- `pnpm build`: compilación, TypeScript y generación estática completadas localmente.
- No está desplegado ni certificado con Hermes/Meta reales. Pendiente: configurar Hermes, aplicar su migración y realizar una prueba con un solo destinatario OPTED_IN.

## Regla documental

## Actualización de producción — 2026-09-03 (America/Guayaquil)

### Estado y niveles de evidencia

| Área | Implementado | Probado | Desplegado | Certificado E2E |
|---|---|---|---|---|
| Frontend Next.js y CRM | Sí | Build, TypeScript y 35/35 rutas | Sí, revisión `09f50f5` reportada | No integral |
| API Express | Sí | Sintaxis y pruebas backend | Sí, revisión `09f50f5` reportada | No integral |
| Proxy Hermes | Sí | `GET /api/hermes/docs/` HTTP 200 | Sí | Sólo HTTP; no flujo CRM integral |
| Corrección PayPhone | Sí | 9 pruebas backend en VPS | Sí, `09f50f5` | No pago real |
| Privacidad del login CRM | Sí, `4e4e454` | 10 pruebas backend, lint y build local | No confirmado | No |
| Campañas oficiales | Sí, `e755780` | Lint y build local | Código incluido en la revisión desplegada `09f50f5`; operación no confirmada | No |

El repositorio productivo informado es `/var/www/html/undercodeec` en `main`. La revisión `09f50f5` es la última confirmada como desplegada durante esta evidencia. Los commits posteriores publicados requieren su propio despliegue y verificación antes de declararse productivos.

### Recuperación de rutas de despliegue y assets — resuelto

- La copia histórica `/var/www/html/undercodeec/undercodeec_nextjs` causaba divergencia: PM2 y Nginx apuntaban a ella mientras el repositorio activo era `/var/www/html/undercodeec`.
- La configuración reportada como correcta usa `web-undercodeec` desde el directorio raíz en puerto 3000 y `api-undercodeec` desde `backend/server.js` con `cwd=/var/www/html/undercodeec/backend` en puerto 3002.
- Nginx fue alineado con `.next/static` y `public` del directorio raíz; los chunks, Bootstrap y assets volvieron a responder. Regla permanente: PM2 y los alias/root de Nginx deben apuntar al mismo deployment.
- El proxy interno requiere `HERMES_API_URL=https://hermes.undercodeec.com/api` mientras el Route Handler concatene el path recibido. La evidencia reporta `https://undercodeec.com/api/hermes/docs/` con HTTP 200.

Los errores `MODULE_NOT_FOUND` de la copia antigua, `ChunkLoadError`, 404 de assets y proxy sin `/api` son históricos/resueltos; no son incidencias actuales sin una observación nueva con timestamp.

### PayPhone — corrección desplegada

El reinicio por `paymentSessions is not defined` fue un cleanup legado dejado tras la migración a `paymentStateStore`. El commit `09f50f5` retiró sólo esa referencia y conserva `paymentState.cleanup(PENDING_ORDER_TTL_MS)` como único cleanup de pagos. En VPS se reportaron `node --check backend/server.js` correcto y 9 pruebas aprobadas; no quedaron referencias activas a `paymentSessions`.

La persistencia MySQL/MariaDB y los métodos de sesión, reclamo y liberación no cambiaron en ese fix. Los escenarios PayPhone reales — pago exitoso, cancelación, webhook duplicado y reinicio entre creación y confirmación — continúan pendientes de certificación E2E.

### CRM y OTP

- `/admin/` redirige a `/admin/crm/login/`; el acceso CRM no debe depender de una ruta de preview.
- La solicitud de OTP fue validada en producción: devuelve una respuesta genérica y no expone el correo autorizado. La configuración de secretos está reportada como presente, sin valores documentados.
- El commit `4e4e454` elimina del frontend el correo autorizado fijo: el operador ingresa su correo y el servidor decide silenciosamente si está autorizado. También homogeniza la respuesta durante cooldown para reducir enumeración. Está publicado y probado localmente, pero su despliegue no está confirmado en esta fecha.
- El flujo completo OTP → prueba Hermes → sesión CRM no tiene una certificación E2E nueva registrada aquí; no inferirla sólo por la validación de `request-code`.

### Runbook de despliegue vigente

1. Trabajar sólo desde `/var/www/html/undercodeec`; no usar la copia histórica salvo rollback explícito.
2. Confirmar commit, `.env`, `pm2 describe` y que Nginx no contenga referencias activas a `undercodeec_nextjs` antes de reiniciar.
3. Instalar dependencias con el gestor y lockfile del directorio correspondiente; ejecutar `node --check backend/server.js`, pruebas backend y build Next.js cuando aplique.
4. Reiniciar únicamente el proceso afectado, guardar PM2 y validar las rutas públicas y assets.
5. Al interpretar logs PM2, comparar timestamp, uptime y reinicios; los archivos pueden contener errores históricos de procesos eliminados.

Pendientes reales: certificación E2E de PayPhone; verificación integral OTP/Hermes/CRM; campañas con una prueba controlada y consentimiento; y validaciones de servicios externos no ejecutadas específicamente. `ADMIN_PASSWORD` permanece como deuda P1: comprobar consumidores y retirarlo de forma controlada, sin mezclarlo con despliegues.

Este es el único archivo de estado del proyecto. Debe actualizarse con fecha y evidencia usando estas categorías:

- **Implementado:** existe en el código.
- **Probado:** tiene una validación repetible que pasa.
- **Desplegado:** está presente en el entorno público.
- **Certificado:** una integración externa fue validada de extremo a extremo.

`KEYWORDS.md`, `contenido-pagina-es.md` e `implementation_plan.md` son documentación temática o planes, no fuentes del estado actual.
