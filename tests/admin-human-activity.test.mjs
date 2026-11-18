import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listenForAdminHumanActivity } from '../src/lib/adminHumanActivity.mjs';

test('only trusted visible human input sends activity, throttled without polling', async () => {
  const listeners = new Map();
  const document = {
    hidden: false,
    addEventListener(name, handler) { listeners.set(name, handler); },
    removeEventListener(name) { listeners.delete(name); },
  };
  let time = 100_000;
  let calls = 0;
  const stop = listenForAdminHumanActivity(document, () => { calls++; }, () => time);
  const input = (type, props = {}) => listeners.get(type)({ type, isTrusted: true, ...props });
  input('pointerdown', { isTrusted: false });
  input('keydown', { repeat: true });
  document.hidden = true;
  input('pointerdown');
  document.hidden = false;
  assert.equal(calls, 0);
  input('pointerdown');
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  input('keydown');
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  time += 60_000;
  input('keydown');
  await new Promise(setImmediate);
  assert.equal(calls, 2);
  time += 24 * 60 * 60 * 1000; // locked screen / idle does not emit anything
  assert.equal(calls, 2);
  stop();
  assert.equal(listeners.size, 0);
});

test('failed activity transmission retries only after another trusted gesture', async () => {
  const listeners = new Map();
  const document = {
    hidden: false,
    addEventListener(name, handler) { listeners.set(name, handler); },
    removeEventListener(name) { listeners.delete(name); },
  };
  let calls = 0;
  const stop = listenForAdminHumanActivity(document, () => {
    calls++;
    if (calls === 1) throw new Error('offline');
  });
  listeners.get('pointerdown')({ type: 'pointerdown', isTrusted: true });
  await new Promise(setImmediate);
  assert.equal(calls, 1);
  listeners.get('keydown')({ type: 'keydown', isTrusted: true, repeat: false });
  await new Promise(setImmediate);
  assert.equal(calls, 2);
  stop();
});
