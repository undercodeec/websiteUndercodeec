const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildApprovedTransferPurchase,
  buildProjectFolderPayload,
  isFirstTransferApproval,
} = require('./transferApproval');

const pendingTransfer = {
  id: 42,
  amount: '180.00',
  payment_method: 'transferencia',
  payment_status: 'pending',
  transaction_id: 'transfer-42',
  plan_name: 'Plan de Lanzamiento',
  client_info: JSON.stringify({
    razonSocial: 'Acme S.A.',
    businessName: 'Proyecto Acme',
    email: 'cliente@example.com',
    telefono: '+593991234567',
    rucCedula: '1790012345001',
    planId: 'web-launch',
    planPrice: 360,
  }),
};

test('recognizes only the first approval of a bank transfer as a fulfillment event', () => {
  assert.equal(isFirstTransferApproval(pendingTransfer, 'approved'), true);
  assert.equal(isFirstTransferApproval({ ...pendingTransfer, payment_status: 'approved' }, 'approved'), false);
  assert.equal(isFirstTransferApproval({ ...pendingTransfer, payment_method: 'tarjeta' }, 'approved'), false);
  assert.equal(isFirstTransferApproval(pendingTransfer, 'rejected'), false);
});

test('builds the existing project-folder request from an approved transfer order', () => {
  assert.deepEqual(buildProjectFolderPayload(pendingTransfer), {
    businessName: 'Acme S.A.',
    email: 'cliente@example.com',
    phone: '+593991234567',
    ruc: '1790012345001',
    plan: 'Plan de Lanzamiento',
    price: 360,
  });
});

test('builds a privacy-safe ecommerce purchase for an approved transfer', () => {
  assert.deepEqual(buildApprovedTransferPurchase(pendingTransfer), {
    event: 'purchase',
    ecommerce: {
      transaction_id: 'transfer-42',
      value: 180,
      currency: 'USD',
      items: [{
        item_id: 'web-launch',
        item_name: 'Plan de Lanzamiento',
        price: 180,
        quantity: 1,
      }],
    },
  });
});
