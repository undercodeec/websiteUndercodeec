# Hermes CRM: tarifas y promociones — informe de implementación

Fecha: 30 de octubre de 2026. Estado: **implementado y verificado localmente; pendiente de publicación autorizada**.

## Arquitectura y pantallas

- Nueva pantalla `Configuración → Tarifas y promociones` en `/admin/crm/configuracion/tarifas`. Reutiliza el diseño, menú, sesión OTP y componentes del CRM.
- Lista todas las tarifas de `GET /api/price-lists` con producto, nombre, importe, moneda, tipo, estado y distintivo de promoción. Cada tarjeta muestra alcance, mercado, vigencia, restricciones, notas y última auditoría disponible.
- Solo una promoción muestra acciones para activar o desactivar. El cuadro de confirmación indica precio, estado anterior y nuevo, y advierte sobre la posible selección del precio por Nous.
- La escritura usa exclusivamente `PUT /api/price-lists/:id` con `{"isActive":true|false}`. Después se consulta `GET /api/price-lists/:id` sin caché. La UI informa éxito únicamente si el estado persistido coincide; si falla, actualiza la lista y muestra el error.
- La vista ofrece carga, vacío, error, éxito, 401, 403 y diseño adaptable a móvil. Los botones se deshabilitan durante la operación.

## Autenticación, autorización y API

- El frontend usa el JWT Hermes que el CRM obtiene mediante su flujo existente OTP → prueba CRM → `POST /api/auth/crm-proof`. Lo envía por el proxy existente `/api/hermes`; no crea JWT ni usa secretos de servicio.
- En la rama piloto backend, `JwtAuthGuard` y `RolesGuard` protegen `POST`, `PUT` y `DELETE /api/price-lists` con `UserRole.ADMIN`. La lectura de tarifas conserva la compatibilidad JWT existente. La lectura de auditoría requiere ADMIN.
- La validación JWT existente busca al usuario activo en la base y comprueba el vencimiento. Una llamada directa sin autorización no llega al servicio de tarifas.
- `GET /api/price-lists/:id/audit` devuelve hasta diez cambios recientes y el administrador responsable, cuando existe.

## Auditoría y Nous

- `PUT` ejecuta lectura, escritura y `AuditLog` en una transacción serializable, con hasta dos reintentos ante conflicto `P2034`. El registro guarda ID de administrador, tarifa, campos anteriores y posteriores, fecha automática y `result=SUCCESS`. Si la escritura falla, no queda un éxito auditado.
- No se creó migración: `AuditLog` y sus índices ya existen. La interfaz no modifica precio, prestaciones, impuestos, tarifa base ni caducidad.
- Commercial Authority continúa leyendo `Product.priceLists` activos y vigentes de la base en cada resolución. No se observó caché propia que requiera invalidación ni reinicio de Nous. La selección de Black Friday también exige la coincidencia con la tarifa base y la intención comercial existente.

## Archivos y commits

| Repositorio / rama | Archivos | Commits |
|---|---|---|
| Hermes `feat/crm-promotions-api`, descendiente del piloto que contiene `fa537a9` | `hermes-backend/src/price-lists/{price-lists.controller.ts,price-lists.service.ts,*.spec.ts}`, `hermes-backend/test/price-lists-access.e2e-spec.ts` | `987520d`, `351f46e`, `ddfccbb` |
| `undercodeec_nextjs` `feat/crm-promotions-ui` | `src/app/admin/crm/configuracion/tarifas/page.jsx`, `src/app/admin/crm/_components/CrmShell.jsx`, `src/app/admin/crm/crm.css`, `src/lib/hermes/{api.js,promotion-workflow.mjs}`, `tests/crm-promotions.test.mjs`, `docs/superpowers/plans/2026-10-30-crm-promotions.md`, este informe | `288159c`, `67dcbab`; revisión y handoff en el commit de cierre |

Los checkouts principales tenían cambios ajenos previos; se trabajó en worktrees independientes y no se alteraron esos cambios.

## Pruebas y resultados

| Comprobación | Resultado |
|---|---|
| Backend `npm test -- --runInBand --silent` final | 102 suites, 1629 pruebas aprobadas |
| Backend specs de tarifas | 8 pruebas de servicio y 4 de controlador aprobadas |
| Backend `npm run test:e2e -- --runInBand test/price-lists-access.e2e-spec.ts` | 3 pruebas HTTP aprobadas: ADMIN, no ADMIN, JWT inválido y vencido |
| Backend `npm run test:e2e -- --runInBand` completo | 3 suites y 15 pruebas aprobaron; la suite `a7-d16-nous.e2e-spec.ts` no pudo iniciar porque exige su base PostgreSQL y Redis sintéticos exactos, ausentes en este worktree |
| Backend `npm run build`, ESLint y Prettier dirigidos | Aprobados |
| Frontend `pnpm test` final | 184 pruebas: 183 aprobadas, 1 omitida preexistente |
| Frontend `node --test tests/crm-promotions.test.mjs` tras ampliar cobertura | 9 pruebas aprobadas |
| Frontend ESLint dirigido a los archivos modificados y `pnpm build` | Aprobados; la ruta nueva aparece en la salida de Next.js |

Las pruebas son aisladas y usan identificadores sintéticos. No se invocó el endpoint productivo ni se activó Black Friday. No se hizo QA visual con una sesión administrativa real ni una prueba de modelo Nous en producción.

Una revisión independiente detectó una carrera de auditoría, fuga de foco del cuadro de confirmación y un estado transitorio engañoso en la auditoría visible. Se corrigieron con aislamiento serializable, `<dialog>.showModal()` y cierre de los detalles después del guardado.

## Handoff para Codex VPS y publicación

1. Verificar en VPS el commit, digest, migraciones y datos **realmente servidos**; no inferirlos del documento local. Confirmar que el backend operativo desciende del piloto autorizado y que la tarifa base y la promoción existen con los atributos y estado esperado. El handoff previo `HERMES_BLACK_FRIDAY_LANDING_80_RELEASE_HANDOFF_2026-10-30.md` documenta la migración de datos `20261029200000_black_friday_landing_80` y sus prechecks si todavía está pendiente.
2. Integrar los commits backend `987520d`, `351f46e` y `ddfccbb` en la línea piloto autorizada mediante revisión; construir una **nueva** imagen por el workflow oficial, comprobar su commit OCI y publicar por digest con el procedimiento y rollback del piloto. El digest de la imagen anterior de Black Friday **no contiene** esta protección ADMIN ni la auditoría nueva.
3. Verificar en staging/VPS con cuentas reales autorizadas: lectura, 401/403, escritura ADMIN de una tarifa sintética o de ensayo, lectura posterior y auditoría. No usar la promoción real como fixture. Confirmar que otros módulos y servicios siguen sanos.
4. Publicar el commit frontend de esta rama por el procedimiento oficial de `undercodeec_nextjs` (`pnpm build`, `pnpm start`, API de ese repositorio y proxy según su README), después de publicar el backend compatible. Conservar la revisión anterior para rollback y confirmar `HERMES_API_URL`.
5. Con la promoción real aún inactiva, validar la pantalla y el flujo de confirmación con sesión legítima. La activación comercial se realiza después, por el procedimiento autorizado; comprobar estado persistido, auditoría y respuesta de Nous. La desactivación sigue el mismo control.

## Riesgos y límites pendientes

- El estado real de VPS, la migración previa y la configuración del proxy no se verificaron desde Codex Local. No hay despliegue, push ni migración productiva en este trabajo.
- Los cambios antiguos carecen de auditoría retroactiva. En esta versión el nuevo `AuditLog` se escribe para `PUT`; las rutas de creación y eliminación quedan restringidas a ADMIN, pero su auditoría comercial no se amplió porque la UI no ofrece esas acciones.
- La integración visual y la selección de Nous se comprobaron por código y pruebas aisladas. Requieren QA con sesión real y entorno de release antes de considerar publicado el flujo.
- La suite E2E A7-D16 completa depende de su PostgreSQL y Redis sintéticos específicos; ese harness debe levantarse según su procedimiento antes de usar su resultado como gate de release. El E2E HTTP de tarifas sí aprobó de forma aislada.
- La promoción `commercial-price-landing-black-friday-80-global-v1` debe permanecer inactiva hasta la activación comercial separada. No se modificó desde este entorno.
