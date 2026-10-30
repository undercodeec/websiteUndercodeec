# CRM Promotions Visual Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish a reviewable frontend branch combining the existing CRM promotions UI with the user's four pending landing visual changes, and a backend branch based on the authorized pilot line.

**Architecture:** Keep the original promotions commits intact. Preserve the user's uncommitted files in an external patch and copies, then apply that patch on a new frontend worktree. Use the existing backend feature branch, which descends from the authorized Black Friday pilot, and publish review branches without touching production.

**Tech Stack:** Next.js 16, React 19, Node test runner, NestJS 11, Jest 30, Prisma 5, Git.

**Spec:** `D:/Documentos/Hermes/ProyectMD/prompt.md`

## Global Constraints

- No VPS, SSH, production deployment, production database writes, Black Friday activation, force push, or destructive Git cleanup.
- Preserve the main checkout's uncommitted changes and unrelated untracked files.
- Keep the promotion UI and its ADMIN security, audit, OTP session, and verified status workflow.

## Review Focus

- Root landing mobile hero framing remains distinct from other landing pages: cover with a source-level regression test.
- Mobile spacer and particle container rules remain scoped to the root landing: cover with a CSS regression test.
- Cache-busting links reference the updated visual assets: cover with an HTML regression test.
- Promotion activation verifies persisted state: retain and run the existing promotion tests.
- Backend ADMIN and audit semantics stay unchanged: run focused Jest and E2E tests.

---

### Task 1: Preserve and integrate the visual changes

**Files:** `public/landing-primary/css/demo-local.css`, `public/landing-primary/css/hero-particles.css`, `public/landing-primary/index.html`, `public/landing-primary/js/home-hero-particles.js`, `public/landing-primary/js/consent-attribution.js`, `src/components/HeroParticles/HeroParticles.jsx`, `tests/landing-mobile-framing.test.mjs`.

**Interfaces:** Consumes the exact four-file patch in the external backup; produces a frontend branch descending from `feat/crm-promotions-ui` with the user's latest visual behavior.

- [x] Add focused regression assertions for root landing mobile scope, framing, asset versions, and consent panel bounds.
- [x] Run those assertions against the clean feature baseline and confirm failure.
- [x] Apply the preserved patch after `git apply --check` and verify it reproduces the backed-up files.
- [ ] Run the focused assertions and promotion tests; commit the visual integration.

### Task 2: Verify and prepare publication

**Files:** `HERMES_CRM_PROMOTIONS_UI_VISUAL_INTEGRATION_REPORT.md`.

**Interfaces:** Consumes the integrated frontend branch and existing backend feature branch; produces Git review branches and a handoff report.

- [x] Run frontend full suite, focused suite, changed-file lint, and build.
- [x] Run backend focused/full Jest, E2E where isolated harness permits, build, and Prisma validate.
- [ ] Check branch ancestry, remote heads, diffs, and worktree cleanliness.
- [ ] Publish review branches with ordinary push and verify remote SHAs.
- [ ] Record exact evidence, release order, rollback, and production checks in the report; commit and push the report.
