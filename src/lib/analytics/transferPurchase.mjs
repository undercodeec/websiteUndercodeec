import { pushAnalyticsEvent } from './dataLayer.mjs';

export function recordApprovedTransferPurchase(purchaseEvent) {
  if (purchaseEvent?.event !== 'purchase' || !purchaseEvent?.ecommerce) return false;

  return pushAnalyticsEvent('purchase', { ecommerce: purchaseEvent.ecommerce });
}
