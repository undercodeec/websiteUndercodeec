import { formatBillingPhone, getBillingCountry } from "./offbrand-wizard-flow.mjs";

const DEFAULT_API_URL = "https://api.undercodeec.com";
const RECAPTCHA_SCRIPT_ID = "offbrand-recaptcha-enterprise";
const CONSENT_STORAGE_KEY = "undercodeec_consent_v1";
const CONSENT_POLICY_VERSION = "2026-09-17";

let recaptchaScriptPromise;
let recaptchaSiteKeyPromise;

function normalizeBillingData(data) {
  return {
    ...data,
    telefono: formatBillingPhone(data.telefono, data.telefonoPais),
    paisNombre: getBillingCountry(data.pais)?.[1] || "",
  };
}

export function isTrustedPaymentMessage(event, paymentWindow, allowedOrigins) {
  return Boolean(paymentWindow && event?.source === paymentWindow && allowedOrigins.includes(event?.origin));
}

export function createPaymentPayload({ project, price, data }) {
  const basePayment = data.tipoPago === "anticipo" ? Math.round(price.price / 2) : price.price;
  const amount = Math.round(basePayment * 1.05);
  const planName = `${price.label} - ${data.tipoPago === "anticipo" ? "Anticipo 50%" : "Pago Total"}`;
  const billingData = normalizeBillingData(data);
  return {
    amount,
    planId: price.id,
    tipoPago: data.tipoPago,
    projectType: project,
    planName,
    orderData: { ...billingData, metodoPago: "tarjeta", planName: price.label, planPrice: price.price, amountPaid: amount },
  };
}

function getApiUrl() {
  return window.__OFFBRAND_API_URL || DEFAULT_API_URL;
}

async function getRecaptchaSiteKey() {
  if (window.__OFFBRAND_RECAPTCHA_SITE_KEY) return window.__OFFBRAND_RECAPTCHA_SITE_KEY;
  if (!recaptchaSiteKeyPromise) {
    recaptchaSiteKeyPromise = fetch(`${getApiUrl()}/api/public-config`)
      .then(async (response) => {
        if (!response.ok) throw new Error("No fue posible cargar la configuración de seguridad.");
        const { recaptchaSiteKey } = await response.json();
        if (!recaptchaSiteKey) throw new Error("ReCAPTCHA no está configurado en el servidor.");
        window.__OFFBRAND_RECAPTCHA_SITE_KEY = recaptchaSiteKey;
        return recaptchaSiteKey;
      })
      .catch((error) => {
        recaptchaSiteKeyPromise = undefined;
        throw error;
      });
  }
  return recaptchaSiteKeyPromise;
}

async function loadRecaptchaEnterprise(siteKey) {
  if (window.grecaptcha?.enterprise?.execute) return window.grecaptcha.enterprise;
  if (!recaptchaScriptPromise) {
    recaptchaScriptPromise = new Promise((resolve, reject) => {
      const script = document.getElementById(RECAPTCHA_SCRIPT_ID) || document.createElement("script");
      const complete = () => window.grecaptcha?.enterprise?.ready
        ? resolve(window.grecaptcha.enterprise)
        : reject(new Error("No fue posible inicializar ReCAPTCHA."));
      script.addEventListener("load", complete, { once: true });
      script.addEventListener("error", () => reject(new Error("No fue posible cargar ReCAPTCHA.")), { once: true });
      if (!script.isConnected) {
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(siteKey)}`;
        script.async = true;
        script.defer = true;
        document.head.append(script);
      } else if (window.grecaptcha?.enterprise?.ready) {
        complete();
      }
    }).catch((error) => {
      recaptchaScriptPromise = undefined;
      throw error;
    });
  }
  return recaptchaScriptPromise;
}

export async function getRecaptchaToken(action) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("ReCAPTCHA solo puede ejecutarse en el navegador.");
  }
  const siteKey = await getRecaptchaSiteKey();
  const enterprise = await loadRecaptchaEnterprise(siteKey);
  if (typeof enterprise.ready === "function") {
    await new Promise((resolve) => enterprise.ready(resolve));
  }
  const token = await enterprise.execute(siteKey, { action });
  if (!token) throw new Error("No fue posible completar la verificación de seguridad.");
  return token;
}

async function getApiError(response, fallback) {
  try {
    const payload = await response.json();
    return payload?.error || fallback;
  } catch {
    return fallback;
  }
}

function withContactAliases(data) {
  return {
    ...data,
    contactName: data.contactName || data.softwareNombre || data.razonSocial || "",
    contactEmail: data.contactEmail || data.softwareEmail || data.email || "",
    contactPhone: data.contactPhone || data.softwareTelefono || data.telefono || "",
  };
}

function measurementConsentIsGranted() {
  try {
    const preferences = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) || "null");
    return preferences?.policyVersion === CONSENT_POLICY_VERSION
      && (preferences.analytics === true || preferences.advertising === true);
  } catch {
    return false;
  }
}

function recordConfirmedPurchase(request, payment) {
  if (!payment?.clientTransactionId || !measurementConsentIsGranted()) return false;

  const payload = createPaymentPayload(request);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "purchase",
    ecommerce: {
      transaction_id: payment.clientTransactionId,
      value: payload.amount,
      currency: "USD",
      items: [{
        item_id: payload.planId,
        item_name: request.price.label,
        price: payload.amount,
        quantity: 1,
      }],
    },
  });
  return true;
}

export async function submitQuote(request) {
  const recaptchaToken = await getRecaptchaToken("WIZARD_GENERIC");
  const isGenericWizard = request.endpoint === "/api/save-wizard-data";
  let body;
  let headers;
  if (isGenericWizard) {
    body = new FormData();
    Object.entries(request.data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") body.append(key, Array.isArray(value) ? value.join(",") : value);
    });
    body.append("g-recaptcha-response", recaptchaToken);
  } else {
    body = JSON.stringify({ ...withContactAliases(request.data), recaptchaToken });
    headers = { "Content-Type": "application/json" };
  }
  const response = await fetch(`${getApiUrl()}${request.endpoint}`, { method: "POST", headers, body });
  if (!response.ok) throw new Error(await getApiError(response, "No fue posible enviar la solicitud."));
  return response;
}

export async function submitTransfer({ project, price, data }) {
  const billingData = normalizeBillingData(data);
  if (!data.comprobante) throw new Error("Adjunta el comprobante de transferencia.");

  const upload = new FormData();
  upload.append("voucher", data.comprobante);
  const uploadResponse = await fetch(`${getApiUrl()}/api/upload-voucher`, { method: "POST", body: upload });
  if (!uploadResponse.ok) throw new Error(await getApiError(uploadResponse, "No fue posible subir el comprobante."));
  const { voucherUrl } = await uploadResponse.json();
  if (!voucherUrl) throw new Error("El servidor no devolvió la ubicación del comprobante.");

  const recaptchaToken = await getRecaptchaToken("TRANSFERENCIA");
  const amountPaid = data.tipoPago === "anticipo" ? Math.round(price.price / 2) : price.price;
  const response = await fetch(`${getApiUrl()}/api/send-order-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recaptchaToken, orderData: { ...billingData, projectType: project, metodoPago: "transferencia", planName: price.label, planPrice: price.price, amountPaid, voucherUrl } }),
  });
  if (!response.ok) throw new Error(await getApiError(response, "No fue posible registrar la transferencia."));
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
    let completed = false;
    let pollingTimer;
    const cleanup = () => {
      window.removeEventListener("message", listener);
      if (pollingTimer) clearInterval(pollingTimer);
    };
    const completePayment = () => {
      if (completed) return;
      completed = true;
      cleanup();
      if (!popup.closed) popup.close();
      recordConfirmedPurchase(request, payment);
      onComplete(payment.clientTransactionId);
    };
    const listener = (event) => {
      if (!isTrustedPaymentMessage(event, popup, origins) || event.data?.type !== "PAYMENT_COMPLETED" || !event.data.success) return;
      completePayment();
    };
    window.addEventListener("message", listener);
    if (payment.paymentSessionToken) {
      const checkPaymentStatus = async () => {
        if (completed) return;
        try {
          const statusResponse = await fetch(`${getApiUrl()}/api/check-payment-status/${encodeURIComponent(payment.clientTransactionId)}`, {
            headers: { Authorization: `Bearer ${payment.paymentSessionToken}` },
          });
          if (!statusResponse.ok) return;
          const status = await statusResponse.json();
          if (status.success === true && status.status === "Approved") completePayment();
        } catch {
          // El siguiente ciclo vuelve a consultar mientras la ventana permanezca abierta.
        }
      };
      void checkPaymentStatus();
      pollingTimer = setInterval(checkPaymentStatus, 2000);
    }
  } catch (error) {
    onError(error);
  }
}
