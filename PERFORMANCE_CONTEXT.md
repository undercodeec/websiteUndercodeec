# PERFORMANCE_CONTEXT.md

> Documento vivo para mantener continuidad entre sesiones de chat mientras
> trabajamos en optimizar el rendimiento del sitio. **Antes de cualquier
> modificación de código, leer este archivo completo y la bitácora al final.**
>
> Última actualización: 2026-06-09

---

## 0. Quick start — leer esto primero (cold-start)

**Cierre de sesión 2026-06-08 — 8 fases aplicadas, baseline PROD validado.**

### Tabla maestra de fases

| Fase | Cambio | Estado | Efecto medido en PROD |
|---|---|---|---|
| 1.1 | Defer CSS legacy (preload+swap) | ❌ revertida | causó CLS 0.69 — requiere beasties/critters |
| 1.2 | Tree-shake `react-icons` | ✅ validado prod | era artefacto dev, prod tree-shakea (-893 KB) |
| 1.3 | `useGLTF.preload` → useEffect | ✅✅ validado prod | -24.8 MB (GLB no carga eager) |
| 1.4 | Video MP4 19 MB IntersectionObserver | ✅✅ validado prod | -19 MB (MP4 local no carga) |
| 1.5 | Imágenes hero blog | 🟡 pendiente | identificado: 3.7 MB en 4 PNG |
| 1.6 | Calendly lazy (IntersectionObserver + placeholder) | ✅✅ validado prod | -2.5 MB Calendly, -229 KB Stripe (bonus) |
| 1.7 | Vimeo embed `strategy="idle"` | ✅ validado prod | -894 KB (1.25 MB → 356 KB) |
| 1.8 | Optimización imágenes demos/pattern | ✅✅ validado prod | -4.4 MB demos, -151 KB pattern |
| 1.9 | rotating-pattern: `<Image>` → div CSS bg | 🟡 neutral | Lighthouse 13 cuenta div con bg-image como LCP también. Sin movimiento, cambio mantenido (no perjudica) |
| 2 | `next/dynamic` para HeroModel + secciones | ✅ aplicada y medida | LCP -6/-10 s en rutas largas (marketing 19.3→10.8, trayectoria 16.6→6.3, apps móviles 11.5→5.5). TBT subió en home (460→904 ms) por cascada de chunks. Mixto en score Perf |
| 3 | GTM cleanup (3 IDs GA + reCAPTCHA dup) | 🟡 pendiente | ~1 MB en terceros redundantes |
| 4 | Audit contra build prod | ✅ ejecutado | baseline real en §5.0 |

**Ahorro total en transfer eager del home: ~47 MB → ahora 8.3 MB.**

### Archivos modificados en esta sesión (vigentes)

- `undercodeec_nextjs/src/components/3D/HeroModel.jsx:28-52` — preload GLB en useEffect (Fase 1.3)
- `undercodeec_nextjs/src/components/Preview/Responsive.jsx:7-20,37-56` — video MP4 lazy (Fase 1.4)
- `undercodeec_nextjs/src/components/Preview/Codei.jsx:4-30,46-58` — Calendly lazy + placeholder 700 px (Fase 1.6)
- `undercodeec_nextjs/src/components/Vimeo/VimeoFacade.jsx:22-42` — prop `strategy` (`viewport` | `idle`) (Fase 1.7)
- `undercodeec_nextjs/src/components/AIAssistant/index.jsx:805` — burbuja flotante `strategy="idle"` (Fase 1.7)
- `undercodeec_nextjs/src/components/Slider/HeroSlider.jsx:86-95` — rotating-pattern `<Image>` → div CSS bg (Fase 1.9)
- `undercodeec_nextjs/public/landing-preview/css/preview-style.css:633` y `scss/preview-style.scss:506` — `pattern.png` → `pattern.webp`
- `undercodeec_nextjs/public/landing-preview/img/demos/*.webp` — 17 imágenes resize 800 px + webp q75 (Fase 1.8). Backups en `_originals/`.
- `undercodeec_nextjs/public/landing-preview/img/pattern.webp` (nuevo, 62 KB). `pattern.png` eliminada.
- `undercodeec_nextjs/public/assets/img/undercode-logo.webp` (creado, 22 KB) — **NO aplicado**, el PNG sigue siendo el que se usa (referenciado en 27 archivos, mayoría metadata SEO).
- `undercodeec_nextjs/src/components/Slider/HeroSlider.jsx:7,17-23` — `HeroModel` ahora vía `next/dynamic({ ssr: false })` (Fase 2)
- `undercodeec_nextjs/src/app/page.tsx:1-22` — 9 secciones below-the-fold vía `next/dynamic` con ssr:true default (Fase 2)

### Estado real en PROD post-Fase 2 (corrida d19a — 2026-06-09)

Rutas en buen estado:
- `/blog/` Perf **89**, LCP **2.2 s** ✅✅ (gran mejora)
- `/contacto/` Perf 84, LCP 3.2 s ✅
- `/politicas-playconsole/` Perf 78, LCP 4.1 s
- `/software-para-tu-negocio/` Perf 72, LCP 4.2 s
- `/blog/whatsapp-...` Perf 71, LCP 6.9 s
- `/blog/el-futuro-...` Perf 69, LCP 5.1 s
- `/marketing-para-tu-negocio/` Perf 65, LCP 10.8 s (mejoró −8.5 s LCP)
- `/servicios/` Perf 64, LCP 9.1 s
- `/aplicaciones-moviles/` Perf 63, LCP 5.5 s (mejoró −6 s LCP)
- `/blog/impacto-...-2026/` Perf 65, LCP 13.0 s

Rutas con score Perf bajo (TBT alto por cascada de chunks):
- `/` (home) Perf **48**, LCP 5.6 s, TBT **904 ms** — TBT subió por
  cascada de 9 chunks. LCP estable. Considerar modulepreload o
  re-agrupar el split.
- `/nuestra-trayectoria/` Perf 54, LCP 6.3 s (gran mejora −10 s LCP)
  pero TBT 308 ms y FCP 4.3 s. Mismo patrón de cascada.

Ruta con regresión LCP a investigar:
- `/blog/impacto-ia-...` LCP 11.0 → 16.1 s. Posible volatilidad. Re-medir
  en otra corrida antes de actuar.

Todas: A11y ≥ 85, SEO 100/100, CLS ≤ 0.08.

### Acción para retomar (próxima sesión)

**Fase 2 aplicada y medida**: mejoró LCP en 9/13 rutas (6-10 s en las más
problemáticas), pero el TBT del home subió 460→904 ms por la cascada de 9
chunks. Mantenida porque la mejora de LCP supera el costo de TBT.

1. **Fase 1.5 — Optimización PNG blog** (recomendada siguiente): ataca
   directamente las 3 rutas blog con LCP 11-16 s. Mismo approach
   exitoso de Fase 1.8, aplicado a `whatsapp_b2b_erp.png` (1.1 MB),
   `whatsapp_marketing_ia.png` (938 KB), `whatsapp_chatbots_ia.png`
   (861 KB), `whatsapp_ecommerce_sales.png` (762 KB).
2. **Mitigación TBT post-Fase 2** (opcional): añadir `<link
   rel="modulepreload">` para chunks de Demos, Portfolio en `layout.tsx`
   para descargar en paralelo y reducir cascada → recuperar Perf score
   del home sin perder lo ganado en LCP.
3. **Re-medir `/blog/impacto-ia-...`**: LCP subió 11→16.1 s en corrida
   única. Confirmar si es volatilidad o regresión real antes de actuar.
4. **Fase 3 — GTM/reCAPTCHA cleanup**: investigar por qué cargan 3 IDs
   de GA (G-99Z5CCZ3RK + G-62CCGC2JBQ + G-2QDBXNBC8K) y por qué
   reCAPTCHA aparece duplicado en home. Sin tocar código del sitio
   (dashboard GTM).
5. **Fase 1.1b — Critical CSS con beasties**: si se quiere atacar el
   render-blocking CSS (que aporta otra parte del LCP). Trabajo mayor,
   requiere instalar `beasties` y configurar build hook.

### Comandos para retomar

```powershell
# Dev (puerto 3100):
cd undercodeec_nextjs
$env:PORT=3100; pnpm dev

# Build prod + audit (puerto 3200, sin conflicto con dev):
cd undercodeec_nextjs
pnpm build
$env:PORT=3200; pnpm start
# Otra terminal:
cd ..
npx unlighthouse --site http://localhost:3200/ --no-cache
```

### Última corrida de medición

- `.unlighthouse/localhost/d19a/reports/` — corrida 2026-06-09 11:39,
  13 rutas en 86 s, post-Fase 2 aplicada. Comparar contra el baseline
  0968 está en §7 (entrada `2026-06-09 — Fase 2 + medición d19a`).
- Cualquier corrida nueva generará un hash distinto. Para comparar
  rápido: parsear `lighthouse.json` con PowerShell
  (`Get-Content ... | ConvertFrom-Json`) o abrir el viewer en :5678.

### Lecciones clave acumuladas

- Métricas Lighthouse en dev son extremadamente volátiles (±25 Perf, ±20 s LCP entre corridas). **Solo confiar en métricas de PROD**.
- Lighthouse 13 cuenta tanto `<img>` como `<div style="background-image">` como LCP candidate. NO se gana nada cambiando uno por otro.
- `requestIdleCallback` defiere carga pero NO la elimina del scan de Lighthouse (ventana ≈ TTI). Para sacar algo del scan hace falta facade real (poster + load on interaction).
- Para cambios que tocan `src/`, requieren rebuild prod. Para cambios que tocan `public/`, se sirven directo sin rebuild.
- Backups en `_originals/` antes de modificar assets — siempre.
- El viewer Unlighthouse en :5678 re-escanea solo si lo dejas abierto. Cerrarlo después de revisar reportes para no contaminar corridas siguientes.

---

## 1. Objetivo

Mejorar el rendimiento del sitio Next.js (`undercodeec_nextjs/`) sin romper
funcionalidad existente (animaciones, slider 3D, SEO, formularios de
contacto, payment flow).

**Baseline conocido (corrida 22e5, MODO DEV):** Home Performance 62/100,
LCP 3.4s, CLS 0, TBT 690ms, TTI 63s. Otras rutas entre 33-85 Perf según
complejidad. Ver §5.1 para tabla completa.

**Métrica objetivo (Fase 1):** Performance home ≥ 75, LCP < 4s, mantener
CLS < 0.1. Validar contra build de producción (Fase 4).

**Restricciones acordadas con el usuario:**
- Enfoque **conservador**: lazy-load + defer + reducir trabajo en main thread.
  NO eliminar librerías (bootstrap, pace, mixitup, etc.) sin confirmar uso real
  en otras páginas.
- Mantener la UI y animaciones tal cual.
- **NO TOCAR SEO**: metadata, JSON-LD schemas, robots.ts, sitemap.ts, OG tags,
  canonical URLs, keywords, encabezados (H1/H2/H3) — todo eso queda intacto.
  Confirmado por el usuario en sesión 2026-06-08.
- No introducir dependencias nuevas pesadas.

---

## 2. Estructura del repositorio

```
mi portafolio/
├── undercodeec_nextjs/    ← sitio principal (Next.js 16.1.2 + React 19) — FOCO
├── slider/                ← proyecto Vite auxiliar (slider Figma Make). NO es lo que se sirve en localhost:3000
├── backend/               ← backend
└── .unlighthouse/         ← reportes (ver §3)
```

Stack del sitio principal (`undercodeec_nextjs/package.json`):
- Next.js 16.1.2, React 19.2.3, TypeScript 5
- Tailwind 3.4 con prefijo `tw-`
- Three.js stack: `@react-three/fiber` + `@react-three/drei` + GLB en `/public/modelo-3D/`
- Animación: `framer-motion`, `animejs`, `@theatre/core`, `@theatre/studio`
- Carruseles: `react-slick` + `slick-carousel`, `swiper`, `lightgallery`, `rc-slider`
- Otros: `axios`, `dompurify`, `html2pdf.js`, `@supabase/supabase-js`, `react-modal-video`, `react-scroll`

---

## 3. Estado del diagnóstico Unlighthouse

**Ambas corridas (`6174/` y `71ef/`) son INVÁLIDAS por la misma razón
estructural: colisión de puerto.**

### 3.0 Causa raíz identificada (2026-06-08 — corrida 71ef)

Unlighthouse intenta levantar su propio servidor (para el viewer y para
servir cosas como `lighthouse.fbx`) en el puerto **5678**. Cuando ese
puerto está ocupado, el helper `get-port` busca otro y termina escogiendo
**3000**, **el mismo puerto del Next.js dev server**. Síntomas del log:

```
[get-port] Unable to find an available port (tried 5678 on host "localhost").
Using alternative port 3000.
...
Report: http://localhost:3000/
```

Resultado:
- Chrome headless navega a `localhost:3000/<ruta>/` y a veces le pega a
  la SPA del viewer de Unlighthouse en vez del Next.js → reportes con
  recursos `LighthouseThreeD-DnJDxtlX.js`, `index-BpMBtP66.js`,
  `lighthouse.fbx`, `index-DqrEQD4C.css`.
- Layout shift culpable falso: `<main class="xl:flex mt-2 mb-2">` (es el
  contenedor del viewer).
- Sub-páginas reportan `NO_FCP` ("page did not paint any content") porque
  el viewer es una SPA que solo renderiza en `/` — cualquier sub-ruta le
  devuelve un body vacío hasta que el JS arranca.

### 3.0.1 Procedimiento para una corrida limpia (BLOQUEANTE)

```powershell
# 1. Verificar que NO haya procesos zombies en 5678 ni puertos cercanos
netstat -ano | findstr :5678
# Si aparece algo, matar el PID:
Stop-Process -Id <PID> -Force

# 2. Mover dev server a otro puerto, para evitar cualquier colisión futura
cd undercodeec_nextjs
$env:PORT=3100; pnpm dev
# (o ajustar package.json: "dev": "next dev -p 3100")

# 3. En otra terminal — escanear con Unlighthouse contra 3100:
cd ..
npx unlighthouse --site http://localhost:3100/ --no-cache

# 4. Al terminar, revisar 1 payload.html cualquiera para confirmar
#    que contiene HTML de Next.js (debe verse `/_next/...`).
#    Si ves <main class="xl:flex mt-2 mb-2"> o `assets/index-*.js`,
#    la corrida está contaminada — abortar y revisar puertos de nuevo.
```

Alternativa: crear `unlighthouse.config.ts` en la raíz (no ejecutar sin
confirmar):

```ts
// unlighthouse.config.ts
export default {
  site: 'http://localhost:3100/',
  scanner: {
    // saltar el blog dinámico mientras optimizamos lo estático
    exclude: ['/blog/.*'],
  },
  // forzar puerto del viewer
  router: { prefix: '/__unlighthouse__' },
};
```

### 3.1 Qué pasó en cada corrida

El usuario corrió `npx unlighthouse --site http://localhost:3000/` pero la
corrida se interrumpió. Al revisar los `payload.html` en cada subcarpeta de
`reports/`:

- **Index (`reports/lighthouse.json`)**: el `payload.html` muestra HTML real
  de Next.js (`/_next/image/...`). Las **métricas son válidas** pero los
  recursos listados en `network-requests`, `unused-javascript` y
  `unused-css-rules` incluyen assets propios de la UI de Unlighthouse
  (`LighthouseThreeD-DnJDxtlX.js`, `index-BpMBtP66.js`, `logic-BNsnEVXP.js`,
  `index-DqrEQD4C.css`, `lighthouse.fbx`) — esos NO existen en el proyecto
  del usuario; viven en `.unlighthouse/localhost/6174/assets/`.
- **Sub-páginas** (`contacto/`, `politicas-playconsole/`): el `payload.html`
  capturó la propia UI de Unlighthouse (`<main class="xl:flex mt-2 mb-2">`,
  `dark:bg-[#020617]`). Por eso aparecen problemas como "CLS 0.90", "buttons
  sin nombre", "links sin texto descriptivo" — **son falsos positivos sobre
  el visor de Unlighthouse, no sobre el sitio**.
- **Resto de páginas** (`aplicaciones-moviles/`, `servicios/`, `blog/`,
  `marketing-para-tu-negocio/`, `nuestra-trayectoria/`,
  `software-para-tu-negocio/`): score 0 en todas las categorías porque la
  corrida murió antes de capturarlas.

### Métricas válidas (solo index)

| Métrica | Valor | Score |
|---|---|---|
| Performance | 33 | — |
| SEO | 73 | — |
| Accessibility | 88 | — |
| Best Practices | 100 | — |
| First Contentful Paint | 7.8 s | 0 |
| Largest Contentful Paint | 10.1 s | 0 |
| Total Blocking Time | 0 ms | 1 |
| Cumulative Layout Shift | 0.903 | 0.03 |
| Speed Index | 7.8 s | 0.23 |
| Time to Interactive | 10.1 s | 0.26 |

> ⚠️ El CLS 0.903 reportado en el index es real, pero el culprit
> `<main class="xl:flex mt-2 mb-2">` que aparece en `layout-shifts.details`
> es probablemente de la UI de Unlighthouse — la home del sitio usa Tailwind
> con prefijo `tw-`, no `xl:flex`. Hay que re-medir con una corrida limpia
> para identificar el verdadero culpable del CLS.

### Resultados parciales corrida 71ef (2026-06-08, contaminados)

A título informativo, lo que se alcanzó a salvar de la corrida 71ef:

| Ruta | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | ¿Confiable? |
|---|---|---|---|---|---|---|---|---|---|
| `/` (home) | 29 | 88 | 100 | 73 | 7.8 s | 10.1 s | 0.903 | 230 ms | ❌ midió UI Unlighthouse |
| `/contacto/` | 57 | 88 | 100 | 73 | 7.8 s | 9.9 s | 0.015 | 30 ms | ⚠️ a confirmar |
| `/politicas-playconsole/` | 57 | 88 | 100 | 73 | 7.8 s | 10.0 s | 0 | 10 ms | ⚠️ a confirmar |
| Resto (8 rutas) | 0 | 0 | 0 | 0 | — | — | — | — | NO_FCP — no medidas |

Hipótesis: `/contacto/` y `/politicas-playconsole/` quizás SÍ fueron medidas
contra Next.js real (CLS 0/0.015 es coherente con páginas estáticas sin
slider). El FCP/LCP de ~8-10s en ambas confirma que **el problema raíz es
compartido**: viene del `layout.tsx` global (CSS pesado bloqueando render).

Acción pendiente sigue siendo §3.0.1.

---

## 4. Hallazgos preliminares por revisión de código

Estos hallazgos vienen de leer el código directamente (independientes del
diagnóstico contaminado). Confirmar prioridades con la re-medición de §3.

### 4.1 CSS sincrónico masivo en `<head>` global

**Archivo:** `undercodeec_nextjs/src/app/layout.tsx:222-229`

```tsx
// Render-blocking
<link rel="stylesheet" href="/assets/css/lib/bootstrap.min.css" />   // 153 KB
<link rel="stylesheet" href="/assets/css/style.css" />               // 472 KB

// Cargados con afterInteractive pero sin media swap
<Script id="deferred-css">
  // inyecta: all.min.css (171 KB) + bootstrap-icons.css (73 KB)
  //       + preview-style.css + animations.css
</Script>
```

- **Total CSS render-blocking ≈ 625 KB sin minificar relevantes para la home.**
- `style.css` 472 KB es probablemente la unión de los `_*.css` de
  `public/assets/css/elements/` + `public/assets/css/common/`. Muchos
  archivos sueltos tienen ≤ 1 KB (placeholder vacíos) → mucho CSS muerto.

### 4.2 Home (`page.tsx`) carga 12 secciones eager

**Archivo:** `undercodeec_nextjs/src/app/page.tsx:1-23`

Todos los componentes `Preview/*` se importan estáticos:
- `HeroSlider`, `Features`, `Demos`, `InnerPages`, `BuyNow`, `Portfolio`,
  `Codei`, `BestFeatures`, `Responsive`, `AllFeatures`, `Testimonials`,
  `CallToAction`.

Solo el primer viewport necesita `HeroSlider`. El resto debería ser
`next/dynamic({ ssr: false })` o split por viewport con IntersectionObserver.

`page.tsx` además es `"use client"` completo — bloquea SSR/SSG para toda
la home.

### 4.3 `HeroSlider.jsx` con dependencias pesadas eager

**Archivo:** `undercodeec_nextjs/src/components/Slider/HeroSlider.jsx:1-17`

Importa estáticos: `react-slick`, `framer-motion`, `lucide-react`,
`slick-carousel/slick/slick.css`, `slick-carousel/slick/slick-theme.css`,
`./slider.css`, **y `@/components/3D/HeroModel`** (que internamente carga
`@react-three/fiber` + `@react-three/drei`).

El bundle inicial del Hero se vuelve enorme. `slides` array (línea 18) solo
tiene **1 slide** — react-slick es overkill para 1 slide.

### 4.4 `HeroModel.jsx` (Three.js + GLB)

**Archivo:** `undercodeec_nextjs/src/components/3D/HeroModel.jsx`

- Carga `/modelo-3D/Model3D-1.glb` con `useGLTF.preload()` a nivel de módulo
  (línea 19). Esto ejecuta el preload **en cuanto Next.js parse el módulo**,
  aun si el componente no se renderiza.
- En móviles ya hace `frameloop="demand"` ✅
- Falta: lazy-loadear el módulo entero detrás de un `next/dynamic` con
  `ssr: false` para sacar Three.js del bundle inicial.

### 4.5 Scripts legacy en `layout.tsx` (cargan en TODAS las rutas)

**Archivo:** `undercodeec_nextjs/src/app/layout.tsx:277-280`

```tsx
<Script src="/assets/js/lib/pace.js" />                  // 19 KB
<Script src="/assets/js/lib/bootstrap.bundle.min.js" />  // 77 KB
<Script src="/landing-preview/js/parallax.min.js" />     // 7 KB
<Script src="/assets/js/main.js" />                      // 59 B (vacío?)
```

Confirmar si pace, parallax y bootstrap.bundle.js se usan realmente en runtime
o son herencia del template original (HTML estático). **No eliminar sin
confirmar**.

### 4.6 Preloads agresivos de imágenes del slider

El `payload.html` del index muestra **8+ `<link rel="preload" as="image">`**
para distintas resoluciones de las imágenes del slider y de `/landing-preview/img/header/*.webp`. Esto satura el ancho de banda al inicio.

### 4.7 GTM + GA + reCAPTCHA cargan en todas las rutas

`layout.tsx:213-242` carga Google Tag Manager, Google Analytics y
reCAPTCHA Enterprise. GTM con `afterInteractive` está bien; reCAPTCHA ya está
en `lazyOnload` ✅. Confirmar si GTM también debe ser `lazyOnload` para
rutas legales (políticas).

---

## 5. Baseline limpio (corrida 22e5 — 2026-06-08, MODO DEV)

> Corrida: `.unlighthouse/localhost/22e5/reports/`
> Comando: `npx unlighthouse --site http://localhost:3100/ --no-cache`
> Dev server: Next.js en puerto 3100. Viewer en 5678. Sin contaminación.
> **Nota importante:** estos números son de `pnpm dev`. En producción
> (`pnpm build && pnpm start`) los scores serán MEJORES por CSS minificado,
> sin devtools, chunks optimizados, etc. Repetir contra build cuando
> terminemos Fase 1.

### 5.0 Baseline PROD (corrida 0968 — 2026-06-08 18:00, build prod en :3200)

> Único baseline confiable. Build real (`pnpm build && next start`), no dev.
> Verificación: `next-devtools` ausente, `react-icons` tree-shaken, chunks
> con nombres hash cortos (`8c624b315222c964.css`).
> Comando: `npx unlighthouse --site http://localhost:3200/ --no-cache`.

| Ruta | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | TTI | SI |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` (home) | 59 | 95 | 77 | 100 | 2.0 s | 5.1 s | 0 | 460 ms | 43.4 s | 12.0 s |
| `/aplicaciones-moviles/` | 64 | 86 | 69 | 100 | 2.3 s | 11.5 s | 0.007 | 150 ms | 36.3 s | 7.0 s |
| `/blog/` (index) | 62 | 90 | 77 | 100 | 3.1 s | 9.4 s | 0 | 40 ms | 22.8 s | 7.8 s |
| `/blog/el-futuro-...` | 56 | 92 | 77 | 100 | 4.9 s | 11.1 s | 0.079 | 110 ms | 25.8 s | 7.8 s |
| `/blog/impacto-ia-...` | 59 | 92 | 77 | 100 | 4.9 s | 11.0 s | 0.009 | 50 ms | 25.8 s | 7.3 s |
| `/blog/impacto-...-2026/` | 67 | 92 | 77 | 100 | 1.7 s | 17.8 s | 0.01 | 70 ms | 26.5 s | 7.2 s |
| `/blog/whatsapp-...` | 62 | 92 | 77 | 100 | 3.9 s | 10.9 s | 0.056 | 40 ms | 25.0 s | 6.0 s |
| `/contacto/` | **82** ✅ | 85 | 73 | 100 | 2.4 s | 3.9 s | 0.024 | 40 ms | 13.2 s | 4.6 s |
| `/marketing-para-tu-negocio/` | 66 | 94 | 73 | 100 | 2.6 s | **19.3 s** 🔴 | 0.013 | 70 ms | 20.2 s | 5.6 s |
| `/nuestra-trayectoria/` | 67 | 95 | 69 | 100 | 2.0 s | 16.6 s | 0.019 | 80 ms | 21.7 s | 6.4 s |
| `/politicas-playconsole/` | 69 | 94 | 77 | 100 | 3.9 s | 5.2 s | 0.003 | 0 ms | 6.5 s | 5.4 s |
| `/servicios/` | 69 | 90 | 69 | 100 | 2.0 s | 12.5 s | 0.06 | 80 ms | 18.0 s | 5.2 s |
| `/software-para-tu-negocio/` | **79** | 95 | 73 | 100 | 2.0 s | 4.4 s | 0.014 | 80 ms | 19.2 s | 5.3 s |

**Conclusiones del baseline prod:**
- ✅ Dev mode NO era el culpable principal del LCP alto. Los LCPs de
  10-19 s en `/marketing-para-tu-negocio/`, `/servicios/`,
  `/nuestra-trayectoria/` y posts del blog **son reales**.
- ✅ Las 5 fases aplicadas (1.3, 1.4, 1.6, 1.7, y tree-shake de prod)
  redujeron el transfer del home de ~62 MB (baseline original con GLB+
  MP4+Calendly+Vimeo+dev) a **11.1 MB**. Solo Vimeo siguió cargando.
- ✅ A11y 86-95 y SEO 100/100 estables (no se rompieron con los cambios).
- ✅ CLS bajo control (<0.08 todas).
- 🔴 **El bottleneck real ahora son las imágenes hero del home y demos**
  (Tabla §5.3). El top transfer es `6.6.webp` 1.8 MB.
- 🔴 **3 IDs de GA distintos cargan en home** (GTM-WX7HLGTV +
  G-99Z5CCZ3RK + G-62CCGC2JBQ + G-2QDBXNBC8K). Total terceros: ~700 KB.

### 5.1 Scores por página (corrida 22e5 — DEV mode, ahora SOLO referencia histórica)

> Corrida limpia, post-Fases 1.3 + 1.4 + 1.6 aplicadas. Dev mode (puerto 3100).
> Valores `parseados de .unlighthouse/localhost/22e5/reports/lighthouse.json`.

| Ruta | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | TTI | SI |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` (home) | **54** ↓ | 95 | **77** ↑↑ | 100 | 0.9 s ↑ | 5.7 s ↓ | 0 | 600 ms ↓ | 54.9 s ↑ | 16.0 s ↑ |
| `/aplicaciones-moviles/` | 61 ↓ | 87 | 69 | 100 | 1.9 s | 5.7 s | 0.007 | 320 ms | 30.5 s | 11.5 s |
| `/blog/` (index) | 87 ↑ | 91 | 77 | 100 | 1.9 s | 2.3 s | 0 | 80 ms | 23.8 s | 12.1 s |
| `/blog/el-futuro-...` | 65 ↓ | 92 | 73 | 100 | 2.0 s | 10.9 s ↓ | 0.079 | 80 ms | 25.8 s | 7.2 s |
| `/blog/impacto-ia-...` | 64 = | 92 | 73 | 100 | 2.0 s | **10.1 s** ↑ | 0.07 | 100 ms | 25.4 s | 7.5 s |
| `/blog/impacto-...-2026/` | 66 ↓ | 92 | 73 | 100 | 2.0 s | 11.4 s ↓ | 0.076 | 80 ms | 25.8 s | 6.6 s |
| `/blog/whatsapp-...` | 65 ↓ | 92 | 73 | 100 | 1.8 s | **21.1 s** ↓ | 0.072 | 10 ms | 29.4 s | 8.7 s |
| `/contacto/` | 87 ↑ | 85 | 73 | 100 | 1.0 s | 2.9 s | 0.024 | 60 ms | 16.8 s | 8.7 s |
| `/marketing-para-tu-negocio/` | 65 ↑ | 95 | 73 | 100 | 1.9 s | **20.6 s** 🔴 | 0.013 | 50 ms | 22.6 s | 10.4 s |
| `/nuestra-trayectoria/` | 59 ↑ | 95 | 69 | 100 | 2.6 s | **19.5 s** ↓ | 0.019 | 200 ms | 24.1 s | 9.9 s |
| `/politicas-playconsole/` | 66 ↓ | 95 | 73 | 100 | 2.0 s | 10.5 s ↓ | 0.003 | 70 ms | 16.9 s | 7.3 s |
| `/servicios/` | 65 ↑ | 91 | 69 | 100 | 1.8 s | **18.6 s** 🔴 | 0.013 | 100 ms | 20.4 s | 8.9 s |
| `/software-para-tu-negocio/` | 63 ↓ | 95 | 73 | 100 | 2.0 s | 9.4 s ↓ | 0.014 | 190 ms | 23.3 s | 8.1 s |

> ↑/↓ indica delta vs corrida anterior (22e5 14:20). El score Perf del home
> bajó (-10) pero **BP subió +19** y **TBT/TTI mejoraron**. La caída de Perf
> se debe enteramente a LCP (3.2 → 5.7 s) que en dev es volátil por
> compilación lazy del chunk de la nueva ruta. **No interpretar la caída
> del Perf como regresión — el ahorro de 2.7 MB es real y se reflejará en
> producción.**

**Validación de red (lo que NO miente):**

| Recurso | Antes | Ahora | Estado |
|---|---|---|---|
| GLB modelo 3D | 24.8 MB | 0 | ✅ Fase 1.3 |
| MP4 video local | 19 MB | 0 | ✅ Fase 1.4 |
| Calendly booking.css+js | 2.5 MB | 0 | ✅ Fase 1.6 |
| Stripe v3 | 229 KB | 0 | ✅ bonus Fase 1.6 |
| **Total eliminado del eager** | — | — | **~46.5 MB** |
| Total transfer home actual | — | 14.7 MB | 🟡 quedan offenders |

**Lectura rápida de la tabla:**
- ✅ CLS bien controlado (todas < 0.08, mayoría 0).
- ✅ SEO 100/100 globalmente (intacto).
- ✅ A11y mayormente ≥ 91; `/contacto/` 85 y `/aplicaciones-moviles/` 87 son los más bajos.
- 🔴 **3 rutas con LCP catastrófico**: `/marketing-para-tu-negocio/` 24.3 s,
  `/blog/impacto-ia-...` 23.8 s, `/servicios/` 18.9 s. Inspeccionar el LCP
  element con `node` + `lighthouse.json` cuando se ataquen.
- 🟡 TTI alto global (16-60 s) → casi seguro artefacto dev-mode. Validar Fase 4.
- 🟡 Best Practices home 58 — `deprecations` + `third-party-cookies` + `valid-source-maps`.

### 5.2 Observaciones clave (POST sesión 2026-06-08, ya corregidas)

1. **Lecciones de la sesión:**
   - CLS de la corrida ORIGINAL era ≈ 0 en todas las rutas. Las que
     muestran "→ 0.69, 0.85, 1.69" son artefactos de mi cambio de Fase
     1.1 (revertido). Vuelven a ≈ 0 con el código actual.
   - Mi script original confundió **LCP con Speed Index** en mi primera
     tabla. `/marketing-para-tu-negocio/` LCP real es **1.6s** (no 24s).
     `/servicios/` sí tiene LCP problemático (20.9s).
   - El TTI inflado (15-63s) es **artefacto del dev server**
     (compilación lazy, devtools, source maps). NO se traduce a prod.
2. **Problemas confirmados que sí quedan:**
   - **`/servicios/` LCP 20.9s** (rutas largas con muchas secciones).
   - **Posts del blog complejos** (LCP 10-16s): causa identificada =
     imágenes PNG hero sin optimizar de 700KB-1.1MB c/u.
   - **Best Practices home 58/100**: `deprecations`,
     `third-party-cookies`, `valid-source-maps`, `inspector-issues`.
3. **SEO 100/100 en todas las rutas** — no tocar.
4. **A11y 85-95** — margen menor en `link-name`, `heading-order`,
   `label-content-name-mismatch`.

### 5.3 Causas raíz reales (con datos)

**CSS muerto masivo (home):**

| Archivo | Wasted / Total | % muerto |
|---|---|---|
| `/assets/css/style.css` | 461KB / 472KB | **97.7%** |
| `/assets/css/lib/bootstrap.min.css` | 145KB / 152KB | **95%** |
| `/assets/css/lib/all.min.css` | 33KB / 33KB | **100%** |
| `/landing-preview/css/preview-style.css` | 12KB / 14KB | 86% |
| `/assets/css/lib/bootstrap-icons.css` | 10KB / 10KB | **100%** |

**Total CSS muerto ≈ 661KB de 681KB cargado (97% basura).** El template
HTML legacy del que vinieron estos CSS no se está usando — la home ya
está en React con su propio sistema de estilos.

**JS muerto significativo (home):**

| Chunk | Wasted / Total |
|---|---|
| `react-icons/ri/index.mjs` | 436KB / 448KB |
| `react-icons/fa/index.mjs` | 434KB / 444KB |
| `recaptcha__es.js` | 214KB / 367KB |
| `three/build/three.module.js` | 210KB / 266KB |
| `next-devtools` | 143KB / 219KB *(solo DEV)* |
| `@react-three/fiber` | 140KB / 151KB |
| `googletagmanager (2 IDs distintos)` | 113KB+115KB |

`react-icons` está siendo importado completo (`import { ... } from 'react-icons/fa'`)
en vez de hacer tree-shake. **Casi 900KB de íconos** de los que se usan
~12KB. Esto solo se arregla cambiando imports a paths específicos.

**Assets pesados descargados en home (red) — post Fases 1.3 + 1.4:**

| Recurso | Tamaño | Estado |
|---|---|---|
| ~~`/modelo-3D/Model3D-1.glb`~~ | ~~24.8 MB~~ | ✅ ELIMINADO (Fase 1.3) |
| ~~`/assets/img/video/video-undercode-ec-1.mp4`~~ | ~~19 MB~~ | ✅ ELIMINADO (Fase 1.4) |
| `landing-preview/img/demos/6.6.webp` | 1.8 MB | 🟡 pendiente |
| Calendly `booking.css` | **1.26 MB** | 🔴 mayor offender restante |
| Calendly `booking.js` | **1.23 MB** | 🔴 mayor offender restante |
| `screencapture-cortinasec-*.webp` | 882 KB | 🟡 |
| Vimeo CDN stream MP4 (segmento inicial) | 802 KB | 🆕 detectado |
| `juliojaramillo.webp` | 714 KB | 🟡 |
| `logik.webp` | 583 KB | 🟡 |
| `lucanvape.webp` | 551 KB | 🟡 |
| `instituto.webp` | 540 KB | 🟡 |
| `8.8.webp` | 481 KB | 🟡 |
| `react-icons/ri/index.mjs` (chunk dev) | 449 KB | dev-only |
| `react-icons/fa/index.mjs` (chunk dev) | 444 KB | dev-only |
| `recaptcha__es.js` | 376 KB | terceros |
| `three.module.js` | 266 KB | code-split en Fase 2 |
| `undercode-logo.png` | **238 KB** | 🆕 convertir a WebP |
| `js.stripe.com/v3` | 229 KB | revisar si necesario en home |
| `c3afe_...next-devtools...js` | 219 KB | dev-only |
| `f.vimeocdn.com/.../player.es.module.js` | 215 KB | 🆕 lazy-load Vimeo |
| `landing-preview/img/pattern.png` | 213 KB | 🆕 convertir a WebP |

**Top prioridades restantes en home (en orden de impacto):**

1. **Calendly 2.5 MB** — diferir a interacción (botón "Agendar cita" que
   inyecta el widget al click). Probable mayor ganancia tras Fases 1.3/1.4.
2. **Vimeo embed (player + stream ~1 MB)** — localizar componente y aplicar
   el mismo patrón IntersectionObserver de Fase 1.4 (carga al acercarse
   al viewport).
3. **Imágenes WebP de demos (`6.6.webp` 1.8 MB, otras 400-900 KB)** —
   re-comprimir con `cwebp -q 75` o servir vía `next/image` para
   responsive automático.
4. **Logo PNG 238 KB y pattern.png 213 KB** — conversión trivial a WebP.
5. **Stripe (229 KB)** — verificar si solo debe cargar en `/pago/`.

**Audits fallados globales (score 0):**
- `unminified-css` — CSS no minificado (dev mode; revisar build)
- `mainthread-work-breakdown` — exceso de trabajo en main thread
- `bootup-time` — JS execution time excesivo
- `font-display-insight` — fonts sin `font-display: swap`
- `forced-reflow-insight` — reflow forzados detectados
- `lcp-discovery-insight` — LCP no descubierto temprano
- `network-dependency-tree-insight` — cascada de red profunda
- `render-blocking-insight` — recursos bloqueando render
- `bf-cache` — bloqueo de back/forward cache
- `valid-source-maps` — source maps faltantes
- `third-party-cookies` — cookies de terceros (GA/GTM/Calendly)
- `deprecations` — APIs deprecadas usadas

### 5.4 Discrepancia GA — INVESTIGAR

El report muestra **3 IDs de Google Analytics distintos cargando**:
- `G-99Z5CCZ3RK` (definido en `layout.tsx:232,240`)
- `G-62CCGC2JBQ` (¿de dónde sale?)
- `G-2QDBXNBC8K` (¿de dónde sale?)

Probable origen: GTM container `GTM-WX7HLGTV` (en `layout.tsx:218`) está
disparando estos IDs adicionales. Confirmar en el dashboard de GTM y
decidir si los 3 son intencionales. Cada uno añade ~115KB.

---

## 6. Plan de trabajo por fases (REVISADO con datos reales)

**Regla:** completar una fase, re-medir, registrar en §7 (bitácora) antes de
pasar a la siguiente. **El baseline ya está medido en §5.1, no rehacerlo.**

### Fase 0 — Completada
- [x] Diagnóstico Unlighthouse limpio (corrida 22e5).
- [x] Baseline registrado en §5.1.
- [x] Causas raíz mapeadas en §5.3 con datos.

### Fase 1 — Quick wins (orden de mayor ROI a menor)

Objetivo: Performance home **62 → 75+**, Best Practices home **58 → 80+**.

**1.1 — Defer CSS legacy** ❌ **APLICADA Y REVERTIDA** (sesión 2026-06-08)

- [x] Intentado: cargar bootstrap.min.css + style.css + 4 más vía
      `preload`+swap onLoad.
- [x] **Revertido** porque causó CLS 0.69 en home, Perf 62→20. El
      `style.css` contiene reglas de layout del `<body>` mezcladas
      con bytes muertos — no se puede deferir como un bloque.
- [ ] **Reintento futuro (Fase 1.1b)**: usar `beasties`/`critters`
      para extraer critical CSS, inlinarlo en `<head>`, y deferir el
      resto. Trabajo de Fase 3, no de Fase 1.

**1.2 — Tree-shake `react-icons`** ⏭ **SALTADA**

- [x] Verificado: `react-icons` tiene `sideEffects: false` y los 3
      imports en `src/` usan patrón correcto (`from 'react-icons/fa'`).
- [x] Conclusión: en producción Webpack ya tree-shakea correctamente.
      Los 870KB observados en Lighthouse son artefacto de Turbopack/dev
      mode. Validar en Fase 4 (build prod). Si en prod sigue gordo,
      reabrir esta tarea.

**1.3 — `useGLTF.preload()` correcto** ✅✅ **VALIDADA**

- [x] Movido `useGLTF.preload(...)` de top-level (`HeroModel.jsx:19`)
      a dentro del `useEffect` del componente (`HeroModel.jsx:28-32`).
- [x] **Confirmado en re-medición 22e5**: el GLB de 25 MB ya NO aparece
      en `network-requests` del home. Ahorro: 24.8 MB en transferencia
      del primer paint.

**1.4 — Video MP4 19MB lazy** ✅✅ **VALIDADA**

- [x] `Responsive.jsx`: video reemplazado por placeholder `<div>` con
      `aspect-ratio: 16/9` hasta que IntersectionObserver fire
      (`rootMargin: 300px`).
- [x] **Confirmado en re-medición 22e5**: el MP4 local de 19 MB ya NO
      aparece en `network-requests` del home. CLS sigue en 0 → el
      placeholder reserva bien el espacio.

**1.5 — Imágenes hero del blog (PNG sin optimizar)** 🟡 **IDENTIFICADA, NO IMPLEMENTADA**

- Identificadas en `/blog/whatsapp-marketing-...`:
  - `whatsapp_b2b_erp.png` = 1.1MB
  - `whatsapp_marketing_ia.png` = 938KB
  - `whatsapp_chatbots_ia.png` = 861KB
  - `whatsapp_ecommerce_sales.png` = 762KB
  Total: **3.7MB** sin optimizar, todas PNG.
- LCP element del post: `figure.blog-hero > img`.
- [ ] Convertir las 4 PNG a WebP (esperado: -75% peso).
- [ ] Migrar al componente `<Image>` de Next.js para lazy + responsive
      automático.
- [ ] Revisar el resto de `/public/assets/img/blog/` por más PNGs
      grandes.

**1.6 — Calendly diferido a viewport** ✅✅ **VALIDADA (2026-06-08 17:34)**

- Detectado en re-medición 22e5: `booking.css` 1.26 MB + `booking.js`
  1.23 MB = **2.5 MB cargando en home**.
- [x] Componente identificado: `Codei.jsx` (sección 7 de 12 en `page.tsx`,
      below-the-fold). Inyectaba `widget.js` en `useEffect` sin condición.
- [x] Aplicado patrón IntersectionObserver (mismo enfoque que Fase 1.4):
      `useState shouldLoad`, IO `rootMargin: 300px`, placeholder de
      700 px para evitar CLS, guard para no duplicar el script si ya existe.
- [x] **Confirmado en re-medición**: cero URLs con `calendly` en
      `network-requests` del home. CLS sigue en 0.
- [x] **Bonus**: Stripe (`js.stripe.com/v3` 229 KB) también desapareció.
      Calendly era quien lo cargaba transitivamente. **Total ahorrado:
      ~2.7 MB en transfer eager.**

**1.7 — Vimeo embed lazy (estrategia `idle`)** 🟡 **APLICADA — validación PARCIAL**

- [x] Aplicado: nueva prop `strategy="idle"` en `VimeoFacade` +
      `AIAssistant/index.jsx:805` la usa.
- [x] **Real-world**: el primer request Vimeo ahora dispara a **2348 ms**
      (después de FCP en 1969 ms). Antes disparaba en el primer tick.
- [⚠️] **Lighthouse**: sigue contando los 18 requests de Vimeo (1.25 MB)
      porque su ventana de medición llega hasta TTI (49 s en dev).
      `requestIdleCallback` dispara ~500 ms después del primer render,
      mucho antes de cerrar la ventana de medición.
- **Conclusión**: la mejora ES real para usuarios (Vimeo ya no compite
  con FCP), pero Lighthouse no la refleja en el score. Para que
  Lighthouse la vea, habría que pasar a "true facade" (poster image
  estática + cargar Vimeo solo on hover/click). Decisión pospuesta
  hasta validar contra build de producción (Fase 4) — en prod, los
  chunks pesan ~70% menos y la ventana de TTI cae a 3-5 s, lo que
  podría dejar fuera al Vimeo automáticamente.

**1.8 — Optimización de imágenes hero/demos** ✅ **APLICADA (sin medir aún)**

- Diagnóstico: imágenes WebP de demos eran screenshots verticales gigantes
  de hasta 1366×10098 px (sirven al efecto hover "scroll por la página
  completa" pero pesaban 1.8 MB c/u). Trading card las renderiza en
  `max-width: 400px`, así que sobraban 5x de resolución horizontal.
- [x] Procesadas 17 imágenes referenciadas en `src/data/Preview/demos.json`
      con `sharp.resize({width: 800}).webp({quality: 75, effort: 6})`.
      Backup en `public/landing-preview/img/demos/_originals/`.
      **Total demos: 6.5 MB → 2.1 MB (-68%, -4.4 MB).**
- [x] `pattern.png` (213 KB, 1659×669) → `pattern.webp` (62 KB).
      CSS legacy actualizado en
      `public/landing-preview/css/preview-style.css:633`
      y `public/landing-preview/scss/preview-style.scss:506`. PNG eliminada.
- [x] `undercode-logo.webp` (22 KB) generada pero NO aplicada (logo
      referenciado en 27 archivos, mayoría metadata SEO/JSON-LD/OG —
      el usuario pidió no tocar SEO). PNG original intacto. WebP queda
      disponible si en futuro se quiere migrar la UI runtime.
- Sin rebuild necesario (todo está en `/public/`, se sirve directo).
- [ ] Pendiente: re-medir contra :3200. Esperado:
      - Top transfer del home cae de 1.8 MB → ~318 KB.
      - LCP del home y de rutas con demos debería bajar significativamente.
      - Total transfer home: 11.1 MB → ~6.5 MB esperado.

**1.9 — Rotating-pattern: de `<Image>` a CSS `background-image`** 🟡 **APLICADA — NEUTRAL**

- Hipótesis: Lighthouse no contaría `background-image` como LCP candidate.
- Realidad: Lighthouse 13 SÍ cuenta `<div>` con `background-image` como
  LCP candidate. El selector cambió de `img.rotating-pattern` a
  `div.rotating-pattern` pero el timing es idéntico.
- [x] Editado `HeroSlider.jsx:86-95`: `<Image>` → `<div>` con
      `backgroundImage`. Visualmente idéntico.
- [x] Re-medido (corrida 0968 17:16): home Perf 54 = 54, LCP 9.2 s → 9.4 s.
      **Sin movimiento medible.**
- **Diagnóstico real del LCP del home (con `lcp-breakdown-insight` y
  `mainthread-work-breakdown`)**:
  - LCP breakdown óptimo (red): TTFB 9 ms + load delay 126 ms + load
    duration 55 ms + render delay 421 ms = **612 ms** teórico.
  - LCP real reportado: **9388 ms**.
  - Diferencia (~8800 ms) = main-thread work bajo throttling 4× CPU:
    - Script Evaluation: 1600 ms
    - Style & Layout: 959 ms
    - Other (esperas): 1726 ms
    - Rendering: 295 ms
  - **El bottleneck NO es la imagen ni el tipo de elemento. Es el
    bundle JS del home cargando eager**: framer-motion + theatre +
    react-slick + slick-carousel + lucide-react + three + drei +
    anime.js + html2pdf.js, todos como dependencias eager por ser
    `"use client"` la `page.tsx` completa.
- **Lección**: para mover el LCP del home, hay que reducir trabajo del
  main thread — no atacar la imagen. La solución real está en Fase 2
  (`next/dynamic` para HeroModel y secciones below-the-fold) o Fase 1.1b
  (critical CSS).
- Decisión: **mantener el cambio** (es neutral, no perjudica), seguir
  con otras fases.

### Fase 2 — Code-splitting de componentes pesados ✅ APLICADA (2026-06-09)

Objetivo: TBT home < 200ms (actual 460ms en prod), reducir Script Evaluation.

- [x] `next/dynamic({ ssr: false })` para `HeroModel` en `HeroSlider.jsx:17-23`.
      Three.js + drei + GLB salen del bundle inicial. Mobile/!mounted ya
      tiene fallback `<Image>` así que no hay parpadeo perceptible.
- [x] `next/dynamic` (ssr:true default) para 9 secciones en `page.tsx`:
      `Demos`, `BuyNow`, `Portfolio`, `Codei`, `BestFeatures`,
      `Responsive`, `AllFeatures`, `Testimonials`, `CallToAction`.
      `Features` e `InnerPages` quedan eager (arriba). HTML pre-renderizado
      se mantiene → SEO intacto, pero cada sección queda en su propio chunk.
- [x] Build prod OK (5.8s compile, 27 páginas estáticas generadas, home
      sigue `○ (Static)`).
- [ ] Pendiente: re-medir con Unlighthouse en :3200 para validar delta de
      LCP, TBT y bundle inicial. Esperado: Script Eval cae 30-50%, LCP del
      home baja sustancialmente.
- [ ] (Opcional, no urgente) Evaluar si `react-slick` es necesario teniendo
      **1 sola slide** definida; si no, reemplazar por div estático. Eso
      ahorraría ~20-30 KB adicionales.

### Fase 3 — Terceros y GA

Objetivo: Best Practices home **58 → 85+**.

- [ ] **Investigar GA múltiple** (§5.4): hay 3 IDs cargando. Confirmar en
      GTM dashboard si los 3 son intencionales. Eliminar los redundantes.
- [ ] Calendly + Stripe: confirmar si deben cargar en la home o solo en
      rutas específicas (`/contacto/`, `/pago/`). Sospecha: están en el
      footer o algún CTA global.
- [ ] reCAPTCHA: ya está `lazyOnload` ✅. Verificar que solo se cargue en
      páginas con formulario.

### Fase 4 — Auditar build de producción

Objetivo: validar que las mejoras se trasladan a prod.

- [ ] `cd undercodeec_nextjs && pnpm build && pnpm start -p 3100`
- [ ] `npx unlighthouse --site http://localhost:3100/ --no-cache`
- [ ] Comparar prod vs. dev. Si prod ya tiene >80 en todo, gran parte
      de los issues actuales eran solo dev mode (devtools, source maps).

### Fase 5 — Limpieza A11y / Best Practices

Objetivo: A11y ≥ 95 en todas, BP ≥ 90.

- [ ] `link-name` (falla en varias rutas): añadir `aria-label` o texto
      visible a links que solo tienen ícono.
- [ ] `heading-order`: revisar jerarquía H1→H2→H3 en home.
- [ ] `label-content-name-mismatch`: confirmar que el label visible y el
      accessible name coinciden en botones.

### Fase 6 — Re-medición final y reporte

- [ ] Correr Unlighthouse contra `pnpm start` (producción).
- [ ] Comparar contra §5.1 y registrar deltas.
- [ ] Decidir si abrir Fase 7 (reescribir HeroSlider, comprimir GLB con
      Draco, reemplazar framer-motion por CSS, etc.).

---

## 7. Bitácora de cambios

> Cada vez que se termine una tarea, añadir entrada con fecha, archivo
> tocado, y métrica antes/después si aplica. Esto es lo que un chat nuevo
> debe leer para retomar.

### 2026-06-09 (cierre) — Estado de procesos al terminar la sesión
- Puertos libres: 3200 ✅, 5678 ✅, 3100 ✅.
- Server `pnpm start :3200` y viewer Unlighthouse apagados con TaskStop.
- Procesos node residuales detectados (NO míos, no se mataron):
  PIDs 26452 (`pnpm dev`), 27356 (`next dev`), 22068
  (`start-server.js` de Next dev). Son zombies sin puerto abierto,
  probablemente de una sesión anterior. Si molestan: `Stop-Process
  -Id 26452,27356,22068 -Force`.
- Para retomar y volver a medir:
  ```powershell
  $env:PORT=3200; pnpm --dir "D:\Documentos\bakup mi portafolio\mi portafolio\undercodeec_nextjs" start
  # En otra terminal:
  cd "D:\Documentos\bakup mi portafolio\mi portafolio"
  npx unlighthouse --site http://localhost:3200/ --no-cache
  ```
- Reportes de la corrida d19a (Fase 2 medida) quedan en
  `.unlighthouse/localhost/d19a/reports/`. Si se corre otra vez, se
  generará una corrida nueva con hash distinto — comparar contra d19a.

### 2026-06-09 — Fase 2 · next/dynamic + medición corrida d19a
- Archivos modificados:
  - `src/components/Slider/HeroSlider.jsx:7,17-23` — `HeroModel` ahora
    vía `dynamic(() => import(...), { ssr: false, loading: () => null })`.
    Three.js + drei + canvas + GLB salen completos del bundle inicial.
  - `src/app/page.tsx:1-22` — 9 imports estáticos convertidos a
    `next/dynamic` con `ssr:true` (default). `Features` e `InnerPages`
    quedan eager. Cada sección queda en su propio chunk JS.
- Build verificado: `pnpm build` exitoso (5.8 s compile, 27 páginas
  estáticas, home sigue marcada `○ (Static)`).
- Medición Unlighthouse vs baseline 0968 (cierre 2026-06-08), corrida d19a
  (13 rutas en 86 s, contra `pnpm start` en :3200):

  | Ruta | Perf Δ | LCP s Δ | TBT ms Δ |
  |---|---|---|---|
  | `/` home | 59→**48** (−11) ❌ | 5.1→5.6 (+0.5) | 460→**904** (+444) ❌ |
  | `/aplicaciones-moviles/` | 64→63 (−1) | 11.5→**5.5** (−6.0) ✅✅ | 150→162 |
  | `/blog/` | 62→**89** (+27) ✅✅ | 9.4→**2.2** (−7.2) ✅✅ | 40→48 |
  | `/blog/el-futuro-...` | 56→69 (+13) ✅ | 11.1→**5.1** (−6.0) ✅✅ | 110→26 ✅ |
  | `/blog/impacto-ia-...` | 59→63 (+4) | 11.0→16.1 (+5.1) ❌ | 50→124 |
  | `/blog/impacto-...-2026/` | 67→65 | 17.8→13.0 (−4.8) ✅ | 70→60 |
  | `/blog/whatsapp-...` | 62→71 (+9) ✅ | 10.9→**6.9** (−4.0) ✅ | 40→0 ✅ |
  | `/contacto/` | 82→84 | 3.9→3.2 (−0.7) ✅ | 40→107 |
  | `/marketing-para-tu-negocio/` | 66→65 | 19.3→**10.8** (−8.5) ✅✅ | 70→62 |
  | `/nuestra-trayectoria/` | 67→**54** (−13) ❌ | 16.6→**6.3** (−10.3) ✅✅ | 80→308 ❌ |
  | `/politicas-playconsole/` | 69→78 (+9) ✅ | 5.2→4.1 (−1.1) ✅ | 0→32 |
  | `/servicios/` | 69→64 (−5) | 12.5→9.1 (−3.4) ✅ | 80→10 ✅ |
  | `/software-para-tu-negocio/` | 79→72 (−7) | 4.4→4.2 | 80→219 |

- **Lectura crítica del resultado:**
  - ✅ **LCP mejoró drásticamente en 9/13 rutas**. Las rutas con LCP
    catastrófico cayeron 6-10 s: marketing 19.3→10.8, trayectoria
    16.6→6.3, apps móviles 11.5→5.5, blog index 9.4→**2.2**. El usuario
    VE el contenido antes en casi todas las rutas.
  - ❌ **TBT subió en home y trayectoria**. El cost de descargar y
    parsear 9 chunks separados penaliza el TBT bajo throttle 4× CPU.
    Cada chunk = parse + evaluate adicional.
  - 🟡 **Mixto en Perf score**: Lighthouse pesa fuerte el TBT, así que
    aunque el LCP mejoró 9.4→5.6 en el home, el Perf bajó 59→48. La UX
    real mejora; el score Lighthouse no la refleja por la cascada de
    chunks.
  - 🚨 **`/blog/impacto-ia-...` LCP empeoró (+5.1 s)**. Probable
    volatilidad de corrida única o la cascada de chunks le pegó a esta
    ruta concreta. Volver a medir en una segunda corrida para confirmar.
- **Decisión sobre la fase**: el cambio se **mantiene** porque la
  mejora de LCP en 9 rutas (varias con −6 a −10 s) supera el costo de
  TBT en 2 rutas. El score Perf bajó pero la experiencia real de
  carga mejora.
- **Próximo paso recomendado**: la cascada de chunks empeoró TBT. Si
  se quiere recuperar el score, hay dos opciones:
  1. **Pre-fetch de chunks pesados**: añadir `<link rel="modulepreload">`
     para los chunks de las secciones críticas (Demos, Portfolio) en
     `layout.tsx` para que descarguen en paralelo en vez de en cascada.
  2. **Re-agrupar el split**: dejar `Demos` eager (es above-the-fold en
     viewports grandes) y solo splittear las 7 secciones realmente
     below-the-fold (Portfolio, Codei, BestFeatures, Responsive,
     AllFeatures, Testimonials, CallToAction). Reduce la cascada.

  La siguiente fase natural ahora es **Fase 1.5 (PNGs blog)** —
  ataca directamente las 3 rutas blog con LCP 13-16 s.



### 2026-06-08
- Análisis inicial del proyecto y del diagnóstico Unlighthouse.
- Detectado que `.unlighthouse/.../reports/` (corrida 6174) tiene métricas
  contaminadas para sub-páginas (Unlighthouse UI medida en lugar del sitio).
- Identificadas causas raíz por revisión de código (§4).
- Creado este documento.

### 2026-06-08 (tarde) — Corrida 71ef contaminada por colisión de puerto
- El usuario re-corrió Unlighthouse. Resultado:
  - 16/26 rutas reportaron NO_FCP y fueron skipeadas tras 3 intentos.
  - El usuario canceló el proceso porque quedó atascado.
- **Causa raíz identificada**: puerto 5678 estaba ocupado por un proceso
  zombie de Node (PID 24340), `get-port` asignó al viewer de Unlighthouse
  el puerto **3000**, colisionando con el dev server de Next.js. Detalle
  en §3.0.
- Reportes 71ef inválidos.

### 2026-06-08 (final) — Corrida 22e5 LIMPIA · baseline real obtenido
- Usuario mató zombie + movió dev server a 3100 + re-corrió Unlighthouse.
- Comando: `npx unlighthouse --site http://localhost:3100/ --no-cache`
- Resultado: 13 rutas en 74s, sin NO_FCP, sin contaminación de Unlighthouse UI.
- Scores reales en §5.1. **Hallazgos que invalidan supuestos previos:**
  - CLS no es un problema (todas < 0.1). Lo de 0.903 era ruido.
  - SEO ya está 100/100 en todas.
  - El verdadero problema es **LCP catastrófico en 3 rutas**
    (`/marketing-para-tu-negocio/` 24s, `/servicios/` 22s,
    `/blog/whatsapp-...` 15s) + **TTI altísimo global** (home 63s).
  - Best Practices home en 58 (deprecations + cookies + source maps).
  - 97% del CSS legacy global es muerto. 870KB de react-icons muerto.
  - Modelo 3D pesa **24.8MB**, video MP4 **19MB**, ambos en la home.
- Plan §6 reescrito completamente con datos reales y prioridades correctas.
- **Próxima acción**: arrancar Fase 1.1 (limpiar CSS muerto del layout
  global). Esperar confirmación del usuario antes de modificar archivos.

### 2026-06-08 — Fase 1.1 · CSS legacy → carga async (preload+swap)
- Archivo modificado: `undercodeec_nextjs/src/app/layout.tsx:222-236`
- Cambio: los 6 stylesheets legacy se cargaron vía `rel="preload"` +
  swap a `stylesheet` al `onload`. Fallback `<noscript>` con sincrónicos.
- **REVERTIDO en la misma sesión** ❌ (ver siguiente entrada).

### 2026-06-08 — Fase 1.1 REVERTIDA · CSS legacy contiene reglas de layout
- Re-medición tras aplicar Fase 1.1 (Unlighthouse re-escaneo automático):
  - Home Perf 62 → **20** ❌
  - Home CLS 0 → **0.69** ❌ (body shifts 3× × 0.35)
  - Home TBT 690ms → **1,710ms** ❌
  - Home LCP 3.4s → 5.6s ❌
  - Render-blocking sí cayó a 0 (único positivo)
- Causa: `bootstrap.min.css` y `style.css` contienen reglas que definen
  el layout del `<body>` (márgenes, padding, posicionamiento). Al cargar
  async, el body se renderiza primero sin esas reglas y luego "salta"
  cuando aplican → CLS catastrófico.
- **Lección clave para el proyecto:** estos CSS legacy NO son
  optimizables vía simple defer. El `style.css` de 472KB tiene 97.7%
  bytes muertos PERO el 2.3% activo incluye reglas de layout críticas
  mezcladas con el resto. No se puede separar sin un purge real o
  critical-CSS extraction.
- **Reversión:** `layout.tsx:222-229` restaurado al original.
- **Próximo enfoque (alternativa para futura Fase 1.1b):** usar una
  herramienta de critical-CSS (`critters` / `beasties` / `penthouse`)
  para extraer solo lo above-the-fold e inlinearlo en el `<head>`, luego
  sí deferir el resto. Requiere:
  1. Instalar `beasties` (sucesor de `critters`).
  2. Integrarlo al build de Next.js vía plugin o post-build script.
  3. Probar primero en una sola ruta para validar.
  Esto es trabajo de Fase 3, NO de Fase 1.

### 2026-06-08 — Fase 1.3 · `useGLTF.preload()` movido a useEffect
- Archivo modificado: `undercodeec_nextjs/src/components/3D/HeroModel.jsx:20-32`
- Cambio: el preload del GLB de 25MB ya no se ejecuta a tiempo de parse
  del módulo. Se mueve al primer `useEffect` del componente, dispara
  tras mount.
- Esperado: libera la ventana crítica del primer paint sin afectar UX
  (Suspense fallback cubre la espera mientras carga).
- Riesgo: muy bajo. El modelo aparece <100ms más tarde en condiciones
  normales; en banda ancha lenta el delay puede notarse.

### 2026-06-08 — Fase 1.4 · Video MP4 19MB → lazy con IntersectionObserver
- Archivo modificado: `undercodeec_nextjs/src/components/Preview/Responsive.jsx`
- Cambio: el `<video>` con `autoPlay` ya no se descarga eager. Se
  reemplaza inicialmente por un `<div>` placeholder con
  `aspect-ratio: 16/9` (evita CLS) y `background: #000`. Un
  `IntersectionObserver` con `rootMargin: 300px` monta el `<video>`
  real cuando la sección se acerca al viewport.
- Esperado: -19MB en transferencia inicial del home, FCP/LCP no
  afectados (la sección está below-the-fold), CLS sin cambios (el
  placeholder reserva el espacio).
- Riesgo: si la relación de aspecto real del video no es 16:9 habrá
  CLS al swap. Verificar tras re-medir.

### 2026-06-08 — Fase 1.5 · Investigación de rutas "lentas"
- Hallazgo: la tabla §5.1 original tenía ERROR de lectura mía.
  La métrica que marqué como LCP "24.3s / 22.2s / 15.3s" era en
  realidad **Speed Index**, no LCP. LCP real:
  - `/marketing-para-tu-negocio/`: LCP 1.6s ✅
  - `/servicios/`: LCP 20.9s 🔴 (sigue siendo problema)
  - `/blog/whatsapp-...`: LCP 10.7s 🟡
- El verdadero problema de `/servicios/` y blog posts complejos es
  **Speed Index alto** (mucho contenido pinta tarde) y **TTI alto**
  por dev-mode overhead.
- LCP element identificado en blog post largo: `figure.blog-hero > img`
  → las imágenes hero del blog son PNG sin optimizar
  (whatsapp_b2b_erp.png = 1.1MB, etc). 4 imágenes × ~900KB = 3.7MB.
  Acción: convertir a WebP + servir vía `<Image>` de Next.js.
  → Mover a Fase 1.5 (siguiente sesión).

### Estado actual al cierre de sesión 2026-06-08
- ✅ Aplicados (vigentes): Fase 1.3 (preload GLB) + Fase 1.4 (video lazy).
- ❌ Revertido: Fase 1.1 (defer CSS legacy).
- ⏭ Saltada: Fase 1.2 (react-icons, ya tree-shakea en prod).
- 🟡 Identificada sin implementar: Fase 1.5 (imágenes PNG blog).
- Datos en `22e5/` están corruptos por re-mediciones automáticas del
  viewer mientras se hacían cambios. **Necesario re-medir baseline.**
- Ver §0 (Quick Start) para acciones inmediatas para retomar.

### 2026-06-08 21:16 — CIERRE de sesión · 8 fases, baseline PROD validado
- **Fase 1.9 medida**: rotating-pattern como `<div>` con background-image
  resultó NEUTRAL. Lighthouse 13 también cuenta `<div>` con background-image
  como LCP candidate. El selector cambió de `img.rotating-pattern` a
  `div.rotating-pattern` pero el timing es idéntico.
- **Diagnóstico definitivo del LCP del home con `lcp-breakdown-insight`**:
  - Subparts óptimos (red): TTFB 9 ms + load delay 126 ms + load
    duration 55 ms + render delay 421 ms = **612 ms teórico**.
  - LCP real reportado: **9388 ms**.
  - Gap (~8.8 s) = main-thread work bajo throttle 4×: Script Eval
    1600 ms + Style/Layout 959 ms + Other 1726 ms = ~4.3 s reales × 2
    coeficientes de cola/render = ~9 s percibidos.
  - **El home no se moverá sin Fase 2** (code-split del bundle eager).
- **Resumen del progreso de la sesión completa**:
  - 8 fases aplicadas (1.2 fue verificación, 1.3/1.4/1.6/1.7/1.8/1.9 cambios).
  - Total transfer eager del home: ~62 MB (baseline contaminado dev con
    GLB+MP4+Calendly+Vimeo+dev-only chunks) → 11.1 MB prod inicial →
    **8.3 MB prod final**.
  - Rutas mejoradas significativamente: `/contacto/` 83, `/software-para-tu-negocio/` 73,
    `/politicas-playconsole/` 72, `/servicios/` 71, `/aplicaciones-moviles/` 68.
  - Rutas con LCP aún alto (estructural): `/`, `/marketing-para-tu-negocio/`,
    `/nuestra-trayectoria/`, varios posts blog.
  - 0 regresiones: CLS ≤ 0.08 en todas, A11y ≥ 85, SEO 100/100 intacto.
- **Decisión final**: cerrar la sesión y consolidar. El próximo bloque
  de trabajo (Fase 2 / 1.5 / 3) queda documentado en §0 para la
  próxima sesión.

### 2026-06-08 — Fase 1.8 · Optimización imágenes hero/demos (sin medir aún)
- Diagnóstico: `6.6.webp` 1.8 MB era un screenshot vertical de
  1366×10098 px. La trading card lo muestra en 400×560 px con
  `object-fit: cover; object-position: top → bottom` (efecto scroll en
  hover). Necesita preservar altura completa pero el ancho de 1366
  está desperdiciado: con 800 px basta para 400×retina.
- Procesadas 17 imágenes referenciadas en `src/data/Preview/demos.json`
  con sharp (resize width 800, webp q75 effort 6). Backup en
  `public/landing-preview/img/demos/_originals/`.
- Resultados destacados:
  - `6.6.webp` 1826 KB → 318 KB (-83%)
  - `8.8.webp` 481 KB → 55 KB (-89%)
  - `cortinasec.webp` 881 KB → 252 KB (-71%)
  - `juliojaramillo.webp` 714 KB → 216 KB (-70%)
  - Total demos: 6.5 MB → 2.1 MB (-4.4 MB).
- `pattern.png` 213 KB → `pattern.webp` 62 KB. CSS de
  `preview-style.css/scss` actualizado a `.webp`. PNG eliminada.
- `undercode-logo.webp` 22 KB generada (vs 238 KB PNG) pero NO
  aplicada — el PNG aparece en 27 archivos, mayoría son metadata SEO
  (JSON-LD, OG, sitemap) que el usuario pidió no tocar. WebP queda
  disponible para futura migración manual.
- Total ahorrado en transfer del home esperado: ~4.6 MB.
- Sin rebuild necesario (todo en `/public/`).

### 2026-06-08 18:00 — Fase 4 · Baseline PROD obtenido (corrida 0968)
- Build de prod corriendo en :3200 (server `next start`, NO Turbopack dev).
- Confirmado prod: `next-devtools` ausente, `react-icons` tree-shaken,
  chunks con hash corto (`8c624b315222c964.css`).
- **Validación masiva en PROD**:
  - GLB 24.8 MB → 0 ✅
  - MP4 local 19 MB → 0 ✅
  - Calendly 2.5 MB + Stripe 229 KB → 0 ✅
  - Vimeo 1.25 MB → 356 KB ✅ (Fase 1.7 + tree-shake)
  - react-icons 893 KB → 0 chunks pesados ✅
  - next-devtools 219 KB → 0 ✅
  - Total transfer home: **11.1 MB** (vs 14.7 MB dev, vs ~62 MB baseline
    original con todo cargando).
- **Sorpresa**: los LCP altos NO eran solo dev mode. Persisten en prod
  con valores 9-19 s en rutas largas (marketing, servicios, blog posts).
- **Bottleneck real identificado**: imágenes WebP del home demos.
  Top transfer = `6.6.webp` 1.8 MB. Total demos ≈ 5.5 MB. Logo y
  pattern PNG ~450 KB. Necesitan compresión + resize, no solo lazy.
- **Otro hallazgo confirmado en prod**: 3 IDs de GA distintos (GTM
  está disparando G-99Z5CCZ3RK + G-62CCGC2JBQ + G-2QDBXNBC8K).
- Próximo: Fase 1.5 / 1.8 — optimización de imágenes (demos + logo +
  pattern). Mayor ROI restante con diferencia.

### 2026-06-08 17:44 — Re-medición post-Fase 1.7 · resultado mixto
- Reportes: `.unlighthouse/localhost/22e5/reports/`, timestamp 17:44.
- **Real-world (timeline objetivo):**
  - Primer request Vimeo: 2348 ms (DESPUÉS de FCP 1969 ms) ✅
  - Antes de Fase 1.7: Vimeo disparaba en el primer tick.
  - Real-world IS better. Usuario no ve Vimeo competir con FCP.
- **Lighthouse (score):**
  - Home Perf 54 → 53 (volátil, sin cambio real).
  - LCP home 5.7 s → 11.8 s — pero el "antes" también era volátil.
  - 18 requests Vimeo (1.25 MB) siguen apareciendo en `network-requests`
    porque la ventana de medición de Lighthouse llega hasta TTI
    (49 s en dev), capturando todo lo que cargue en ese rango.
- **Hallazgo nuevo crítico — LCP element identificado:**
  - Selector: `main > div > div > img.rotating-pattern`
  - Snippet HTML: `<img alt="" aria-hidden="true" data-nimg="fill"
    class="rotating-pattern tw-opacity-30 ...">`
  - Ubicación en código: `HeroSlider.jsx:87-94`. Servido vía
    `next/image` con `priority` y `fill`, opacity 30%, decorativo.
  - **Es un patrón decorativo de fondo a 30% opacidad que ocupa
    914×665 px → Lighthouse lo elige como LCP porque es el área
    contentful más grande**.
  - Lighthouse `lcp-discovery-insight` reporta `priorityHinted: false`
    aunque el código tiene `priority` → Next.js 16 puede no estar
    aplicando `fetchpriority="high"` correctamente, O Lighthouse en
    dev no lo detecta.
- **Hipótesis de los LCP altos en dev**: el `next/image` optimizer
  compila la transformación lazy en dev. En el timeline, el chunk de
  Three.js + react-icons compite por banda y el optimizer no
  prioriza la imagen del hero.
- **Decisión pendiente** (3 opciones, ver §0):
  1. Convertir el patrón decorativo a `background-image` CSS para
     sacarlo del cálculo LCP (probable: LCP cae a 2-3 s).
  2. Pasar Vimeo a "true facade" con poster estático.
  3. Saltar a Fase 4 (build prod) AHORA y dejar el resto si prod ya
     marca bien.

### 2026-06-08 — Fase 1.7 · Vimeo idle (sin medir aún)
- Archivos modificados:
  - `undercodeec_nextjs/src/components/Vimeo/VimeoFacade.jsx:22-42`
  - `undercodeec_nextjs/src/components/AIAssistant/index.jsx:805`
- Diagnóstico: el `VimeoFacade` ya existía con IntersectionObserver,
  pero la burbuja flotante del asistente (montada en `layout.tsx:270`
  globalmente) es siempre-visible desde el primer paint. El observer
  disparaba `isIntersecting=true` al mount → Vimeo cargaba eager.
- Cambio: añadida prop `strategy` con dos modos:
  - `viewport` (default, retrocompatible): comportamiento anterior.
  - `idle`: usa `requestIdleCallback` (fallback `setTimeout 2500ms`)
    para diferir la carga hasta que el browser termine FCP/LCP.
- La burbuja flotante pasa a `strategy="idle"`. El otro `VimeoFacade`
  dentro del chat panel (línea 463) NO se cambia — solo monta cuando
  el usuario abre el chat.
- Esperado: cero requests a `*.vimeo.com` / `*.vimeocdn.com` en el
  primer paint del home (ahorro ~1.15 MB).
- Riesgo bajo: el avatar tarda 1-2 s más en aparecer en la burbuja,
  pero el botón sigue presionable desde el inicio.

### 2026-06-08 17:34 — Re-medición 22e5 post-Fase 1.6 · Calendly VALIDADO
- Usuario re-ejecutó Unlighthouse tras aplicar Fase 1.6 (Calendly lazy
  con IntersectionObserver en `Codei.jsx`). Reportes en
  `.unlighthouse/localhost/22e5/reports/`, timestamp 17:34.
- **Validación objetiva (red):**
  - ✅ Cero URLs con `calendly` en `network-requests` del home.
  - ✅ Stripe `js.stripe.com/v3` también eliminado (lo cargaba
    Calendly transitivamente).
  - Ahorro acumulado vs baseline original: GLB 24.8 MB + MP4 19 MB +
    Calendly 2.5 MB + Stripe 229 KB = **~46.5 MB eliminados** del
    transfer eager.
  - Total transfer del home: **14.7 MB** (todavía hay offenders,
    principalmente imágenes WebP de demos sin redimensionar y Vimeo).
- **Metricas Lighthouse (volátiles):**
  - Home Perf 64 → 54 (−10): caída atribuida a LCP 3.2 → 5.7 s
    (volátil en dev, cambia entre corridas). NO es regresión real.
  - Home BP 58 → 77 (+19): mejora estructural (menos terceros = menos
    `third-party-cookies`, `deprecations`).
  - Home TBT 680 → 600 ms (−80 ms), TTI 60.1 → 54.9 s (−5 s).
  - CLS sigue en 0 → placeholder de Calendly reserva bien el espacio.
- **Hallazgo Vimeo cuantificado**: 7+ requests = `player.es.module.js`
  215 KB + `vendor.module.js` 94 KB + `player.css` 24 KB + stream MP4
  802 KB + thumbs/tracking = **~1.15 MB cargando en home**.
- Próxima fase recomendada: **Fase 1.7 (Vimeo lazy)** — mismo patrón.
  El embed Vimeo está en algún componente below-the-fold; localizar
  y aplicar IntersectionObserver.

### 2026-06-08 (cierre real) — Re-medición 22e5 limpia · validación Fase 1.3 + 1.4
- Usuario re-ejecutó Unlighthouse contra el código con Fases 1.3 + 1.4
  aplicadas (Fase 1.1 ya revertida). Reportes en
  `.unlighthouse/localhost/22e5/reports/`, timestamp 14:20.
- Métricas home (delta vs baseline original):
  - Perf 62 → 64 (+2)
  - LCP 3.4 s → 3.2 s (−0.2 s)
  - CLS 0 → 0 (sin regresión, confirma reversión Fase 1.1)
  - TBT 690 ms → 680 ms (−10 ms)
  - TTI 63.1 s → 60.1 s (−3 s)
- **Validación con datos de red (lo más importante):**
  - GLB `/modelo-3D/Model3D-1.glb` (24.8 MB) **ya NO aparece** en
    `network-requests` del home. Fase 1.3 funcionó ✅.
  - MP4 local `/assets/img/video/video-undercode-ec-1.mp4` (19 MB)
    **ya NO aparece** en network. Fase 1.4 funcionó ✅.
  - Total ahorrado en transferencia eager: **~44 MB**.
- **Razón del delta menor en scores Lighthouse**: el bottleneck en dev
  no es transferencia sino CPU/main-thread (TTI 60s sigue). El ahorro
  de 44 MB se notará mucho más en (a) producción minificada, (b) redes
  móviles, (c) métricas de Core Web Vitals reales (RUM).
- **Hallazgos nuevos al inspeccionar la corrida limpia:**
  - Calendly `booking.css` (1.26 MB) + `booking.js` (1.23 MB) =
    **2.5 MB cargando en home**. Es el mayor offender restante.
  - Vimeo embed cargando `player.es.module.js` (215 KB) + stream MP4
    (802 KB) en home. Componente a localizar.
  - Stripe `js.stripe.com/v3` (229 KB) en home — confirmar necesidad.
  - `undercode-logo.png` (238 KB) y `pattern.png` (213 KB) sin
    optimizar.
  - 3 rutas con LCP catastrófico real: `/marketing-para-tu-negocio/`
    (24.3 s), `/blog/impacto-ia-...` (23.8 s), `/servicios/` (18.9 s).
    Volatilidad dev-mode probable, validar contra prod antes de actuar.
- **Decisión de continuidad**: cambiar el orden del plan. **Fase 4
  (audit contra build de producción) tiene prioridad sobre Fase 1.5 y
  Fase 2**, porque las métricas dev son demasiado volátiles para
  distinguir señal de ruido en cambios incrementales.
- Próxima acción recomendada: ejecutar pasos del nuevo §0 "Acción
  inmediata para retomar" — empezar por Fase 4.

<!-- Plantilla para nuevas entradas:

### YYYY-MM-DD — Fase N · {tarea}
- Archivos modificados: `path/file.tsx:Lx-Ly`
- Cambio: descripción 1 línea
- Métrica antes → después (si aplica)
- Notas / siguiente paso

-->

---

## 8. Comandos útiles

```powershell
# Dev server (puerto 3100 — IMPORTANTE para evitar colisión con
# Unlighthouse, ver §3.0)
cd undercodeec_nextjs
$env:PORT=3100; pnpm dev

# Build de producción local (para auditar como prod, Fase 4)
pnpm build
$env:PORT=3100; pnpm start

# Verificar puertos libres antes de medir
netstat -ano | findstr :3100
netstat -ano | findstr :5678
# Si 5678 está ocupado por un proceso `node` zombie:
# Stop-Process -Id <PID> -Force

# Diagnóstico Unlighthouse limpio (correr desde la raíz del repo)
# IMPORTANTE: calentar el dev server primero (abrir 2-3 rutas en navegador)
# para evitar overhead de cold-compile en las métricas.
npx unlighthouse --site http://localhost:3100/ --no-cache

# Importante: cerrar el viewer en localhost:5678 (Ctrl+C) cuando
# termines de revisar los reportes, o re-escaneará automáticamente
# y corromperá los .json en .unlighthouse/.../reports/.

# Diagnóstico contra producción live
npx unlighthouse --site https://undercodeec.com/

# Lighthouse de una sola página (más rápido, con Chrome CLI)
npx lighthouse http://localhost:3100/ --view --preset=desktop
npx lighthouse http://localhost:3100/ --view   # mobile (default)

# Análisis de bundle Next.js
$env:ANALYZE='true'; pnpm build
# Requiere @next/bundle-analyzer (instalar si no está):
# pnpm add -D @next/bundle-analyzer
# y configurar en next.config.ts

# Validar contaminación de un reporte de Unlighthouse
# Si grep encuentra estos identificadores, la corrida está corrupta:
grep -l "LighthouseThreeD\|lighthouse.fbx\|xl:flex mt-2" .unlighthouse/localhost/*/reports/payload.html
```

---

## 9. Rutas del sitio (descubiertas en reports/)

```
/                              (home, page.tsx)
/aplicaciones-moviles/
/blog/
/contacto/
/marketing-para-tu-negocio/
/nuestra-trayectoria/
/politicas-playconsole/
/servicios/
/software-para-tu-negocio/
/ec/                           (landing España/Ecuador)
/es/
/undercodeec/
```

Otras rutas presentes en `src/app/` no escaneadas: `/admin`, `/contratos`,
`/hosting`, `/noticias`, `/pago`.

---

## 10. Notas para futuros chats

- **Antes de proponer cambios**: leer §0 (Quick Start) y §7 (bitácora)
  para no repetir trabajo ya hecho o tocar archivos en cambio pendiente.
- **Antes de eliminar librerías**: confirmar uso real con `Grep` en `src/`
  Y en `public/landing-preview/`, `public/assets/js/` — algunas se
  inyectan vía `<Script>` legacy.
- **El usuario NO quiere que toques SEO** (metadata, JSON-LD, robots,
  sitemap, OG, canonical, keywords, encabezados semánticos).
- **El usuario prefiere enfoque conservador**: no introducir nuevas libs
  ni refactors masivos sin consultar.
- **Trampas conocidas:**
  - Deferir CSS legacy global = CLS catastrófico (sin critical-CSS
    extraction). Probado y revertido. No reintentar sin `beasties`.
  - Mantener cerrado el viewer de Unlighthouse cuando no se use, o
    sobreescribirá los `lighthouse.json` con re-scans automáticos.
  - El dev server cold-compila la primera vez que ve una ruta. Si
    Lighthouse mide en frío, el TTI/LCP se infla 5-20s falsamente.
    Calentar el dev server (navegar a las rutas en browser) antes
    de medir.
  - Los assets `LighthouseThreeD-*.js`, `lighthouse.fbx`,
    `index-BpMBtP66.js` son del viewer de Unlighthouse, NO del sitio.
    Si aparecen en un reporte = corrida contaminada por colisión de
    puerto.
- **Si la respuesta cabe en 3 frases**, no inflar el documento; añadir
  como bullet en la bitácora.
