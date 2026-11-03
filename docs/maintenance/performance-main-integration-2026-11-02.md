# Integración de rendimiento con main — 2 de noviembre de 2026

**Base:** origin/main 337e50de0fc82929988442eb2f2b31440ba938d4. **Rama:** feat/performance-staging-integration. El commit funcional 00becc3bbc9ff96a849c09d4675700f5ae109829 se publicó en el PR #2. Esta corrección documental actualiza únicamente el informe y el manifiesto integrado; el PR permanece abierto, sin merge ni despliegue.

## Alcance y procedencia

El [manifiesto original](./performance-staging-manifest.sha256) conserva como evidencia histórica los hashes locales de las 27 rutas de fase 5 y no es un manifiesto válido del release integrado; SHA-256 del manifiesto `3b0ffc545e4ad898c82a78f6a0c64e5cffdc7f89fbc4dee75bed395d83921d47`. Las 27 rutas se incorporaron, junto con `scripts/check-carousel-hydration.cjs`. La prueba de main `tests/landing-mobile-framing.test.mjs` se ajustó para comprobar las nuevas versiones de caché. El [manifiesto integrado](./performance-main-integration-manifest.sha256) enumera las **29 rutas de código, recursos y pruebas** del resultado, con los hashes de los blobs almacenados en Git para el commit 00becc3bbc9ff96a849c09d4675700f5ae109829; SHA-256 `d661bf56052a351c7b10c257b0f4d4de760ebb4028a673d7c64dd55a463f8909`. El commit funcional original incluyó el informe y los dos manifiestos; esta corrección actualiza solamente el informe y el manifiesto integrado. El handoff histórico de fase 5 permanece sin cambios en el checkout original.

## Corrección de integridad del PR #2

El manifiesto inicial calculó SHA-256 desde los bytes del worktree Windows. Sus 29 entradas coincidían con esos archivos locales, pero solo 14 coincidían con los blobs del commit publicado. En las otras 15 rutas, el worktree tenía CRLF (en la mayoría mezclados con LF) y Git guardó LF por core.autocrlf=true. La sustitución binaria de cada par CRLF por LF produce exactamente el blob Git correspondiente. No hubo otras diferencias de bytes, de codificación UTF-8 ni de BOM en esos 15 archivos. El manifiesto inicial también tenía BOM UTF-8 y CRLF; el corregido usa UTF-8 sin BOM y LF.

Las 15 rutas afectadas fueron:

- public/landing-primary/css/demo-local.css
- public/landing-primary/index.html
- public/landing-primary/js/demo-local.js
- public/landing-primary/js/ob.2026.index.23.js
- src/app/layout.tsx
- src/app/noticias/page.tsx
- src/app/servicios/page.tsx
- src/components/Primary/PrimaryHeader.module.css
- src/components/Saas/About/PrimaryAbout.jsx
- src/components/Servicios/ServicesHero.module.css
- src/components/Servicios/ServicesShowcase.jsx
- src/components/Servicios/ServicesShowcase.module.css
- src/layouts/Preview.tsx
- tests/demos-route.test.mjs
- tests/landing-mobile-framing.test.mjs

Las 29 entradas corregidas se verificaron contra los blobs del commit funcional. Las 29 rutas de aplicación, recursos y pruebas permanecen idénticas a ese commit; el manifiesto histórico de fase 5 se conserva sin cambios.

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

**Dictamen:** MANIFIESTO CORREGIDO — LISTO PARA REVALIDACIÓN EN VPS. El PR #2 permanece abierto; la revisión debe comprobar visualmente el encabezado móvil en dispositivo real y repetir la validación de staging antes de producción.
