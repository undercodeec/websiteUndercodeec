import test from 'node:test';
import assert from 'node:assert/strict';

// Run against test/fixtures/crm-calendar-server.cjs and a local Next instance.
// Opt-in so the regular suite never requests a running server or real CRM.
const base = process.env.CALENDAR_QA_PROXY_URL;
test('real Next proxy forwards auth, filters and UTC meeting contract without credentials in its response', { skip: !base }, async () => {
  const session = await (await fetch(`${base}/qa-session/`)).json();
  const query = new URLSearchParams({ from: '2026-09-28T05:00:00Z', to: '2026-10-05T05:00:00Z' });
  const headers = { Authorization: `Bearer ${session.accessToken}` };
  const response = await fetch(`${base}/meetings/?${query}`, { headers });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const payload = await response.json();
  assert.equal(payload.data.length, 5);
  assert.deepEqual(payload.range, { from: '2026-09-28T05:00:00.000Z', to: '2026-10-05T05:00:00.000Z' });
  assert.deepEqual(new Set(payload.data.map((meeting) => meeting.status)), new Set(['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED']));
  assert.equal(new Set(payload.data.map((meeting) => meeting.timezone)).size, 3);
  assert.equal(payload.data.find((meeting) => meeting.status === 'PENDING').lead, null);
  assert.equal(payload.data.find((meeting) => meeting.status === 'PENDING').meetUrl, null);
  assert.doesNotMatch(JSON.stringify(payload), /synthetic-calendar-qa-secret|accessToken|refreshToken|googleEventId|calendarId/);
  query.set('status', 'PENDING');
  const filtered = await (await fetch(`${base}/meetings/?${query}`, { headers })).json();
  assert.equal(filtered.data.length, 1);
  assert.equal(filtered.data[0].status, 'PENDING');
  query.set('timezone', 'America/Guayaquil');
  assert.equal((await (await fetch(`${base}/meetings/?${query}`, { headers })).json()).data.length, 0);
  query.set('status', 'invalid');
  assert.equal((await fetch(`${base}/meetings/?${query}`, { headers })).status, 400);
  assert.equal((await fetch(`${base}/meetings/?${query}`)).status, 401);
});
