// Empty optional inputs must not become zero-valued commercial facts.
export function advertisingEventPayload(eventType, form) {
  const occurredAt = String(form.get("occurredAt") || "");
  const value = String(form.get("value") || "").trim();
  const revenueReceived = String(form.get("revenueReceived") || "").trim();
  const currency = String(form.get("currency") || "").trim();
  const commercialReference = String(form.get("commercialReference") || "").trim();
  const serviceRequested = String(form.get("serviceRequested") || "").trim();
  if ([value, revenueReceived].some((amount) => amount && (!Number.isFinite(Number(amount)) || Number(amount) < 0))) {
    throw new Error("Los importes deben ser números válidos no negativos.");
  }
  const validCurrency = /^[A-Z]{3}$/.test(currency) && Intl.supportedValuesOf("currency").includes(currency);
  if (eventType === "CONTRACT_WON" && (value || revenueReceived || commercialReference)) {
    if (!value || !Number.isFinite(Number(value)) || Number(value) <= 0 || !validCurrency || !commercialReference) {
      throw new Error("Para registrar datos del contrato, indica un importe contratado mayor que cero, una moneda y una referencia verificable. También puedes dejar los datos comerciales vacíos.");
    }
  } else if ((value || revenueReceived) && !validCurrency) {
    throw new Error("Selecciona una moneda para los importes indicados.");
  }
  return {
    eventType,
    ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}),
    ...(value ? { value: Number(value) } : {}),
    ...(revenueReceived ? { revenueReceived: Number(revenueReceived) } : {}),
    ...((value || revenueReceived) ? { currency } : {}),
    ...(commercialReference ? { commercialReference } : {}),
    ...(serviceRequested ? { serviceRequested } : {}),
  };
}

export function advertisingEventSuccessMessage(result) {
  if (result?.conversionCreated === false && result?.reason === "FIRST_PURCHASE_ALREADY_RECORDED") {
    return "Compra registrada; no se creó otra conversión porque la primera compra ya estaba registrada.";
  }
  return "Hito comercial registrado y auditado.";
}
