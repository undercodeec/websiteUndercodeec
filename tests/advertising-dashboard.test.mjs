import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("adds the advertising attribution area to the authenticated CRM", async () => {
  const [shell, api, page, leadPage] = await Promise.all([
    readFile("src/app/admin/crm/_components/CrmShell.jsx", "utf8"),
    readFile("src/lib/hermes/api.js", "utf8"),
    readFile("src/app/admin/crm/publicidad/page.jsx", "utf8"),
    readFile("src/app/admin/crm/leads/[id]/page.jsx", "utf8"),
  ]);

  assert.match(shell, /href: "\/admin\/crm\/publicidad"/);
  assert.match(shell, /label: "Publicidad y atribución"/);
  assert.match(shell, /hermes-crm-sidebar-collapsed/);
  assert.match(shell, /aria-controls="crm-sidebar"/);
  assert.match(shell, /Mostrar navegación lateral/);
  assert.match(api, /advertisingDashboard\(params\)/);
  assert.match(api, /request\(`\/advertising\/dashboard/);
  assert.match(api, /advertisingStatus\(\)/);
  assert.match(api, /updateAdvertisingIntegration\(data\)/);
  assert.match(api, /advertisingMappings\(\)/);
  assert.match(api, /syncAdvertisingMetrics\(data\)/);
  assert.match(api, /advertisingLeadHistory\(id\)/);
  assert.match(api, /recordAdvertisingEvent\(id, data\)/);
  assert.match(api, /revokeAdvertisingConsent\(contactId, reason\)/);
  assert.match(page, /Modo seguro:/);
  assert.match(page, /Mapeo de conversiones/);
  assert.match(page, /Métricas por campaña/);
  assert.match(page, /No disponible/);
  assert.doesNotMatch(page, /fetch\([^)]*google/i);
  assert.match(leadPage, /Atribución e hitos verificables/);
  assert.match(leadPage, /MEETING_CONFIRMED/);
  assert.match(leadPage, /CONTRACT_WON/);
  assert.match(leadPage, /Revocar consentimiento/);
});

test("uses the deployed Hermes contact-intent contract in the BFF", async () => {
  const route = await readFile("src/app/api/attribution/whatsapp/route.ts", "utf8");

  assert.match(route, /\/advertising\/contact-intents/);
  assert.match(route, /"X-Hermes-Attribution-Key": integrationKey/);
  assert.match(route, /process\.env\.HERMES_ATTRIBUTION_KEY/);
  assert.match(route, /toHermesContactIntent\(validation\.value, origin\)/);
  assert.doesNotMatch(route, /Authorization:/);
  assert.doesNotMatch(route, /Idempotency-Key/);
});
