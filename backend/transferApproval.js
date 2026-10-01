function parseOrderData(order) {
  if (order?.client_info && typeof order.client_info === 'object') return order.client_info;
  if (typeof order?.client_info === 'string') {
    try {
      return JSON.parse(order.client_info);
    } catch {
      return {};
    }
  }
  return order || {};
}

function isFirstTransferApproval(order, status) {
  return order?.payment_method === 'transferencia'
    && order?.payment_status !== 'approved'
    && status === 'approved';
}

function buildProjectFolderPayload(order) {
  const data = parseOrderData(order);
  return {
    businessName: data.razonSocial || data.businessName || '',
    email: data.email || '',
    phone: data.telefono || '',
    ruc: data.rucCedula || '',
    plan: order?.plan_name || data.planName || '',
    price: Number(data.planPrice ?? order?.amount ?? 0),
  };
}

function buildApprovedTransferPurchase(order) {
  const data = parseOrderData(order);
  const transactionId = order?.transaction_id || `transfer-${order?.id}`;
  const value = Number(order?.amount || 0);
  const itemName = order?.plan_name || data.planName || 'Proyecto';

  return {
    event: 'purchase',
    ecommerce: {
      transaction_id: transactionId,
      value,
      currency: 'USD',
      items: [{
        item_id: data.planId || `order-${order?.id}`,
        item_name: itemName,
        price: value,
        quantity: 1,
      }],
    },
  };
}

module.exports = {
  buildApprovedTransferPurchase,
  buildProjectFolderPayload,
  isFirstTransferApproval,
};
