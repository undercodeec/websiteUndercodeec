# Black Friday Root Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show an accessible, responsive Black Friday landing-page offer modal three seconds after the root-page preloader completes.

**Architecture:** A dedicated client component is rendered only by `src/app/page.tsx`, receiving the existing `usePageReady` preloader-completion state. It owns the delayed visibility, focus/keyboard controls, session dismissal, scroll lock, and a WhatsApp offer URL. A CSS module scopes the modal’s visual layer, including a rectangular WhatsApp CTA that recalls the global floating control.

**Tech Stack:** Next.js 16, React 19, CSS Modules, lucide-react, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-06-black-friday-root-modal-design.md`

## Global Constraints

- The modal appears only on `/`, three seconds after `preloaderDone`/`usePageReady` completes.
- The displayed price is exactly `$80,00` and all nine supplied benefits are present.
- There is one commercial CTA only: WhatsApp, presented as a long rectangular button.
- Preserve the global floating WhatsApp control and existing homepage content.
- The modal must be keyboard accessible, responsive and motion-reduced where requested.

## Review Focus

- First visit after preload: readiness arms the dialog for exactly 3000 ms — Task 2 test.
- Explicit dismissal: closing, backdrop clicking or Escape prevents it reopening this session — Task 2 test.
- Keyboard navigation: focus starts in the dialog and returns to the opener/active element after close — Task 2 test.
- Mobile viewport: the benefit list remains legible and internally scrollable without obscuring the CTA — Task 3 style test.
- Existing WhatsApp attribution remains available for the offer’s external link — Task 1 test.

---

## File Structure

- `src/components/BlackFridayLandingModal/BlackFridayLandingModal.jsx`: client component with state, a11y behavior, offer content and CTA.
- `src/components/BlackFridayLandingModal/BlackFridayLandingModal.module.css`: isolated responsive modal layout and rectangular WhatsApp CTA.
- `src/components/BlackFridayLandingModal/config.mjs`: offer message and URL builder.
- `src/app/page.tsx`: passes `usePageReady` to mount the modal only after the root preloader has ended.
- `tests/black-friday-landing-modal.test.mjs`: executable contract for copy, URL builder, readiness delay, dismissal markers, scoped styles and root mounting.

### Task 1: Define and test the promotional WhatsApp destination

**Files:**
- Create: `src/components/BlackFridayLandingModal/config.mjs`
- Create: `tests/black-friday-landing-modal.test.mjs`

**Interfaces:**
- Produces: `buildBlackFridayLandingWhatsAppUrl(): string`.
- Consumed by: `BlackFridayLandingModal` CTA.

- [ ] **Step 1: Write the failing URL-builder test**

Assert that `buildBlackFridayLandingWhatsAppUrl()` targets `593999739534` and encodes an explicit Black Friday $80,00 landing-page enquiry.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/black-friday-landing-modal.test.mjs`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement `buildBlackFridayLandingWhatsAppUrl(): string` in `config.mjs`**

Use the established WhatsApp number and encode the fixed promotion request with `encodeURIComponent`.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test tests/black-friday-landing-modal.test.mjs`
Expected: PASS.

### Task 2: Build the accessible post-preload modal

**Files:**
- Create: `src/components/BlackFridayLandingModal/BlackFridayLandingModal.jsx`
- Modify: `tests/black-friday-landing-modal.test.mjs`

**Interfaces:**
- Consumes: `buildBlackFridayLandingWhatsAppUrl(): string` and `isPageReady: boolean`.
- Produces: default React component `BlackFridayLandingModal`.
- Consumed by: `src/app/page.tsx`.

- [ ] **Step 1: Add failing component contract tests**

Assert that `isPageReady` arms a `3000` ms timer, no timer is armed earlier, session dismissal is respected, dialog semantics are present, the price and nine benefits are exact, there is one WhatsApp CTA, and close behavior plus the URL builder are used.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/black-friday-landing-modal.test.mjs`
Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement `BlackFridayLandingModal({ isPageReady })`**

Use React effects so the three-second timer starts only after `isPageReady` becomes true. Store a session flag after dismissal; render no dialog before the timer completes. Provide a labelled `role="dialog"` with a focusable close button, backdrop close handling and an external WhatsApp anchor using the offer URL.

- [ ] **Step 4: Run the focused test to verify it passes**

Run: `node --test tests/black-friday-landing-modal.test.mjs`
Expected: PASS.

### Task 3: Add responsive visual styling and mount the modal in the root page

**Files:**
- Create: `src/components/BlackFridayLandingModal/BlackFridayLandingModal.module.css`
- Modify: `src/app/page.tsx`
- Modify: `tests/black-friday-landing-modal.test.mjs`

**Interfaces:**
- Consumes: default `BlackFridayLandingModal` component and `isReady` from `usePageReady`.
- Produces: root-page-only promotional modal.

- [ ] **Step 1: Extend tests for root mount and visual safeguards**

Assert that the root page imports/renders `BlackFridayLandingModal` with `isPageReady={isReady}`; styles provide the backdrop, desktop/max-height rules, a mobile media query and a non-circular rectangular CTA class.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test tests/black-friday-landing-modal.test.mjs`
Expected: FAIL because the root import and styles do not exist.

- [ ] **Step 3: Implement the CSS module and root mount**

Use the existing purple, glass and bright green visual language. Keep the dialog centred, limit its height, let the benefit region scroll on short screens and make the WhatsApp button full-width/rectangular with the existing green affordance. Add the component once in `HomePage` using its current preload-ready state.

- [ ] **Step 4: Run focused and project verification**

Run: `node --test tests/black-friday-landing-modal.test.mjs && pnpm lint && pnpm test`
Expected: all commands exit 0.

## Delivery correction: static root landing

The root route is rewritten in `next.config.ts` to `public/landing-primary/index.html`; it does not render `src/app/page.tsx` in the browser. The production implementation therefore lives in the static landing served at `/`:

- `public/landing-primary/index.html`: modal markup plus stylesheet and script references.
- `public/landing-primary/css/black-friday-modal.css`: responsive overlay, scrollable benefit list, rectangular WhatsApp CTA and privacy-panel handling while the dialog is open.
- `public/landing-primary/js/black-friday-modal.js`: listens for the static `homePreloaderDone` event, waits exactly 3000 ms, and manages close, focus trapping, Escape, backdrop and scroll lock.
- `tests/black-friday-static-modal.test.mjs`: verifies the static delivery contract.

The static implementation opens once per page load after preload completion. Closing it does not persist a dismissal flag, so a fresh root-page load still shows the requested promotion.

## Visual adjustment requested after delivery

The current root modal intentionally omits the "Incluye" section and all benefit rows. It keeps the $80,00 offer, uses the root site's Ataero font and white type, and reveals its title with the same staggered character animation as the root hero. The only commercial action reads "Escríbenos para saber más" and places the existing animated WhatsApp orb inside the rectangular CTA. The modal remains dark and opens three seconds after `homePreloaderDone`.
