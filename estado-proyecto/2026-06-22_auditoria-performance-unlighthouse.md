# Auditoría performance Unlighthouse — 2026-06-22

## Resumen progreso
| Prioridad | Estado |
|---|---|
| P1 — Extraer CSS crítico style.css | ⏸ pendiente |
| P2 — Migrar Bootstrap grid → Tailwind | ⏸ pendiente |
| P3 — Migrar FA/BI → react-icons | ⏸ pendiente |
| P4 — Consolidar GTM/GA | 🟡 parcial (1/2) |
| P5 — Eliminar JS legacy layout.tsx | ✅ completado (3/4 scripts removidos) |
| P6 — Reducir bundle Next.js | ⏸ pendiente |
| P7 — Revisar PreLoader UX | ⏸ pendiente |


## Herramienta identificada
**Unlighthouse** (`npx unlighthouse --site <url>`). Crawler que ejecuta Lighthouse en cada ruta. Reportes en `.unlighthouse/`.

## Métricas reporte mobile (homepage `/`)
- FCP: **5.7s** (score 0.05)
- LCP: **13.5s** (score 0)
- Speed Index: **23.6s** (score 0)
- TTI: **70.7s** (score 0)
- TBT: 760ms (score 0.39)
- CLS: 0.00007 ✅

## Causas raíz (orden de impacto)

### 1. CSS render-blocking legacy (3,680ms FCP perdidos)
| Archivo | Tamaño | % inutilizado |
|---|---|---|
| `/assets/css/style.css` | 460 KB | 97.7% |
| `/assets/css/lib/all.min.css` | 174 KB | 99.76% |
| `/assets/css/lib/bootstrap.min.css` | 156 KB | 95.1% |
| `/assets/css/lib/bootstrap-icons.css` | 73 KB | 99% |
| `/landing-preview/css/preview-style.css` | 90 KB | 81% |

### 2. JS sin usar (1,811 KiB, 1,720ms LCP)
- `9d6ee2e74fc5983a.js` (1.2MB) — 63.7% basura
- `recaptcha__es.js` (379KB) — 47.6% basura
- GTM/GA ×3 instancias — ~65% basura

### 3. Triple instancia GA/GTM (666ms main thread) — **PARCIAL 2026-06-22**
- `GTM-WX7HLGTV` (layout.tsx) ✅ mantener
- ~~`GTM-P8Q2DWL` (loadingPace.js)~~ ✅ ELIMINADO
- `G-99Z5CCZ3RK` (layout.tsx directo) ⏸ mantener hasta verificar GA4 dentro de GTM-WX7HLGTV
- Trae además: `G-62CCGC2JBQ`, `AW-11011915740`

### 4. Ejecución JS pesada (2.5s CPU mobile)
- `222bbc474d485e14.js`: 2,017ms
- `6e9f3ab0d4c44ceb.js`: 1,610ms

### 5. PreLoader (efecto multiplicador, no causa raíz)
`src/components/PreLoader/index.jsx` — bloquea scroll + requiere click. Explica TTI=70s.

## Puntos de inyección de CSS legacy

### `src/app/layout.tsx:238-245`
```tsx
{/* Critical CSS — blocks render intentionally */}
<link rel="stylesheet" href="/assets/css/lib/bootstrap.min.css" />
<link rel="stylesheet" href="/assets/css/style.css" />

{/* Non-critical CSS — loaded async after main thread is free */}
<Script id="deferred-css" strategy="afterInteractive">
  {`(function(){var s=['/assets/css/lib/all.min.css','/assets/css/lib/bootstrap-icons.css','/landing-preview/css/preview-style.css','/assets/css/animations.css'];...})();`}
</Script>
```

### `src/app/layout.tsx` — JS legacy — **ACTUALIZADO 2026-06-22**
Estado actual (post P5):
```tsx
<Script src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="lazyOnload" />
<Script src="/assets/js/lib/bootstrap.bundle.min.js" strategy="afterInteractive" />
```
Removidos: `pace.js`, `parallax.min.js`, `main.js`.

### `src/common/fixStylesheetsOrder.js`
Reordena bootstrap/style/preview en `<head>` para que la cascada CSS funcione. Llamado desde: `app/page.tsx`, `app/ec/page.tsx`, `app/es/page.tsx`, `app/hosting/page.tsx`.

### ~~`src/common/loadingPace.js`~~
**ELIMINADO 2026-06-22** (P5). Archivo borrado completo. Import + llamada + div `#preloader-pace` también removidos de `PreLoader/index.jsx`.

## Cambios intentados y REVERTIDOS

Se intentó mover `bootstrap.min.css` y `style.css` de render-blocking a deferred → **rompió estilos visuales** (FOUC visible en visitantes recurrentes que skipean el preloader).

**Estado actual: idéntico al inicio de la sesión.** Todo restaurado:
- `layout.tsx` con los 2 `<link>` render-blocking
- `preview-style.css` en deferred script
- `fixStylesheetsOrder.js` restaurado
- 4 páginas (`/`, `/ec`, `/es`, `/hosting`) llaman a `fixPreviewStylesheetOrder()`

## Cambios APLICADOS

### 2026-06-22 — P4 parcial
- `src/common/loadingPace.js`: removido `loadGoogleTagManager()` (GTM-P8Q2DWL eliminado). Archivo queda solo con lógica Pace.
- Pendiente re-auditar con `npx unlighthouse --site http://localhost:3000` para medir impacto real en main thread.

### 2026-06-22 — P5 completado
- `src/app/layout.tsx`: eliminados `<Script>` de `pace.js`, `parallax.min.js`, `main.js`. Conservado `bootstrap.bundle.min.js`.
- `src/common/loadingPace.js`: ELIMINADO (huérfano).
- `src/components/PreLoader/index.jsx`: removido import `loadingPace`, llamada `setTimeout(() => loadingPace(), 0)` y div fantasma `<div id="preloader-pace" />`.
- Archivos físicos en `public/assets/js/` (pace.js, parallax.min.js, main.js) sin borrar — quedan huérfanos, candidatos a `rm` futuro.

## Componentes que dependen del CSS legacy

**Bootstrap grid (86 archivos)** — usan `col-*`, `row`, `container`, `d-flex`, `navbar-expand-lg`, etc.
Ejemplos críticos del home:
- `components/Preview/Features.jsx` (`container > row > col-lg-4`)
- `components/Navbars/PreviewNav/index.jsx` (`navbar navbar-expand-lg`)
- `components/Slider/HeroSlider.jsx`

**FontAwesome / Bootstrap Icons (37 archivos)** — usan `<i className="fas fa-*">`, `<i className="bi-*">`.

**style.css custom classes** — `.feat-dark`, `.nav-preview`, `.index-main`, `.bg-img`, `.animate-fadeUp` (~10KB útiles dentro de 460KB).

## Archivos físicos en `public/`

```
public/assets/css/
├── animations.css
├── one_pages.css
├── rtl_style.css
├── style.css
├── common/, elements/
└── lib/
    ├── all.min.css, all.min_old.css
    ├── animate.css
    ├── bootstrap.min.css, bootstrap.rtl.min.css
    ├── bootstrap-icons.css (+.woff/.woff2)
    ├── jquery.fancybox.css
    ├── jquery-ui.min.css
    ├── lity.css
    └── swiper.min.css

public/assets/js/
├── bootstrap.bundle.min.js     ← en uso (layout.tsx)
├── html5shiv.min.js            ← huérfano
├── mixitup.min.js              ← huérfano
├── pace.js                     ← huérfano (P5)
├── parallax.min.js             ← huérfano (P5)
├── scrollIt.min.js             ← huérfano
├── wow.min.js                  ← huérfano
├── main.js                     ← huérfano (P5)
└── lib/                        ← contiene pace.js, parallax.min.js, etc. también huérfanos
```
Candidatos a `rm` físico: todo excepto `bootstrap.bundle.min.js` y su carpeta `lib/` necesaria.

## Trabajo pendiente (por prioridad)

### P1 — Extraer CSS crítico de `style.css`
1. Identificar las ~10KB de clases custom realmente usadas (`.feat-dark`, `.nav-preview`, etc.)
2. Mover a CSS module / globals.css
3. Eliminar `style.css` completo → **-460KB, -2-3s FCP**

### P2 — Migrar Bootstrap grid → Tailwind
86 componentes. Reemplazar:
- `container` → `tw-container` o `tw-max-w-* tw-mx-auto`
- `row` → `tw-grid tw-grid-cols-12 tw-gap-*` o `tw-flex tw-flex-wrap`
- `col-lg-4` → `tw-col-span-4` o `lg:tw-w-1/3`
- `d-flex align-items-center` → `tw-flex tw-items-center`
- Después eliminar `bootstrap.min.css` → **-156KB**

### P3 — Migrar FontAwesome / BI → react-icons
37 componentes con `<i className="fa-*">`, `<i className="bi-*">`.
Reemplazar por imports de `react-icons/fa`, `react-icons/bi`.
Después eliminar `all.min.css` y `bootstrap-icons.css` → **-247KB**

### P4 — Consolidar GTM/GA — **PARCIAL**
- ✅ Eliminar `GTM-P8Q2DWL` de `loadingPace.js` (2026-06-22)
- ⏸ Decidir si mantener `G-99Z5CCZ3RK` o consolidar todo en GTM-WX7HLGTV
  - **Acción pendiente fuera del código**: verificar en tagmanager.google.com → contenedor GTM-WX7HLGTV → si ya existe tag GA4 con measurement ID G-99Z5CCZ3RK → eliminar bloque `layout.tsx:247-258`
- **-666ms main thread, -1.17MB transfer** (parcialmente recuperado)

### P5 — Eliminar JS legacy de `layout.tsx:305-308` — **COMPLETADO 2026-06-22**
- ✅ `pace.js` ELIMINADO (sin uso real, fallback ya cubría)
- ❌ `bootstrap.bundle.min.js` MANTENIDO — 10 archivos usan `data-bs-toggle="collapse"` (navbars mobile + accordions FAQ/BuyNow). Migración pendiente: reemplazar con headless Tailwind/Radix para luego removerlo.
- ✅ `parallax.min.js` ELIMINADO (0 referencias en src)
- ✅ `main.js` ELIMINADO (solo invocaba WOW que no se carga, no-op)
- ✅ `loadingPace.js` ELIMINADO (huérfano sin pace.js)
- ✅ `PreLoader/index.jsx` limpiado: import, llamada y div `#preloader-pace` removidos

### P6 — Reducir bundle Next.js
- `9d6ee2e74fc5983a.js` (1.2MB, 63% basura) — revisar tree-shaking
- Posibles culpables: Theatre.js, Three.js, GSAP cargando completos sin code-split
- Auditar con `@next/bundle-analyzer`

### P7 — Revisar PreLoader UX
TTI=70s es catastrófico. Considerar:
- Auto-dismiss después de N segundos sin click
- Permitir contenido interactivo detrás del preloader
- Métrica TTI se calcula hasta que main thread libre — el preloader no debería bloquearlo tanto

## Comandos útiles

```bash
# Re-auditar después de cambios
npx unlighthouse --site http://localhost:3000

# Auditar producción
npx unlighthouse --site https://undercodeec.com

# Analizar bundle
ANALYZE=true npm run build
```

## Archivos de reporte existentes
`.unlighthouse/undercodeec.com/969e/reports/lighthouse.json` (producción)
`.unlighthouse/localhost/*/reports/` (varias corridas locales)
