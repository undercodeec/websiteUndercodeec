# Estado del proyecto Undercodeec

**Última auditoría:** 2026-08-02 (America/Guayaquil)
**Estado global:** operativo parcial; desarrollo avanzado, pero no todo el sistema está validado para producción.

## Veredicto ejecutivo

El sitio público y la API principal están en línea, y el frontend actual genera correctamente su build de producción. El repositorio contiene implementaciones amplias para pagos PayPhone, administración, asistente comercial con IA, CRM Hermes y facturación electrónica SRI.

No es correcto declarar el proyecto completo o totalmente certificado. Persisten cuatro brechas principales:

1. El frontend tiene 43 errores y 232 advertencias de ESLint.
2. Las integraciones críticas no tienen pruebas automatizadas ni una validación end-to-end reciente: PayPhone, SRI, correo, base de datos, Google Drive y Gemini/TTS.
3. La facturación SRI no puede operar con la configuración local auditada: faltan datos del emisor, contraseña y archivo `.p12`.
4. Producción no coincide por completo con este repositorio: la ruta local `/admin/crm/` compila, pero en producción devuelve 404.

## Evidencia de la auditoría

Se revisaron el código frontend y backend, la configuración, las rutas, los documentos históricos de estado, las variables requeridas y los scripts de prueba. No se realizaron pagos, emisiones SRI, envíos de correo ni cambios sobre bases de datos externas.

### Validaciones ejecutadas

| Validación | Resultado | Lectura correcta |
|---|---:|---|
| Build Next.js 16.1.2 | Aprobado | Compiló, validó TypeScript y generó 33 rutas sin error. |
| ESLint sobre `src` y `next.config.ts` | Falló | 43 errores y 232 advertencias. |
| Sintaxis JavaScript del backend | Aprobada | Todos los `.js` propios de `backend/` pasan `node --check`. |
| Playbook comercial | Aprobado | El script `test_chat_commercial_playbook.js` pasa. |
| Autenticación OTP del CRM | Aprobada | 3 de 3 pruebas pasan. |
| Pruebas frontend | Inexistentes | No hay suite unitaria, de componentes ni E2E. |
| Pruebas de PayPhone | Inexistentes | Solo hay bitácora manual histórica. |
| Pruebas de facturación SRI | Inexistentes | No hay prueba contra `celcer` ni pruebas unitarias del XML/firma. |
| CI/CD | Inexistente | No hay workflow de CI ni manifiesto de despliegue versionado. |

### Comprobación pública realizada

| Recurso | Resultado observado |
|---|---:|
| `https://undercodeec.com/` | HTTP 200 |
| Rutas públicas principales | HTTP 200 |
| `https://undercodeec.com/sitemap.xml` | HTTP 200 |
| `https://api.undercodeec.com/api/health` | HTTP 200, estado `ok` |
| Endpoints protegidos de chat y facturas sin token | HTTP 401, protección activa |
| `https://undercodeec.com/admin/crm/` | HTTP 404 |

La comprobación HTTP solo demuestra disponibilidad básica; no certifica flujos autenticados ni operaciones externas.

## Estado real por área

### 1. Sitio público y SEO — operativo con deuda técnica

- Hay 26 archivos de página y el build produce 33 rutas, incluidas home, servicios, blog, páginas regionales Ecuador/España, contacto, hosting, portal y paneles administrativos.
- Existen `robots.txt`, sitemap, metadatos, datos estructurados y cuatro artículos de blog generados estáticamente.
- Las rutas públicas principales responden en producción.
- El `README.md` sigue siendo el texto genérico de Create Next App; no documenta la arquitectura real ni la operación.
- El lint falla en tipado, reglas de React Hooks, navegación y otros puntos. El build pasa porque estos errores no lo bloquean.
- No hay pruebas frontend automatizadas.

**Estado:** funcional y desplegado, no limpio ni suficientemente cubierto.

### 2. Rendimiento — optimizaciones aplicadas, resultado actual no certificado

- Sí están aplicados `next/dynamic`, carga diferida con `IntersectionObserver`, fachada de Calendly y estrategias diferidas para scripts.
- Las mediciones guardadas de Unlighthouse corresponden a junio de 2026 y no validan el código actual.
- Continúan activos muy pesados en `public/`: un video de aproximadamente 112 MB, modelos GLB de aproximadamente 91 MB y 31 MB, y un WAV de aproximadamente 25 MB.
- El layout global aún carga CSS legacy y varios scripts de terceros.

**Estado:** trabajo de optimización parcial; hace falta una medición limpia y actual de producción.

### 3. Backend/API — operativo, monolítico y con cobertura mínima

- Backend Express 5 separado, con MySQL/MariaDB y más de cuarenta endpoints para pagos, chat, formularios, administración, CRM y facturas.
- La API pública responde `ok` y los endpoints protegidos auditados rechazan accesos sin token.
- La mayor parte de la lógica vive en `backend/server.js`, un archivo de más de cuatro mil líneas.
- Sesiones administrativas, OTP, límites, órdenes pendientes y confirmaciones PayPhone usan `Map` en memoria. Un reinicio pierde ese estado y varias instancias no lo comparten.
- No hay prueba de integración del arranque con la base de datos ni migraciones versionadas. El archivo `database_schema.sql` mencionado en documentos antiguos no existe.
- `backend/.env.example` solo documenta variables del OTP CRM y omite la mayoría de variables requeridas por pagos, DB, correo, chat y SRI.

**Estado:** API viva y con controles básicos, pero con riesgo operativo por estado en memoria, documentación incompleta y baja cobertura.

### 4. Administración clásica — implementada, no validada end-to-end

- Existe acceso admin con código de verificación, recuperación/cambio de contraseña y sesiones protegidas.
- El dashboard contiene pagos, leads, consumo/conversaciones del chat y facturación.
- La UI de facturas incluye emisión manual o desde un pago, listado, detalle, reintento, XML, RIDE y reenvío por email.
- El build valida estas pantallas, pero no se probó un login real ni consultas contra la base de producción.

**Estado:** implementado en código; validación operativa pendiente.

### 5. Asistente IA comercial — mayormente implementado

- Hay modos ChatBot e IA, registro, verificación de correo, login, recuperación, cierre por inactividad y niveles de uso.
- Se implementaron persistencia de sesiones/mensajes, captura de leads, intención comercial, puntuación, temperatura, próxima acción y WhatsApp dinámico por servicio.
- Incluye respuestas estáticas para reducir consumo, Gemini, análisis de URLs, TTS y generación de enlaces PayPhone cuando el usuario está listo para comprar.
- El playbook comercial tiene pruebas y estas pasan.
- No existen pruebas del endpoint `/api/chat`, streaming, autenticación completa, Gemini, TTS, scraping, captura de lead o pago desde el asistente.

**Estado:** funcionalidad principal presente; integración y conversión real no certificadas.

### 6. PayPhone — flujo principal reforzado, cierre incompleto en el asistente

- El flujo de planes implementa token de sesión, webhook verificado, caché temporal de aprobaciones, polling, cierre del popup, deduplicación y TTL de órdenes pendientes.
- El polling del flujo principal tiene un límite aproximado de diez minutos.
- `AIAssistant/index.jsx` todavía depende únicamente de `postMessage` para cerrar su popup PayPhone; no replica el polling/fast-path del flujo de planes.
- No hay prueba automatizada ni evidencia reciente de dos casos indispensables: pago aprobado con un solo email/carpeta y cierre sin pagar sin efectos secundarios.
- Las órdenes pendientes y aprobaciones viven en memoria; un reinicio entre creación y webhook puede romper la correlación.

**Estado:** implementado parcialmente y pendiente de validación real; el flujo del asistente conserva una brecha conocida.

### 7. Facturación electrónica SRI — código construido, operación bloqueada

- Existen tabla `invoices`, builder, firma XAdES-BES, cliente SOAP, servicio de estados, RIDE, correo, endpoints admin e interfaz.
- La dependencia `open-factura` está instalada.
- La configuración local auditada tiene vacíos en `SRI_RUC`, `SRI_RAZON_SOCIAL`, `SRI_DIR_MATRIZ` y `SRI_P12_PASSWORD`.
- `backend/secrets/` no contiene un certificado `.p12`; solo contiene su `.gitignore`.
- No se ha demostrado una factura autorizada en `celcer`, comparación de XML/RIDE ni emisión real en producción.

**Estado:** fases de construcción completadas, pero no está listo para emitir. Mantener `SRI_AMBIENTE=1` hasta certificar todo el flujo.

### 8. CRM Hermes — frontend local presente, despliegue pendiente

- Existen dashboard, leads, detalle, inbox, handoff y login passwordless.
- La prueba unitaria del OTP/proof pasa.
- El CRM depende de una API Hermes separada y de secretos compartidos.
- La configuración frontend local auditada no define `NEXT_PUBLIC_HERMES_API_URL`; el fallback `/api/hermes` requiere un proxy que no forma parte de Next.js.
- La ruta `/admin/crm/` existe en el build local, pero devuelve 404 en producción.

**Estado:** integración desarrollada localmente; no desplegada o no enrutada en producción.

## Prioridades reales

### P0 — bloqueos de operación

1. Completar datos y certificado SRI, crear pruebas unitarias y certificar primero en `celcer`.
2. Validar PayPhone end-to-end y añadir al asistente el mismo fallback de polling del flujo principal.
3. Desplegar o retirar temporalmente el CRM Hermes; hoy el repositorio y producción divergen.
4. Persistir órdenes pendientes, aprobaciones y sesiones críticas fuera de memoria si habrá reinicios o más de una instancia.

### P1 — calidad antes de ampliar funciones

1. Corregir los 43 errores de ESLint.
2. Añadir pruebas de API e integraciones críticas, más una prueba E2E del recorrido comercial.
3. Completar `.env.example` de frontend y backend sin secretos.
4. Reemplazar el README genérico por instrucciones reales de desarrollo, despliegue, rollback y operación.
5. Crear CI que ejecute build, lint y pruebas en cada cambio.

### P2 — rendimiento y mantenibilidad

1. Repetir Lighthouse/Unlighthouse sobre el despliegue actual y registrar un nuevo baseline.
2. Comprimir o eliminar los activos de 25–112 MB y confirmar que ninguno se precarga innecesariamente.
3. Dividir `backend/server.js` por dominios y versionar migraciones de base de datos.
4. Reducir logs temporales de PayPhone y eliminar código/CSS residual.

## Criterio para declarar el proyecto listo

El proyecto podrá considerarse listo cuando, como mínimo:

- build, lint y pruebas terminen sin errores;
- PayPhone pase pruebas reales de éxito, cancelación, webhook duplicado y reinicio;
- SRI autorice el set de certificación y se valide XML, RIDE y email;
- CRM y panel admin funcionen en el entorno desplegado;
- exista monitoreo de errores y un procedimiento de rollback;
- la configuración necesaria esté documentada sin incluir secretos.

## Regla documental

Este es el único archivo de estado del proyecto. Debe actualizarse con evidencia y fecha. Para evitar volver a mezclar intención con realidad, usar siempre estas categorías:

- **Implementado:** existe en el código.
- **Probado:** tiene una validación repetible que pasa.
- **Desplegado:** está presente en el entorno público.
- **Certificado:** la integración externa fue validada de extremo a extremo.

Los archivos `KEYWORDS.md`, `contenido-pagina-es.md` e `implementation_plan.md` son documentación temática o planes, no fuentes del estado actual.
