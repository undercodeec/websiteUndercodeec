const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('server delegates payment cleanup to paymentStateStore', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  assert.match(
    serverSource,
    /paymentState\.cleanup\(PENDING_ORDER_TTL_MS\)/,
    'the scheduled payment-state cleanup must remain active',
  );
  assert.doesNotMatch(
    serverSource,
    new RegExp('\\bpayment' + 'Sessions\\b'),
    'server.js must not reference the removed legacy payment session map',
  );
});

test('server provides a constrained voucher upload endpoint for bank transfers', () => {
  const serverSource = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

  assert.match(serverSource, /app\.post\('\/api\/upload-voucher'/);
  assert.match(serverSource, /limits: \{ fileSize: 10 \* 1024 \* 1024, files: 1 \}/);
  assert.match(serverSource, /Comprobante de transferencia requerido/);
  assert.match(serverSource, /recaptchaSiteKey: process\.env\.RECAPTCHA_SITE_KEY/);
});
