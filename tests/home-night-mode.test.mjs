import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("root header logo becomes white in dark mode", async () => {
  const [styles, page] = await Promise.all([
    readFile("public/landing-primary/css/home-night-mode.css", "utf8"),
    readFile("public/landing-primary/index.html", "utf8"),
  ]);

  assert.match(
    styles,
    /html\.dark\s+\.hud-brand-logo\s*\{\s*filter:\s*brightness\(0\)\s+invert\(1\);/,
  );
  assert.match(page, /home-night-mode\.css\?v=20261023-header-logo-white/);
});
