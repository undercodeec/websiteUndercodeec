import assert from "node:assert/strict";
import test from "node:test";

import { presentHermesIncident } from "../src/lib/hermes/incidents.mjs";

test("presents a provider failure that needs human review as an actionable CRM alert", () => {
  const presentation = presentHermesIncident(
    {
      category: "PROVIDER_ERROR",
      code: "PROVIDER_UNAVAILABLE",
      summary: "El proveedor no respondió después de dos intentos.",
      attempts: 2,
      recovered: false,
      requiresHumanReview: true,
      occurredAt: "2026-09-20T20:15:00.000Z",
    },
    {
      id: "task-17",
      title: "Revisar incidencia de Hermes",
      status: "PENDING",
    },
  );

  assert.deepEqual(presentation, {
    categoryLabel: "Error del proveedor",
    code: "PROVIDER_UNAVAILABLE",
    summary: "El proveedor no respondió después de dos intentos.",
    attemptsLabel: "2 intentos",
    occurredAt: "2026-09-20T20:15:00.000Z",
    tone: "review",
    statusLabel: "Revisión humana pendiente",
    taskLabel: "Revisar incidencia de Hermes · Pendiente",
  });
});

test("presents a recovered policy incident without claiming that review is pending", () => {
  const presentation = presentHermesIncident({
    category: "POLICY_VIOLATION",
    code: "UNAUTHORIZED_PRICE",
    summary: "Se reemplazó una cifra no autorizada por una respuesta segura.",
    attempts: 1,
    recovered: true,
    requiresHumanReview: false,
    occurredAt: "2026-09-20T20:20:00.000Z",
  });

  assert.equal(presentation.categoryLabel, "Política comercial");
  assert.equal(presentation.tone, "recovered");
  assert.equal(presentation.statusLabel, "Recuperada automáticamente");
  assert.equal(presentation.taskLabel, null);
  assert.equal(presentation.attemptsLabel, "1 intento");
});

test("does not render an alert when the conversation has no Hermes incident", () => {
  assert.equal(presentHermesIncident(null), null);
});
