import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { updatePromotionAndVerify } from '../src/lib/hermes/promotion-workflow.mjs';

test('only a persisted promotion state is reported as saved', async () => {
  const calls = [];
  const api = {
    updatePriceListStatus: async (id, isActive) => { calls.push(['put', id, isActive]); return { isActive }; },
    priceList: async (id) => { calls.push(['get', id]); return { id, isPromotion: true, isActive: true }; },
  };
  const saved = await updatePromotionAndVerify(api, { id: 'synthetic', isPromotion: true, isActive: false }, true);
  assert.equal(saved.isActive, true);
  assert.deepEqual(calls, [['put', 'synthetic', true], ['get', 'synthetic']]);
});

test('a stale read after HTTP success is reported as an error', async () => {
  const api = {
    updatePriceListStatus: async () => ({ isActive: true }),
    priceList: async () => ({ id: 'synthetic', isPromotion: true, isActive: false }),
  };
  await assert.rejects(updatePromotionAndVerify(api, { id: 'synthetic', isPromotion: true }, true), /no se pudo verificar/i);
});

test('base tariffs cannot be changed by the promotion workflow', async () => {
  let called = false;
  const api = { updatePriceListStatus: async () => { called = true; } };
  await assert.rejects(updatePromotionAndVerify(api, { id: 'base', isPromotion: false }, true), /promociones/i);
  assert.equal(called, false);
});

test('Hermes API sends only isActive in the authorized PUT', async () => {
  const source = await readFile(new URL('../src/lib/hermes/api.js', import.meta.url), 'utf8');
  const { hermesApi } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const requests = [];
  globalThis.window = { sessionStorage: { getItem: () => 'synthetic-token' } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ isActive: true }) };
  };
  try {
    await hermesApi.updatePriceListStatus('promo-1', true);
    assert.match(requests[0].url, /\/price-lists\/promo-1$/);
    assert.equal(requests[0].options.method, 'PUT');
    assert.deepEqual(JSON.parse(requests[0].options.body), { isActive: true });
    assert.equal(requests[0].options.headers.get('Authorization'), 'Bearer synthetic-token');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
  }
});

test('configuration navigation exposes the tariffs route to administrators', async () => {
  const source = await readFile(new URL('../src/app/admin/crm/_components/CrmShell.jsx', import.meta.url), 'utf8');
  assert.match(source, /\/admin\/crm\/configuracion\/tarifas/);
  assert.match(source, /Tarifas y promociones/);
  assert.match(source, /adminOnly: true/);
});
