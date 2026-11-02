# Integración de rendimiento con main — 2 de noviembre de 2026

**Base:** `337e50de0fc82929988442eb2f2b31440ba938d4` (`origin/main` al consultar GitHub). **Rama:** `feat/performance-staging-integration`. El commit local de esta entrega se identifica con `git rev-parse HEAD` en el worktree `D:\Documentos\undercodeec_nextjs_staging_integration`. No se hizo push, merge ni despliegue.

## Alcance y procedencia

El [manifiesto original](./performance-staging-manifest.sha256) conserva los hashes de las 27 rutas de fase 5; SHA-256 del manifiesto `3b0ffc545e4ad898c82a78f6a0c64e5cffdc7f89fbc4dee75bed395d83921d47`. Las 27 rutas se incorporaron, junto con `scripts/check-carousel-hydration.cjs`. La prueba de main `tests/landing-mobile-framing.test.mjs` se ajustó para comprobar las nuevas versiones de caché. El [manifiesto integrado](./performance-main-integration-manifest.sha256) enumera las **29 rutas de código, recursos y pruebas** del resultado, con sus hashes actuales; SHA-256 `c2d92d1eee3dc7dbc206399cdf0b9367c3db460ca8989351e65212d5b3177f7c`. El informe y los dos manifiestos son los tres documentos del commit. El handoff histórico de fase 5 permanece sin cambios en el checkout original.

Solo seis rutas candidatas también habían cambiado en main:

| Archivo | Resolución |
| --- | --- |
| `public/landing-primary/css/demo-local.css` | El ajuste de espaciador móvil de main ya estaba en el candidato; se conservó junto con visibilidad inicial y posición del menú ante el consentimiento. |
| `public/landing-primary/css/hero-particles.css` | El encuadre móvil de portada de main ya estaba en el candidato; se conservó junto con el fondo estático progresivo. |
| `public/landing-primary/index.html` | Se conservaron el encuadre y la navegación móvil; las URL de caché de fase 5 reemplazan las versiones anteriores de main. |
| `public/landing-primary/js/consent-attribution.js` | Se fusionó `box-sizing: border-box` de main con el diseño compacto del aviso de fase 5. Su hash cambia de `c8de22ef…` a `1d2ba3c1…`. |
| `public/landing-primary/js/home-hero-particles.js` | Los cambios de cámara móvil de main ya estaban en el candidato; se conservó además la carga progresiva. |
| `src/components/HeroParticles/HeroParticles.jsx` | La versión de consulta de fase 5 apunta al script progresivo más nuevo y mantiene el comportamiento de main. |

Los otros 21 archivos del manifiesto original coinciden byte por byte con su candidato de fase 5. No se modificaron backend Hermes, contratos de API, rutas de autenticación, host guard, componentes CRM ni archivos de configuración del servidor. Los 42 archivos de pruebas de main siguen presentes.

## Validación

- `pnpm install --frozen-lockfile`: correcto, con pnpm 9.15.4 y lockfile sin cambios.
- `pnpm build`: correcto; 41 páginas estáticas. El manifiesto generado por Next tiene **42 rutas**, las mismas 42 claves que el build limpio de main. Incluye `/admin/crm/configuracion/tarifas`, Inbox, Leads, login OTP y `/api/hermes`.
- `pnpm test`: **188 pruebas**, 187 aprobadas, 1 omitida, 0 fallos; idéntico total y resultado al main de referencia. La primera corrida falló en la aserción de versiones de caché antiguas; se actualizó esa prueba y pasó la suite completa.
- `pnpm lint`: 0 errores, 173 advertencias. `git diff --check`: sin errores; solo avisos de normalización LF/CRLF.
- `node scripts/check-carousel-hydration.cjs` contra el build integrado: **14/14** combinaciones a 320, 375, 412, 520, 521, 768 y 1440 px, sin errores de hidratación, overflow ni imágenes rotas. Una primera ejecución agotó el timeout de inicialización durante el arranque frío; la repetición completa pasó.
- Revisión en Chrome a 412 y 1440 px para portada, Servicios y Aplicaciones: seis respuestas 200/304, cero errores JavaScript, cero imágenes rotas y cero overflow; los carruseles inicializan en índice 0. Menú móvil abre y cierra, consentimiento y control de tema funcionan; el formulario de Contacto rechaza vacío y no se envió. La navegación interna entre Servicios y Aplicaciones mantiene el documento y ambos carruseles.
- Las capturas temporales de navegador están en `.unlighthouse/integration-visual/` del worktree y no forman parte del commit. En una captura temprana de Aplicaciones faltaba el encabezado visual; se reprodujo también en el main limpio bajo la misma inspección. En la candidata integrada apareció al estabilizarse. Conviene revisar esta animación en un dispositivo real durante el PR.

## Conservación de CRM y límites

La comparación de fuentes de ruta dio **37/37 archivos de `page`/`route`** iguales a main, y el diff no toca `src/app/admin`, `src/app/api`, `backend` ni `src/lib/hermes`. Permanecen Tarifas y promociones con su auditoría y permisos, login OTP, Inbox con audio, Leads, sesiones administrativas, proxy `/api/hermes` y el guard de `admincrm.undercodeec.com`. El 404 de CRM en el host público es el comportamiento esperado del guard. No se ejercitaron servicios CRM ni formularios reales; la validación cubre fuentes, build, pruebas y navegador local.

**Dictamen:** LISTO PARA PUSH Y REVISIÓN DE PR. La revisión de PR debe comprobar visualmente el encabezado móvil en dispositivo real y repetir la validación de staging antes de producción.
