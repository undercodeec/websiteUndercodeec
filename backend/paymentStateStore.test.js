const test = require('node:test');
const assert = require('node:assert/strict');
const { createPaymentStateStore } = require('./paymentStateStore');

test('payment session accepts its token and rejects unrelated tokens', async () => {
  const store = createPaymentStateStore({ randomBytes: () => Buffer.alloc(32, 1) });
  const token = await store.issueSession('tx-1');

  assert.equal(await store.validateSession('tx-1', token), true);
  assert.equal(await store.validateSession('tx-1', 'b'.repeat(64)), false);
  assert.equal(await store.validateSession('tx-2', token), false);
});

test('payment session expires deterministically', async () => {
  let clock = 1_000;
  const store = createPaymentStateStore({ now: () => clock });
  const token = await store.issueSession('tx-expiring', 500);

  clock = 1_501;
  assert.equal(await store.validateSession('tx-expiring', token), false);
});

test('cleanup removes expired payment sessions and abandoned pending orders', async () => {
  let clock = 1_000;
  const store = createPaymentStateStore({
    now: () => clock,
    randomBytes: () => Buffer.alloc(32, 2),
  });
  const token = await store.issueSession('tx-cleanup', 500);
  await store.saveOrder('tx-cleanup', {
    email: 'cliente@example.com',
    __createdAt: clock,
  });

  clock = 1_600;
  await store.cleanup(500);

  assert.equal(await store.validateSession('tx-cleanup', token), false);
  assert.equal(await store.getOrder('tx-cleanup'), null);
});

test('pending order and webhook approval survive the in-memory workflow', async () => {
  const store = createPaymentStateStore();
  await store.saveOrder('tx-order', { email: 'cliente@example.com', __createdAt: Date.now() });
  await store.rememberApproval('tx-order', { transactionId: 'payphone-123' });

  assert.equal((await store.getOrder('tx-order')).email, 'cliente@example.com');
  assert.equal((await store.getApproval('tx-order')).transactionId, 'payphone-123');

  await store.deleteOrder('tx-order');
  assert.equal(await store.getOrder('tx-order'), null);
});

test('only one worker can claim an order until it is released', async () => {
  const store = createPaymentStateStore();
  await store.saveOrder('tx-claim', { email: 'cliente@example.com', __createdAt: Date.now() });

  assert.equal((await store.claimOrder('tx-claim')).email, 'cliente@example.com');
  assert.equal(await store.claimOrder('tx-claim'), null);

  await store.releaseOrder('tx-claim');
  assert.equal((await store.claimOrder('tx-claim')).email, 'cliente@example.com');
});
