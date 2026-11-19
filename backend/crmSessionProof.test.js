const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createAdminSessions, ADMIN_IDLE_TIMEOUT_MS } = require('./adminSessions');
const { createCrmSessionProof } = require('./crmSessionProof');
const { CRM_OPERATOR_EMAIL } = require('./crmOtp');

test('only live operator adminAuth can mint distinct two-minute web proofs, without refreshing idle time', async () => {
  let time = 100_000;
  const sessions = createAdminSessions({ now: () => time });
  const operator = sessions.create(CRM_OPERATOR_EMAIL);
  const unrelated = sessions.create('other@example.test');
  const app = express();
  app.post('/api/crm/auth/session-proof', (req, res, next) => {
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    req.adminSession = sessions.get(token);
    if (!req.adminSession) return res.sendStatus(401);
    next();
  }, createCrmSessionProof({ proofSecret: () => 'local-test-proof-secret' }));
  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const post = async token => {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/crm/auth/session-proof`, {
        method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {},
      });
      return { status: response.status, body: response.ok ? await response.json() : null };
    };
    assert.equal((await post()).status, 401);
    assert.equal((await post(unrelated)).status, 403);
    const first = await post(operator);
    const second = await post(operator);
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    const decode = proof => JSON.parse(Buffer.from(proof.split('.')[1], 'base64url'));
    const a = decode(first.body.proof);
    const b = decode(second.body.proof);
    assert.equal(a.sub, CRM_OPERATOR_EMAIL);
    assert.equal(a.aud, 'hermes-crm');
    assert.equal(a.exp - a.iat, 120);
    assert.notEqual(a.jti, b.jti);
    time += ADMIN_IDLE_TIMEOUT_MS;
    assert.equal((await post(operator)).status, 401);
    assert.equal(sessions.get(operator), null);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
