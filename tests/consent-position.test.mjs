import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("React privacy control stays at the lower left like the static landing", async () => {
  const css = await readFile(
    new URL("../src/components/Consent/ConsentManager.module.css", import.meta.url),
    "utf8",
  );
  const rule = css.match(/\.settingsToggle\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(rule, /left:\s*1rem;/);
  assert.match(rule, /right:\s*auto;/);
  assert.match(rule, /bottom:\s*1rem;/);
});
