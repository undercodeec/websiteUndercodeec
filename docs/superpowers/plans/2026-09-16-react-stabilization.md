# React Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mantener Next.js/React como frontend activo, recuperar una línea base de pruebas verde y retirar el piloto Astro y dependencias confirmadas como no usadas sin alterar la experiencia actual.

**Architecture:** Next.js continúa sirviendo todas las rutas y conserva la reescritura de `/` y `/demos` hacia `public/landing-primary`. La estabilización se divide en commits reversibles: primero se alinean las pruebas con el comportamiento aprobado, luego se retira Astro y finalmente se eliminan tres dependencias sin referencias. La limpieza amplia de componentes y activos queda fuera de este plan hasta contar con evidencia adicional de uso en navegador.

**Tech Stack:** Next.js 16.1.2, React 19.2.3, Node Test Runner, Express 5.1.0, pnpm 9.15.4, npm para la suite aislada de `backend/`.

**Spec:** `docs/superpowers/specs/2026-09-16-react-stabilization-design.md`

## Global Constraints

- No cambiar diseño, contenido, animaciones ni comportamiento aprobado.
- No modificar `public/landing-primary`, sus scripts ni la reescritura de `/` y `/demos`.
- No modificar pagos, contratos, formularios, reCAPTCHA, portal, CRM, Hermes, contratos HTTP, cookies, almacenamiento de sesión o variables de entorno.
- No actualizar versiones de dependencias no relacionadas.
- Cada tarea termina en un commit independiente y verificable.
- El punto de recuperación completo es `pre-react-stabilization-2026-09-16` (`22e6fe34fa72e70a3166bbac1e51607a1d57f2cf`).
- Si hay un servidor Next de desarrollo activo, ejecutar el smoke HTTP con `DEMO_BASE_URL=http://127.0.0.1:3000`; no terminar procesos iniciados por el usuario.

---

## Mapa de archivos

- `tests/demos-route.test.mjs`: contrato de la portada estática y sus recursos.
- `tests/servicios-primary-layout.test.mjs`: caracterización visual y de integraciones de las rutas React.
- `tests/react-stack.test.mjs`: nueva barrera que impide reintroducir el piloto Astro o retirar accidentalmente Next/React.
- `package.json`: comandos de prueba y dependencias del frontend.
- `pnpm-lock.yaml`: resolución reproducible después de retirar Astro y dependencias no usadas.
- `.gitignore`: retirar exclusiones que solo pertenecen a `apps/web`.
- `apps/web/**`: piloto Astro que se elimina del proyecto activo.
- `plan_migracion_sin_react.md`: conservar como documento histórico, marcado claramente como reemplazado.
- `docs/maintenance/react-stabilization-audit.md`: evidencia de lo retirado y candidatos aplazados.

---

### Task 1: Recuperar una suite de regresión fiel al comportamiento actual

**Files:**
- Modify: `tests/demos-route.test.mjs`
- Modify: `tests/servicios-primary-layout.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: portada activa en `public/landing-primary/index.html`, layout global React y botón Hermes actual.
- Produces: comandos `pnpm test`, `pnpm test:backend` y `pnpm test:all`; suite raíz de 58 pruebas verdes.

- [ ] **Step 1: Actualizar el contrato SEO de la portada**

En `tests/demos-route.test.mjs`, sustituir la expectativa heredada de OFF+BRAND:

```js
assert.match(
  page,
  /<title>Undercodeec \| Diseño Web, Apps, Software y SEO<\/title>/,
);
```

No modificar ninguna otra verificación de estructura, animación o recursos de la portada.

- [ ] **Step 2: Actualizar el contrato de carga localizada de reCAPTCHA**

En `tests/servicios-primary-layout.test.mjs`, reemplazar la prueba obsoleta por:

```js
test("loads reCAPTCHA only from routes and forms that require it", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const contact = await readFile("src/components/Contact/Form.jsx", "utf8");
  const marketing = await readFile("src/components/Marketing/MarketingPrimaryContent.jsx", "utf8");
  const hr = await readFile("src/app/recursos-humanos/page.tsx", "utf8");

  assert.doesNotMatch(layout, /RecaptchaEnterpriseScript/);
  assert.doesNotMatch(layout, /google\.com\/recaptcha\/enterprise\.js/);
  assert.match(contact, /<RecaptchaEnterpriseScript\s*\/>/);
  assert.match(marketing, /<RecaptchaEnterpriseScript\s*\/>/);
  assert.match(hr, /<RecaptchaEnterpriseScript\s*\/>/);
});
```

- [ ] **Step 3: Actualizar el contrato del botón Hermes arrastrable**

En el mismo archivo, reemplazar la expectativa de anclaje izquierdo por:

```js
test("removes the promotion banner and keeps Hermes draggable from the right edge", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");
  const hermes = await readFile("src/components/HermesWhatsAppButton/index.jsx", "utf8");

  assert.doesNotMatch(layout, /PromoBanner/);
  await assert.rejects(access("src/components/PromoBanner/index.tsx"));
  assert.match(hermes, /right:\s*var\(--primary-page-gutter, 24px\);/);
  assert.match(hermes, /right:\s*16px;/);
  assert.match(hermes, /setPointerCapture/);
  assert.match(hermes, /releasePointerCapture/);
  assert.match(hermes, /touch-action:\s*none;/);
});
```

- [ ] **Step 4: Añadir comandos reproducibles**

En `package.json`, dejar el bloque `scripts` con estas entradas adicionales, sin alterar los comandos existentes:

```json
{
  "test": "node --test \"tests/*.test.mjs\"",
  "test:backend": "npm --prefix backend test",
  "test:all": "pnpm test && pnpm test:backend"
}
```

Mantener `test:crm` por compatibilidad hasta una limpieza posterior.

- [ ] **Step 5: Ejecutar las pruebas dirigidas**

Con el servidor de desarrollo actual disponible en el puerto 3000:

```powershell
$env:DEMO_BASE_URL='http://127.0.0.1:3000'
pnpm test
Remove-Item Env:DEMO_BASE_URL
```

Expected: `58` pruebas, `58` correctas, `0` fallidas.

- [ ] **Step 6: Ejecutar backend y verificaciones estáticas**

```powershell
pnpm test:backend
pnpm lint
pnpm build
```

Expected: backend `11` pruebas correctas más `chatCommercialPlaybook tests passed`; lint con cero errores; build de Next con 34 rutas.

- [ ] **Step 7: Commit**

```powershell
git add -- package.json tests/demos-route.test.mjs tests/servicios-primary-layout.test.mjs
git commit -m "test: alinear regresiones con experiencia vigente"
```

---

### Task 2: Retirar el piloto Astro sin afectar Next

**Files:**
- Create: `tests/react-stack.test.mjs`
- Delete: `apps/web/astro.config.mjs`
- Delete: `apps/web/package.json`
- Delete: `apps/web/tsconfig.json`
- Delete: `apps/web/public/fonts/ataero-retina.woff2`
- Delete: `apps/web/src/components/global/PrimaryFooter.astro`
- Delete: `apps/web/src/content/services.ts`
- Delete: `apps/web/src/pages/servicios.astro`
- Delete: `apps/web/src/scripts/primary-footer.ts`
- Delete: `apps/web/src/styles/components/primary-footer.css`
- Delete: `apps/web/src/styles/pages/services.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.gitignore`
- Modify: `plan_migracion_sin_react.md`

**Interfaces:**
- Consumes: scripts de prueba definidos en Task 1 y reescrituras de `next.config.ts`.
- Produces: repositorio con Next/React como único frontend activo y una prueba automatizada de esa decisión.

- [ ] **Step 1: Escribir una prueba que falle mientras Astro siga activo**

Crear `tests/react-stack.test.mjs`:

```js
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("keeps Next and React as the only active frontend stack", async () => {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  const nextConfig = await readFile("next.config.ts", "utf8");

  assert.equal(packageJson.dependencies.next, "16.1.2");
  assert.equal(packageJson.dependencies.react, "19.2.3");
  assert.equal(packageJson.dependencies["react-dom"], "19.2.3");
  assert.equal(packageJson.devDependencies.astro, undefined);
  await assert.rejects(access("apps/web/package.json"));
  assert.match(nextConfig, /source:\s*"\/"[\s\S]*destination:\s*"\/landing-primary\/index\.html"/);
  assert.match(nextConfig, /source:\s*"\/demos"[\s\S]*destination:\s*"\/landing-primary\/index\.html"/);
});
```

- [ ] **Step 2: Confirmar que la prueba falla por Astro**

```powershell
node --test tests/react-stack.test.mjs
```

Expected: FAIL porque `devDependencies.astro` existe y `apps/web/package.json` es accesible.

- [ ] **Step 3: Eliminar exclusivamente los diez archivos versionados del piloto**

Eliminar mediante `apply_patch` los archivos enumerados en la sección **Files** de esta tarea. No borrar `apps/` recursivamente y no usar comandos con rutas calculadas.

- [ ] **Step 4: Retirar Astro y regenerar el lockfile sin actualizar otras versiones**

```powershell
pnpm remove --save-dev astro
pnpm install --lockfile-only --frozen-lockfile=false
```

Revisar que el diff de `pnpm-lock.yaml` elimine el importer `apps/web` y paquetes exclusivos de Astro, sin cambios de versión en Next, React, GSAP, Three.js o dependencias del backend.

- [ ] **Step 5: Limpiar exclusiones exclusivas del piloto**

Eliminar de `.gitignore` exactamente estas líneas:

```gitignore
/apps/web/node_modules/
/apps/web/.astro/
/apps/web/dist/
```

Conservar `/.next/`, `/node_modules`, `/out/` y todas las demás exclusiones.

- [ ] **Step 6: Marcar el plan de migración como histórico**

Insertar inmediatamente después del título de `plan_migracion_sin_react.md`:

```markdown
> **Estado: reemplazado el 16 de septiembre de 2026.** Se decidió conservar Next.js y React para proteger la experiencia visual y los flujos actuales. La decisión vigente y sus controles están documentados en `docs/superpowers/specs/2026-09-16-react-stabilization-design.md`.
```

No reescribir ni eliminar el contenido histórico restante.

- [ ] **Step 7: Verificar la barrera arquitectónica y ausencia de Astro**

```powershell
node --test tests/react-stack.test.mjs
rg -n "astro|@undercodeec/web|apps/web" package.json pnpm-lock.yaml pnpm-workspace.yaml .gitignore
pnpm install --frozen-lockfile
```

Expected: la prueba pasa; `rg` no encuentra dependencias o rutas activas de Astro (se permite la entrada genérica `apps/*` en `pnpm-workspace.yaml`); instalación correcta con un solo proyecto activo.

- [ ] **Step 8: Ejecutar todas las puertas de calidad**

```powershell
$env:DEMO_BASE_URL='http://127.0.0.1:3000'
pnpm test:all
Remove-Item Env:DEMO_BASE_URL
pnpm lint
pnpm build
git diff --check
```

Expected: todas las pruebas pasan; lint y build terminan sin errores; ningún error de espacios en el diff.

- [ ] **Step 9: Commit**

```powershell
git add -A -- apps/web package.json pnpm-lock.yaml .gitignore plan_migracion_sin_react.md tests/react-stack.test.mjs
git commit -m "chore: retirar piloto Astro"
```

---

### Task 3: Retirar dependencias confirmadas como no usadas

**Files:**
- Modify: `tests/react-stack.test.mjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: barrera arquitectónica creada en Task 2.
- Produces: manifiesto y lockfile sin `clsx`, `rc-slider` ni `tailwind-merge`.

- [ ] **Step 1: Extender la prueba con la lista de dependencias ausentes**

Añadir al final de la prueba existente:

```js
  for (const dependency of ["clsx", "rc-slider", "tailwind-merge"]) {
    assert.equal(packageJson.dependencies[dependency], undefined, dependency);
  }
```

- [ ] **Step 2: Confirmar que la prueba falla por las tres dependencias**

```powershell
node --test tests/react-stack.test.mjs
```

Expected: FAIL mostrando primero `clsx` como dependencia todavía presente.

- [ ] **Step 3: Reconfirmar que no existen referencias de código**

```powershell
rg -n 'clsx|rc-slider|tailwind-merge' src tests scripts
```

Expected: sin coincidencias. Si aparece alguna coincidencia, detener esta tarea y conservar la dependencia correspondiente.

- [ ] **Step 4: Retirar las dependencias con pnpm**

```powershell
pnpm remove clsx rc-slider tailwind-merge
```

Revisar que no cambien las versiones de dependencias restantes.

- [ ] **Step 5: Ejecutar pruebas y build**

```powershell
node --test tests/react-stack.test.mjs
$env:DEMO_BASE_URL='http://127.0.0.1:3000'
pnpm test:all
Remove-Item Env:DEMO_BASE_URL
pnpm lint
pnpm build
pnpm install --frozen-lockfile
```

Expected: todas las puertas terminan correctamente y la instalación no modifica el lockfile.

- [ ] **Step 6: Commit**

```powershell
git add -- package.json pnpm-lock.yaml tests/react-stack.test.mjs
git commit -m "chore: retirar dependencias frontend sin uso"
```

---

### Task 4: Registrar evidencia y cerrar este lote de estabilización

**Files:**
- Create: `docs/maintenance/react-stabilization-audit.md`

**Interfaces:**
- Consumes: resultados y commits de Tasks 1–3.
- Produces: registro auditable de cambios ejecutados y limpieza aplazada.

- [ ] **Step 1: Crear el registro de auditoría**

Crear `docs/maintenance/react-stabilization-audit.md` con esta estructura:

```markdown
# Auditoría de estabilización React

**Fecha:** 2026-09-16
**Punto de retorno:** `pre-react-stabilization-2026-09-16`

## Cambios ejecutados

| Lote | Evidencia |
|---|---|
| Línea base de pruebas | 58/58 pruebas raíz y backend correcto |
| Retiro del piloto Astro | barrera `react-stack`, build Next correcto |
| Dependencias sin uso | búsqueda sin referencias, suite y build correctos |

## Elementos retirados

- `apps/web` y la dependencia de desarrollo `astro`.
- `clsx`, `rc-slider` y `tailwind-merge`.

## Elementos protegidos y sin cambios

- `public/landing-primary` y las reescrituras de `/` y `/demos`.
- Animaciones, preloaders, cursores, canvas y recursos 3D.
- Pagos, formularios, reCAPTCHA, portal, CRM y Hermes.

## Trabajo aplazado

- Los 105 candidatos del reporte histórico de Knip requieren verificación individual; existen falsos positivos por cargas mediante HTML, CSS y cadenas.
- El import no declarado de `prop-types` pertenece a `src/components/CountTo/index.jsx`; se decidirá junto con la verificación de uso de ese componente.
- No se eliminarán activos de `public/` sin inventario de solicitudes de red y comprobación visual.
```

- [ ] **Step 2: Ejecutar verificación final del lote**

```powershell
$env:DEMO_BASE_URL='http://127.0.0.1:3000'
pnpm test:all
Remove-Item Env:DEMO_BASE_URL
pnpm lint
pnpm build
pnpm install --frozen-lockfile
git diff --check
git status --short
```

Expected: pruebas, lint, build e instalación correctos; antes del commit solo aparece el nuevo documento de auditoría.

- [ ] **Step 3: Commit**

```powershell
git add -- docs/maintenance/react-stabilization-audit.md
git commit -m "docs: registrar auditoria de estabilizacion React"
```

- [ ] **Step 4: Verificar la historia y el rollback**

```powershell
git log --oneline --decorate -6
git show-ref --verify refs/tags/pre-react-stabilization-2026-09-16
git status --short --branch
```

Expected: existen commits separados para pruebas, retiro de Astro, dependencias y auditoría; la etiqueta apunta al commit `22e6fe3` y el árbol está limpio en `chore/react-stabilization`.

---

## Límite de este plan

Este plan termina después de retirar Astro y las tres dependencias cuya ausencia de referencias ya fue confirmada. La eliminación de componentes React antiguos, CSS global o activos de `public/` requiere un segundo plan basado en inventario de rutas, trazas de red y comparación visual; no debe incorporarse oportunistamente a estos commits.
