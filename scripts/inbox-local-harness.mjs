// Local-only browser harness. No repository .env is read and no production
// server is started. Fixture mode is NOT Nest/PostgreSQL integration evidence.
import { createRequire } from 'node:module';
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { readFile, cp, mkdir, mkdtemp, symlink, writeFile, realpath } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(join(root, 'backend/package.json'));
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const otp = require('./crmOtp.js');
const fixture = process.argv.includes('--fixture');
const upstream = new URL(process.env.INBOX_LOCAL_NEST_URL || 'http://127.0.0.1:3312');
if (!['localhost', '127.0.0.1', '[::1]'].includes(upstream.hostname) || upstream.protocol !== 'http:' || upstream.username || upstream.password) {
  throw new Error('Only explicit loopback HTTP Nest URLs are permitted');
}
const secret = process.env.INBOX_LOCAL_PROOF_SECRET || (fixture ? randomBytes(32).toString('hex') : '');
assert.ok(secret.length >= 32, 'Set a synthetic INBOX_LOCAL_PROOF_SECRET shared with local Nest');
const tempRoot = join(root, 'artifacts', 'inbox-local');
await mkdir(tempRoot, { recursive: true });
const stage = await mkdtemp(join(tempRoot, 'inbox-local-'));
const evidence = join(stage, 'evidence');
await mkdir(evidence);
const results = { mode: fixture ? 'fixture-browser-NOT-real-integration' : 'real-Nest-with-admin-auth-component-fixture',
  head: '', sourceSha256: {}, checks: [], proxyResponses: [], blockedExternalRequests: [], limitations: [
    'Admin OTP routes execute from production source, but SMTP delivery and admin session storage/profile are in-memory fixtures.',
    'Full Express server, MySQL persistence, real SMTP and external WhatsApp are not exercised.',
  ] };
const git = spawn('git', ['rev-parse', 'HEAD'], { cwd: root });
for await (const chunk of git.stdout) results.head += chunk;
results.head = results.head.trim();
for (const file of ['src/app/admin/crm/inbox/page.jsx', 'src/lib/hermes/inbox-order.mjs', 'tests/hermes-inbox-order.test.mjs', 'scripts/inbox-local-harness.mjs']) {
  results.sourceSha256[file] = createHash('sha256').update(await readFile(join(root, file))).digest('hex');
}

// Execute the unchanged production OTP route bodies, without importing server.js
// (which would read backend/.env and initialize unrelated payment integrations).
const app = express();
app.use(cors({ origin: 'http://127.0.0.1:3310' }));
app.use(express.json());
let mailboxCode;
const adminTokens = new Set();
const operator = { id: 'inbox-local-operator', email: otp.CRM_OPERATOR_EMAIL, role: 'ADMIN', name: 'Operador ficticio' };
const source = await readFile(join(root, 'backend/server.js'), 'utf8');
const authSource = source.slice(source.indexOf('const crmOtpRecords = new Map();'), source.indexOf('async function sendAdminPasswordResetEmail'));
assert.ok(authSource.includes("app.post('/api/crm/auth/verify-code'"), 'OTP source markers changed');
const lockSource = source.slice(source.indexOf('function isLocked(map, key)'), source.indexOf('function clearAttempts(map, key)'));
vm.runInNewContext(lockSource + authSource, {
  app, ...otp, crypto: { randomUUID },
  process: { env: { CRM_OTP_HASH_SECRET: randomBytes(32).toString('hex'), CRM_HERMES_PROOF_SECRET: secret } },
  console, Buffer, Date,
  transporter: { async sendMail({ html }) { mailboxCode = html.match(/>(\d{8})<\/p>/)?.[1]; assert.ok(mailboxCode); } },
  escapeHtml: (value) => value,
  getClientIp: () => '127.0.0.1',
  safeStringEqual: (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b)),
  createAdminSession() { const token = randomBytes(32).toString('hex'); adminTokens.add(token); return token; },
});
app.get('/api/admin/profile', (req, res) => adminTokens.has(req.headers.authorization?.replace('Bearer ', '')) ? res.json(operator) : res.sendStatus(401));
app.post('/api/admin/logout', (_req, res) => res.json({ success: true }));
const servers = [];
const listen = (server, port) => new Promise((ok, fail) => { const s = server.listen(port, '127.0.0.1', () => { servers.push(s); ok(); }); s.on('error', fail); });

const now = Date.now();
const chats = Array.from({ length: 63 }, (_, index) => ({
  id: `synthetic-${String(index + 1).padStart(3, '0')}`, status: index % 3 === 0 ? 'CLOSED' : 'ACTIVE',
  contact: { name: `Contacto ficticio ${String(index + 1).padStart(3, '0')}`, phone: `000${index}` },
  attribution: { origin: index % 2 ? 'organic' : 'meta_ad' },
  createdAt: new Date(now - index * 60000).toISOString(),
  messages: [{ id: `msg-${index}`, content: `Mensaje ficticio ${index + 1}`, sender: 'CONTACT', createdAt: new Date(now - index * 60000).toISOString() }],
  handoffs: [],
}));
const history = new Map(chats.map((c) => [c.id, [...c.messages]]));
if (fixture) {
  const nest = express(); nest.use(express.json());
  const tokens = new Set();
  nest.post('/auth/crm-proof', (req, res) => {
    const [header, payload, sig] = (req.body.proof || '').split('.');
    const expected = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    if (sig !== expected) return res.sendStatus(401);
    const token = randomBytes(32).toString('hex'); tokens.add(token);
    return res.json({ accessToken: token, user: operator });
  });
  nest.use((req, res, next) => tokens.has(req.headers.authorization?.replace('Bearer ', '')) ? next() : res.sendStatus(401));
  nest.get('/auth/profile', (_req, res) => res.json(operator));
  nest.get('/conversations/events', (_req, res) => { res.setHeader('content-type', 'text/event-stream'); res.write(': fixture\n\n'); });
  nest.get('/conversations', (req, res) => {
    let items = [...chats].sort((a, b) => b.messages[0].createdAt.localeCompare(a.messages[0].createdAt) || a.id.localeCompare(b.id));
    if (req.query.query) items = items.filter((c) => c.contact.name.includes(req.query.query));
    if (req.query.status) items = items.filter((c) => c.status === req.query.status);
    if (req.query.origin) items = items.filter((c) => c.attribution.origin === req.query.origin);
    if (req.query.priorityOnly) items = [];
    const page = Number(req.query.page || 1), limit = Number(req.query.limit || 50);
    res.json({ data: items.slice((page - 1) * limit, page * limit), total: items.length, totalPages: Math.ceil(items.length / limit) });
  });
  nest.get('/conversations/:id', (req, res) => res.json(chats.find((c) => c.id === req.params.id)));
  nest.get('/conversations/:id/messages', (req, res) => res.json({ data: history.get(req.params.id), totalPages: 1 }));
  nest.get('/transfers/conversation/:id', (_req, res) => res.json(null));
  nest.get('/feedback/conversation/:id', (_req, res) => res.json({ data: [] }));
  // Reject any unanticipated mutating endpoint, especially payments/WhatsApp.
  nest.use((_req, res) => res.status(404).json({ error: 'Outside fixture scope' }));
  await listen(nest, Number(upstream.port));
}

let next, browser;
let serverLog = '';
try {
  await listen(app, 3311);
  for (const name of ['src', 'package.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.js', 'tailwind.config.js']) {
    await cp(join(root, name), join(stage, name), { recursive: true });
  }
  await symlink(join(root, 'node_modules'), join(stage, 'node_modules'), 'junction');
  await symlink(join(root, 'public'), join(stage, 'public'), 'junction');
  // Turbopack needs the dependency junction target within its resolution root.
  // Only the disposable staged config changes; source and real env stay intact.
  await writeFile(join(stage, 'next.config.ts'), (await readFile(join(stage, 'next.config.ts'), 'utf8'))
    .replace('root: import.meta.dirname', `root: ${JSON.stringify(dirname(await realpath(join(root, 'node_modules'))))}`));
  const env = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'WINDIR', 'TEMP', 'TMP', 'USERPROFILE', 'LOCALAPPDATA', 'APPDATA'].filter((key) => process.env[key]).map((key) => [key, process.env[key]]));
  Object.assign(env, { HERMES_API_URL: upstream.href, NEXT_PUBLIC_HERMES_API_URL: '/api/hermes', NEXT_PUBLIC_ADMIN_API_URL: 'http://127.0.0.1:3311', NEXT_TELEMETRY_DISABLED: '1' });
  next = spawn(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3310'], { cwd: stage, env, stdio: ['ignore', 'pipe', 'pipe'] });
  next.stdout.on('data', (data) => { serverLog += data; }); next.stderr.on('data', (data) => { serverLog += data; });
  for (let attempt = 0; ; attempt++) {
    try { const response = await fetch('http://127.0.0.1:3310/admin/crm/login/'); if (response.ok) break; } catch {}
    if (attempt >= 90 || next.exitCode !== null) throw new Error(`Next failed: ${serverLog.slice(-2500)}`);
    await new Promise((ok) => setTimeout(ok, 1000));
  }
  browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith('/api/hermes/')) results.proxyResponses.push({ path, status: response.status() });
  });
  await page.setViewport({ width: 1440, height: 1000 });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = new URL(req.url());
    if (['http:', 'https:'].includes(url.protocol) && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
      results.blockedExternalRequests.push(url.origin); void req.abort();
    } else void req.continue();
  });
  await page.goto('http://127.0.0.1:3310/admin/crm/login/');
  const unauthorized = await fetch('http://127.0.0.1:3310/api/hermes/conversations');
  assert.equal(unauthorized.status, 401);
  results.checks.push('Unauthenticated real Next proxy request is rejected with 401');
  await page.waitForSelector('input[type=email]');
  await page.type('input[type=email]', otp.CRM_OPERATOR_EMAIL);
  await page.click('button[type=submit]');
  await page.waitForSelector('input[autocomplete=one-time-code]');
  await page.type('input[autocomplete=one-time-code]', mailboxCode);
  await page.click('button[type=submit]');
  await page.waitForFunction(() => !location.pathname.includes('/login'), { timeout: 60000 });
  const replay = await fetch('http://127.0.0.1:3311/api/crm/auth/verify-code', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: otp.CRM_OPERATOR_EMAIL, code: mailboxCode }) });
  assert.equal(replay.status, 400);
  mailboxCode = undefined;
  results.checks.push('Consumed OTP replay is rejected with 400 by production route body');
  results.checks.push('Browser OTP form -> production OTP route bodies -> signed proof -> /api/hermes/auth/crm-proof -> authenticated session');
  await page.goto('http://127.0.0.1:3310/admin/crm/inbox/');
  await page.waitForSelector('.crm-conversation-list button', { timeout: 60000 });
  await page.screenshot({ path: join(evidence, 'inbox-desktop.png'), fullPage: true });
  const count = await page.$$eval('.crm-conversation-list button', (nodes) => nodes.length);
  assert.equal(count, 50);
  results.checks.push('Desktop authenticated Inbox renders first 50 conversations');
  if (fixture) {
    await page.click('.crm-origin-pagination button:last-child');
    await page.waitForFunction(() => document.querySelector('.crm-origin-pagination span')?.textContent === '2 de 2' && document.querySelectorAll('.crm-conversation-list button').length === 13);
    assert.match(await page.$eval('.crm-conversation-list button strong', (n) => n.textContent), /051/);
    results.checks.push('63 conversations: globally ordered second page starts with 051');
    await page.select('.crm-inbox-filters select', 'CLOSED');
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 21);
    results.checks.push('Status filter resets pagination and returns 21 closed conversations');
    await page.select('.crm-inbox-filters select', '');
    await page.type('input[placeholder="Buscar contacto…"]', '063');
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 1);
    results.checks.push('Search returns synthetic contact 063');
    await page.focus('input[placeholder="Buscar contacto…"]'); await page.keyboard.down('Control'); await page.keyboard.press('A'); await page.keyboard.up('Control'); await page.keyboard.press('Backspace');
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 50);
    await page.$$eval('.crm-inbox-filters select', (nodes) => { nodes[1].value = 'meta_ad'; nodes[1].dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 32);
    results.checks.push('Origin Meta Ads filter returns 32 attributed conversations');
    await page.$$eval('.crm-inbox-filters select', (nodes) => { nodes[1].value = ''; nodes[1].dispatchEvent(new Event('change', { bubbles: true })); });
    await page.click('.crm-inbox-filters button[aria-pressed]');
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 0);
    results.checks.push('Priority filter empty state is displayed');
    await page.click('.crm-inbox-filters button[aria-pressed]');
    await page.waitForFunction(() => document.querySelectorAll('.crm-conversation-list button').length === 50);
    await page.focus('.crm-conversation-list button'); await page.keyboard.press('Enter');
    await page.waitForSelector('.crm-chat-header');
    results.checks.push('Conversation selected with keyboard Enter');
    const selectedName = await page.$eval('.crm-conversation-list button.is-active strong', (n) => n.textContent);
    const incoming = { id: 'new-synthetic-contact-message', content: 'Nuevo mensaje ficticio', sender: 'CONTACT', createdAt: new Date(now + 60000).toISOString() };
    chats[62].messages = [incoming]; history.get(chats[62].id).push(incoming);
    await page.evaluate((id) => window.dispatchEvent(new CustomEvent('hermes:customer-message', { detail: { conversationId: id } })), chats[62].id);
    await page.waitForFunction(() => document.querySelector('.crm-conversation-list button strong')?.textContent.includes('063'));
    assert.equal(await page.$eval('.crm-conversation-list button.is-active strong', (n) => n.textContent), selectedName);
    results.checks.push('New synthetic incoming message promotes a former page-two conversation globally while preserving selection');
  }
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.waitForSelector('[aria-label="Volver a conversaciones"]', { timeout: 60000 });
  await page.screenshot({ path: join(evidence, 'inbox-mobile-chat.png'), fullPage: true });
  assert.ok(await page.$eval('body', (body) => body.scrollWidth <= window.innerWidth), 'No horizontal mobile overflow');
  await page.click('[aria-label="Volver a conversaciones"]');
  await page.waitForFunction(() => !document.querySelector('.crm-inbox.has-selection'));
  await page.screenshot({ path: join(evidence, 'inbox-mobile-list.png'), fullPage: true });
  results.checks.push('390x844 mobile chat/back/list and no horizontal overflow');
  if (process.argv.includes('--serve')) {
    console.log(`QA ready: http://127.0.0.1:3310/admin/crm/inbox/ ; evidence ${evidence}. Ctrl+C stops task-owned services.`);
    await new Promise((ok) => process.once('SIGINT', ok));
  }
  await writeFile(join(stage, 'next.log'), serverLog);
} catch (error) {
  results.error = error.stack;
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (next) next.kill();
  await writeFile(join(stage, 'next.log'), serverLog);
  for (const server of servers) { server.closeAllConnections(); server.close(); }
  results.blockedExternalRequests = [...new Set(results.blockedExternalRequests)];
  await writeFile(join(evidence, 'results.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify({ evidence, ...results }, null, 2));
}
