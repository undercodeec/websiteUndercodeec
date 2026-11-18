const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const { createCrmAuthRouter } = require('./crmAuthRoutes');
const { CRM_OPERATOR_EMAIL } = require('./crmOtp');

const hashSecret = 'local-test-otp-secret';
const proofSecret = 'local-test-proof-secret';

async function withApi(dependencies, run) {
  const app = express();
  app.use(express.json());
  app.use('/api/crm/auth', createCrmAuthRouter({
    hashSecret: () => hashSecret,
    proofSecret: () => proofSecret,
    ...dependencies,
  }));
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const post = async (route, body, headers = {}) => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/crm/auth${route}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    };
    await run(post);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function checkProof(proof, audience) {
  const parts = proof.split('.');
  assert.equal(parts.length, 3);
  assert.deepEqual(JSON.parse(Buffer.from(parts[0], 'base64url')), { alg: 'HS256', typ: 'JWT' });
  const signature = crypto.createHmac('sha256', proofSecret).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  assert.equal(parts[2], signature);
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url'));
  assert.equal(payload.iss, 'undercodeec-admin');
  assert.equal(payload.aud, audience);
  assert.equal(payload.sub, CRM_OPERATOR_EMAIL);
  assert.equal(payload.role, 'ADMIN');
  assert.match(payload.jti, /^[0-9a-f-]{36}$/);
  assert.equal(payload.exp - payload.iat, 120);
  return payload;
}

test('HTTP contract: web and mobile consume the same OTP, with distinct signed proofs and no mobile admin session', async () => {
  let savedHash;
  const mails = [];
  const sessions = [];
  const store = {
    request: async ({ hash }) => { savedHash = hash; return hash ? 'sent' : 'ignored'; },
    verify: async ({ candidateHash }) => {
      if (!savedHash || candidateHash !== savedHash) return 'invalid';
      savedHash = null;
      return 'verified';
    },
  };
  await withApi({ store, sendCode: async (mail) => mails.push(mail),
    createAdminSession: (email) => { sessions.push(email); return 'test-web-session'; },
  }, async (post) => {
    const unknown = await post('/request-code', { email: 'not-an-operator@example.test' });
    const requested = await post('/request-code', { email: ` ${CRM_OPERATOR_EMAIL.toUpperCase()} ` });
    assert.deepEqual(requested, unknown);
    assert.equal(requested.status, 200);
    assert.equal(mails.length, 1);
    assert.equal(mails[0].to, CRM_OPERATOR_EMAIL);
    assert.match(mails[0].code, /^\d{8}$/);
    assert.notEqual(savedHash, mails[0].code);

    const credentials = { email: CRM_OPERATOR_EMAIL, code: mails[0].code };
    assert.equal((await post('/mobile/verify-code', { ...credentials, code: 'bad' })).status, 400);
    const mobile = await post('/mobile/verify-code', credentials);
    assert.equal(mobile.status, 200);
    assert.deepEqual(Object.keys(mobile.body).sort(), ['proof', 'success']);
    const mobilePayload = checkProof(mobile.body.proof, 'hermes-crm-mobile');
    assert.deepEqual(sessions, []);
    assert.equal((await post('/verify-code', credentials)).status, 400);
    assert.equal((await post('/mobile/verify-code', credentials)).status, 400);

    await post('/request-code', { email: CRM_OPERATOR_EMAIL });
    const web = await post('/verify-code', { email: CRM_OPERATOR_EMAIL, code: mails[1].code });
    assert.equal(web.status, 200);
    assert.deepEqual(Object.keys(web.body).sort(), ['adminToken', 'proof', 'success']);
    assert.equal(web.body.adminToken, 'test-web-session');
    const webPayload = checkProof(web.body.proof, 'hermes-crm');
    assert.notEqual(webPayload.jti, mobilePayload.jti);
    assert.deepEqual(sessions, [CRM_OPERATOR_EMAIL]);
    assert.equal((await post('/mobile/verify-code', { email: CRM_OPERATOR_EMAIL, code: mails[1].code })).status, 400);
  });
});

test('isolated router factory can use an entirely synthetic operator without changing production identity', async () => {
  const operatorEmail = 'local-operator@example.test';
  let hash;
  let code;
  await withApi({
    operatorEmail,
    store: {
      request: async ({ email, hash: candidate }) => { assert.equal(email, operatorEmail); hash = candidate; return candidate ? 'sent' : 'ignored'; },
      verify: async ({ candidateHash }) => {
        if (!hash || candidateHash !== hash) return 'invalid';
        hash = null;
        return 'verified';
      },
    },
    sendCode: async (message) => { assert.equal(message.to, operatorEmail); code = message.code; },
    createAdminSession: () => assert.fail('mobile must not create admin sessions'),
  }, async (post) => {
    assert.equal((await post('/request-code', { email: operatorEmail })).status, 200);
    const result = await post('/mobile/verify-code', { email: operatorEmail, code });
    assert.equal(result.status, 200);
    assert.equal(JSON.parse(Buffer.from(result.body.proof.split('.')[1], 'base64url')).sub, operatorEmail);
    assert.equal((await post('/mobile/verify-code', { email: operatorEmail, code })).status, 400);
  });
});

test('router factory rejects a blank operator override instead of authorizing an empty email', () => {
  assert.throws(() => createCrmAuthRouter({ operatorEmail: '   ' }), /operator email is required/);
});

test('HTTP contract: peer IP (not forwarded header) reaches limits, and 429 is returned', async () => {
  const ips = [];
  await withApi({
    store: {
      request: async ({ ip }) => { ips.push(ip); return ips.length === 1 ? 'ignored' : 'limited'; },
      verify: async ({ ip }) => { ips.push(ip); return 'limited'; },
    },
    sendCode: async () => assert.fail('no email should be sent'),
    createAdminSession: () => assert.fail('no session should be created'),
  }, async (post) => {
    const body = { email: 'unknown@example.test' };
    assert.equal((await post('/request-code', body, { 'x-forwarded-for': '198.51.100.1' })).status, 200);
    assert.equal((await post('/request-code', body, { 'x-forwarded-for': '198.51.100.2' })).status, 429);
    assert.equal((await post('/mobile/verify-code', { ...body, code: '12345678' })).status, 429);
    assert.equal((await post('/verify-code', { ...body, code: '12345678' })).status, 429);
    assert.equal(ips.length, 4);
    assert.ok(ips.every((ip) => ip === ips[0] && !ip.includes('198.51.100')));
  });
});

test('HTTP contract: failed mail revokes the reserved OTP and never issues a proof', async () => {
  let reservedHash;
  let revoked;
  let mailCode;
  await withApi({
    store: {
      request: async ({ hash }) => { reservedHash = hash; return 'sent'; },
      revoke: async (email, hash) => { revoked = { email, hash }; reservedHash = null; },
      verify: async ({ candidateHash }) => candidateHash && candidateHash === reservedHash ? 'verified' : 'invalid',
    },
    sendCode: async ({ code }) => { mailCode = code; throw new Error('local fake SMTP failure'); },
    createAdminSession: () => assert.fail('no session should be created'),
  }, async (post) => {
    const errorLog = console.error;
    console.error = () => {};
    try {
      const failed = await post('/request-code', { email: CRM_OPERATOR_EMAIL });
      assert.equal(failed.status, 500);
      assert.deepEqual(failed.body, { success: false, error: 'No se pudo procesar la solicitud de acceso.' });
    } finally {
      console.error = errorLog;
    }
    assert.deepEqual(revoked, { email: CRM_OPERATOR_EMAIL,
      hash: crypto.createHmac('sha256', hashSecret).update(mailCode).digest('hex') });
    for (const route of ['/verify-code', '/mobile/verify-code']) {
      assert.equal((await post(route, { email: CRM_OPERATOR_EMAIL, code: mailCode })).status, 400);
    }
  });
});

test('HTTP contract: missing proof secret fails closed without consuming the OTP', async () => {
  let verifyCalls = 0;
  await withApi({
    store: { verify: async () => { verifyCalls++; return 'verified'; } },
    proofSecret: () => undefined,
  }, async (post) => {
    const errorLog = console.error;
    console.error = () => {};
    try {
      for (const route of ['/verify-code', '/mobile/verify-code']) {
        const result = await post(route, { email: CRM_OPERATOR_EMAIL, code: '12345678' });
        assert.equal(result.status, 500);
        assert.equal(result.body.success, false);
        assert.equal(result.body.proof, undefined);
      }
    } finally {
      console.error = errorLog;
    }
    assert.equal(verifyCalls, 0);
  });
});
