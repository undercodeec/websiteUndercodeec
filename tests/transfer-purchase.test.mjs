import assert from 'node:assert/strict';
import test from 'node:test';

import { recordApprovedTransferPurchase } from '../src/lib/analytics/transferPurchase.mjs';

test('records the approved transfer purchase only with measurement consent', (t) => {
  const originalWindow = globalThis.window;
  const dataLayer = [];
  globalThis.window = {
    localStorage: {
      getItem: () => JSON.stringify({
        policyVersion: '2026-09-17',
        analytics: true,
        advertising: false,
        updatedAt: new Date().toISOString(),
      }),
    },
    dataLayer,
  };
  t.after(() => { globalThis.window = originalWindow; });

  const recorded = recordApprovedTransferPurchase({
    event: 'purchase',
    ecommerce: {
      transaction_id: 'transfer-42',
      value: 180,
      currency: 'USD',
      items: [{ item_id: 'web-launch', item_name: 'Plan de Lanzamiento', price: 180, quantity: 1 }],
    },
  });

  assert.equal(recorded, true);
  assert.deepEqual(dataLayer, [{
    event: 'purchase',
    ecommerce: {
      transaction_id: 'transfer-42',
      value: 180,
      currency: 'USD',
      items: [{ item_id: 'web-launch', item_name: 'Plan de Lanzamiento', price: 180, quantity: 1 }],
    },
  }]);
});
