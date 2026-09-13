import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  getPlanProjectFromSearch,
} from "../public/landing-primary/js/plan-selector.mjs";

test("accepts only project types supported by the root wizard", () => {
  for (const project of [
    "Sitio Web",
    "Desarrollo de Software",
    "Tienda Online",
    "Landing Page",
    "Aplicación Web",
    "Aplicación Móvil",
    "Plataforma de cursos Moodle",
  ]) {
    const search = `?${new URLSearchParams({ project }).toString()}`;
    assert.equal(getPlanProjectFromSearch(search), project);
  }

  assert.equal(getPlanProjectFromSearch("?project=unknown"), "");
});

test("uses buttons for plan options so the legacy runtime cannot navigate their href", async () => {
  const page = await readFile("public/landing-primary/index.html", "utf8");
  const plansStart = page.indexOf("data-demo-plans-section");
  const plansEnd = page.indexOf('<section data-hide="tab"', plansStart);
  const plansSection = page.slice(plansStart, plansEnd);

  assert.equal(
    (plansSection.match(/<button type="button" class="offbrand-project-option">/g) ?? []).length,
    7,
  );
  assert.doesNotMatch(plansSection, /<a href="\/#planes" class="offbrand-project-option">/);
});
