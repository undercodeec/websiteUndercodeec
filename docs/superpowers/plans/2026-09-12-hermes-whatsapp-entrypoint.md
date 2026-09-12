# Hermes WhatsApp Entrypoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mounted website AI assistant with an accessible floating link that starts a WhatsApp conversation with Hermes.

**Architecture:** Create a client component that owns the WhatsApp URL, click-only Meta Pixel event, public-route exclusion, and floating-button presentation. Change the root layout to mount that component in place of `AIAssistant`; leave the existing assistant source entirely unchanged.

**Tech Stack:** Next.js 16, React 19, JavaScript/JSX, react-icons, Node.js built-in test runner, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-12-hermes-whatsapp-entrypoint-design.md`

## Global Constraints

- Destination number is exactly `+593 99 973 9534` (`593999739534`).
- Do not modify, delete, rename, or import internals from `src/components/AIAssistant/index.jsx`.
- Do not submit or store visitor data in the website; WhatsApp/Hermes handles the conversation.
- The link must use `target="_blank"` and `rel="noopener noreferrer"`.
- The event name is exactly `WhatsAppHermesClick`, and Meta Pixel failure or absence must not block navigation.
- Keep the button hidden for `/admin`, `/contratos`, and `/recursos-humanos` routes.

---

### Task 1: Create and verify the Hermes WhatsApp button

**Files:**

- Create: `src/components/HermesWhatsAppButton/index.jsx`
- Create: `src/components/HermesWhatsAppButton/config.mjs`
- Create: `tests/hermes-whatsapp-button.test.mjs`

**Interfaces:**

- Consumes: `usePathname` from `next/navigation`; `FaWhatsapp` from `react-icons/fa`; `buildHermesWhatsAppUrl` and `isHermesWhatsAppHiddenPath` from the local config module.
- Produces: default `HermesWhatsAppButton` React component with no props.

- [ ] **Step 1: Write the failing behavior test for the link configuration**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHermesWhatsAppUrl,
  isHermesWhatsAppHiddenPath,
} from "../src/components/HermesWhatsAppButton/config.mjs";

test("builds the approved WhatsApp conversation URL", () => {
  assert.equal(
    buildHermesWhatsAppUrl(),
    "https://wa.me/593999739534?text=Hola%2C%20quisiera%20obtener%20informaci%C3%B3n%20sobre%20los%20servicios%20de%20Undercodeec.",
  );
});

test("hides the Hermes entrypoint on internal route prefixes", () => {
  for (const pathname of ["/admin", "/admin/crm", "/contratos/123", "/recursos-humanos/solicitudes"]) {
    assert.equal(isHermesWhatsAppHiddenPath(pathname), true, pathname);
  }
  assert.equal(isHermesWhatsAppHiddenPath("/servicios"), false);
});
```

- [ ] **Step 2: Run the test to verify it fails because the component does not exist**

Run: `node --test tests/hermes-whatsapp-button.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/components/HermesWhatsAppButton/config.mjs`.

- [ ] **Step 3: Implement the minimal, self-contained component**

```jsx
"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { buildHermesWhatsAppUrl, isHermesWhatsAppHiddenPath } from "./config.mjs";

export default function HermesWhatsAppButton() {
  const pathname = usePathname();
  const isHiddenPath = isHermesWhatsAppHiddenPath(pathname);
  const whatsappUrl = buildHermesWhatsAppUrl();

  if (isHiddenPath) return null;

  const trackClick = () => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("trackCustom", "WhatsAppHermesClick", { source: "hermes_whatsapp_button", page_path: pathname || "/" });
    }
  };

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={trackClick} aria-label="Hablar con Hermes por WhatsApp">
      <FaWhatsapp aria-hidden="true" />
      <span>Hablar por WhatsApp</span>
    </a>
  );
}
```

Create `config.mjs` with this executable interface:

```js
const WHATSAPP_NUMBER = "593999739534";
const WHATSAPP_MESSAGE = "Hola, quisiera obtener información sobre los servicios de Undercodeec.";
const HIDDEN_PATH_PREFIXES = ["/admin", "/contratos", "/recursos-humanos"];

export const buildHermesWhatsAppUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const isHermesWhatsAppHiddenPath = (pathname) =>
  HIDDEN_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
```

Add fixed bottom-right visual styles to the link: green WhatsApp color, circular icon treatment, focus-visible outline, hover motion, and a responsive label. Keep the link as the only navigation mechanism; do not call `window.open` or any API.

- [ ] **Step 4: Run the component test to verify it passes**

Run: `node --test tests/hermes-whatsapp-button.test.mjs`

Expected: PASS with four successful subtests.

- [ ] **Step 5: Commit the independently verified component**

```powershell
git add src/components/HermesWhatsAppButton/index.jsx tests/hermes-whatsapp-button.test.mjs
git commit -m "feat: add Hermes WhatsApp button"
```

### Task 2: Mount Hermes globally and verify the assistant is no longer used

**Files:**

- Modify: `src/app/layout.tsx:1-7`
- Modify: `src/app/layout.tsx:297-302`
- Modify: `tests/hermes-whatsapp-button.test.mjs`

**Interfaces:**

- Consumes: default `HermesWhatsAppButton` from `@/components/HermesWhatsAppButton`.
- Produces: root layout renders `HermesWhatsAppButton` in public pages; `AIAssistant` is not imported or mounted.

- [ ] **Step 1: Extend the failing test with the root-layout integration contract**

```js
test("root layout mounts Hermes instead of the web AI assistant", async () => {
  const layout = await readFile("src/app/layout.tsx", "utf8");

  assert.match(layout, /import HermesWhatsAppButton from "@\/components\/HermesWhatsAppButton"/);
  assert.match(layout, /<HermesWhatsAppButton\s*\/>/);
  assert.doesNotMatch(layout, /import AIAssistant from "@\/components\/AIAssistant"/);
  assert.doesNotMatch(layout, /<AIAssistant\s*\/>/);
});
```

- [ ] **Step 2: Run the test to verify it fails against the current root layout**

Run: `node --test tests/hermes-whatsapp-button.test.mjs`

Expected: FAIL because `layout.tsx` still imports and renders `AIAssistant`.

- [ ] **Step 3: Replace only the global mount and import**

```tsx
import HermesWhatsAppButton from "@/components/HermesWhatsAppButton";
```

Replace the `AIAssistant` import with the import above, then replace `<AIAssistant />` with `<HermesWhatsAppButton />`. Do not edit `src/components/AIAssistant/index.jsx` or existing direct WhatsApp links elsewhere in the site.

- [ ] **Step 4: Run the static test and project checks**

Run: `node --test tests/hermes-whatsapp-button.test.mjs; pnpm lint; pnpm build`

Expected: the static test passes, ESLint exits with code 0, and Next.js completes an optimized production build.

- [ ] **Step 5: Commit the layout integration**

```powershell
git add src/app/layout.tsx tests/hermes-whatsapp-button.test.mjs
git commit -m "feat: route website conversations to Hermes WhatsApp"
```
