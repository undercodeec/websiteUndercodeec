import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/lib/hermes/api.js', import.meta.url), 'utf8');
const { hermesApi, adminApi, refreshHermesWebSession, getHermesDeadline, subscribeHermesEvents } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function response(status, data) {
  return { ok: status < 400, status, headers: new Headers({ 'content-type': 'application/json' }), json: async () => data };
}

test('renewal checks the current operator admin, exchanges a fresh proof and retains admin on Hermes 401', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const previousCustomEvent = globalThis.CustomEvent;
  const admin = new Map([['adminToken', 'live-admin']]);
  const liveAccess = `x.${Buffer.from(JSON.stringify({ typ: 'web', exp: Math.floor(Date.now() / 1000) + 300 })).toString('base64url')}.x`;
  const hermes = new Map([['hermesCrmToken', liveAccess], ['hermesCrmRefreshToken', 'session.old']]);
  const events = [];
  const calls = [];
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  globalThis.window = {
    localStorage: { getItem: key => admin.get(key), setItem: (key, value) => admin.set(key, value), removeItem: key => admin.delete(key) },
    sessionStorage: { getItem: key => hermes.get(key), setItem: (key, value) => hermes.set(key, value), removeItem: key => hermes.delete(key) },
    dispatchEvent: event => events.push(event.type),
  };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/api/admin/profile')) return response(200, { user: { email: 'gerencia@undercodeec.com' }, expiresAt: Date.now() + 1000 });
    if (url.endsWith('/api/crm/auth/session-proof')) return response(200, { proof: 'unique-proof' });
    if (url.endsWith('/auth/crm-proof')) return response(200, { accessToken: 'new-hermes', refreshToken: 'session.new', expiresAt: new Date(Date.now() + 86_400_000).toISOString(), user: { id: 'operator' } });
    return response(401, { message: 'expired Hermes token' });
  };
  try {
    await assert.rejects(hermesApi.profile(), error => error.status === 401);
    assert.equal(admin.get('adminToken'), 'live-admin');
    const session = await hermesApi.renewSession();
    assert.equal(session.accessToken, 'new-hermes');
    assert.equal(hermes.get('hermesCrmToken'), 'new-hermes');
    assert.equal(hermes.get('hermesCrmRefreshToken'), 'session.new');
    assert.ok(getHermesDeadline() > Date.now());
    assert.deepEqual(calls.slice(1).map(call => new URL(call.url, 'https://local.test').pathname), [
      '/api/admin/profile', '/api/crm/auth/session-proof', '/api/hermes/auth/crm-proof',
    ]);
    assert.equal(calls[2].options.headers.get('Authorization'), 'Bearer live-admin');
    assert.deepEqual(JSON.parse(calls[3].options.body), { proof: 'unique-proof', existingRefreshToken: 'session.old' });
    assert.deepEqual(events, ['hermes:token-rotated']); // profile 401 is not a forced logout.
    globalThis.fetch = async url => url.endsWith('/api/admin/profile') ? response(401, {}) : response(200, {});
    await assert.rejects(adminApi.profile(), error => error.status === 401);
    assert.equal(admin.has('adminToken'), false);
    assert.equal(hermes.has('hermesCrmToken'), false);
    assert.deepEqual(events, ['hermes:token-rotated', 'hermes:session-expired']);
  } finally {
    globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
    globalThis.CustomEvent = previousCustomEvent;
  }
});

test('renewal never requests a proof for a different admin, even if bearer is valid', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const urls = [];
  globalThis.window = { localStorage: { getItem: () => 'other-admin' }, sessionStorage: { getItem: () => 'session.other' } };
  globalThis.fetch = async url => { urls.push(url); return response(200, { user: { email: 'other@example.test' }, expiresAt: Date.now() + 1000 }); };
  try {
    await assert.rejects(hermesApi.renewSession(), error => error.status === 403);
    assert.equal(urls.length, 1);
    assert.match(urls[0], /\/api\/admin\/profile$/);
  } finally { globalThis.window = previousWindow; globalThis.fetch = previousFetch; }
});

test('concurrent refreshes use one CAS rotation, preserve idle deadline and never recreate after 401', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const previousCustomEvent = globalThis.CustomEvent;
  const hermes = new Map([['hermesCrmRefreshToken', 'session.once'], ['hermesCrmToken', 'old'], ['hermesCrmExpiresAt', String(Date.now() + 86_400_000)]]);
  const admin = new Map([['adminToken', 'operator-session']]);
  let rotations = 0;
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  globalThis.window = {
    sessionStorage: { getItem: k => hermes.get(k), setItem: (k, v) => hermes.set(k, v), removeItem: k => hermes.delete(k) },
    localStorage: { getItem: k => admin.get(k), removeItem: k => admin.delete(k) },
    dispatchEvent: () => {},
  };
  globalThis.fetch = async url => {
    if (url.endsWith('/api/admin/profile')) return response(200, { user: { email: 'gerencia@undercodeec.com' }, expiresAt: Date.now() + 86_400_000 });
    if (url.endsWith('/auth/web/refresh')) {
      rotations++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return response(200, { accessToken: 'new', refreshToken: 'session.rotated', expiresAt: new Date(Date.now() + 86_000_000).toISOString() });
    }
    throw new Error(`unexpected route ${url}`);
  };
  try {
    const deadline = getHermesDeadline();
    await Promise.all([refreshHermesWebSession(), refreshHermesWebSession(), refreshHermesWebSession()]);
    assert.equal(rotations, 1);
    assert.equal(hermes.get('hermesCrmRefreshToken'), 'session.rotated');
    assert.equal(getHermesDeadline(), deadline);
    globalThis.fetch = async url => url.endsWith('/api/admin/profile')
      ? response(200, { user: { email: 'gerencia@undercodeec.com' }, expiresAt: Date.now() + 86_400_000 })
      : response(401, {});
    await assert.rejects(refreshHermesWebSession(), error => error.status === 401);
    assert.equal(hermes.has('hermesCrmRefreshToken'), false);
    assert.equal(admin.get('adminToken'), 'operator-session');
    await assert.rejects(hermesApi.renewSession());
  } finally {
    globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
    globalThis.CustomEvent = previousCustomEvent;
  }
});

test('SSE reconnects with rotated bearer; attachment fetch uses the same current bearer', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const previousCustomEvent = globalThis.CustomEvent;
  const events = new Map();
  const tokens = new Map();
  const token = suffix => `x.${Buffer.from(JSON.stringify({ typ: 'web', exp: Math.floor(Date.now() / 1000) + 300, suffix })).toString('base64url')}.x`;
  const first = token('first');
  const second = token('second');
  tokens.set('hermesCrmToken', first);
  tokens.set('hermesCrmRefreshToken', 'web.old');
  tokens.set('hermesCrmExpiresAt', String(Date.now() + 86_400_000));
  const admin = new Map([['adminToken', 'admin-operator']]);
  globalThis.CustomEvent = class { constructor(type) { this.type = type; } };
  globalThis.window = {
    sessionStorage: { getItem: k => tokens.get(k), setItem: (k, v) => tokens.set(k, v), removeItem: k => tokens.delete(k) },
    localStorage: { getItem: k => admin.get(k), removeItem: k => admin.delete(k) },
    addEventListener: (name, cb) => events.set(name, cb), removeEventListener: name => events.delete(name),
    dispatchEvent: event => events.get(event.type)?.(),
    setTimeout, clearTimeout,
  };
  const sseTokens = [];
  const mediaTokens = [];
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/api/admin/profile')) return response(200, { user: { email: 'gerencia@undercodeec.com' }, expiresAt: Date.now() + 86_400_000 });
    if (url.endsWith('/auth/web/refresh')) return response(200, { accessToken: second, refreshToken: 'web.new', expiresAt: new Date(Date.now() + 86_000_000).toISOString() });
    if (url.endsWith('/conversations/events')) {
      sseTokens.push(options.headers.Authorization);
      return { ok: true, body: { getReader: () => ({ read: () => new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
      }) }) } };
    }
    if (url.endsWith('/media')) {
      mediaTokens.push(options.headers.Authorization);
      return { ok: true, blob: async () => new Blob(['synthetic']) };
    }
    throw new Error(`unexpected route: ${url}`);
  };
  const stop = subscribeHermesEvents(() => {});
  try {
    for (let i = 0; i < 20 && sseTokens.length < 1; i++) await new Promise(resolve => setTimeout(resolve, 1));
    assert.deepEqual(sseTokens, [`Bearer ${first}`]);
    await refreshHermesWebSession();
    for (let i = 0; i < 20 && sseTokens.length < 2; i++) await new Promise(resolve => setTimeout(resolve, 1));
    assert.deepEqual(sseTokens, [`Bearer ${first}`, `Bearer ${second}`]);
    const blob = await hermesApi.inboxMedia('test-conversation', 'test-message');
    assert.equal(await blob.text(), 'synthetic');
    assert.deepEqual(mediaTokens, [`Bearer ${second}`]);
  } finally {
    stop();
    globalThis.window = previousWindow;
    globalThis.fetch = previousFetch;
    globalThis.CustomEvent = previousCustomEvent;
  }
});

test('offline refresh preserves both credentials for explicit revalidation, without issuing a proof', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const hermes = new Map([['hermesCrmRefreshToken', 'web.offline'], ['hermesCrmToken', 'web-access']]);
  const admin = new Map([['adminToken', 'admin-offline']]);
  globalThis.window = {
    sessionStorage: { getItem: k => hermes.get(k), removeItem: k => hermes.delete(k) },
    localStorage: { getItem: k => admin.get(k), removeItem: k => admin.delete(k) },
  };
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error('offline'); };
  try {
    await assert.rejects(refreshHermesWebSession());
    assert.equal(requests, 1); // no Hermes request or proof without a verified admin
    assert.equal(hermes.get('hermesCrmRefreshToken'), 'web.offline');
    assert.equal(admin.get('adminToken'), 'admin-offline');
  } finally { globalThis.window = previousWindow; globalThis.fetch = previousFetch; }
});
