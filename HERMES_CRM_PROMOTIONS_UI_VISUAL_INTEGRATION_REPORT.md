# Integración visual y Tarifas y promociones del CRM

Fecha: 2026-10-30. Entorno: Codex Local, Windows. Este informe documenta ramas de revisión; no se accedió al VPS ni se desplegó o modificó producción.

## 1. Estado inicial y procedencia

| Repositorio | Checkout principal | Rama de funcionalidad limpia | Estado inicial relevante |
| --- | --- | --- | --- |
| `undercodeec_nextjs` | `main` en `22bb11dc5231c6d1098f023e0213e75917ec4242` | `feat/crm-promotions-ui` en `e4cea02f8c624b8cfa63e679c1731c51e678be25` | Cuatro archivos públicos modificados sin commit y un informe histórico sin seguimiento. |
| `hermes_n8n` | `main` en `0eedd4af175f080f4924d828b07748803a111065` | `feat/crm-promotions-api` en `ddfccbbf043b41dae66d42b8848dd8430005547e` | El checkout principal tenía 36 entradas de estado ajenas, incluidas documentación, un ZIP y temporales. No se tocaron. |

La rama backend procede de `fa537a90aeecda0efce1d3248354bc2dd647cbda`, HEAD remoto de `pilot/a7-d12-monitor-only-20261026`, mediante el commit documental `331bc3f5efe66d5b7de4a71ed7c2c404149afd36` y los tres commits de API. `main` de backend es divergente y no se usó como base. La rama frontend de integración procede de `feat/crm-promotions-ui`; sus tres commits funcionales/documentales siguen en la historia.

Los demás worktrees se inspeccionaron por estado. Las entradas sin seguimiento de `crm-calendar` y `f2-human-review-ui`, así como el informe histórico del checkout frontend principal, quedaron fuera de la integración.

## 2. Inventario y conflictos

| Clase | Archivos | Diferencia relevante |
| --- | --- | --- |
| A. Visuales recientes del usuario | `public/landing-primary/css/demo-local.css` | Oculta `.spacer-10` solo en la home móvil de hasta 767 px. |
| A | `public/landing-primary/css/hero-particles.css` | Ajusta la capa de partículas de la home móvil a `top: 12svh`, `height: 100svh` y sin transformación. |
| A | `public/landing-primary/index.html` | Actualiza las versiones de caché de los CSS y del script de partículas con fecha 2026-10-29. |
| A | `public/landing-primary/js/home-hero-particles.js` | Centra y reduce la esfera móvil de la home; mantiene la geometría anterior en las otras páginas. |
| B. Tarifas y promociones | `src/app/admin/crm/configuracion/tarifas/page.jsx`, `src/app/admin/crm/crm.css`, `src/app/admin/crm/_components/CrmShell.jsx`, `src/lib/hermes/api.js`, `src/lib/hermes/promotion-workflow.mjs`, `tests/crm-promotions.test.mjs` | Ruta de configuración, navegación, tarjetas responsive, confirmación, GET posterior al PUT, errores 401/403, auditoría y sesión CRM. |
| C. Integración compartida | `src/components/HeroParticles/HeroParticles.jsx` | Actualiza la versión del script para que las páginas React carguen el mismo archivo nuevo que la home estática. |
| C. Corrección visual observada | `public/landing-primary/js/consent-attribution.js`, `public/landing-primary/index.html` | El aviso de privacidad móvil excedía el viewport por sumar padding al ancho. Se agregó `box-sizing: border-box` y una versión de caché nueva para ese script. La lógica de consentimiento no cambió. |
| D. Ajenos | `HERMES_A7_D26_R2_FRONTEND_MAIN_PROMOTION_REPORT.md` del checkout principal y cambios de otros worktrees | No se incorporaron ni modificaron. |

No hubo conflictos de Git: los cuatro archivos A no coincidían con los archivos de la UI CRM. La única coordinación manual necesaria fue la referencia compartida al script. Los cambios A no modificaron componentes React, JSX, tipografías, colores, menús, botones, modales ni estados del CRM; esas piezas corresponden a la funcionalidad B. El ajuste A es de espaciado, composición móvil, animación de partículas y versiones de recursos.

## 3. Preservación recuperable

Antes de integrar se creó `D:\Documentos\Hermes-CRM-Promotions-Visual-Backup-20261030`, fuera de ambos repositorios. Contiene `user-visual.patch`, copias íntegras de los cuatro archivos A, `manifest.json` con SHA-256 por archivo y una copia del informe histórico sin seguimiento. El parche se validó con `git apply --check` sobre la rama nueva y se aplicó sin conflictos. Las cuatro copias y los cuatro archivos integrados dieron el mismo contenido tras normalizar CRLF/LF. Los archivos originales del checkout `main` permanecieron sin commit y sin alteración.

El respaldo no incluye `.env`, credenciales, tokens, bases de datos ni otros archivos sensibles. Para recuperar los cambios A sobre la misma base, usar `git apply --check` seguido de `git apply` con ese parche, o copiar los archivos preservados después de revisar el destino.

## 4. Funciones preservadas y verificación

La rama integrada conserva Configuración → Tarifas y promociones, listado y detalle de productos/tarifas, características, activación y desactivación con confirmación nativa, lectura GET posterior al PUT, carga, errores, auditoría visible y sesión OTP del CRM. Las pruebas cubren el bloqueo de tarifas base, 401/403, foco del diálogo y rechazo de lecturas persistidas obsoletas. La rama backend conserva `JwtAuthGuard`, `RolesGuard`, roles `ADMIN` en escrituras y lectura de auditoría, comprobación de usuario activo en la estrategia JWT, transacción serializable, reintentos `P2034`, registro de auditoría y compatibilidad de la línea piloto con Commercial Authority y Nous. No se cambiaron precios ni datos comerciales.

| Validación local | Resultado |
| --- | --- |
| Frontend `node --test tests/*.test.mjs` | 188 pruebas: 187 aprobadas, 1 omitida, 0 fallidas. |
| Frontend focalizado `tests/crm-promotions.test.mjs` y `tests/landing-mobile-framing.test.mjs` | 13 pruebas aprobadas al cierre. Las nuevas pruebas se comprobaron en rojo sobre la base anterior y en verde tras la integración. |
| Frontend lint | `pnpm lint`: 0 errores y 172 advertencias preexistentes del árbol `src`; ESLint de JSX/JS/pruebas modificados: 0 errores. `node --check` del script de partículas: correcto. |
| Frontend build | `pnpm build` completó TypeScript y 41 páginas estáticas; incluye `/admin/crm/configuracion/tarifas`. |
| Backend unitario completo | 102 suites y 1629 pruebas aprobadas. |
| Backend focalizado | 2 suites y 12 pruebas de controller/service aprobadas; E2E de acceso a tarifas: 1 suite y 3 pruebas aprobadas. |
| Backend calidad/build | ESLint y Prettier de los archivos cambiados: correctos; `npm run build`: correcto; `prisma validate`: esquema válido con URL sintética local. |

Se comprobó la home local con Chrome a 390 × 844 y 1440 × 900. En móvil el panel de privacidad mide de x=16 a x=374 y los tres botones quedan dentro del viewport de 390 px; `document.documentElement.scrollWidth` es 390. En escritorio, `scrollWidth` es 1440. Las capturas `landing-390-cdp.png` y `landing-1440-cdp.png` se guardaron en el respaldo externo. No se hizo QA visual autenticado de la pantalla CRM: requiere sesión administrativa OTP y un backend controlado con datos sintéticos. Por ello siguen pendientes la inspección visual de tarjetas/modal CRM en móvil y escritorio, contraste, teclado y ausencia de superposición en esa ruta real.

Una revisión independiente de `e4cea02..80cf2a1` no encontró hallazgos críticos ni importantes. Confirmó que los cuatro archivos visuales se preservan, la pantalla CRM previa no cambia y las versiones de recursos están coordinadas.

### E2E A7-D16

El procedimiento oficial `hermes-backend/scripts/run-a7-d16-e2e.mjs` usa `docker-compose.a7-d16-e2e.yml` con PostgreSQL y Redis sintéticos vinculados a loopback. Se verificó Docker local: `docker info` no pudo conectar con `npipe:////./pipe/dockerDesktopLinuxEngine` porque el daemon no está activo. No se inició el harness ni se declara aprobada la suite A7-D16. La única suite E2E ejecutada aquí fue la sintética de acceso a tarifas, que no toca producción. Repetir A7-D16 en un Windows local con Docker operativo o en el runner autorizado antes del merge.

## 5. Commits, árboles y ramas

| Repositorio | Rama de revisión | Commits incluidos de esta entrega | Árbol de implementación / HEAD |
| --- | --- | --- | --- |
| Frontend | `feat/crm-promotions-visual-integration` | `288159cf9ce1d77278caccb6a90f057504773e2e`, `67dcbab20b32877d17ec0006fee8d06c2aa84fad`, `e4cea02f8c624b8cfa63e679c1731c51e678be25`, `80cf2a110d936fa0bf460139a9b476379dd8508c` | `bf151d666cdcd1e21ef32c25dadb64d5b0062886` para `80cf2a1`; el commit de este informe cambia el árbol final. |
| Backend | `feat/crm-promotions-api` | `987520d98efce01483910abfc0adbdaff4582d6f`, `351f46e726ab6452c0fe7eeaea893ae8308aee6c`, `ddfccbbf043b41dae66d42b8848dd8430005547e` | `39ca304f28f3b4b3aefc31ed86e48f92c10cd1da` para `ddfccbb`. |

El backend se publicó con `git push -u origin feat/crm-promotions-api`; `git ls-remote` confirmó `ddfccbbf043b41dae66d42b8848dd8430005547e`. La línea piloto remota seguía en `fa537a90aeecda0efce1d3248354bc2dd647cbda`. El frontend se publicó con `git push -u origin feat/crm-promotions-visual-integration`; `git ls-remote` confirmó inicialmente el commit de implementación `80cf2a110d936fa0bf460139a9b476379dd8508c`. El informe se añade en un commit posterior de esa misma rama. `main` frontend seguía en `22bb11dc5231c6d1098f023e0213e75917ec4242`. Ninguna rama de publicación (`main` frontend ni piloto backend) se movió durante este trabajo.

Los PRs en borrador no se pudieron abrir desde este entorno: `gh auth status` indicó que GitHub CLI no tiene una sesión iniciada. Las ramas remotas están disponibles para crear un PR frontend hacia `main` de `websiteUndercodeec` y un PR backend hacia `pilot/a7-d12-monitor-only-20261026` de `hermes_n8n`. No se fusionó ninguna rama.

## 6. Procedimiento de publicación y rollback

1. Revisar y probar la rama backend `feat/crm-promotions-api` contra `pilot/a7-d12-monitor-only-20261026`. Su HEAD desciende del HEAD piloto remoto, por lo que puede integrarse por avance lineal tras la aprobación correspondiente. Verificar de nuevo el HEAD remoto antes de integrar; evitar `main` backend y force push.
2. Ejecutar A7-D16 en el harness oficial y revisar el resultado. En el flujo autorizado de VPS, publicar la imagen backend resultante de esa línea piloto y validar JWT/ADMIN, 403 para no administradores, auditoría y lecturas de tarifas. La imagen productiva previa indicada en el prompt es `ghcr.io/undercodeec/hermes-backend@sha256:db399bba2886bd25c9b9730e08c79ae0223c90286e64b52cb7c65e87bd414be6`; su estado real no se verificó aquí.
3. Revisar la rama frontend `feat/crm-promotions-visual-integration` y, tras aprobarla, integrarla en la rama de publicación oficial `main` conservando los cuatro commits de promociones y el visual. Construir y publicar el frontend mediante el procedimiento oficial de UnderCodeEC, después del backend.
4. Validar el CRM con sesión administrativa real: menú, listado, características, modal, desactivación/activación, GET persistido, auditoría, 401/403, y comprobar que Black Friday sigue inactiva antes de la activación comercial autorizada. Activar únicamente en la fase productiva posterior y validar selección de Nous. Este trabajo local no realizó esa activación.

Si la publicación backend falla, volver a la imagen productiva previamente verificada y mantener Black Friday inactiva; no se añadieron migraciones de esquema en estos commits de API. Si falla el frontend, revertir su publicación al artefacto anterior sin tocar datos comerciales. Si ya hubo cambios de estado productivos, conservar auditoría y evaluar el estado persistido antes de cualquier reversión manual; no asumir que revertir código revierte precios. Las operaciones de rollback corresponden al operador de despliegue autorizado, no a Codex Local.

Pendiente en producción: confirmar HEAD e imagen efectivos, A7-D16, smoke de permisos/API, QA visual y teclado del CRM autenticado, lectura de auditoría, estado inactivo de Black Friday, activación posterior autorizada y respuesta comercial de Nous. No se accedió al VPS, no se usó SSH y no se desplegó producción.
