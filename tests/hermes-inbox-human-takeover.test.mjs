import assert from 'node:assert/strict';
import test from 'node:test';
import { startHumanTakeover } from '../src/lib/hermes/human-takeover.mjs';

test('creating human control takes the pending handoff before enabling the operator', async () => {
  const calls = [];
  const api = {
    createHandoff: async (...args) => {
      calls.push(['create', ...args]);
      return { id: 'handoff-1', status: 'PENDING', assignedAgentId: null };
    },
    takeHandoff: async (id) => {
      calls.push(['take', id]);
    },
  };

  const result = await startHumanTakeover(api, {
    conversationId: 'conversation-1',
    reason: 'CUSTOM',
    reasonDetail: 'Seguimiento manual',
    userId: 'operator-1',
  });

  assert.equal(result.taken, true);
  assert.deepEqual(calls, [
    ['create', 'conversation-1', 'CUSTOM', 'Seguimiento manual'],
    ['take', 'handoff-1'],
  ]);
});

test('a failed take keeps the created handoff available for retry', async () => {
  const takeError = new Error('Temporary conflict');
  const api = {
    createHandoff: async () => ({ id: 'handoff-1', status: 'PENDING', assignedAgentId: null }),
    takeHandoff: async () => { throw takeError; },
  };

  const result = await startHumanTakeover(api, {
    conversationId: 'conversation-1', reason: 'CUSTOM', reasonDetail: 'Manual', userId: 'operator-1',
  });
  assert.equal(result.taken, false);
  assert.equal(result.handoff.id, 'handoff-1');
  assert.equal(result.takeError, takeError);
});

test('an existing handoff owned by another operator is never reassigned', async () => {
  let takeCalled = false;
  const result = await startHumanTakeover({
    createHandoff: async () => ({ id: 'handoff-1', status: 'IN_PROGRESS', assignedAgentId: 'operator-2' }),
    takeHandoff: async () => { takeCalled = true; },
  }, {
    conversationId: 'conversation-1', reason: 'CUSTOM', reasonDetail: 'Manual', userId: 'operator-1',
  });
  assert.equal(result.assignedElsewhere, true);
  assert.equal(takeCalled, false);
});
