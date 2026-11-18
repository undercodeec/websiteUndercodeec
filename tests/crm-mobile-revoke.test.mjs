import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const apiSource = await readFile(new URL("../src/lib/hermes/api.js", import.meta.url), "utf8");
const { hermesApi, HermesApiError } = await import(
  `data:text/javascript;base64,${Buffer.from(apiSource).toString("base64")}`
);

test("revoke-all uses the current Hermes web JWT only when invoked", async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.window = {
    sessionStorage: { getItem: (key) => key === "hermesCrmToken" ? "web-jwt" : null },
    localStorage: { getItem: () => "admin-jwt" },
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ revoked: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    assert.equal(calls.length, 0);
    await hermesApi.revokeAllMobileAccess();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/api/hermes/auth/mobile/revoke-all");
    assert.equal(calls[0].options.method, "POST");
    assert.equal(calls[0].options.cache, "no-store");
    assert.equal(calls[0].options.headers.get("Authorization"), "Bearer web-jwt");
    assert.equal(calls[0].options.body, undefined);
    assert.equal(calls[0].options.headers.has("Content-Type"), false);
  } finally {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  }
});

test("revoke-all rejects a failed Hermes request without silently succeeding", async () => {
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  globalThis.window = { sessionStorage: { getItem: () => "web-jwt" } };
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "Forbidden" }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });

  try {
    await assert.rejects(hermesApi.revokeAllMobileAccess(), (error) => {
      assert.ok(error instanceof HermesApiError);
      assert.equal(error.status, 403);
      return true;
    });
  } finally {
    globalThis.window = originalWindow;
    globalThis.fetch = originalFetch;
  }
});

test("administration limits the action to ADMIN with explicit confirmation and accessible feedback", async () => {
  const page = await readFile(new URL("../src/app/admin/crm/administracion/page.jsx", import.meta.url), "utf8");
  const revokePanel = page.slice(page.indexOf("function MobileAccessRevoke()"), page.indexOf("function BankAccounts()"));
  assert.match(revokePanel, /user\?\.role !== 'ADMIN'\) return null/);
  assert.match(revokePanel, /status !== 'confirm' \|\| requestInProgress\.current/);
  assert.match(revokePanel, /await hermesApi\.revokeAllMobileAccess\(\)/);
  assert.match(revokePanel, /onClick=\{confirmRevoke\}/);
  assert.match(revokePanel, /onClick=\{\(\) => setStatus\('confirm'\)\}/);
  assert.match(revokePanel, /onClick=\{\(\) => setStatus\('idle'\)\}/);
  assert.match(revokePanel, /role="status" aria-live="polite"/);
  assert.match(revokePanel, /role="alert"/);
  assert.match(revokePanel, /Tu sesión web del CRM sigue abierta/);
  assert.doesNotMatch(revokePanel, /user\?\.(email|phone)/);
});
