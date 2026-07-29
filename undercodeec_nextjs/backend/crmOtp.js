const crypto = require('crypto');

const CRM_OPERATOR_EMAIL = 'gerencia@undercodeec.com';

function normalizeCrmEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isCrmOperator(email) {
  return normalizeCrmEmail(email) === CRM_OPERATOR_EMAIL;
}

function createCrmOtp() {
  return String(crypto.randomInt(0, 100000000)).padStart(8, '0');
}

function hashCrmOtp(code, secret) {
  if (!secret) throw new Error('CRM_OTP_HASH_SECRET es requerido');
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function signCrmProof({ email, jti, now = Date.now(), secret, ttlSeconds = 120 }) {
  if (!secret) throw new Error('CRM_HERMES_PROOF_SECRET es requerido');
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: 'undercodeec-admin',
    aud: 'hermes-crm',
    sub: normalizeCrmEmail(email),
    role: 'ADMIN',
    jti,
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + ttlSeconds,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

module.exports = {
  CRM_OPERATOR_EMAIL,
  createCrmOtp,
  hashCrmOtp,
  isCrmOperator,
  normalizeCrmEmail,
  signCrmProof,
};
