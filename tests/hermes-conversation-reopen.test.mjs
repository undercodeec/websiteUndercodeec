import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const apiPath = new URL("../src/lib/hermes/api.js", import.meta.url);
const inboxPath = new URL("../src/app/admin/crm/inbox/page.jsx", import.meta.url);

test("Hermes API exposes the protected conversation reopen request", async () => {
  const source = await readFile(apiPath, "utf8");
  assert.match(source, /reopenConversation\(id\)/);
  assert.match(source, /conversations\/\$\{encodeURIComponent\(id\)\}\/reopen/);
  assert.match(source, /method: "PUT"/);
});

test("closed conversations expose a reopen action and block manual replies", async () => {
  const source = await readFile(inboxPath, "utf8");
  assert.match(source, /Reabrir con Hermes/);
  assert.match(source, /Hermes vuelve a atender con el contexto previo/);
  assert.match(source, /conversation\?\.status === "HANDED_OFF"/);
  assert.match(source, /disabled=\{!canReplyManually \|\| sending\}/);
});
