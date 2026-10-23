# Mobile Hero Overflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the root landing hero to render without lateral clipping on mobile only.

**Architecture:** Keep the desktop `overflow: clip` declaration intact and add a narrowly scoped mobile override in the local stylesheet. A source-level regression test pins the breakpoint, selector, and declaration.

**Tech Stack:** Static HTML/CSS, Node.js test runner.

**Spec:** `docs/superpowers/specs/2026-10-23-mobile-hero-overflow-design.md`

## Global Constraints

- Apply only at `max-width: 700px`.
- Scope the override to the root landing page's `page-w` element.
- Preserve desktop clipping.

## Review Focus

- Mobile viewport: the root hero may extend beyond the lateral edge without being clipped.
- Desktop viewport: the existing clipped overflow behavior remains unchanged.

---

### Task 1: Scoped mobile overflow override

**Files:**

- Modify: `tests/demos-route.test.mjs`
- Modify: `public/landing-primary/css/demo-local.css`

**Interfaces:**

- Consumes: the root landing marker `data-page="home"` and `.page-w[overflow="clip"]`.
- Produces: a mobile-only CSS override for the root landing container.

- [ ] **Step 1: Write the failing test**

Add a test asserting that `demo-local.css` contains an `@media (max-width: 700px)` block where `body:has([data-page="home"]) .page-w[overflow="clip"]` has `overflow: visible`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/demos-route.test.mjs`

Expected: FAIL because the mobile override does not exist.

- [ ] **Step 3: Add the minimal mobile CSS override**

Add the selector and declaration specified by the test inside the existing or a new `@media (max-width: 700px)` block in `public/landing-primary/css/demo-local.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/demos-route.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add docs/superpowers/specs/2026-10-23-mobile-hero-overflow-design.md docs/superpowers/plans/2026-10-23-mobile-hero-overflow.md tests/demos-route.test.mjs public/landing-primary/css/demo-local.css`

Run: `git commit -m "fix(frontend): free root hero overflow on mobile"`
