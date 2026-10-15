import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('CRM offers 14 and 30 day presets within backend bounds and accepts 1 GiB', async () => {
  const source = await readFile(new URL('../src/app/admin/crm/administracion/retentionPolicyUi.js', import.meta.url), 'utf8');
  const { availableBackupIntervals, STORAGE_BUDGET_WARNING } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const options = availableBackupIntervals({ min: 6, max: 720 });
  assert.deepEqual(options.map(({ hours }) => hours), [12, 24, 48, 72, 168, 336, 720]);
  assert.equal(options.find(({ hours }) => hours === 336).label, '14 días');
  assert.equal(options.find(({ hours }) => hours === 720).label, '30 días');
  assert.equal(availableBackupIntervals({ min: 6, max: 168 }).some(({ hours }) => hours === 720), false);
  assert.match(STORAGE_BUDGET_WARNING, /límite máximo de backups gestionados/);
  assert.match(STORAGE_BUDGET_WARNING, /umbral de seguridad del servidor/);
  const component = await readFile(new URL('../src/app/admin/crm/administracion/RetentionRecovery.jsx', import.meta.url), 'utf8');
  assert.match(component, /Backups periódicos desactivados/);
  assert.match(component, /Comprobaciones periódicas de restore desactivadas/);
  assert.match(component, /min=\{data\.limits\[key\]\.min\}/);
});

test('CRM retention flow uses ADMIN Hermes endpoints with a bearer token and typed payload', async () => {
  const source = await readFile(new URL('../src/lib/hermes/api.js', import.meta.url), 'utf8');
  const { hermesApi } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const previousFetch = globalThis.fetch;
  const previousWindow = globalThis.window;
  const requests = [];
  globalThis.window = { sessionStorage: { getItem: () => 'synthetic-admin-jwt' } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, method: options.method || 'GET', body: options.body, authorization: options.headers.get('authorization') });
    return Response.json({
      policy: { backupEnabled: false, restoreCheckEnabled: false },
      limits: { backupIntervalHours: { min: 6, max: 720 }, maximumBackupStorageGiB: { min: 1, max: 1024 } },
      status: { nextBackupAt: null, nextRestoreCheckAt: null },
    });
  };
  try {
    const policy = {
      backupEnabled: false, backupIntervalHours: 336, maximumBackupCount: 4,
      maximumBackupAgeDays: 45, maximumBackupStorageGiB: 1,
      restoreCheckEnabled: false, restoreCheckIntervalDays: 60,
    };
    const initial = await hermesApi.retentionPolicy();
    assert.deepEqual(initial.limits.backupIntervalHours, { min: 6, max: 720 });
    assert.deepEqual(initial.limits.maximumBackupStorageGiB, { min: 1, max: 1024 });
    await hermesApi.previewRetentionRotation(policy);
    await hermesApi.updateRetentionPolicy(policy);
    assert.deepEqual(requests.map(({ url, method }) => [new URL(url, 'http://local.test').pathname, method]), [
      ['/api/hermes/admin/retention-recovery-policy', 'GET'],
      ['/api/hermes/admin/retention-recovery-policy/rotation-preview', 'POST'],
      ['/api/hermes/admin/retention-recovery-policy', 'PUT'],
    ]);
    assert.deepEqual(JSON.parse(requests[1].body), policy);
    assert.deepEqual(JSON.parse(requests[2].body), policy);
    assert.ok(requests.every(({ authorization }) => authorization === 'Bearer synthetic-admin-jwt'));
  } finally {
    globalThis.fetch = previousFetch;
    globalThis.window = previousWindow;
  }
});
