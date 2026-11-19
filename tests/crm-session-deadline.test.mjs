import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingAdminTime, watchAdminDeadline } from '../src/lib/hermes/adminDeadline.mjs';

test('server deadline hides data at exact expiry; resume/offline cannot extend it', () => {
  const originalNow = Date.now;
  let now = 100_000;
  Date.now = () => now;
  let deadline;
  let expired = 0;
  const window = {
    setTimeout: (callback, ms) => { deadline = { callback, at: now + ms }; return 1; },
    clearTimeout: () => { deadline = null; },
  };
  try {
    const stop = watchAdminDeadline(window, now + 24 * 60 * 60 * 1000, () => expired++);
    now = deadline.at - 1;
    assert.equal(remainingAdminTime(deadline.at), 1);
    now++;
    deadline.callback();
    assert.equal(expired, 1);
    assert.equal(remainingAdminTime(deadline.at), 0);
    assert.equal(remainingAdminTime(undefined), 0);
    stop();
    watchAdminDeadline(window, now - 1, () => expired++);
    assert.equal(expired, 2);
  } finally { Date.now = originalNow; }
});
