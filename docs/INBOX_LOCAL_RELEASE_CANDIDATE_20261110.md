# Inbox: candidato local de publicación — 2026-11-10

## Identidad y alcance

- Candidato: `.worktrees/inbox-release-candidate`, rama `dev/inbox-release-candidate`.
- Base y HEAD durante QA: `56e6a217907376e7d53707b2521a815aaa83144c` (`origin/main`), con delta Inbox sin commit durante las validaciones. QA final favorable para commit/push/PR; inspección visual pendiente, sin autorización de despliegue.
- `33fbb9a` aplicado mediante `cherry-pick --no-commit`, más corrección de envío pendiente A→B→A, deduplicación por ID, regresiones y harness local. No contiene los commits de configuración multiagent de la rama raíz.
- Archivos funcionales: `src/app/admin/crm/inbox/page.jsx`, `src/lib/hermes/inbox-order.mjs`, `tests/hermes-inbox-order.test.mjs`, `scripts/inbox-local-harness.mjs`; este informe.
- Raíz original preservada; cambios ajenos `.gitignore`, `implementation_plan.md`, informes y artifacts anteriores excluidos. Cierre autorizado limitado a commit/push/PR de estos cinco archivos. Sin merge, despliegue ni operaciones reales de pagos/WhatsApp.

## Correcciones

Orden por `messages[0].createdAt` DESC y desempate de conversación por ID ASC; chats sin mensaje al final. El servidor debe ordenar **antes** de paginar. La página solo ordena la porción recibida, sin inventar un orden global.

Guardas independientes invalidan respuestas antiguas de lista, detalle e historial. La selección sobrevive a reordenamientos. Si la última página deja de existir se solicita una página válida conservando filtros.

El envío captura una generación de selección además del ID: un envío iniciado en A no cambia historial, borrador, conversación ni estado de envío tras A→B→A. La confirmación no duplica un mensaje ya recibido por un refresh de detalle. Las pruebas ejecutan callbacks reales de la página; no son pruebas de navegador ni de backend.

## Validaciones sobre el candidato

| Comando | Resultado |
| --- | --- |
| `pnpm install --offline --frozen-lockfile` | OK, dependencias del candidato; sin cambios de manifiestos/lockfile |
| `pnpm test` | 225 tests: 224 pass, 1 skip, 0 fallos |
| `node --test tests/hermes-inbox-order.test.mjs` | 17 pass, incluidas A→B→A y deduplicación |
| `pnpm lint` | 0 errores, 173 advertencias preexistentes |
| `pnpm build` | OK con Turbopack; rutas CRM y proxy generadas |
| `node --check scripts/inbox-local-harness.mjs` | OK |
| `node scripts/inbox-local-harness.mjs --fixture` | OK, navegador Chromium autenticado con datos ficticios |
| `node scripts/inbox-local-harness.mjs` (sin fixture, corrida cruzada final) | exit 0: login/proxy, lista 50, detalle, móvil 390×844 y volver sin overflow |

QA independiente confirmó `pnpm test` 224 pass/1 skip, lint 0 errores/173 advertencias, build OK y navegador fixture con 63 conversaciones. Backend PostgreSQL aislado: **8 PASS**. Benchmark: 10.068 conversaciones/200.198 mensajes; p95 serial 178 ms y cuatro lectores 222 ms frente a presupuesto 2 s. El orden global materializa IDs O(N): límite de escala aún existente, no garantía para volúmenes arbitrarios. Un wrapper PowerShell background devolvió exit 1 aunque su log registró PASS y cleanup; la corrida PostgreSQL estándar devolvió exit 0. No se certifica el wrapper como éxito de proceso.

Evidencia REAL final: `artifacts/inbox-local/inbox-local-8kyZW2/evidence/results.json` y capturas en ese directorio del candidato. Resultado sin error, modo `real-Nest-with-admin-auth-component-fixture`. Los cuatro hashes funcionales se verificaron antes del cierre contra esa evidencia, sin cambios:

| Archivo | SHA-256 |
| --- | --- |
| `src/app/admin/crm/inbox/page.jsx` | `92c34aa18710f38059f913ef1fdc8c5a5ab2c7096318778f8d440f5c70a7ecfd` |
| `src/lib/hermes/inbox-order.mjs` | `bb3913343ec2fcbaeb16c58620575827319c687ab9eba61a819aa0cdd403bee7` |
| `tests/hermes-inbox-order.test.mjs` | `bb15d172da1ceb1f3f70d6efd9e0ae5065383a7d4be7891d791ba093fd13daf5` |
| `scripts/inbox-local-harness.mjs` | `499e1fbb243ae05a1553464f7c736b3b4f9f2667a89abc66c122b036183af0db` |

Backend publicado por su especialista: `12744e9b600cc40e305f33a11c83c46dc262aa70`, PR hacia piloto: https://github.com/undercodeec/hermes_n8n/pull/21. QA confirmó limpieza de recursos propios y ausencia de listeners de la prueba. Este cierre modifica solo el informe, no el código aprobado.

Primer intento de build con junction `node_modules` hacia fuera del candidato falló por raíz de Turbopack. Se quitó **solo la junction propia** y se instaló offline en el candidato; build exacto repetido OK. Webpack dev no sirve para esta prueba porque un selector CSS global preexistente de NotFound no es aceptado por ese compilador. El harness usa Turbopack sin modificar el config real.

Última evidencia de navegador fixture: `artifacts/inbox-local/inbox-local-GSWtcM/evidence/` dentro del candidato. Contiene `results.json` con SHA-256 de los cuatro archivos funcionales, HEAD, comprobaciones y códigos HTTP del proxy, y capturas `inbox-desktop.png`, `inbox-mobile-chat.png`, `inbox-mobile-list.png`. Los logs de comandos están en `%LOCALAPPDATA%/Temp/opencode/inbox-candidate-{test,lint,build}.log` y `inbox-browser-candidate.log`. No agregar directorios de staging completos al commit. La lectura de capturas por herramienta sigue denegada incluso tras retomar: no se certifica inspección visual humana; QA debe revisarlas por un mecanismo autorizado.

Comprobado automáticamente en fixture: proxy sin sesión 401; OTP consumido no reutilizable (400); formulario de login; 50 chats de primera página y 13 de segunda de un total 63; orden global fixture; filtro CLOSED 21; búsqueda 063; origen Meta Ads 32; estado vacío de prioridad; selección con Enter; mensaje nuevo de un chat antes en página dos pasa primero manteniendo selección; 390×844 sin desbordamiento horizontal, chat/volver/lista; escritorio 1440×1000. **Filtros, paginación y mensaje nuevo en navegador se probaron SOLO con fixture**, no en la corrida real. Respuestas invertidas y envío pendiente se cubren en callbacks deterministas, no por simulación de entrega WhatsApp.

## Aislamiento y límites de autenticación/integración

El harness **no importa** `backend/server.js`: extrae sus rutas OTP y helpers de bloqueo actuales y los ejecuta en Express local. Usa generación/hash/consumo y firma de proof reales; buzón SMTP, perfil y almacenamiento de sesión admin son fixtures en memoria. No certifica el servidor Express completo, MySQL ni SMTP reales.

En `--fixture`, también Nest y PostgreSQL están sustituidos por un servidor fixture. **Ese modo no es evidencia de integración real Nest/PostgreSQL**. La corrida final sin fixture sí ejercitó Nest Auth, Conversations y PostgreSQL reales del candidato piloto; transfer utilizó un adaptador protegido JWT con Payments real, feedback fue real y los colaboradores mutantes permanecieron bloqueados. SMTP/perfil/sesiones admin continuaron sustituidos. No certifica el backend completo, MySQL, SMTP ni entrega WhatsApp. No se ejecutó reply hacia WhatsApp ni decisiones de pago. La inspección visual independiente permanece pendiente por `permission.rejected` al leer capturas; QA funcional aprueba commit/push/PR, **no despliegue**.

Next corre desde una copia desechable de `src`/config/manifiesto, sin copiar ni cargar `.env`. El entorno heredado se limita a variables del sistema operativo más URLs sintéticas explícitas. Solo el config desechable ajusta la raíz Turbopack para resolver dependencias. El navegador bloquea hosts no loopback (Intercom bloqueado). Finalización cierra Chromium, proceso Next y conexiones/servidores propios; conserva staging/evidencia para QA. No se crearon recursos Docker desde frontend.

### Repetición con backend real aislado

Desde el candidato, tras el handoff del especialista que prepara Nest piloto y PostgreSQL nuevo con >50 conversaciones ficticias:

```powershell
# Obtener los valores SINTÉTICOS del proceso local preparado por backend.
$env:INBOX_LOCAL_NEST_URL = 'http://127.0.0.1:3312'
$env:INBOX_LOCAL_PROOF_SECRET = '<valor sintético compartido solo entre procesos locales>'
node scripts/inbox-local-harness.mjs
Remove-Item Env:INBOX_LOCAL_NEST_URL, Env:INBOX_LOCAL_PROOF_SECRET
```

No usar `--fixture` en esa repetición. Solo se permiten URLs upstream HTTP loopback sin user/password. El frontend ocupa `http://127.0.0.1:3310/admin/crm/inbox/`, admin componente `http://127.0.0.1:3311`, backend esperado `http://127.0.0.1:3312`. Nest requiere `POST /auth/crm-proof` con `{proof}`, `GET /auth/profile`, lista/detalle/historial, transfer por conversación, feedback y eventos. Se envía Authorization Bearer por el proxy real `/api/hermes/*`. El operador de proof es la constante autorizada del código, sin envío de correo real.

Sin flag fixture el harness valida login, proxy, primera página, sesión restaurada y móvil; los asserts específicos de los 63 registros propios solo se ejecutan en modo fixture. El resultado etiqueta explícitamente el componente admin sustituido incluso cuando Nest sea real. `--serve` conserva servicios **después** de las verificaciones hasta Ctrl+C para revisión local; no publica tokens ni códigos OTP.

## Preparación de release y rollback — sin ejecutar despliegues

1. Handoff backend piloto y QA funcional final completados con los límites anteriores. Antes de cualquier despliegue futuro, completar inspección visual por mecanismo autorizado y revisión de seguridad pertinente. No certificar inspección humana no realizada.
2. Verificar base actual y diff exclusivo de los cinco archivos; no hacer PR de toda `dev/opencode-multiagent`. Repetir validaciones si cambia código, backend o base.
3. Tras orden de cierre y QA favorable: staging por rutas exactas, commit de candidato y push normal a su rama de desarrollo. Excluir `.env`, node_modules, stages y artifacts ajenos. Registrar SHA final y resultados asociados. No merge a main ni deploy desde esta tarea.
4. Release posterior: confirmar contrato backend desplegable y orden de actividades, monitorear errores/listado/autenticación sin datos privados; no confundir imagen publicada con entorno desplegado.
5. Rollback posterior si regresión: detener promoción, revertir el commit Inbox en la rama de release con revisión y pruebas. No usar force-push, reset destructivo ni revertir configuraciones ajenas. No hay migraciones de datos del frontend para revertir; coordinar compatibilidad del orden paginado con backend.
