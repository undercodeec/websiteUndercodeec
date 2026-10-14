import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('CRM retention flow uses ADMIN Hermes endpoints with a bearer token and typed payload', async () => {
  const source = await readFile(new URL('../src/lib/hermes/api.js', import.meta.url), 'utf8');
  const { hermesApi } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const previousFetch = globalThis.fetch;
  const previousWindow = globalThis.window;
  const requests = [];
  globalThis.window = { sessionStorage: { getItem: () => 'synthetic-admin-jwt' } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url, method: options.method || 'GET', body: options.body, authorization: options.headers.get('authorization') });
    return Response.json({ ok: true });
  };
  try {
    const policy = {
      backupEnabled: false, backupIntervalHours: 12, maximumBackupCount: 4,
      maximumBackupAgeDays: 30, maximumBackupStorageGiB: 40,
      restoreCheckEnabled: false, restoreCheckIntervalDays: 60,
    };
    await hermesApi.retentionPolicy();
    await hermesApi.previewRetentionRotation(policy);
    await hermesApi.updateRetentionPolicy(policy);
    await hermesApi.runBackupNow();
    await hermesApi.runRestoreCheckNow();
    assert.deepEqual(requests.map(({ url, method }) => [new URL(url, 'http://local.test').pathname, method]), [
      ['/api/hermes/admin/retention-recovery-policy', 'GET'],
      ['/api/hermes/admin/retention-recovery-policy/rotation-preview', 'POST'],
      ['/api/hermes/admin/retention-recovery-policy', 'PUT'],
      ['/api/hermes/admin/retention-recovery-policy/backup', 'POST'],
      ['/api/hermes/admin/retention-recovery-policy/restore-check', 'POST'],
    ]);
    assert.deepEqual(JSON.parse(requests[1].body), policy);
    assert.deepEqual(JSON.parse(requests[2].body), policy);
    assert.ok(requests.every(({ authorization }) => authorization === 'Bearer synthetic-admin-jwt'));
  } finally {
    globalThis.fetch = previousFetch;
    globalThis.window = previousWindow;
  }
});
