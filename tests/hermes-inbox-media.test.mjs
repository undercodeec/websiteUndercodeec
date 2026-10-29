import assert from 'node:assert/strict';
import test from 'node:test';
import { inboxMediaKind } from '../src/lib/hermes/inbox-media.mjs';

test('Inbox offers playback for customer and assistant audio messages', () => {
  assert.equal(inboxMediaKind({ sender: 'CONTACT', type: 'AUDIO' }), 'audio');
  assert.equal(inboxMediaKind({ sender: 'HERMES', type: 'AUDIO' }), 'audio');
});

test('Inbox keeps customer image and PDF attachments, but does not open unsupported senders', () => {
  assert.equal(inboxMediaKind({ sender: 'CONTACT', type: 'IMAGE' }), 'image');
  assert.equal(inboxMediaKind({ sender: 'CONTACT', type: 'DOCUMENT' }), 'document');
  assert.equal(inboxMediaKind({ sender: 'HUMAN', type: 'AUDIO' }), null);
  assert.equal(inboxMediaKind({ sender: 'HERMES', type: 'DOCUMENT' }), null);
  assert.equal(inboxMediaKind({ sender: 'CONTACT', type: 'TEXT' }), null);
});
