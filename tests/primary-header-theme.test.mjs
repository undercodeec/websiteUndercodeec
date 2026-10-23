import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("primary header logo becomes white in dark mode", async () => {
  const styles = await readFile("src/components/Primary/PrimaryHeader.module.css", "utf8");

  assert.match(
    styles,
    /:global\(html\.dark\)\s+\.brand\s+img\s*\{\s*filter:\s*brightness\(0\)\s+invert\(1\);/,
  );
});
