const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createCrmOtpStore } = require('./crmOtpStore');

// Explicit opt-in: never run destructive integration tests against an existing DB.
const enabled = process.env.CRM_OTP_TEST_DB === 'crm_otp_test' && process.env.CRM_OTP_TEST_PORT;

test('MySQL OTP persists across instances and is consumed by exactly one verifier', { skip: !enabled }, async () => {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.CRM_OTP_TEST_PORT),
    user: 'root', password: process.env.CRM_OTP_TEST_PASSWORD, database: 'crm_otp_test', connectionLimit: 10 });
  const options = { pool, config: { ttlMs: 500, cooldownMs: 200, maxAttempts: 3, lockMs: 1500, ipMaxRequests: 10 } };
  const a = createCrmOtpStore(options);
  const b = createCrmOtpStore(options);
  const email = `operator-${crypto.randomUUID()}@example.test`;
  const ip = crypto.randomUUID();
  const hash = crypto.createHash('sha256').update(crypto.randomUUID()).digest('hex');
  try {
    assert.equal(await a.request({ ip, email, hash }), 'sent');
    assert.equal(await b.request({ ip, email, hash }), 'cooldown');
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => (i % 2 ? a : b)
      .verify({ ip: `${ip}-${i}`, email, candidateHash: hash })));
    assert.equal(results.filter((result) => result === 'verified').length, 1);
    assert.equal(await b.verify({ ip, email, candidateHash: hash }), 'invalid');
    await new Promise((resolve) => setTimeout(resolve, 210));
    assert.equal(await b.request({ ip, email, hash }), 'sent');
    const invalidResults = await Promise.all(Array.from({ length: 3 }, (_, i) => a.verify({
      ip: `${ip}-wrong-${i}`, email, candidateHash: '0'.repeat(64),
    })));
    assert.deepEqual(invalidResults, ['invalid', 'invalid', 'invalid']);
    assert.equal(await b.verify({ ip: `${ip}-after`, email, candidateHash: hash }), 'invalid');
  } finally {
    await pool.end();
  }
});

test('MySQL request limits are shared and spoofable headers are not inputs', { skip: !enabled }, async () => {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.CRM_OTP_TEST_PORT),
    user: 'root', password: process.env.CRM_OTP_TEST_PASSWORD, database: 'crm_otp_test' });
  const a = createCrmOtpStore({ pool, config: { ipMaxRequests: 2 } });
  const b = createCrmOtpStore({ pool, config: { ipMaxRequests: 2 } });
  const ip = crypto.randomUUID();
  try {
    const results = await Promise.all([a, b, a, b].map((store) => store.request({ ip, email: 'other', hash: null })));
    assert.equal(results.filter((result) => result === 'ignored').length, 2);
    assert.equal(results.filter((result) => result === 'limited').length, 2);
  } finally {
    await pool.end();
  }
});

test('expired and revoked codes cannot be verified, including from another instance', { skip: !enabled }, async () => {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.CRM_OTP_TEST_PORT),
    user: 'root', password: process.env.CRM_OTP_TEST_PASSWORD, database: 'crm_otp_test' });
  const options = { pool, config: { ttlMs: 100, cooldownMs: 100, ipMaxRequests: 10 } };
  const a = createCrmOtpStore(options);
  const b = createCrmOtpStore(options);
  const email = crypto.randomUUID();
  const ip = crypto.randomUUID();
  const hash = crypto.createHash('sha256').update('test').digest('hex');
  try {
    assert.equal(await a.request({ ip, email, hash }), 'sent');
    await a.revoke(email, hash);
    assert.equal(await b.verify({ ip, email, candidateHash: hash }), 'invalid');
    await new Promise((resolve) => setTimeout(resolve, 120));
    assert.equal(await b.request({ ip, email, hash }), 'sent');
    await new Promise((resolve) => setTimeout(resolve, 120));
    assert.equal(await a.verify({ ip, email, candidateHash: hash }), 'invalid');
  } finally {
    await pool.end();
  }
});

test('mobile route returns only a one-use proof while web keeps its admin token', { skip: !enabled }, async () => {
  const mysql = require('mysql2/promise');
  const express = require('express');
  const { createCrmAuthRouter } = require('./crmAuthRoutes');
  const { CRM_OPERATOR_EMAIL } = require('./crmOtp');
  const pool = mysql.createPool({ host: '127.0.0.1', port: Number(process.env.CRM_OTP_TEST_PORT),
    user: 'root', password: process.env.CRM_OTP_TEST_PASSWORD, database: 'crm_otp_test' });
  const store = createCrmOtpStore({ pool, config: { cooldownMs: 150, ipMaxRequests: 10 } });
  const app = express();
  app.use(express.json());
  let sentCode;
  let sessions = 0;
  app.use('/api/crm/auth', createCrmAuthRouter({ store,
    hashSecret: () => 'test-hash-secret', proofSecret: () => 'test-proof-secret',
    sendCode: async ({ code }) => { sentCode = code; },
    createAdminSession: () => { sessions++; return 'web-only-session'; },
  }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/crm/auth`;
  const post = async (route, body, headers = {}) => {
    const response = await fetch(base + route, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  try {
    const request = await post('/request-code', { email: CRM_OPERATOR_EMAIL }, { 'x-forwarded-for': '1.2.3.4' });
    assert.equal(request.status, 200);
    assert.match(sentCode, /^\d{8}$/);
    const mobile = await post('/mobile/verify-code', { email: CRM_OPERATOR_EMAIL, code: sentCode });
    assert.equal(mobile.status, 200);
    assert.deepEqual(Object.keys(mobile.body).sort(), ['proof', 'success']);
    assert.equal(sessions, 0);
    assert.equal(JSON.parse(Buffer.from(mobile.body.proof.split('.')[1], 'base64url')).aud, 'hermes-crm-mobile');
    assert.equal((await post('/verify-code', { email: CRM_OPERATOR_EMAIL, code: sentCode })).status, 400);
    await new Promise((resolve) => setTimeout(resolve, 170));
    await post('/request-code', { email: CRM_OPERATOR_EMAIL });
    const web = await post('/verify-code', { email: CRM_OPERATOR_EMAIL, code: sentCode });
    assert.deepEqual(Object.keys(web.body).sort(), ['adminToken', 'proof', 'success']);
    assert.equal(web.body.adminToken, 'web-only-session');
    assert.equal(JSON.parse(Buffer.from(web.body.proof.split('.')[1], 'base64url')).aud, 'hermes-crm');
    assert.equal(sessions, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
});
