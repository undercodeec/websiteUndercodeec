const DEFAULT_API_URL = "https://api.undercodeec.com";

export function isTrustedPaymentMessage(event, paymentWindow, allowedOrigins) {
  return Boolean(paymentWindow && event?.source === paymentWindow && allowedOrigins.includes(event?.origin));
}

export function createPaymentPayload({ project, price, data }) {
  const basePayment = data.tipoPago === "anticipo" ? Math.round(price.price / 2) : price.price;
  const amount = Math.round(basePayment * 1.05);
  const planName = `${price.label} - ${data.tipoPago === "anticipo" ? "Anticipo 50%" : "Pago Total"}`;
  return {
    amount,
    planId: price.id,
    tipoPago: data.tipoPago,
    projectType: project,
    planName,
    orderData: { ...data, metodoPago: "tarjeta", planName: price.label, planPrice: price.price, amountPaid: amount },
  };
}

function getApiUrl() {
  return window.__OFFBRAND_API_URL || DEFAULT_API_URL;
}

export async function submitQuote(request) {
  const isGenericWizard = request.endpoint === "/api/save-wizard-data";
  let body;
  let headers;
  if (isGenericWizard) {
    body = new FormData();
    Object.entries(request.data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") body.append(key, Array.isArray(value) ? value.join(",") : value);
    });
  } else {
    body = JSON.stringify(request.data);
    headers = { "Content-Type": "application/json" };
  }
  const response = await fetch(`${getApiUrl()}${request.endpoint}`, { method: "POST", headers, body });
  if (!response.ok) throw new Error("No fue posible enviar la solicitud.");
  return response;
}

export async function submitTransfer({ project, price, data }) {
  let voucherUrl = null;
  if (data.comprobante) {
    const upload = new FormData();
    upload.append("voucher", data.comprobante);
    const uploadResponse = await fetch(`${getApiUrl()}/api/upload-voucher`, { method: "POST", body: upload });
    if (!uploadResponse.ok) throw new Error("No fue posible subir el comprobante.");
    voucherUrl = (await uploadResponse.json()).voucherUrl;
  }
  const amountPaid = data.tipoPago === "anticipo" ? Math.round(price.price / 2) : price.price;
  const response = await fetch(`${getApiUrl()}/api/send-order-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderData: { ...data, projectType: project, metodoPago: "transferencia", planName: price.label, planPrice: price.price, amountPaid, voucherUrl } }),
  });
  if (!response.ok) throw new Error("No fue posible registrar la transferencia.");
}

export async function openPayment(request, onComplete, onError) {
  try {
    const payload = createPaymentPayload(request);
    const response = await fetch(`${getApiUrl()}/api/create-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("No fue posible iniciar el pago.");
    const payment = await response.json();
    const popup = window.open(payment.paymentUrl, "PayPhonePayment", "width=600,height=700,resizable=yes,scrollbars=yes");
    if (!popup) throw new Error("El navegador bloqueó la ventana de pago.");
    const origins = ["https://pay.payphonetodoesposible.com", "https://api.undercodeec.com", window.location.origin];
    const listener = (event) => {
      if (!isTrustedPaymentMessage(event, popup, origins) || event.data?.type !== "PAYMENT_COMPLETED" || !event.data.success) return;
      window.removeEventListener("message", listener);
      popup.close();
      onComplete(payment.clientTransactionId);
    };
    window.addEventListener("message", listener);
  } catch (error) {
    onError(error);
  }
}
