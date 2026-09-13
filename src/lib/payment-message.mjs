export function isTrustedPaymentMessage(event, paymentWindow, allowedOrigins) {
  return Boolean(
    paymentWindow
      && event?.source === paymentWindow
      && allowedOrigins.includes(event?.origin),
  );
}
