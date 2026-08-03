const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CRM_OPERATOR_EMAIL,
  createCrmOtp,
  hashCrmOtp,
  isCrmOperator,
  signCrmProof,
} = require('./crmOtp');

test('solo autoriza al operador CRM configurado', () => {
  assert.equal(isCrmOperator(' GERENCIA@UNDERCODEEC.COM '), true);
  assert.equal(isCrmOperator('other@undercodeec.com'), false);
});

test('genera OTP de ocho digitos y guarda un hash HMAC', () => {
  const code = createCrmOtp();
  assert.match(code, /^\d{8}$/);
  assert.notEqual(hashCrmOtp(code, 'hash-secret'), code);
  assert.equal(hashCrmOtp(code, 'hash-secret'), hashCrmOtp(code, 'hash-secret'));
});

test('emite una prueba Hermes de vida corta con audiencia restringida', () => {
  const proof = signCrmProof({
    email: CRM_OPERATOR_EMAIL,
    jti: 'test-jti',
    now: 1_700_000_000_000,
    secret: 'shared-secret',
  });
  const payload = JSON.parse(Buffer.from(proof.split('.')[1], 'base64url').toString('utf8'));
  assert.equal(payload.sub, CRM_OPERATOR_EMAIL);
  assert.equal(payload.aud, 'hermes-crm');
  assert.equal(payload.role, 'ADMIN');
  assert.equal(payload.exp - payload.iat, 120);
});
