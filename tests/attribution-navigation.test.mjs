import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import ts from "typescript";
import * as params from "../src/lib/attribution/params.mjs";
import { validateAttributionIntent } from "../src/lib/attribution/schema.mjs";
import { toHermesContactIntent } from "../src/lib/attribution/hermes-contract.mjs";

const provider = readFileSync(new URL("../src/components/Attribution/AttributionProvider.jsx", import.meta.url), "utf8");
const staticScript = readFileSync(new URL("../public/landing-primary/js/consent-attribution.js", import.meta.url), "utf8");
const storageKey = "undercodeec_attribution_v2";
const policy = "2026-09-17";
const initialTime = Date.now() - 120_000;
const granted = { analytics: true, advertising: true, policyVersion: policy, updatedAt: new Date(initialTime).toISOString() };

function clock(start = initialTime) {
  let timestamp = start;
  return {
    Date: class extends Date {
      constructor(...args) { super(...(args.length ? args : [timestamp])); }
      static now() { return timestamp; }
    },
    advance(ms) { timestamp += ms; },
  };
}

function storage(values = new Map(), blocked = false) {
  return {
    getItem(key) { if (blocked) throw new Error("storage blocked"); return values.get(key) || null; },
    setItem(key, value) { if (blocked) throw new Error("storage blocked"); values.set(key, value); },
    removeItem(key) { if (blocked) throw new Error("storage blocked"); values.delete(key); },
  };
}

function compileProvider(react, navigation, preferences, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(provider, { compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const dependencies = {
    react,
    "react/jsx-runtime": react === React ? jsxRuntime : {
      jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }),
    },
    "next/navigation": navigation,
    "@/components/Consent/ConsentManager": { useConsent: () => ({ preferences: preferences() }) },
    "@/lib/consent/config.mjs": { CONSENT_POLICY_VERSION: policy },
    "@/lib/attribution/params.mjs": params,
  };
  vm.runInNewContext(compiled, {
    exports, ...globals,
    require(name) { assert.ok(name in dependencies, `unexpected dependency: ${name}`); return dependencies[name]; },
  }, { timeout: 1_000 });
  return exports.default;
}

// Execute the real provider and observer with a deterministic hook scheduler.
// Router hooks supply pathname/query changes; this is a component contract test,
// not a claim of browser/Next end-to-end coverage.
function reactNavigation(url, options = {}) {
  let location = new URL(url, "https://undercodeec.com");
  let preferences = Object.hasOwn(options, "preferences") ? options.preferences : granted;
  let owner = "provider", slot = 0, dirty = true, tree;
  const state = new Map(), effects = [];
  const values = options.values || new Map();
  const time = clock(options.startTime ?? initialTime);
  const equal = (a, b) => a && b && a.length === b.length && a.every((item, i) => Object.is(item, b[i]));
  const nextSlot = () => {
    const key = `${owner}:${slot++}`;
    if (!state.has(key)) state.set(key, {});
    return state.get(key);
  };
  const hooks = {
    Suspense: "suspense",
    createContext: () => ({ Provider: "provider" }),
    useContext: () => tree.props.value,
    useState(initial) {
      const record = nextSlot();
      if (!record.set) {
        record.value = initial;
        record.set = (value) => {
          const next = typeof value === "function" ? value(record.value) : value;
          if (!Object.is(next, record.value)) { record.value = next; dirty = true; }
        };
      }
      return [record.value, record.set];
    },
    useMemo(factory, deps) {
      const record = nextSlot();
      if (!equal(record.deps, deps)) { record.value = factory(); record.deps = deps; }
      return record.value;
    },
    useCallback(callback, deps) { return hooks.useMemo(() => callback, deps); },
    useEffect(effect, deps) {
      const record = nextSlot();
      if (!equal(record.deps, deps)) {
        record.deps = deps;
        effects.push(() => { record.cleanup?.(); record.cleanup = effect(); });
      }
    },
  };
  const component = compileProvider(hooks, {
    usePathname: () => location.pathname,
    useSearchParams: () => new URLSearchParams(location.search),
  }, () => preferences, {
    Date: time.Date, window: { sessionStorage: storage(values, options.blockedStorage), queueMicrotask },
  });
  async function settle() {
    for (let iteration = 0; iteration < 12; iteration++) {
      if (dirty) {
        dirty = false; owner = "provider"; slot = 0;
        tree = component({ children: "page-content" });
        const suspense = tree.props.children.find((child) => child?.type === "suspense");
        if (suspense) {
          owner = "observer"; slot = 0;
          const observer = suspense.props.children;
          observer.type(observer.props);
        }
      }
      effects.splice(0).forEach((effect) => effect());
      await Promise.resolve();
      if (!dirty && !effects.length) return;
    }
    assert.fail("provider did not settle");
  }
  return {
    values, time, settle,
    async navigate(next) { location = new URL(next, location); dirty = true; await settle(); },
    async setConsent(next) { preferences = next; dirty = true; await settle(); },
    intent() { return tree.props.value.buildIntent(); },
  };
}

test("React observes query-only campaign navigation and does not merge campaigns", async () => {
  const h = reactNavigation("/?gclid=A&utm_campaign=alpha");
  await h.settle();
  const first = h.intent();
  h.time.advance(10_000);
  await h.navigate("/?gclid=B&utm_source=other");
  const second = h.intent();
  assert.equal(second.lastTouch.clickIds.gclid, "B");
  assert.equal(second.lastTouch.utm.campaign, null);
  assert.equal(first.firstTouch.clickIds.gclid, "A");
  assert.notEqual(second.lastTouch.visitedAt, first.lastTouch.visitedAt);
  await h.navigate("/?tab=details");
  assert.equal(h.intent().lastTouch.clickIds.gclid, "B");
  assert.equal(h.intent().lastTouch.visitedAt, second.lastTouch.visitedAt);
});

test("React v2 keeps first A, updates last B, and clears history on revoke", async () => {
  const h = reactNavigation("/?gclid=A&utm_id=ID_A");
  await h.settle();
  h.time.advance(10_000);
  await h.navigate("/?utm_campaign=B");
  assert.equal(h.intent().schemaVersion, 2);
  assert.equal(h.intent().firstTouch.clickIds.gclid, "A");
  assert.equal(h.intent().firstTouch.utm.id, "ID_A");
  assert.equal(h.intent().lastTouch.clickIds.gclid, null);
  assert.equal(h.intent().lastTouch.utm.campaign, "B");
  await h.setConsent({ ...granted, advertising: false });
  assert.equal(h.intent().firstTouch, null);
  assert.equal(h.values.has("undercodeec_attribution_v2"), false);
  await h.setConsent(granted);
  assert.equal(h.intent().firstTouch.utm.campaign, "B");
});

test("React does not retain a tagged visit before consent and loses it after untagged navigation", async () => {
  const h = reactNavigation("/?gclid=A", { preferences: null });
  await h.settle();
  await h.navigate("/servicios");
  await h.setConsent(granted);
  assert.equal(h.intent().firstTouch, null);
  assert.equal(h.intent().lastTouch, null);
  assert.equal(h.values.size, 0);
});

test("React captures the currently visible tagged URL when consent arrives on the same page", async () => {
  const h = reactNavigation("/?gclid=A", { preferences: null });
  await h.settle();
  assert.equal(h.values.size, 0);
  await h.setConsent(granted);
  assert.equal(h.intent().firstTouch.clickIds.gclid, "A");
});

test("React does not reuse an older touch after a new consent decision", async () => {
  const h = reactNavigation("/?gclid=A");
  await h.settle();
  h.time.advance(10_000);
  await h.navigate("/servicios");
  h.time.advance(1_000);
  await h.setConsent({ ...granted, updatedAt: new Date(initialTime + 11_000).toISOString() });
  assert.equal(h.intent().firstTouch, null);
  assert.equal(h.values.has(storageKey), false);
});

test("React expires an idle session before contact and starts a new one on the next tagged visit", async () => {
  const h = reactNavigation("/?gclid=A");
  await h.settle();
  const firstVisited = h.intent().firstTouch.visitedAt;
  h.time.advance(30 * 60_000 + 1);
  assert.equal(h.intent().firstTouch, null);
  await h.navigate("/?gclid=B");
  assert.equal(h.intent().firstTouch.clickIds.gclid, "B");
  assert.notEqual(h.intent().firstTouch.visitedAt, firstVisited);
});

test("React back/forward query changes and reload keep coherent v2 snapshots", async () => {
  const h = reactNavigation("/?gclid=A");
  await h.settle();
  h.time.advance(10_000); await h.navigate("/?gclid=B");
  h.time.advance(10_000); await h.navigate("/?gclid=A");
  assert.equal(h.intent().lastTouch.clickIds.gclid, "A");
  h.time.advance(10_000); await h.navigate("/?gclid=B");
  const visitedAt = h.intent().lastTouch.visitedAt;
  const reloaded = reactNavigation("/?gclid=B", { values: h.values, startTime: Date.parse(h.intent().occurredAt) + 1_000 });
  await reloaded.settle();
  assert.equal(reloaded.intent().lastTouch.visitedAt, visitedAt);
  assert.equal(reloaded.intent().firstTouch.clickIds.gclid, "A");
  assert.equal(validateAttributionIntent(reloaded.intent()).ok, true);
});

test("React contact time advances independently of stored visit time", async () => {
  const h = reactNavigation("/es?gclid=A");
  await h.settle();
  const visitedAt = h.intent().lastTouch.visitedAt;
  h.time.advance(30_000);
  assert.equal(h.intent().lastTouch.visitedAt, visitedAt);
  assert.notEqual(h.intent().occurredAt, visitedAt);
  assert.equal(validateAttributionIntent(h.intent()).ok, true);
});

test("React denial strips identifiers and clears session persistence", async () => {
  const h = reactNavigation("/es?gclid=A&utm_campaign=alpha");
  await h.settle();
  await h.setConsent({ ...granted, advertising: false });
  assert.equal(h.intent().firstTouch, null);
  assert.equal(h.intent().lastTouch, null);
  assert.equal(h.values.has(storageKey), false);
});

test("blocked session storage does not crash the React capture", async () => {
  const h = reactNavigation("/?gclid=A", { blockedStorage: true });
  await h.settle();
  assert.equal(h.intent().lastTouch.clickIds.gclid, "A");
  assert.equal(h.values.size, 0);
});

test("a suspended query observer preserves server-rendered page content", () => {
  const component = compileProvider(React, {
    usePathname: () => "/",
    useSearchParams() { throw new Promise(() => {}); },
  }, () => null);
  assert.match(renderToString(React.createElement(component, null, "page-content")), /page-content/);
});

function staticPage(url, options = {}) {
  const location = new URL(url, "https://undercodeec.com");
  const values = options.values || new Map();
  const time = clock();
  const listeners = new Map(), controls = new Map(), requests = [];
  const createdElements = [];
  const preferences = Object.hasOwn(options, "preferences") ? options.preferences : granted;
  const document = {
    readyState: "complete",
    getElementById: () => null, querySelector: () => null,
    createElement: (tagName) => {
      const element = {
        tagName,
        setAttribute() {},
        addEventListener(_name, callback) { if (this.id === "uc-consent-settings") controls.set("reopen", callback); },
        querySelector(selector) {
          return { addEventListener(_name, callback) { controls.set(selector, callback); }, checked: false };
        },
      };
      createdElements.push(element);
      return element;
    },
    head: { append() {}, appendChild() {} }, body: { append() {} },
    addEventListener(name, listener) { listeners.set(name, listener); },
  };
  const window = {
    location, sessionStorage: storage(values, options.blockedStorage),
    localStorage: { getItem: () => JSON.stringify(preferences), setItem() {} },
    open: () => ({ location: { replace() {} } }),
    fbq: options.fbq,
  };
  vm.runInNewContext(staticScript, {
    window, document, URL, URLSearchParams, AbortSignal, Date: time.Date,
    fetch: async (_url, config) => {
      requests.push(JSON.parse(config.body));
      return { ok: true, json: async () => ({ reference: "UC-ABCDEFGHJKLMNPQRSTUVWX" }) };
    },
  }, { timeout: 1_000 });
  return {
    values, time, createdElements,
    async accept() { controls.get("[data-accept]")(); },
    reopen() { controls.get("reopen")(); },
    reject() { controls.get("[data-reject]")(); },
    async click() {
      const anchor = { href: "https://wa.me/593999739534?text=Test", dataset: {} };
      const before = requests.length;
      await listeners.get("click")({ button: 0, target: { closest: () => anchor }, preventDefault() {} });
      assert.equal(requests.length, before + 1);
      return requests.at(-1);
    },
};
}

test("static privacy control stays on the left away from the mobile menu", () => {
  const h = staticPage("/");
  const styles = h.createdElements.filter((element) => element.tagName === "style");
  const style = styles.at(-1)?.textContent || "";

  assert.match(style, /\.uc-consent-settings\s*\{[^}]*left:\s*1rem;/);
  assert.match(style, /\.uc-consent-settings\s*\{[^}]*right:\s*auto;/);
});

test("static landing lets a prior visitor reopen consent and revoke Meta", () => {
  const calls = [];
  const h = staticPage("/", { fbq: (...args) => calls.push(args) });
  h.reopen();
  h.reject();
  assert.deepEqual(calls, [["consent", "revoke"]]);
});

test("static landing preserves visit time until the WhatsApp contact", async () => {
  const h = staticPage("/?gclid=A");
  h.time.advance(30_000);
  const intent = await h.click();
  assert.notEqual(intent.lastTouch.visitedAt, intent.occurredAt);
  const validated = validateAttributionIntent(intent);
  assert.equal(validated.ok, true);
  assert.equal(toHermesContactIntent(validated.value, "https://undercodeec.com").lastTouch.visitedAt, intent.lastTouch.visitedAt);
});

test("static landing sends independent first and last touches with utm_id", async () => {
  const h = staticPage("/?gclid=A&utm_id=ID_A");
  const intent = await h.click();
  assert.equal(intent.schemaVersion, 2);
  assert.equal(intent.firstTouch.clickIds.gclid, "A");
  assert.equal(intent.lastTouch.utm.id, "ID_A");
  assert.equal(validateAttributionIntent(intent).ok, true);
});

test("static landing stores no attribution before consent", async () => {
  const h = staticPage("/?gclid=A", { preferences: null });
  const intent = await h.click();
  assert.equal(intent.firstTouch, null);
  assert.equal(intent.lastTouch, null);
  assert.equal(h.values.size, 0);
});

test("static landing captures the visible campaign only after late consent", async () => {
  const h = staticPage("/?gclid=A", { preferences: null });
  await h.accept();
  assert.equal((await h.click()).firstTouch.clickIds.gclid, "A");
});

test("static A to React partial B keeps first A and last B", async () => {
  const landing = staticPage("/?gclid=A&utm_id=ID_A");
  const app = reactNavigation("/servicios?utm_campaign=B", { values: landing.values });
  await app.settle();
  assert.equal(app.intent().firstTouch.clickIds.gclid, "A");
  assert.equal(app.intent().lastTouch.utm.campaign, "B");
  assert.equal(app.intent().lastTouch.clickIds.gclid, null);
});

test("static landing discards an idle in-memory session before capturing again", async () => {
  const h = staticPage("/?gclid=A");
  const firstVisited = (await h.click()).firstTouch.visitedAt;
  h.time.advance(30 * 60_000 + 1);
  const next = await h.click();
  assert.notEqual(next.firstTouch.visitedAt, firstVisited);
});

test("static landing removes advertising storage after a prior revocation", async () => {
  const values = new Map([[storageKey, JSON.stringify({ schemaVersion: 2 })], ["undercodeec_attribution_v1", "legacy"]]);
  const h = staticPage("/", { preferences: { ...granted, advertising: false }, values });
  assert.equal((await h.click()).firstTouch, null);
  assert.equal(values.size, 0);
});

test("static landing expires a 91-day-old consent before using an ad click", async () => {
  const stale = { ...granted, updatedAt: new Date(initialTime - 91 * 24 * 60 * 60_000).toISOString() };
  const h = staticPage("/?gclid=A", { preferences: stale });
  assert.equal((await h.click()).firstTouch, null);
});

test("static landing removes a touch older than the current consent decision", async () => {
  const first = staticPage("/?gclid=A");
  const next = staticPage("/servicios", { values: first.values,
    preferences: { ...granted, updatedAt: new Date(initialTime + 1_000).toISOString() } });
  assert.equal((await next.click()).firstTouch, null);
  assert.equal(first.values.has(storageKey), false);
});

test("static to React navigation uses the same stored visit metadata", async () => {
  const landing = staticPage("/?gclid=A&utm_campaign=alpha");
  const saved = JSON.parse(landing.values.get(storageKey));
  const app = reactNavigation("/servicios", { values: landing.values });
  await app.settle();
  assert.equal(app.intent().lastTouch.clickIds.gclid, "A");
  assert.equal(app.intent().lastTouch.landingPath, saved.lastTouch.landingPath);
  assert.equal(app.intent().lastTouch.visitedAt, saved.lastTouch.capturedAt);
});

test("React to static navigation keeps the stored landing and visit time", async () => {
  const app = reactNavigation("/es?gclid=A");
  await app.settle();
  const before = app.intent();
  const landing = staticPage("/", { values: app.values });
  const after = await landing.click();
  assert.equal(after.lastTouch.landingPath, before.lastTouch.landingPath);
  assert.equal(after.lastTouch.visitedAt, before.lastTouch.visitedAt);
});

test("static denied consent forwards no advertising identifiers", async () => {
  const h = staticPage("/?gclid=A&utm_campaign=alpha", { preferences: { ...granted, advertising: false } });
  const intent = await h.click();
  assert.equal(intent.firstTouch, null);
  assert.equal(intent.lastTouch, null);
  assert.equal(h.values.size, 0);
});

test("static capture applies the same click ID filter as React", async () => {
  const h = staticPage("/?gclid=contains%20spaces");
  assert.equal((await h.click()).lastTouch, null);
});

test("blocked session storage does not crash the static landing", async () => {
  const h = staticPage("/?gclid=A", { blockedStorage: true });
  assert.equal((await h.click()).lastTouch.clickIds.gclid, "A");
  assert.equal(h.values.size, 0);
});
