# Estado del proyecto Undercodeec

**Última actualización:** 2026-08-03 (America/Guayaquil)
**Estado global:** desarrollo local validado; despliegue y pruebas con servicios reales pendientes.

## Veredicto ejecutivo

El repositorio compila para producción, TypeScript pasa y ESLint no reporta errores. Se corrigieron los 43 errores de lint que bloqueaban la línea base de calidad, se añadieron pruebas y CI, se documentó la operación, se incorporó el proxy de Hermes y se reforzó PayPhone con polling autenticado y estado persistente.

No se declara el sistema completamente certificado. PayPhone, correo, Google Drive, Gemini/TTS, base de datos y Hermes todavía necesitan pruebas end-to-end en un entorno con credenciales reales. Los cambios de esta actualización aún deben desplegarse para corregir la divergencia observada en producción.

La facturación electrónica SRI queda fuera del alcance operativo actual y se mantiene como mejora futura. No forma parte del criterio de salida de esta etapa.

## Cambios completados el 2026-08-03

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

**Estado:** solución local compilada; falta configurar Hermes y desplegar esta revisión. La última observación pública, realizada el 2026-08-02, devolvía 404 en `/admin/crm/`.

### Documentación y configuración

- `README.md` documenta arquitectura, desarrollo, validación, despliegue y rollback.
- `config/frontend.env.example` y `config/backend.env.example` contienen el inventario canónico de variables sin secretos.
- La configuración SRI está separada y comentada como trabajo futuro.

## Evidencia local actual

| Validación | Resultado | Evidencia |
|---|---:|---|
| Build Next.js 16.1.2 | Aprobado | Compilación, TypeScript y generación de 33 páginas completadas; proxy Hermes incluido como ruta dinámica. |
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

Login, recuperación, dashboard, pagos, leads, chat y pantallas de facturas compilan. No se hizo login real ni consulta a la base desplegada en esta actualización.

**Estado:** implementado; validación end-to-end pendiente.

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

## Regla documental

Este es el único archivo de estado del proyecto. Debe actualizarse con fecha y evidencia usando estas categorías:

- **Implementado:** existe en el código.
- **Probado:** tiene una validación repetible que pasa.
- **Desplegado:** está presente en el entorno público.
- **Certificado:** una integración externa fue validada de extremo a extremo.

`KEYWORDS.md`, `contenido-pagina-es.md` e `implementation_plan.md` son documentación temática o planes, no fuentes del estado actual.
