# CRM promotions implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let authenticated Hermes administrators inspect tariffs and explicitly activate or deactivate promotions from CRM Configuración.

**Architecture:** The Next.js CRM reuses its Hermes OTP exchanged JWT and `/api/hermes` proxy. The pilot Hermes backend enforces ADMIN on price-list writes, records state changes in `AuditLog`, and exposes recent audit data. The UI rereads the price list after each update before showing success.

**Tech Stack:** Next.js 16, React 19, NestJS 11, Prisma, Jest, Node test.

**Spec:** `D:/Documentos/Hermes/ProyectMD/prompt.md`

## Global Constraints

- No production access, VPS, SSH, deploy, or production database changes.
- PUT payload is exactly `{ "isActive": true|false }`; only promotions can be toggled from this UI.
- Keep base prices, taxes, offer details, and Nous source unchanged.
- Separate frontend and backend commits and release procedures.

## Review Focus

- A stale or unsuccessful PUT must not display success until GET confirms the persisted state.
- A non-ADMIN bearer token must be rejected by the API even if it calls PUT directly.
- The UI must not allow toggling a base tariff.
- A 401 must reuse the CRM session-expiry flow; a 403 must keep the session and show access denied.
- Concurrent clicks must not send duplicate writes.

---

### Task 1: Secure and audit the pilot backend

**Files:** `hermes-backend/src/price-lists/price-lists.controller.ts`, `price-lists.service.ts`, their specs.

**Interfaces:** `GET /api/price-lists`, `GET /api/price-lists/:id`, `GET /api/price-lists/:id/audit`; `PUT /api/price-lists/:id` accepts the existing DTO. Writes require ADMIN.

- [x] Write failing tests for role metadata, audit recording, and audit retrieval.
- [x] Run the focused specs and confirm expected failures.
- [x] Add ADMIN guards on create/update/delete and transaction-backed state audit with current user ID.
- [x] Run focused specs and backend build.
- [x] Commit backend changes.

### Task 2: CRM promotion interface

**Files:** `src/lib/hermes/api.js`, `src/app/admin/crm/_components/CrmShell.jsx`, `src/app/admin/crm/configuracion/tarifas/page.jsx`, `src/app/admin/crm/crm.css`, frontend tests.

**Interfaces:** `hermesApi.priceLists`, `hermesApi.priceList`, `hermesApi.updatePriceListStatus`, `hermesApi.priceListAudit`.

- [x] Write failing tests for the API payload, navigation, and saved-state verification.
- [x] Run them and confirm expected failures.
- [x] Add the API methods and responsive ADMIN-only page with details and confirmation dialog.
- [x] Run frontend tests, lint, and build.
- [x] Commit frontend changes.

### Task 3: Handoff

**Files:** `HERMES_CRM_PROMOTIONS_UI_IMPLEMENTATION_REPORT.md`.

- [ ] Record architecture, commits, tests, release order, and remaining risks.
- [ ] Verify clean branch status and no real promotion mutation.
