export function buildMarketingPayload(formData, recaptchaToken) {
  return {
    nombre: formData.nombre,
    empresa: formData.empresa,
    ruc: formData.ruc,
    telefono: formData.telefono,
    email: formData.email,
    objetivo: formData.presupuesto,
    plan: "Por definir",
    recaptchaToken,
  };
}

export function isMarketingSubmissionSuccessful(responseOk, data) {
  return responseOk && (data?.success === true || data?.status === "success");
}
