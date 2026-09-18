import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("limits admin routes to the CRM subdomain in production", async () => {
  const layout = await readFile("src/app/admin/layout.jsx", "utf8");

  assert.match(layout, /from "next\/headers"/);
  assert.match(layout, /from "next\/navigation"/);
  assert.match(layout, /const CRM_HOST = "admincrm\.undercodeec\.com"/);
  assert.match(layout, /process\.env\.NODE_ENV === "production"/);
  assert.match(layout, /await headers\(\)/);
  assert.match(layout, /host !== CRM_HOST\) notFound\(\)/);
});
