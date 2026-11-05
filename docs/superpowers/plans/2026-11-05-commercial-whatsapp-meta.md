# Commercial WhatsApp Meta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emit one Meta Pixel event for every commercial WhatsApp click on public pages while excluding CRM and internal routes.

**Architecture:** A shared client utility will own the public-path rule and send `WhatsAppCommercialClick` with the existing source and page path. The React floating button and the global commercial-link observer will call it. The standalone landing page will use the same event contract in its own browser script.

**Tech Stack:** Next.js 16, React 19, browser Meta Pixel `fbq`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-05-commercial-whatsapp-meta-design.md`

## Global Constraints

- Track only HTTPS links to `wa.me/593999739534` on public pages.
- Send Meta events only with advertising consent and an available `fbq` function.
- Exclude `/admin`, `/contratos` and `/undercodeec`, including descendants.
- Keep `dataLayer`, attribution, Hermes CRM, and personal data handling unchanged.
- Treat the event as contact initiation; Meta configuration uses category `Contactar` and no monetary value.

## Review Focus

- A click in an excluded route must never send the Meta event; cover with a path helper test in Task 1.
- A missing Pixel function must not prevent navigation; cover with a no-throw helper test in Task 1.
- The floating button must retain its identifying source; cover with a helper payload test in Task 1.
- Non-floating commercial links must use their existing `commercial_whatsapp_link` source; cover by source assertion in Task 2.
- The static landing page must emit the same custom-event name only after advertising consent; cover with source-file integration assertions in Task 2.

---

### Task 1: Define the commercial Meta event contract

**Files:**
- Modify: `src/components/HermesWhatsAppButton/config.mjs`
- Modify: `tests/hermes-whatsapp-button.test.mjs`

**Interfaces:**
- Produces: `isCommercialWhatsAppTrackingPath(pathname)` returning a boolean and `trackCommercialWhatsAppClick(tracker, { source, pagePath })`.
- Consumes: no new dependencies.

- [x] **Step 1: Write failing tests for the event contract**

Add tests proving `trackCommercialWhatsAppClick` sends exactly `trackCustom`, `WhatsAppCommercialClick`, `{ source, page_path }`; it does not throw without a tracker; and public/internal paths are classified according to the three excluded prefixes.

- [x] **Step 2: Run the focused test to verify it fails**

Run: `pnpm exec node --test tests/hermes-whatsapp-button.test.mjs`

Expected: FAIL because the two exported functions do not exist.

- [x] **Step 3: Implement the two exported helpers in `config.mjs`**

Use exact prefix matching for internal paths. Emit the custom event only when the supplied tracker is a function; normalize an absent page path to `/`.

- [x] **Step 4: Run the focused test to verify it passes**

Run: `pnpm exec node --test tests/hermes-whatsapp-button.test.mjs`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/components/HermesWhatsAppButton/config.mjs tests/hermes-whatsapp-button.test.mjs
git commit -m "feat: define commercial WhatsApp Meta event"
```

### Task 2: Send the contract from each public commercial entry point

**Files:**
- Modify: `src/components/HermesWhatsAppButton/index.jsx`
- Modify: `src/components/Attribution/CommercialWhatsAppAttribution.jsx`
- Modify: `public/landing-primary/js/consent-attribution.js`
- Modify: `tests/hermes-whatsapp-button.test.mjs`

**Interfaces:**
- Consumes: `isCommercialWhatsAppTrackingPath(pathname)` and `trackCommercialWhatsAppClick(tracker, payload)` from Task 1.
- Produces: one `WhatsAppCommercialClick` for each eligible commercial WhatsApp click.

- [x] **Step 1: Write failing integration assertions**

Add behavioral assertions for the shared tracker and the static landing listener. Review the React call sites for their respective `source` values and the path guard.

- [x] **Step 2: Run the focused test to verify it fails**

Run: `pnpm exec node --test tests/hermes-whatsapp-button.test.mjs`

Expected: FAIL because the components and static script do not yet call the shared event contract.

- [x] **Step 3: Integrate the event without changing attribution or navigation**

Replace the floating button's `WhatsAppHermesClick` call with the shared event. Call the shared event from the React global observer only on public paths and with advertising consent. In the standalone landing listener, call `window.fbq("trackCustom", "WhatsAppCommercialClick", { source: "commercial_whatsapp_link", page_path })` only when advertising consent is granted and `window.fbq` is a function.

- [x] **Step 4: Run the focused test to verify it passes**

Run: `pnpm exec node --test tests/hermes-whatsapp-button.test.mjs`

Expected: PASS.

- [x] **Step 5: Commit**

```bash
git add src/components/HermesWhatsAppButton/index.jsx src/components/Attribution/CommercialWhatsAppAttribution.jsx public/landing-primary/js/consent-attribution.js tests/hermes-whatsapp-button.test.mjs
git commit -m "feat: track commercial WhatsApp clicks in Meta"
```

### Task 3: Verify the delivered behavior

**Files:**
- Modify: `docs/superpowers/specs/2026-11-05-commercial-whatsapp-meta-design.md`
- Modify: `docs/superpowers/plans/2026-11-05-commercial-whatsapp-meta.md`

**Interfaces:**
- Consumes: completed Tasks 1 and 2.
- Produces: verification evidence and checked plan steps.

- [x] **Step 1: Run the complete frontend suite**

Run: `pnpm test`

Expected: PASS with no failing tests.

- [x] **Step 2: Run lint for the changed React files**

Run: `pnpm exec eslint src/components/HermesWhatsAppButton/index.jsx src/components/Attribution/CommercialWhatsAppAttribution.jsx`

Expected: exit code 0.

- [x] **Step 3: Mark completed plan tasks and document the Meta manual verification**

Record that Events Manager must receive `WhatsAppCommercialClick` after accepting advertising consent and clicking a public commercial link; internal pages must not emit it.

- [x] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-11-05-commercial-whatsapp-meta-design.md docs/superpowers/plans/2026-11-05-commercial-whatsapp-meta.md
git commit -m "docs: record commercial WhatsApp Meta verification"
```

## Execution record

The work was committed together because the helper and both browser integrations form one measurement change. The focused tests failed first on the missing helper and missing static Meta event, then passed after implementation. `pnpm test` passed (193 passed, 1 skipped), targeted ESLint passed, and `pnpm build` completed successfully. Real receipt in Meta Events Manager requires publication and a consented click.
