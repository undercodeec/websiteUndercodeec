# Off+Brand Static Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar `/demos/` por una reproducción estática, saneada e independiente de la exportación Off+Brand entregada por el usuario.

**Architecture:** Un importador determinista copia únicamente HTML, CSS, fuente, imágenes, SVG, video y JavaScript visual permitido desde la exportación a `public/demos-offbrand/`. Una reescritura `beforeFiles` de Next.js sirve ese documento en `/demos/`, fuera del árbol React y del layout global, mientras una prueba de integración comprueba aislamiento, recursos locales y ausencia de rastreadores.

**Tech Stack:** Next.js 16, Node.js 24 (`node:test`, `fs/promises`), HTML/CSS/JavaScript estático, PowerShell, Chrome o Edge headless para revisión visual.

**Spec:** `docs/superpowers/specs/2026-09-07-offbrand-static-demo-design.md`

## Global Constraints

- La única fuente visual y multimedia es `D:\Documentos\undercodeec_nextjs\desing\saveweb2zip-com-www-itsoffbrand-com`.
- La URL pública es `/demos/`; `public/demos-offbrand/` es únicamente el espacio interno de recursos.
- No reutilizar componentes, datos, imágenes, tipografías, estilos ni comportamientos de Undercodeec.
- Mantener estructura, textos, composición, fuente local, imágenes, SVG, MP4 y responsive de la exportación original.
- Eliminar Google Analytics, Intellimize, rastreadores, HLS remoto, el orb remoto, formularios activos y enlaces salientes.
- No añadir dependencias npm.
- No modificar los archivos originales bajo `desing/saveweb2zip-com-www-itsoffbrand-com`.
- La página debe funcionar sin solicitudes a terceros.

## File Map

- `tests/demos-route.test.mjs`: contrato HTTP de `/demos/`, recursos y aislamiento.
- `scripts/offbrand-demo/prepare.mjs`: copia y sanea la exportación de manera reproducible.
- `scripts/offbrand-demo/demo-local.css`: ajustes locales mínimos para fallback del orb y comportamiento seguro.
- `scripts/offbrand-demo/demo-local.js`: neutraliza enlaces y garantiza que el preloader no bloquee la página.
- `public/demos-offbrand/**`: resultado estático generado y versionado; no se edita manualmente.
- `next.config.ts`: reescritura `beforeFiles` de `/demos` al HTML estático.
- `src/app/demos/page.tsx`: implementación React descartada; se elimina.
- `src/app/demos/demos.module.css`: estilos React descartados; se eliminan.
- `src/components/PromoBanner/index.tsx`: se retira la excepción temporal para `/demos`.
- `src/components/AIAssistant/index.jsx`: se retira la excepción temporal para `/demos`.
- `src/components/CustomCursor/index.jsx`: se retira la excepción temporal para `/demos`.
- `src/components/PageTransition/index.jsx`: se retira la excepción temporal para `/demos`.

---

### Task 1: Establish the standalone demo contract

**Files:**
- Modify: `tests/demos-route.test.mjs`

**Interfaces:**
- Consumes: el servidor Next iniciado desde la raíz del worktree.
- Produces: contrato HTTP para `/demos/` y `/demos-offbrand/**`; las tareas posteriores deben satisfacerlo sin cambiar sus aserciones.

- [ ] **Step 1: Replace the old editorial test with the failing static contract**

```js
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = 3227;
const baseUrl = `http://127.0.0.1:${port}`;

function startServer() {
  const nextCli = fileURLToPath(
    new URL("../node_modules/next/dist/bin/next", import.meta.url),
  );

  return spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore" },
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Next.js is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next development server did not start in time");
}

test("serves the supplied OFF+BRAND export as an isolated static demo", async (t) => {
  const server = startServer();
  t.after(() => server.kill());
  await waitForServer();

  const response = await fetch(`${baseUrl}/demos/`);
  const page = await response.text();

  assert.equal(response.status, 200);
  assert.match(page, /<title>OFF\+BRAND\. \| Global Creative &amp; Technology Studio<\/title>/);
  assert.match(page, /A different/i);
  assert.match(page, /Creative/i);
  assert.match(page, /Trusted by/i);
  assert.match(page, /Featured work/i);
  assert.match(page, /How about/i);
  assert.match(page, /Microsoft/i);
  assert.match(page, /Trevor Noah/i);
  assert.match(page, /Lando Norris/i);
  assert.match(page, /Vizcom/i);

  assert.match(page, /<base href="\/demos-offbrand\/">/);
  assert.match(page, /\/demos-offbrand\/css\/offbrand-2023\.shared\.0746f2a75\.min\.css/);
  assert.match(page, /\/demos-offbrand\/media\/OFF_siteclips_13\.mp4/);

  for (const forbidden of [
    "data-promo-banner",
    "Abrir asistente",
    "codeCursorGradient",
    "solid-grad-telon-single",
    "intellimize",
    "google_tags_first_party",
    "googletagmanager",
    "cloudflarestream.com",
    "assets.itsoffbrand.io",
    "w-webflow-badge",
  ]) {
    assert.doesNotMatch(page, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(page, /<(?:script|link|source)\b[^>]+(?:src|href)="https?:\/\//i);
  assert.doesNotMatch(page, /<a\b[^>]+href="(?:https?:\/\/|\/(?!demos-offbrand\/))/i);
  assert.doesNotMatch(page, /<form\b/i);

  const assets = [
    ["/demos-offbrand/css/offbrand-2023.shared.0746f2a75.min.css", "text/css"],
    ["/demos-offbrand/fonts/64ff29f82f284681edeb53a9_AtAero-Retina-dot-edit.woff2", "font/woff2"],
    ["/demos-offbrand/images/64ce56bd39c2f116181f1aa5_ob-2023-logomark-svg.svg", "image/svg+xml"],
    ["/demos-offbrand/images/6a54f691c4624186bbeb1157_cs-trevor-main-image.webp", "image/webp"],
    ["/demos-offbrand/images/68ece3e91ef2f1125c5b57eb_lando-cs-hero-img.jpg", "image/jpeg"],
    ["/demos-offbrand/media/OFF_siteclips_13.mp4", "video/mp4"],
    ["/demos-offbrand/js/demo-local.js", "(?:text|application)/javascript"],
  ];

  for (const [pathname, contentType] of assets) {
    const assetResponse = await fetch(`${baseUrl}${pathname}`);
    assert.equal(assetResponse.status, 200, pathname);
    assert.match(assetResponse.headers.get("content-type") ?? "", new RegExp(contentType));
  }
});
```

- [ ] **Step 2: Run the contract and verify that it fails for the discarded React page**

Run:

```powershell
node --test tests/demos-route.test.mjs
```

Expected: `FAIL` because the response does not contain the original Off+Brand title or `/demos-offbrand/` assets.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add -- tests/demos-route.test.mjs
git commit -m "test: define isolated offbrand demo contract"
```

---

### Task 2: Import and sanitize the supplied static export

**Files:**
- Create: `scripts/offbrand-demo/prepare.mjs`
- Create: `scripts/offbrand-demo/demo-local.css`
- Create: `scripts/offbrand-demo/demo-local.js`
- Create: `public/demos-offbrand/**` (generated)
- Modify: `next.config.ts`
- Delete: `src/app/demos/page.tsx`
- Delete: `src/app/demos/demos.module.css`
- Test: `tests/demos-route.test.mjs`

**Interfaces:**
- Consumes: `OFFBRAND_SOURCE_DIR`, optional absolute source directory; default `desing/saveweb2zip-com-www-itsoffbrand-com` under the repository root.
- Produces: `public/demos-offbrand/index.html`, local asset folders, and a `beforeFiles` rewrite from `/demos` to `/demos-offbrand/index.html`.

- [ ] **Step 1: Add the local fallback stylesheet**

```css
html,
body {
  overscroll-behavior-x: none;
}

.demo-disabled-form {
  display: none !important;
}

[data-orb-wrap] {
  pointer-events: none !important;
}

[data-orb] {
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, #ffffff 0 4%, transparent 28%),
    radial-gradient(circle at 62% 62%, #ff603d 0 15%, #7d32ff 48%, #101010 78%);
  box-shadow: 0 0 3rem rgb(125 50 255 / 35%);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Add the local safety script**

```js
(() => {
  const releasePage = () => {
    document.querySelector("[preloader]")?.remove();
    document.documentElement.classList.remove("anti-flicker");
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href="#"]');
    if (link) event.preventDefault();
  });

  window.addEventListener("load", () => window.setTimeout(releasePage, 1400));
  window.setTimeout(releasePage, 4000);
})();
```

- [ ] **Step 3: Add the deterministic importer**

Create `scripts/offbrand-demo/prepare.mjs` with this implementation:

```js
import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const projectRoot = process.cwd();
const sourceName = "saveweb2zip-com-www-itsoffbrand-com";
const sourceDir = resolve(
  process.env.OFFBRAND_SOURCE_DIR ?? join(projectRoot, "desing", sourceName),
);
const outputDir = resolve(projectRoot, "public", "demos-offbrand");
const helperDir = resolve(projectRoot, "scripts", "offbrand-demo");

if (basename(sourceDir) !== sourceName) {
  throw new Error(`Unexpected OFFBRAND_SOURCE_DIR: ${sourceDir}`);
}
if (outputDir !== resolve(projectRoot, "public", "demos-offbrand")) {
  throw new Error(`Unsafe output directory: ${outputDir}`);
}

await access(join(sourceDir, "index.html"));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const directory of ["css", "fonts", "images", "media"]) {
  await cp(join(sourceDir, directory), join(outputDir, directory), {
    recursive: true,
  });
}

await mkdir(join(outputDir, "js"), { recursive: true });
for (const filename of [
  "jquery-3.5.1.min.dc5e7f18c8.js",
  "offbrand-2023.b9e4a10f.df426058a60187e3.js",
  "ob.2026.index.23.js",
]) {
  await cp(join(sourceDir, "js", filename), join(outputDir, "js", filename));
}

await cp(join(helperDir, "demo-local.css"), join(outputDir, "css", "demo-local.css"));
await cp(join(helperDir, "demo-local.js"), join(outputDir, "js", "demo-local.js"));

let html = await readFile(join(sourceDir, "index.html"), "utf8");

const blockedScript = /intellimize|117825735|86cn3bq|google_tags_first_party|\bgtag\s*\(|cloudflarestream|\bhls\b|assets\.itsoffbrand\.io|offbrand-orb/i;
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) =>
  blockedScript.test(script) ? "" : script,
);
html = html.replace(
  /<link\b[^>]*(?:rel="(?:preconnect|canonical)"|href="https?:\/\/)[^>]*>/gi,
  "",
);
html = html.replace(/<meta\b[^>]+google-site-verification[^>]*>/gi, "");
html = html.replace(/\sdata-wf-intellimize-customer-id="[^"]*"/gi, "");
html = html.replace(/\sdata-wf-status="[^"]*"/gi, "");
html = html.replace(/\sdata-hls-src="[^"]*"/gi, "");
html = html.replace(/<form\b[^>]*>/gi, '<div class="demo-disabled-form" hidden>');
html = html.replace(/<\/form>/gi, "</div>");
html = html.replace(/<a\b[^>]*>/gi, (anchor) =>
  anchor
    .replace(/\shref=("|')(?!#)[\s\S]*?\1/i, ' href="#"')
    .replace(/\starget=("|')[\s\S]*?\1/i, ""),
);
html = html.replace(/<div\b[^>]*class="[^"]*w-webflow-badge[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
html = html.replace(/w-webflow-badge/gi, "demo-removed-badge");

for (const directory of ["css", "fonts", "images", "js", "media"]) {
  html = html.replace(
    new RegExp(`(["'(=])(?:\\./)?${directory}/`, "g"),
    `$1/demos-offbrand/${directory}/`,
  );
}

const poster = "/demos-offbrand/images/68b6edabe6aadf7c4b4218a7_overview.jpg";
let localVideoAdded = false;
html = html.replace(/<video\b([^>]*)>[\s\S]*?<\/video>/gi, (_video, attributes) => {
  const safeAttributes = attributes.replace(/\sposter=("|')[\s\S]*?\1/i, "");
  const source = localVideoAdded
    ? ""
    : '<source src="/demos-offbrand/media/OFF_siteclips_13.mp4" type="video/mp4">';
  localVideoAdded = true;
  return `<video${safeAttributes} poster="${poster}">${source}</video>`;
});

html = html.replace(
  /<head>/i,
  '<head><base href="/demos-offbrand/">',
);
html = html.replace(
  /<\/head>/i,
  '<link rel="stylesheet" href="/demos-offbrand/css/demo-local.css"></head>',
);
html = html.replace(
  /<\/body>/i,
  '<script src="/demos-offbrand/js/demo-local.js"></script></body>',
);

await writeFile(join(outputDir, "index.html"), html, "utf8");
console.log(`Prepared OFF+BRAND demo from ${sourceDir}`);
```

- [ ] **Step 4: Generate the namespaced public snapshot from the supplied files**

Run from the isolated worktree:

```powershell
$env:OFFBRAND_SOURCE_DIR = 'D:\Documentos\undercodeec_nextjs\desing\saveweb2zip-com-www-itsoffbrand-com'
node scripts/offbrand-demo/prepare.mjs
Remove-Item Env:OFFBRAND_SOURCE_DIR
```

Expected: `Prepared OFF+BRAND demo from ...` and `public/demos-offbrand/index.html` plus `css`, `fonts`, `images`, `js` and `media` directories.

- [ ] **Step 5: Add the static rewrite before filesystem routes**

Add this method to `nextConfig` in `next.config.ts`, immediately before `async redirects()`:

```ts
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/demos",
          destination: "/demos-offbrand/index.html",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
```

The existing `trailingSlash: true` normalizes the public request to `/demos/`; the `beforeFiles` phase ensures the old App Router page cannot win over the static document.

- [ ] **Step 6: Remove the discarded React implementation with `apply_patch`**

Run:

```diff
*** Begin Patch
*** Delete File: src/app/demos/page.tsx
*** Delete File: src/app/demos/demos.module.css
*** End Patch
```

Expected: `src/app/demos/` no longer contains a route or project-owned visual resources.

- [ ] **Step 7: Run the static contract and make it pass**

Run:

```powershell
node --test tests/demos-route.test.mjs
```

Expected: `PASS`, including successful responses for CSS, WOFF2, SVG, WebP, JPG, MP4 and the local safety script.

- [ ] **Step 8: Scan the generated document for forbidden network dependencies**

Run:

```powershell
rg -n -i 'intellimize|googletagmanager|google_tags_first_party|cloudflarestream\.com|assets\.itsoffbrand\.io|data-hls-src|<form\b|w-webflow-badge' public/demos-offbrand/index.html
```

Expected: no matches and exit code `1` from `rg`.

- [ ] **Step 9: Commit the standalone static demo**

```powershell
git add -- next.config.ts scripts/offbrand-demo public/demos-offbrand src/app/demos tests/demos-route.test.mjs
git commit -m "feat: serve supplied offbrand demo as static microsite"
```

---

### Task 3: Remove obsolete global-shell exceptions

**Files:**
- Modify: `src/components/PromoBanner/index.tsx`
- Modify: `src/components/AIAssistant/index.jsx`
- Modify: `src/components/CustomCursor/index.jsx`
- Modify: `src/components/PageTransition/index.jsx`
- Test: `tests/demos-route.test.mjs`

**Interfaces:**
- Consumes: the static `beforeFiles` rewrite from Task 2.
- Produces: global components returned to their pre-demo behavior; isolation remains guaranteed by architecture rather than pathname conditions.

- [ ] **Step 1: Remove only the `/demos` exception from PromoBanner**

Delete `isStandaloneDemosPage`, restore the height calculation to `isAdminRoute ? 0 : ...`, restore the effect dependency to `[isAdminRoute]`, and restore the early return to:

```tsx
if (isStandaloneStackPage || isAdminRoute) return null;
```

- [ ] **Step 2: Remove only the `/demos` exception from AIAssistant**

Restore the hidden-path expression to:

```jsx
const isHiddenPath = pathname?.startsWith('/admin') || pathname?.startsWith('/contratos') || pathname?.startsWith('/recursos-humanos');
```

- [ ] **Step 3: Remove only the `/demos` exception from CustomCursor**

Delete `isEditorialRoute` and restore the early return to:

```jsx
if (isTouchDevice || isAdminRoute) return null;
```

- [ ] **Step 4: Remove only the `/demos` exception from PageTransition**

Delete `isEditorialDemosRoute`, remove both calls to it, and restore these expressions:

```jsx
if (isAdminRoute(normCurrent) || isAdminRoute(normTarget)) {
```

```jsx
const hideCurtain = isAdminRoute(normPathname)
  || (preloaderRoutes.includes(normPathname) && transitionState === "hidden");
```

- [ ] **Step 5: Verify isolation still passes after restoring the global components**

Run:

```powershell
node --test tests/demos-route.test.mjs
```

Expected: `PASS`; the static document still contains none of the global-shell markers.

- [ ] **Step 6: Verify no unrelated component edits remain**

Run:

```powershell
git diff 975f424 -- src/components/PromoBanner/index.tsx src/components/AIAssistant/index.jsx src/components/CustomCursor/index.jsx src/components/PageTransition/index.jsx
```

Expected: no output.

- [ ] **Step 7: Commit the cleanup**

```powershell
git add -- src/components/PromoBanner/index.tsx src/components/AIAssistant/index.jsx src/components/CustomCursor/index.jsx src/components/PageTransition/index.jsx
git commit -m "refactor: isolate demos through static routing"
```

---

### Task 4: Verify build quality and visual fidelity

**Files:**
- Verify: `public/demos-offbrand/index.html`
- Verify: `public/demos-offbrand/css/offbrand-2023.shared.0746f2a75.min.css`
- Verify: `tests/demos-route.test.mjs`
- Create locally, do not commit: `$env:TEMP/offbrand-demo-verification/*.png`

**Interfaces:**
- Consumes: completed static route and generated assets from Tasks 2–3.
- Produces: test, type, lint, build and screenshot evidence suitable for final review.

- [ ] **Step 1: Run the focused integration test**

```powershell
node --test tests/demos-route.test.mjs
```

Expected: `PASS` with one passing test and zero failures.

- [ ] **Step 2: Run TypeScript validation**

```powershell
pnpm exec tsc --noEmit
```

Expected: exit code `0` and no diagnostics.

- [ ] **Step 3: Run lint**

```powershell
pnpm lint
```

Expected: exit code `0` with no ESLint errors.

- [ ] **Step 4: Run the production build**

```powershell
pnpm build
```

Expected: exit code `0`; Next.js completes compilation and route generation.

- [ ] **Step 5: Start the production server for screenshots**

```powershell
pnpm start -- --hostname 127.0.0.1 --port 3228
```

Expected: server ready at `http://127.0.0.1:3228` (leave this process running while capturing screenshots).

- [ ] **Step 6: Capture desktop and mobile renderings with the installed browser**

In a second PowerShell session:

```powershell
$demoArtifacts = Join-Path $env:TEMP 'offbrand-demo-verification'
New-Item -ItemType Directory -Force -Path $demoArtifacts | Out-Null
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 --window-size=1440,1200 "--screenshot=$demoArtifacts\desktop.png" 'http://127.0.0.1:3228/demos/'
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=5000 --window-size=390,844 "--screenshot=$demoArtifacts\mobile.png" 'http://127.0.0.1:3228/demos/'
```

Expected: two non-empty PNG files. If Chrome is unavailable, execute the same arguments with `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.

- [ ] **Step 7: Inspect both screenshots against the supplied export**

Verify visually that:

- desktop opens with the three-line “A different / Creative / approach” hero and Off+Brand navigation;
- mobile uses the compact hero and does not overflow horizontally;
- the page uses the supplied AtAero typography, black/white palette and purple/orange orb fallback;
- no Undercodeec banner, assistant, cursor or page-transition curtain is present;
- no preloader remains over the content after the five-second capture budget.

If any item fails, adjust only `scripts/offbrand-demo/demo-local.css`, `scripts/offbrand-demo/demo-local.js` or `scripts/offbrand-demo/prepare.mjs`, regenerate the snapshot with the Step 4 command from Task 2, and repeat Tasks 4.1–4.7.

- [ ] **Step 8: Confirm final repository scope**

```powershell
git status --short
git diff --check
git log --oneline -5
```

Expected: no uncommitted implementation changes, no whitespace errors, and separate commits for the contract, static demo and global-shell cleanup. Las capturas permanecen fuera del repositorio bajo `$env:TEMP`.
