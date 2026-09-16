import assert from "node:assert/strict";
import test from "node:test";

let buildMarketingPayload;
let isMarketingSubmissionSuccessful;

try {
  ({ buildMarketingPayload, isMarketingSubmissionSuccessful } = await import(
    "../src/components/Marketing/marketingForm.mjs"
  ));
} catch {
  // The first run documents the missing backend contract before implementation.
}

test("maps the visible marketing form to the backend contract", () => {
  assert.deepEqual(
    buildMarketingPayload?.({
      nombre: "Ada",
      empresa: "Analytical Engines",
      ruc: "1234567890",
      telefono: "+593999999999",
      email: "ada@example.com",
      presupuesto: "Necesito una campaña SEO",
      terms: true,
    }, "captcha-token"),
    {
      nombre: "Ada",
      empresa: "Analytical Engines",
      ruc: "1234567890",
      telefono: "+593999999999",
      email: "ada@example.com",
      objetivo: "Necesito una campaña SEO",
      plan: "Por definir",
      recaptchaToken: "captcha-token",
    },
  );
});

test("accepts the success shape returned by send-marketing", () => {
  assert.equal(isMarketingSubmissionSuccessful?.(true, { success: true }), true);
  assert.equal(isMarketingSubmissionSuccessful?.(true, { status: "success" }), true);
  assert.equal(isMarketingSubmissionSuccessful?.(false, { success: true }), false);
});
