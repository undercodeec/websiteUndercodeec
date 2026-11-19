const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAdminSessions, ADMIN_IDLE_TIMEOUT_MS: DAY } = require('./adminSessions');

test('automatic reads cannot renew a session; exactly 24h idle expires', () => {
  let time = 100_000;
  const sessions = createAdminSessions({ now: () => time });
  const token = sessions.create('operator@example.test');
  assert.equal(token.length, 64);
  assert.equal(sessions.get(token).expiresAt, time + DAY);
  time += DAY - 1;
  assert.equal(sessions.get(token).email, 'operator@example.test');
  assert.equal(sessions.get(token).expiresAt, 100_000 + DAY);
  sessions.cleanup();
  time += 1;
  assert.equal(sessions.get(token), null);
  assert.equal(sessions.recordHumanActivity(token), false);
});

test('human activity extends indefinitely with no absolute lifetime cap', () => {
  let time = 100_000;
  const sessions = createAdminSessions({ now: () => time });
  const token = sessions.create('operator@example.test');
  for (let day = 0; day < 40; day++) {
    time += DAY - 1;
    assert.equal(sessions.recordHumanActivity(token), true);
    assert.equal(sessions.get(token).expiresAt, time + DAY);
    sessions.cleanup();
  }
  assert.equal(sessions.get(token).email, 'operator@example.test');
  sessions.delete(token);
  assert.equal(sessions.get(token), null);
});

test('unknown and malformed session activity fail closed', () => {
  let time = 100_000;
  const sessions = createAdminSessions({ now: () => time });
  assert.equal(sessions.recordHumanActivity('missing'), false);
  const token = sessions.create('operator@example.test');
  time -= 1;
  assert.equal(sessions.get(token), null);
});
