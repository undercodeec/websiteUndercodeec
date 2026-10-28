import assert from 'node:assert/strict';
import test from 'node:test';
import { originLabel, safeAdId, acquisitionRange, acquisitionToday } from '../src/lib/hermes/meta-attribution.mjs';

test('origin labels preserve verified organic and unknown as different cases', () => {
  assert.equal(originLabel('meta_ad'), 'Meta Ads');
  assert.equal(originLabel('organic'), 'Publicación orgánica');
  assert.equal(originLabel('unknown'), 'Sin atribución');
  assert.equal(originLabel('unexpected'), 'Sin atribución');
  assert.equal(safeAdId('123456789'), '123456789');
  assert.equal(safeAdId(null), null);
});

test('acquisition date presets use inclusive Ecuador calendar dates', () => {
  assert.equal(acquisitionToday(new Date('2026-10-29T02:00:00.000Z')), '2026-10-28');
  assert.deepEqual(acquisitionRange('today', '2026-10-28'), { from: '2026-10-28', to: '2026-10-28' });
  assert.deepEqual(acquisitionRange('7d', '2026-10-28'), { from: '2026-10-22', to: '2026-10-28' });
  assert.deepEqual(acquisitionRange('30d', '2026-03-01'), { from: '2026-01-31', to: '2026-03-01' });
});
