import test from "node:test";
import assert from "node:assert/strict";

import { customerMessageEventsFromConversations } from "../src/lib/hermes/realtime.mjs";

function conversation(id, message) {
  return {
    id,
    contactId: `contact-${id}`,
    contact: { name: `Cliente ${id}` },
    messages: message ? [message] : [],
  };
}

test("the initial polling snapshot does not emit old customer messages", () => {
  const result = customerMessageEventsFromConversations(
    [conversation("1", { id: "m1", sender: "CONTACT", content: "Hola" })],
    null,
  );

  assert.equal(result.events.length, 0);
  assert.equal(result.nextMessageIds.get("1"), "m1");
});

test("polling emits a new inbound message from any recent conversation", () => {
  const result = customerMessageEventsFromConversations(
    [
      conversation("1", {
        id: "m2",
        sender: "CONTACT",
        content: "Quiero continuar",
        type: "TEXT",
        createdAt: "2026-09-19T12:00:00.000Z",
      }),
    ],
    new Map([["1", "m1"]]),
  );

  assert.deepEqual(result.events[0], {
    messageId: "m2",
    conversationId: "1",
    contactId: "contact-1",
    contactName: "Cliente 1",
    content: "Quiero continuar",
    messageType: "TEXT",
    createdAt: "2026-09-19T12:00:00.000Z",
  });
});

test("polling ignores outbound Hermes messages", () => {
  const result = customerMessageEventsFromConversations(
    [conversation("1", { id: "m2", sender: "HERMES", content: "Respuesta" })],
    new Map([["1", "m1"]]),
  );

  assert.equal(result.events.length, 0);
});

test("polling emits a newly created conversation after initialization", () => {
  const result = customerMessageEventsFromConversations(
    [conversation("2", { id: "m2", sender: "CONTACT", content: "Hola" })],
    new Map([["1", "m1"]]),
  );

  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].conversationId, "2");
});
