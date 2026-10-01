import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("queries PayPhone status through the documented client transaction route", async () => {
  const source = await readFile("backend/server.js", "utf8");

  assert.match(source, /api\/Sale\/client\/\$\{encodeURIComponent\(clientTxId\)\}/);
  assert.match(source, /api\/Sale\/client\/\$\{encodeURIComponent\(clientTransactionId\)\}/);
  assert.doesNotMatch(source, /api\/Sale\/ClientTransactionId\//);
});
