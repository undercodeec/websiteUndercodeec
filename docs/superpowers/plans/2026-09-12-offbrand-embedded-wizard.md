# OFF+BRAND Embedded Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the complete pricing wizard inside the OFF+BRAND plans section without leaving the demo.

**Architecture:** Reuse the existing React wizard in a same-origin, wizard-only route and mount it from the static demo with an isolated iframe. Parent and child exchange only validated height messages; the static parent owns OFF+BRAND expansion and reset behavior.

**Tech Stack:** Next.js 16, React 19, static ES modules, Node test runner, CSS.

**Spec:** `docs/superpowers/specs/2026-09-12-offbrand-embedded-wizard-design.md`

## Global Constraints

- Reuse `InnerPages.jsx` as the only payment and form implementation.
- Keep wizard CSS isolated from OFF+BRAND with a same-origin iframe.
- Accept height messages only from `window.location.origin` and use finite positive heights.
- Preserve the no-JavaScript `/#planes` fallback links.

---

### Task 1: Wizard-only reusable route

**Files:**
- Modify: `src/components/Preview/InnerPages.jsx`
- Create: `src/app/demos-wizard/page.jsx`
- Test: `tests/offbrand-plan-selector.test.mjs`

**Interfaces:**
- Consumes: `project` query string.
- Produces: `<AffiliationSection embedded initialProject />` and `offbrand-wizard-height` messages.

- [x] **Step 1: Write the failing test**

```js
assert.match(await fetch(`${baseUrl}/demos-wizard/?project=Sitio+Web`).then(r => r.text()), /wizard-section/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/offbrand-plan-selector.test.mjs`
Expected: the wizard-only route is missing.

- [x] **Step 3: Implement the route and embedded wizard mode**

```jsx
export default function DemoWizardPage() {
  return <InnerPages embedded />;
}
```

```js
window.parent.postMessage({ type: "offbrand-wizard-height", height }, window.location.origin);
```

- [x] **Step 4: Run the focused test**

Run: `node --test tests/offbrand-plan-selector.test.mjs`
Expected: PASS.

### Task 2: Expand OFF+BRAND and mount the wizard

**Files:**
- Modify: `public/demos-offbrand/js/plan-selector.mjs`
- Modify: `public/demos-offbrand/css/demo-local.css`
- Test: `tests/demos-route.test.mjs`

**Interfaces:**
- Consumes: selected `[data-plan-project]` link and `offbrand-wizard-height` message.
- Produces: `.is-wizard-open`, `[data-plan-wizard-frame]`, and a reset control.

- [x] **Step 1: Write the failing route assertion**

```js
assert.match(page, /demos-wizard/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/demos-route.test.mjs`
Expected: the static selector has no embedded wizard target.

- [x] **Step 3: Implement mount, reset, and same-origin height handling**

```js
frame.src = `/demos-wizard/?project=${encodeURIComponent(project)}`;
window.addEventListener("message", onWizardMessage);
```

- [x] **Step 4: Add expanded/mobile CSS with `offbrand-` prefixes**

```css
.offbrand-plans-grid.is-wizard-open { grid-template-columns: 1fr; }
.offbrand-plans-grid.is-wizard-open > :first-child { display: none; }
```

- [x] **Step 5: Run demo tests**

Run: `$env:DEMO_BASE_URL='http://127.0.0.1:3000'; node --test tests/demos-route.test.mjs`
Expected: PASS.

### Task 3: Full verification

**Files:**
- Test: `tests/demos-route.test.mjs`
- Test: `tests/offbrand-plan-selector.test.mjs`

- [x] **Step 1: Run focused tests**

Run: `$env:DEMO_BASE_URL='http://127.0.0.1:3000'; node --test tests/demos-route.test.mjs tests/offbrand-plan-selector.test.mjs`
Expected: all tests pass.

- [x] **Step 2: Run production build**

Run: `pnpm build`
Expected: Next compiles successfully.

- [x] **Step 3: Check diff whitespace**

Run: `git diff --check`
Expected: no whitespace errors.
