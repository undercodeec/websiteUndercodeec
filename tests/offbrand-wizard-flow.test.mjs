import assert from "node:assert/strict";
import test from "node:test";

import {
  createWizardState,
  getRoute,
  validateStep,
} from "../public/landing-primary/js/offbrand-wizard-flow.mjs";

test("returns the Website price, business and billing route", () => {
  const state = createWizardState("Sitio Web");

  assert.deepEqual(
    getRoute("Sitio Web", state).map(({ id }) => id),
    ["price", "business", "billing"],
  );
  assert.equal(validateStep("Sitio Web", "price", state), false);
});

test("routes Moodle standard projects to payment and institutional projects to submission", () => {
  const standard = {
    ...createWizardState("Plataforma de cursos Moodle"),
    moodleUsuarios: "bajo",
    moodleClases: "asincronicas",
    moodleDiseno: "estandar",
  };
  const institutional = { ...standard, moodleUsuarios: "alto" };

  assert.equal(getRoute("Plataforma de cursos Moodle", standard).at(-1).id, "payment");
  assert.equal(getRoute("Plataforma de cursos Moodle", institutional).at(-1).id, "submit");
});
