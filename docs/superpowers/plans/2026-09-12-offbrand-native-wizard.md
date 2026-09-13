# OFF+BRAND Native Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the complete project qualification, quote and payment flow inside the OFF+BRAND plans section without loading the root wizard visual UI.

**Architecture:** A DOM-free flow module defines the seven project routes, field metadata, validation, prices and payload builders. A static OFF+BRAND renderer owns state and turns that definition into semantic HTML in the demo. A payment adapter calls the existing API endpoints and reports its result to the renderer; it never imports React components or root CSS.

**Tech Stack:** Native ES modules, static HTML/CSS, Node `node:test`, Next.js API endpoints already used by the root wizard, PayPhone popup.

**Spec:** `docs/superpowers/specs/2026-09-12-offbrand-native-wizard-design.md`

## Global Constraints

- Never render `InnerPages`, `/demos-wizard/`, an iframe, or CSS classes from the root wizard in `/demos/`.
- New UI selectors begin with `offbrand-wizard-` and only use `demo-local.css`.
- Maintain all seven project routes and their conditional steps from `InnerPages.jsx`.
- Backend remains the authority for prices and payment state; browser price values are presentation only.
- Preserve unrelated dirty worktree changes and do not commit them.

---

### Task 1: Model the OFF+BRAND wizard flow

**Files:**
- Create: `public/demos-offbrand/js/offbrand-wizard-flow.mjs`
- Create: `tests/offbrand-wizard-flow.test.mjs`

**Interfaces:**
- Produces `createWizardState(project)`, `getRoute(project, state)`, `validateStep(project, step, state)`, `getSelectedPrice(state)`, and `buildSubmission(project, state)`.
- Consumed by `public/demos-offbrand/js/offbrand-wizard.mjs`.

- [ ] **Step 1: Write failing route and validation tests**

```js
test("returns the Website price, business and billing route", () => {
  const state = createWizardState("Sitio Web");
  assert.deepEqual(getRoute("Sitio Web", state).map(({ id }) => id), ["price", "business", "billing"]);
  assert.equal(validateStep("Sitio Web", "price", state), false);
});

test("routes Moodle standard projects to payment and institutional projects to submission", () => {
  const standard = { ...createWizardState("Plataforma de cursos Moodle"), moodleUsuarios: "bajo", moodleClases: "asincronicas", moodleDiseno: "estandar" };
  const institutional = { ...standard, moodleUsuarios: "alto" };
  assert.equal(getRoute("Plataforma de cursos Moodle", standard).at(-1).id, "payment");
  assert.equal(getRoute("Plataforma de cursos Moodle", institutional).at(-1).id, "submit");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/offbrand-wizard-flow.test.mjs`

Expected: FAIL because `offbrand-wizard-flow.mjs` does not exist.

- [ ] **Step 3: Implement the declarative flow module**

Define each project as a route of field groups: Site, Landing and Store use `price → business → billing/payment`; Software uses `discovery → scope → contact → submit`; Web App and Mobile use their existing discovery groups plus contact/submission; Moodle branches after content. Keep the existing field keys and root endpoint names in the model so payloads are compatible.

```js
export function validateStep(project, step, state) {
  return getRoute(project, state)
    .find((definition) => definition.id === step)
    ?.required.every((field) => hasValue(state[field])) ?? false;
}
```

- [ ] **Step 4: Run tests to verify the module passes**

Run: `node --test tests/offbrand-wizard-flow.test.mjs`

Expected: PASS.

### Task 2: Render native OFF+BRAND form steps

**Files:**
- Create: `public/demos-offbrand/js/offbrand-wizard.mjs`
- Modify: `public/demos-offbrand/js/plan-selector.mjs`
- Modify: `public/demos-offbrand/index.html`
- Test: `tests/offbrand-wizard-render.test.mjs`

**Interfaces:**
- Consumes `createWizardState`, `getRoute` and `validateStep` from Task 1.
- Produces `openOffbrandWizard(project)`, `closeOffbrandWizard()` and a `data-offbrand-wizard` DOM region.

- [ ] **Step 1: Write a failing browser-level regression test**

The test opens `/demos/`, clicks `Sitio Web`, then asserts that the URL remains `/demos/`, `iframe` count is zero, one `data-offbrand-wizard` region is visible and its initial visible form has price-card buttons. Repeat for `Aplicación Móvil` and assert its first discovery form is visible.

- [ ] **Step 2: Run the regression test to verify it fails**

Run: `node --test tests/offbrand-wizard-render.test.mjs`

Expected: FAIL because the current selector creates an iframe.

- [ ] **Step 3: Implement the renderer and event delegation**

Render headings, progress, inputs, radios, checkbox chips, conditional “Otro” text fields, price cards, validation text and Previous/Next controls with only `offbrand-wizard-*` classes. Use delegated `input`, `change` and `click` handlers. Re-render the current step after a state update and preserve `aria-live` validation feedback.

```js
export function openOffbrandWizard(project) {
  state = createWizardState(project);
  currentStep = 0;
  host.hidden = false;
  render();
}
```

- [ ] **Step 4: Replace iframe creation with the native renderer**

Remove `demos-wizard` URL construction, frame resizing and `postMessage` height handling from `plan-selector.mjs`. The plan click calls `openOffbrandWizard(project)`; “Cambiar proyecto” closes it and restores the two original columns.

- [ ] **Step 5: Run the renderer test to verify it passes**

Run: `node --test tests/offbrand-wizard-render.test.mjs`

Expected: PASS with zero navigation and zero iframe elements.

### Task 3: Add OFF+BRAND payment and submission adapter

**Files:**
- Create: `public/demos-offbrand/js/offbrand-wizard-payment.mjs`
- Modify: `public/demos-offbrand/js/offbrand-wizard.mjs`
- Create: `tests/offbrand-wizard-payment.test.mjs`

**Interfaces:**
- Consumes `buildSubmission(project, state)` from Task 1.
- Produces `submitQuote(payload)`, `openPayment(payload)` and `isTrustedPaymentMessage(event, paymentWindow, allowedOrigins)`.

- [ ] **Step 1: Write failing adapter tests**

```js
test("sends software requests to the existing software endpoint", async () => {
  const request = buildSubmission("Desarrollo de Software", completeSoftwareState);
  assert.equal(request.endpoint, "/api/send-software-request");
});

test("rejects a same-origin payment completion from a window other than the active popup", () => {
  assert.equal(isTrustedPaymentMessage({ origin: "https://undercodeec.com", source: {} }, activePopup, allowedOrigins), false);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/offbrand-wizard-payment.test.mjs`

Expected: FAIL because the adapter has not been created.

- [ ] **Step 3: Implement endpoint and payment handling**

Map custom quote projects to `/api/send-software-request`, `/api/send-webapp-request`, `/api/send-mobileapp-request`, `/api/send-moodle-request` and generic forms to `/api/save-wizard-data`. Map paid plans to `/api/create-payment`, `/api/check-payment-status/:id`, `/api/upload-voucher` and `/api/send-order-emails`, including the existing payment terms and transfer receipt constraints. Read public configuration from data attributes injected by the Next page or use the current production API default; never embed secrets.

- [ ] **Step 4: Render terminal states in the native wizard**

On success show the OFF+BRAND confirmation state. On payment cancel, error or network failure keep the user on the payment step with an accessible error. Validate `event.origin`, `event.source` and the active popup before accepting `PAYMENT_COMPLETED`.

- [ ] **Step 5: Run adapter tests to verify they pass**

Run: `node --test tests/offbrand-wizard-payment.test.mjs tests/payment-message.test.mjs`

Expected: PASS.

### Task 4: Apply the OFF+BRAND-only visual system and remove the bridge

**Files:**
- Modify: `public/demos-offbrand/css/demo-local.css`
- Modify: `src/components/Preview/InnerPages.jsx`
- Delete: `src/app/demos-wizard/page.jsx`
- Delete: `src/app/demos-wizard/page.module.css`
- Delete: `src/lib/plan-wizard.mjs`
- Modify: `tests/demos-route.test.mjs`

**Interfaces:**
- Consumes the native wizard markup from Task 2.
- Removes the no-longer-used visual bridge to root React UI.

- [ ] **Step 1: Write a failing style-isolation test**

Assert that `/demos/` has no `iframe`, `/demos-wizard/` is no longer linked by the static selector, and all wizard classes in `demo-local.css` begin with `.offbrand-wizard-` or are existing `.offbrand-*` classes.

- [ ] **Step 2: Run the isolation test to verify it fails**

Run: `node --test tests/demos-route.test.mjs`

Expected: FAIL because the iframe bridge and route are still present.

- [ ] **Step 3: Implement responsive native styling**

Add only OFF+BRAND selectors for the shell, step counter, cards, fields, checkbox/radio controls, error state, summary and confirmation. Use the existing `--main-light`, `--main-dark`, `--light-grey`, text classes and dark-mode rules; do not import root CSS or copy root color values. Collapse fields and price cards to one column at the existing mobile breakpoint.

- [ ] **Step 4: Delete the obsolete bridge code**

Remove `demos-wizard` route files and the embedded-only changes to `InnerPages.jsx`. Keep unrelated root wizard functionality intact.

- [ ] **Step 5: Run the isolation test to verify it passes**

Run: `node --test tests/demos-route.test.mjs`

Expected: PASS.

### Task 5: Verify every route and final build

**Files:**
- Modify: `tests/offbrand-wizard-render.test.mjs`
- Modify: `tests/offbrand-wizard-payment.test.mjs`

**Interfaces:**
- Consumes the completed static wizard.
- Produces regression coverage for all project routes.

- [ ] **Step 1: Add route-matrix coverage**

For all seven projects, assert project selection does not navigate, the expected route length is rendered, Previous restores the prior step and missing required fields block Next. Cover Website, Landing and Store price selection; Moodle’s two terminal branches; transfer receipt validation; and a forged payment `postMessage`.

- [ ] **Step 2: Run the complete tests**

Run: `$env:DEMO_BASE_URL='http://127.0.0.1:3000'; node --test tests/*.test.mjs`

Expected: PASS with no failing tests.

- [ ] **Step 3: Run static and production verification**

Run: `pnpm lint; pnpm build; git diff --check`

Expected: lint has zero errors, production compilation succeeds and `git diff --check` has no whitespace errors.
