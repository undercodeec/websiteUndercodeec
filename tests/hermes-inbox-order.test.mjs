import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {
  conversationActivityAt,
  createInboxRequestGuard,
  inboxPageWithinTotal,
  sortInboxConversations,
} from '../src/lib/hermes/inbox-order.mjs';

const at = (day) => `2026-11-${String(day).padStart(2, '0')}T12:00:00.000Z`;
const chat = (id, day, sender = 'CONTACT') => ({
  id, createdAt: at(1), updatedAt: at(10),
  messages: [{ id: `message-${id}`, createdAt: at(day), sender }],
});

test('pagination recovers the 51 to 50 boundary without resetting filters or forcing page one early', () => {
  assert.equal(inboxPageWithinTotal(2, 2), 2);
  assert.equal(inboxPageWithinTotal(2, 1), 1);
  assert.equal(inboxPageWithinTotal(2, 0), 1);
  assert.equal(inboxPageWithinTotal(3, 2), 2);
});

// Runs the real page callbacks with synthetic API promises and a deterministic
// hook scheduler. Capture before JSX: these are callback/state contract tests,
// not browser rendering, authentication, or real-backend E2E evidence.
function inboxHarness(api) {
  const records = [];
  let cursor = 0;
  let snapshot;
  const next = () => records[cursor++] ||= {};
  const equal = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const hooks = {
    useState(initial) {
      const r = next();
      if (!r.set) {
        r.value = initial;
        r.set = (v) => { r.value = typeof v === 'function' ? v(r.value) : v; };
      }
      return [r.value, r.set];
    },
    useRef(initial) { const r = next(); return r.ref ||= { current: initial }; },
    useCallback(fn, deps) {
      const r = next();
      if (!equal(r.deps, deps)) { r.fn = fn; r.deps = deps; }
      return r.fn;
    },
    useEffect() {}, // Requests are explicitly driven below, no wall-clock polling.
    useDeferredValue(value) { return value; },
  };
  const source = readFileSync(new URL('../src/app/admin/crm/inbox/page.jsx', import.meta.url), 'utf8')
    .replace(/  if \(listLoading && !conversations.length\) \{[\s\S]*?(?=  const handoff = activeHandoff\(conversation\);)/, '')
    .replace(/  return \(\r?\n    <div className=\{`crm-inbox/, `
      return __capture({ selectedId, conversation, messages, transfer, detailError,
        detailLoading, loadingOlder, listError, listLoading, conversations, listMeta,
        conversationPage, statusFilter, originFilter, priorityOnly, deferredSearch, toast,
        reply, sending, setReply, sendReply,
        setSelectedId, setStatusFilter, setOriginFilter, setPriorityOnly, setSearch,
         setConversationPage, loadConversations, loadConversation, loadOlderMessages });
       return (\n    <div className={\`crm-inbox`);
  const compiled = ts.transpileModule(source, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const exports = {};
  const deps = {
    react: hooks,
    'next/navigation': { useRouter: () => ({ replace() {} }), useSearchParams: () => new URLSearchParams() },
    '@/lib/hermes/api': { hermesApi: api },
    '@/lib/hermes/inbox-order.mjs': { conversationActivityAt, createInboxRequestGuard, inboxPageWithinTotal, sortInboxConversations },
    '../_components/CrmSession': { useCrmSession: () => ({ user: { id: 'synthetic-operator' } }) },
    '../_components/format': { apiErrorMessage: (error) => error.message },
    '../_components/constants': { activeHandoff: (conversation) => conversation?.handoffs?.[0] },
    '@/lib/hermes/incidents.mjs': { presentHermesIncident: () => null },
  };
  vm.runInNewContext(compiled, {
    exports, URLSearchParams, window: { setTimeout() {} },
    __capture(value) { snapshot = value; return value; },
    require(name) { return deps[name] || {}; },
  });
  const render = () => { cursor = 0; exports.default(); return snapshot; };
  render();
  return { render, get state() { return snapshot; } };
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

test('real Inbox callbacks preserve selection across polling reorder and reload an invalid last page with filters intact', async () => {
  const calls = [];
  let response = { data: [chat('a', 8), chat('b', 2)], total: 51, totalPages: 2 };
  const h = inboxHarness({ conversations: async (params) => { calls.push(params); return response; } });
  await h.state.loadConversations(); h.render();
  h.state.setSelectedId('b'); h.render();
  response = { ...response, data: [chat('a', 8), chat('b', 9)] };
  await h.state.loadConversations(true); h.render();
  assert.equal(h.state.selectedId, 'b');
  assert.deepEqual(Array.from(h.state.conversations, ({ id }) => id), ['b', 'a']);
  h.state.setStatusFilter('ACTIVE'); h.state.setOriginFilter('synthetic-origin');
  h.state.setPriorityOnly(true); h.state.setSearch('Synthetic');
  h.state.setConversationPage(2); h.render();
  response = { data: [], total: 50, totalPages: 1 };
  await h.state.loadConversations(true); h.render();
  assert.equal(h.state.conversationPage, 1);
  assert.equal(h.state.selectedId, 'b');
  response = { data: [chat('b', 9)], total: 50, totalPages: 1 };
  await h.state.loadConversations(true); h.render();
  assert.equal(calls.at(-1).page, 1);
  assert.equal(calls.at(-1).status, 'ACTIVE');
  assert.equal(calls.at(-1).origin, 'synthetic-origin');
  assert.equal(calls.at(-1).query, 'Synthetic');
  assert.equal(calls.at(-1).priorityOnly, true);
  assert.equal(h.state.listMeta.total, 50);
});

test('real Inbox list callbacks reject stale polling results, failures and loading cleanup', async () => {
  const calls = [];
  const h = inboxHarness({ conversations: () => { const d = deferred(); calls.push(d); return d.promise; } });
  const old = h.state.loadConversations();
  const latest = h.state.loadConversations();
  calls[0].reject(new Error('stale list failure')); await old; h.render();
  assert.equal(h.state.listLoading, true);
  assert.equal(h.state.listError, '');
  calls[1].resolve({ data: [chat('b', 9)], total: 1, totalPages: 1 }); await latest; h.render();
  assert.equal(h.state.listLoading, false);
  assert.equal(h.state.selectedId, 'b');
  const stale = h.state.loadConversations(true);
  const fresh = h.state.loadConversations(true);
  calls[3].resolve({ data: [chat('a', 10)], total: 1, totalPages: 1 }); await fresh;
  calls[2].resolve({ data: [chat('b', 9)], total: 1, totalPages: 1 }); await stale; h.render();
  assert.equal(h.state.conversations[0].id, 'a');
  assert.equal(h.state.selectedId, 'b');
});

test('real Inbox detail callbacks ignore inverted responses, stale failures and A-B-A requests', async () => {
  const requests = [];
  const h = inboxHarness({
    conversation: (id) => { const d = deferred(); requests.push({ id, ...d }); return d.promise; },
    messages: async (id) => ({ data: [{ id: `message-${id}` }], totalPages: 2 }),
    transferByConversation: async (id) => ({ id: `transfer-${id}` }),
    feedbackForConversation: async () => null,
  });
  h.state.setSelectedId('a'); h.render();
  const oldA = h.state.loadConversation('a');
  h.state.setSelectedId('b'); h.render();
  const b = h.state.loadConversation('b');
  requests[0].reject(new Error('stale A failure')); await oldA; h.render();
  assert.equal(h.state.detailLoading, true);
  assert.equal(h.state.detailError, '');
  requests[1].resolve({ id: 'b' }); await b; h.render();
  assert.equal(h.state.conversation.id, 'b');
  assert.equal(h.state.messages[0].id, 'message-b');
  assert.equal(h.state.transfer.id, 'transfer-b');
  const staleB = h.state.loadConversation('b', true);
  h.state.setSelectedId('a'); h.render();
  const a = h.state.loadConversation('a');
  requests[3].resolve({ id: 'a' }); await a;
  requests[2].resolve({ id: 'b' }); await staleB; h.render();
  assert.equal(h.state.conversation.id, 'a');
  const firstA = h.state.loadConversation('a', true);
  h.state.setSelectedId('b'); h.render();
  h.state.setSelectedId('a'); h.render();
  const latestA = h.state.loadConversation('a');
  requests[4].resolve({ id: 'a', stale: true }); await firstA; h.render();
  assert.equal(h.state.detailLoading, true);
  assert.equal(h.state.conversation, null);
  requests[5].resolve({ id: 'a', stale: false }); await latestA; h.render();
  assert.equal(h.state.conversation.stale, false);
  const failure = h.state.loadConversation('a');
  requests[6].reject(new Error('current detail failure')); await failure; h.render();
  assert.equal(h.state.detailError, 'current detail failure');
  assert.equal(h.state.detailLoading, false);
});

test('real Inbox older-history callbacks cannot insert messages or errors into another chat or refreshed history', async () => {
  let older;
  const h = inboxHarness({
    conversation: async (id) => ({ id }),
    messages: async (id, { page }) => page > 1 ? (older = deferred()).promise : { data: [{ id: `latest-${id}` }], totalPages: 2 },
    transferByConversation: async () => null, feedbackForConversation: async () => null,
  });
  h.state.setSelectedId('a'); h.render();
  await h.state.loadConversation('a'); h.render();
  const old = h.state.loadOlderMessages(); h.render();
  assert.equal(h.state.loadingOlder, true);
  h.state.setSelectedId('b'); h.render();
  await h.state.loadConversation('b'); h.render();
  const oldA = older;
  const currentB = h.state.loadOlderMessages(); h.render();
  const pendingB = older;
  oldA.resolve({ data: [{ id: 'old-a' }], totalPages: 2 }); await old; h.render();
  assert.equal(h.state.loadingOlder, true, 'stale A finally cannot clear current B loading');
  assert.equal(h.state.messages[0].id, 'latest-b');
  assert.equal(h.state.messages.length, 1);
  pendingB.reject(new Error('current B history failure')); await currentB; h.render();
  assert.equal(h.state.toast.message, 'current B history failure');
  const staleFailure = h.state.loadOlderMessages();
  await h.state.loadConversation('b', true); h.render();
  older.reject(new Error('stale history failure')); await staleFailure; h.render();
  assert.equal(h.state.toast.message, 'current B history failure');
  assert.equal(h.state.loadingOlder, false);
});

test('pending send from an earlier A selection cannot affect A after A-B-A, including draft and loading', async () => {
  const sends = [];
  const detail = (id) => ({ id, status: 'HANDED_OFF', replyWindow: { isOpen: true, closesAt: '2099-01-01' },
    handoffs: [{ status: 'IN_PROGRESS', assignedAgentId: 'synthetic-operator' }] });
  const h = inboxHarness({
    conversation: async (id) => detail(id), messages: async () => ({ data: [], totalPages: 1 }),
    transferByConversation: async () => null, feedbackForConversation: async () => null,
    reply: () => { const d = deferred(); sends.push(d); return d.promise; },
    conversations: async () => ({ data: [], total: 0, totalPages: 1 }),
  });
  h.state.setSelectedId('a'); h.render(); await h.state.loadConversation('a'); h.render();
  h.state.setReply('first send'); h.render();
  const old = h.state.sendReply({ preventDefault() {} }); h.render();
  assert.equal(h.state.sending, true);
  h.state.setSelectedId('b'); h.render(); h.state.setSelectedId('a'); h.render();
  await h.state.loadConversation('a'); h.render();
  h.state.setReply('new draft'); h.render();
  const current = h.state.sendReply({ preventDefault() {} }); h.render();
  sends[0].resolve({ id: 'old-send' }); await old; h.render();
  assert.equal(h.state.reply, 'new draft');
  assert.equal(h.state.sending, true);
  assert.equal(h.state.messages.length, 0);
  assert.equal(h.state.conversation.updatedAt, undefined);
  sends[1].reject(new Error('current send failed')); await current; h.render();
  assert.equal(h.state.sending, false);
  assert.equal(h.state.reply, 'new draft');
  assert.equal(h.state.toast.message, 'current send failed');
});

test('send acknowledgement does not duplicate a message already loaded by detail refresh', async () => {
  const ack = deferred();
  let history = [];
  const h = inboxHarness({
    conversation: async () => ({ id: 'a', status: 'HANDED_OFF', replyWindow: { isOpen: true, closesAt: '2099-01-01' },
      handoffs: [{ status: 'IN_PROGRESS', assignedAgentId: 'synthetic-operator' }] }),
    messages: async () => ({ data: history }), transferByConversation: async () => null,
    feedbackForConversation: async () => null, reply: () => ack.promise,
    conversations: async () => ({ data: [], total: 0, totalPages: 1 }),
  });
  h.state.setSelectedId('a'); h.render(); await h.state.loadConversation('a'); h.render();
  h.state.setReply('send'); h.render(); const send = h.state.sendReply({ preventDefault() {} });
  history = [{ id: 'ack', content: 'send' }];
  await h.state.loadConversation('a', true); h.render();
  ack.resolve(history[0]); await send; h.render();
  assert.equal(h.state.messages.length, 1);
  assert.equal(h.state.messages[0].id, 'ack');
  assert.equal(h.state.reply, '');
  assert.equal(h.state.sending, false);
});
const ids = (items) => items.map(({ id }) => id);

test('latest messages first for customer, bot and operator; administrative updates do not promote chats', () => {
  const items = [chat('old', 2), chat('operator', 8, 'HUMAN'), chat('bot', 9, 'BOT'), chat('customer', 7)];
  const before = structuredClone(items);
  assert.deepEqual(ids(sortInboxConversations(items)), ['bot', 'operator', 'customer', 'old']);
  assert.deepEqual(items, before, 'does not mutate API data');
  assert.equal(conversationActivityAt(items[0]), at(2));
});

test('empty conversations rank last by conversation ID, regardless of creation or update date', () => {
  const fresh = { id: 'new', createdAt: at(9), messages: [] };
  const old = { id: 'old', createdAt: at(1), updatedAt: at(10), messages: [] };
  assert.deepEqual(ids(sortInboxConversations([old, chat('existing', 8), fresh])), ['existing', 'new', 'old']);
  assert.equal(conversationActivityAt(fresh), undefined);
  assert.equal(conversationActivityAt(old), undefined);
});

test('invalid/missing message timestamps sort last without administrative date fallback', () => {
  const invalid = { id: 'invalid', messages: [{ createdAt: 'bad' }], createdAt: at(3) };
  const legacy = { id: 'legacy', createdAt: 'bad', updatedAt: at(2) };
  assert.equal(conversationActivityAt(invalid), undefined);
  assert.equal(conversationActivityAt(legacy), undefined);
  assert.equal(conversationActivityAt({}), undefined);
  assert.deepEqual(ids(sortInboxConversations([{ id: 'unknown' }, legacy, invalid, chat('valid', 1)])), ['valid', 'invalid', 'legacy', 'unknown']);
});

test('message ID tie-break is supplied by messages[0]; conversation ties use conversation ID ASC', () => {
  const first = chat('a', 4);
  first.messages = [
    { id: 'z', createdAt: at(4), content: 'Latest by message ID' },
    { id: 'a', createdAt: at(4), content: 'Older by message ID' },
  ];
  const second = chat('b', 4);
  second.messages[0].id = 'zz'; // must not outrank conversation a on equal dates
  const before = structuredClone([second, first]);
  const sorted = sortInboxConversations([second, first]);
  assert.deepEqual(ids(sorted), ['a', 'b']);
  assert.equal(conversationActivityAt(sorted[0]), first.messages[0].createdAt);
  assert.equal(sorted[0].messages[0].id, 'z');
  assert.deepEqual([second, first], before);
});

test('ties remain deterministic across shuffled polling results including missing dates', () => {
  for (const items of [[chat('b', 4), chat('a', 4)], [{ id: 'b' }, { id: 'a' }]]) {
    assert.deepEqual(ids(sortInboxConversations(items)), ['a', 'b']);
    assert.deepEqual(ids(sortInboxConversations([...items].reverse())), ['a', 'b']);
  }
});

test('explicit null timestamps and null message collections remain last, not epoch activity', () => {
  const items = [
    { id: 'c', messages: null, updatedAt: at(10) },
    { id: 'b', messages: [{ createdAt: null }], createdAt: at(10) },
    { id: 'a', messages: [null] },
    chat('active', 1),
  ];
  assert.deepEqual(ids(sortInboxConversations(items)), ['active', 'a', 'b', 'c']);
  for (const item of items.slice(0, 3)) assert.equal(conversationActivityAt(item), undefined);
});

test('equivalent timezone offsets tie by opaque string ID ASC, not timestamp spelling or numeric value', () => {
  const items = [
    { id: '2', messages: [{ createdAt: '2026-11-04T07:00:00-05:00' }] },
    { id: '10', messages: [{ createdAt: '2026-11-04T13:00:00+01:00' }] },
    { id: '001', messages: [{ createdAt: '2026-11-04T12:00:00.000Z' }] },
  ];
  assert.deepEqual(ids(sortInboxConversations(items)), ['001', '10', '2']);
  assert.deepEqual(ids(sortInboxConversations([...items].reverse())), ['001', '10', '2']);
  assert.ok(sortInboxConversations(items).every(({ id }) => typeof id === 'string'));
});

test('a refreshed incoming or outgoing message moves the conversation to the top', () => {
  const initial = [chat('a', 8), chat('b', 2)];
  assert.deepEqual(ids(sortInboxConversations(initial)), ['a', 'b']);
  for (const sender of ['CONTACT', 'HUMAN', 'BOT']) {
    assert.deepEqual(ids(sortInboxConversations([initial[0], chat('b', 9, sender)])), ['b', 'a']);
  }
});

test('sorting stays inside the returned filtered page without merging or changing metadata', () => {
  const result = { data: [chat('b', 2), chat('a', 8)], total: 120, totalPages: 3 };
  assert.deepEqual(ids(sortInboxConversations(result.data)), ['a', 'b']);
  assert.equal(result.total, 120);
  assert.equal(result.totalPages, 3);
});

test('only latest overlapping list request can apply results, errors or loading state', async () => {
  const guard = createInboxRequestGuard();
  let releaseOld;
  const oldResponse = new Promise((resolve) => { releaseOld = resolve; });
  const oldVersion = guard.next();
  const applied = [];
  const oldRequest = oldResponse.then(() => {
    if (guard.isCurrent(oldVersion)) applied.push('old');
  });
  const newVersion = guard.next();
  if (guard.isCurrent(newVersion)) applied.push('new');
  releaseOld();
  await oldRequest;
  assert.deepEqual(applied, ['new']);
  guard.invalidate(); // filter/page change or unmount before delayed reload
  assert.equal(guard.isCurrent(newVersion), false);
  assert.equal(guard.isCurrent(guard.next()), true);
});
