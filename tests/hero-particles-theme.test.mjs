import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("hero particle canvas becomes white in dark mode", async () => {
  const styles = await readFile("public/landing-primary/css/hero-particles.css", "utf8");

  assert.match(
    styles,
    /html\.dark\s+\.hero-particles\s+canvas\s*\{\s*filter:\s*grayscale\(1\)\s+brightness\(0\)\s+invert\(1\);/,
  );
});
