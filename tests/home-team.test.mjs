import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const normalizeHtml = html => html.replace(/\s+/g, ' ').replace(/>\s+/g, '>').replace(/\s+</g, '<').replace(/\s+\/>/g, '>').replace(/\s+>/g, '>');
const home = normalizeHtml(readFileSync(new URL('../public/landing-primary/index.html', import.meta.url), 'utf8'));
const styles = readFileSync(new URL('../public/landing-primary/css/home-team.css', import.meta.url), 'utf8');
const demoStyles = readFileSync(new URL('../public/landing-primary/css/demo-local.css', import.meta.url), 'utf8');
const homeScript = readFileSync(new URL('../public/landing-primary/js/demo-local.js', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../public/landing-primary/js/home-team-motion.js', import.meta.url), 'utf8');
const native = readFileSync(new URL('../public/landing-primary/js/ob.2026.index.23.js', import.meta.url), 'utf8');

function assertTeamBeforeTools(html) {
  const title = html.indexOf('Transformamos tus ideas en soluciones digitales innovadoras');
  const tools = html.indexOf('data-client-section=""');
  const start = html.lastIndexOf('<section class="s">', title);
  const end = html.lastIndexOf('<section class="s"><div class="c"><div data-hide="m" class="spacer-10"></div><div data-client-section=""', tools);
  const work = html.indexOf('<section home-work="" class="s">', tools);
  const plans = html.indexOf('<section class="s offbrand-plans-section"', work);
  assert.ok(start >= 0 && title > start && end > title && tools > end && work > tools && plans > work,
    'presentation must precede tools, work and plans');
  const markup = html.slice(start, end);
  const stack = [];
  let presentation;
  let presentationGrid;
  let slot;
  let team;
  for (const [tag] of markup.matchAll(/<\/?(?:div|section)\b[^>]*>/g)) {
    const name = tag.match(/^<\/?(div|section)/)?.[1];
    if (tag.startsWith('</')) {
      assert.equal(stack.pop()?.name, name, `unbalanced ${tag} in presentation`);
    } else {
      const node = { name, tag, parent: stack.at(-1), children: [] };
      node.parent?.children.push(node);
      if (tag === '<section class="s">') presentation = node;
      if (tag.includes('class="grid-main m-flex"')) presentationGrid = node;
      if (tag.includes('class="spacer-10 home-team-slot"')) slot = node;
      if (tag.includes('class="s home-team"')) team = node;
      stack.push(node);
    }
  }
  assert.equal(stack.length, 0, 'presentation and nested tags must close before tools');
  assert.equal(presentationGrid?.parent?.parent, presentation);
  assert.equal(slot?.parent, presentationGrid?.parent, 'team slot must follow the presentation grid');
  assert.equal(presentationGrid.parent.children.indexOf(slot), presentationGrid.parent.children.indexOf(presentationGrid) + 1,
    'the presentation grid and team slot must be immediate siblings');
  assert.equal(team?.parent, slot, 'team must be a direct child of the presentation trailing spacer');
  assert.doesNotMatch(slot.tag, /aria-hidden|data-hide/);
  assert.ok(markup.indexOf('Transformamos tus ideas') < markup.indexOf('home-team-slot'));
  assert.match(html.slice(end, work), /<div data-hide="m" class="spacer-10"><\/div><\/div><\/section>$/);
  assert.doesNotMatch(html.slice(end, work), /home-team-slot|<section class="s home-team"/);
  assert.match(html.slice(plans, html.indexOf('<section data-hide="tab" class="s is-hsc">', plans)),
    /<div class="spacer-10"><\/div><\/div><\/section>$/);
  assert.doesNotMatch(html.slice(plans), /home-team-slot|<section class="s home-team"/);
}

test('team follows presentation inside its last spacer, before tools and work', () => {
  assert.match(home, /<link rel="stylesheet" href="\/landing-primary\/css\/home-team\.css\?v=[^"]+">/);
  assert.match(home, /<script src="\/landing-primary\/js\/home-team-motion\.js\?v=[^"]+" defer><\/script>/);
  assert.match(homeScript, /document\.querySelector\("\[data-client-section\]"\)/);
  assert.match(homeScript, /"NUESTRAS HERRAMIENTAS"/);
  assertTeamBeforeTools(home);
  assert.match(home, /<h2 id="home-team-title" stagger-scroll="" split-text="" class="h-b">Equipo de trabajo<\/h2>/);
  assert.equal((home.match(/<section class="s home-team"/g) ?? []).length, 1);
  assert.ok(home.includes('<div class="spacer-10"></div>'.repeat(3) + '</div></section><section class="s offbrand-plans-section"'));
});

test('team presents four real profiles without fictional disclaimer', () => {
  const team = home.match(/<section class="s home-team"[\s\S]*?<\/section>/)?.[0];
  const cards = [...team.matchAll(/<article class="home-team__member">[\s\S]*?<\/article>/g)].map(([card]) => card);
  assert.equal(cards.length, 4);
  for (const [i, name, role, profession] of [
    [0, 'Stefany Balcázar', 'Sale Engineer', 'Tecnología en desarrollo de software full stack.'],
    [1, 'Christopher Gallardo', 'CTO', 'Tecnología en desarrollo de software.'],
    [2, 'Francisco Gallardo', 'Director Creativo', 'Diseñador Audiovisual y modelado 3D.'],
    [3, 'Camila León', 'Arquitecta de Datos', 'Tecnología en bases de datos y sistemas.'],
  ]) {
    assert.ok(cards[i].includes(name) && cards[i].includes(role) && cards[i].includes(profession));
    assert.match(cards[i], /<p class="home-team__profile">[^<]+<\/p>/);
    assert.match(cards[i], /<p class="home-team__education"><span>(?:Formación|Profesión)<\/span>[^<]+<\/p>/);
    if (i === 0) assert.match(cards[i], /<img src="\/assets\/img\/Stefani-Sale\.png" alt="Stefany Balc\u00e1zar">/);
    else if (i === 1) assert.match(cards[i], /<img src="\/assets\/img\/Christopher-Director\.png" alt="Christopher Gallardo">/);
    else if (i === 2) assert.match(cards[i], /<img src="\/assets\/img\/Director-Creativo\.png" alt="Francisco Gallardo">/);
    else if (i === 3) assert.match(cards[i], /<img src="\/assets\/img\/Camila-Arquitecta\.png" alt="Camila León">/);
  }
  assert.doesNotMatch(team, /Valeria Cruz|ficticio/);
});

test('Francisco portrait uses the real image and accessible name', () => {
  const card = [...home.matchAll(/<article class="home-team__member">[\s\S]*?<\/article>/g)]
    .map(([markup]) => markup).find(markup => markup.includes('Francisco Gallardo'));
  assert.ok(card);
  assert.match(card, /<div class="home-team__photo home-team__photo--portrait"><img src="\/assets\/img\/Director-Creativo\.png" alt="Francisco Gallardo"><\/div>/);
  assert.doesNotMatch(card, /Espacio para foto|<span>Foto<\/span>/);
});

test('GET Francisco portrait returns PNG', { skip: !process.env.HOME_TEAM_BASE_URL }, async () => {
  const image = await fetch(new URL('/assets/img/Director-Creativo.png', process.env.HOME_TEAM_BASE_URL));
  assert.equal(image.status, 200);
  assert.match(image.headers.get('content-type') ?? '', /image\/png/);
  assert.ok((await image.arrayBuffer()).byteLength > 0);
});

test('roles and education have readable, responsive typography', () => {
  assert.match(styles, /\.home-team__intro\s*\{[^}]*font-size: 1rem;[^}]*line-height: 1\.5;/);
  assert.match(styles, /\.home-team__meta\s*\{[^}]*font-size: 1rem;[^}]*font-weight: 600;[^}]*line-height: 1\.4;/);
  assert.match(styles, /\.home-team__meta span:last-child\s*\{[^}]*text-align: right;[^}]*overflow-wrap: anywhere;/);
  assert.match(styles, /\.home-team__education\s*\{[^}]*color: inherit;[^}]*font-size: 1rem;[^}]*line-height: 1\.5;/);
  assert.match(styles, /\.home-team__profile\s*\{\s*font-size: 1rem;\s*\}/);
  assert.match(styles, /\.home-team__education span\s*\{[^}]*font-size: \.875rem;[^}]*font-weight: 600;/);
  assert.match(styles, /html\.dark \.home-team\s*\{[^}]*--team-muted: rgba\(255, 255, 255, \.75\)/);
  assert.match(styles, /\.home-team__member h3\s*\{[^}]*overflow-wrap: anywhere;/);
  assert.match(styles, /\.home-team__member h3\s*\{[^}]*max-width: 100%;[^}]*font-size: clamp\(1\.25rem, 2vw, 1\.75rem\);/);
});

test('carousel progressively enhances without buttons and keeps profiles accessible', () => {
  assert.match(styles, /\.home-team__grid\s*\{\s*display: grid/);
  assert.ok(home.includes('Para cerrar, aleja el ratón o toca fuera. Con teclado, usa Tab para abrir y Esc o Tab para salir.'));
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(motion, /3000/);
  assert.match(motion, /focusin/);
  assert.match(motion, /pointerleave/);
  assert.match(motion, /document\.hidden/);
  assert.doesNotMatch(motion, /<button|aria-hidden|\.inert/);
});

test('portrait boxes contain complete, centered images without distortion', () => {
  assert.match(styles, /\.home-team__photo--portrait\s*\{[^}]*aspect-ratio:\s*1;[^}]*background:\s*transparent/);
  assert.match(styles, /\.home-team__photo:has\(img\)\s*\{[^}]*aspect-ratio:\s*1;[^}]*background:\s*transparent/);
  assert.match(styles, /\.home-team__photo img\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain;[^}]*object-position:\s*center/);
});

function carouselHarness({ fail = false, reduced = false, animated = false, visible = true, observer = true, trajectory = false } = {}) {
  class Node {
    constructor() { this.events = {}; this.attrs = {}; this.dataset = {}; }
    addEventListener(type, fn) { (this.events[type] ??= []).push(fn); }
    removeEventListener(type, fn) { this.events[type] = (this.events[type] ?? []).filter(item => item !== fn); }
    fire(type, event = {}) { for (const fn of this.events[type] ?? []) fn(event); }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key] ?? null; }
    removeAttribute(key) { delete this.attrs[key]; }
  }
  const cards = Array.from({ length: 4 }, () => new Node());
  const grid = new Node();
  grid.setAttribute('aria-describedby', 'home-team-help');
  const help = new Node();
  let inView = visible;
  grid.getBoundingClientRect = () => inView === 'edge'
    ? { left: 0, right: 100, top: 600, bottom: 700, width: 100, height: 100 }
    : inView
    ? { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 }
    : { left: 0, right: 100, top: 1000, bottom: 1100, width: 100, height: 100 };
  const log = [];
  if (animated) {
    const rect = () => { log.push('measure'); return { left: 0, right: 100, top: 0, bottom: 100, width: 100, height: 100 }; };
    const animate = () => { log.push('animate'); return { cancel() { log.push('cancel'); } }; };
    Object.assign(grid, { getBoundingClientRect: rect, animate });
    cards.forEach(card => Object.assign(card, { getBoundingClientRect: rect, animate, offsetWidth: 100, offsetHeight: 100 }));
  }
  const classes = new Set();
  grid.classList = { add: c => classes.add(c), remove: (...names) => names.forEach(c => classes.delete(c)), contains: c => classes.has(c), toggle: (c, force) => force ? classes.add(c) : classes.delete(c) };
  grid.querySelectorAll = () => cards;
  grid.contains = node => node === grid;
  const section = new Node();
  section.closest = () => trajectory ? section : null;
  section.querySelector = selector => selector === '.home-team__grid' ? grid : selector === '.home-team__help' ? help : null;
  section.contains = node => node === grid;
  const document = new Node();
  Object.assign(document, { readyState: 'complete', hidden: false, querySelector: () => section });
  const preference = new Node();
  preference.matches = reduced;
  const hover = new Node();
  hover.matches = true;
  let intersection;
  const window = new Node();
  Object.assign(window, { innerWidth: 800, innerHeight: 600, matchMedia: query => {
    if (fail) throw new Error('matchMedia failed');
    return query.includes('reduced-motion') ? preference : hover;
  } });
  if (observer) window.IntersectionObserver = class { constructor(fn) { intersection = fn; } observe() {} disconnect() {} };
  let interval;
  let nextTimeout = 0;
  const timeouts = new Map();
  runInNewContext(motion, { document, window, Element: class {},
    DOMMatrixReadOnly: class { e = 0; f = 0; },
    getComputedStyle: () => ({ opacity: '1', transform: 'none' }),
    setInterval(fn, delay) { interval = { fn, delay }; return 1; },
    clearInterval() { interval = undefined; },
    setTimeout(fn) { const id = ++nextTimeout; timeouts.set(id, fn); return id; },
    clearTimeout(id) { timeouts.delete(id); },
  });
  return { section, grid, cards, preference, document, window, help, log,
    setVisible(value) { inView = value; if (observer) intersection(); else window.fire('scroll'); },
    move(value, event = 'scroll') { inView = value; window.fire(event); },
    notifyObserver() { intersection?.(); },
    flushTimeouts() { for (const [id, fn] of timeouts) { timeouts.delete(id); fn(); } },
    get timer() { return interval; } };
}

function assertTeamHelp(html) {
  assert.equal((html.match(/\bid="home-team-help"/g) ?? []).length, 1, 'help ID must be unique');
  assert.match(html, /<div class="home-team__grid" role="region" aria-label="Integrantes del equipo" aria-describedby="home-team-help">/);
  assert.match(html, /<p id="home-team-help" class="home-team__help">Haz clic o toca el equipo para abrir sus perfiles\. Para cerrar, aleja el ratón o toca fuera\. Con teclado, usa Tab para abrir y Esc o Tab para salir\.<\/p>/);
}

test('team region references unique accessible interaction help', () => {
  assertTeamHelp(home);
});

test('first entry starts at Stefany after offscreen time; re-entry preserves slide', () => {
  for (const observer of [true, false]) {
    const h = carouselHarness({ visible: false, observer });
    assert.equal(h.timer, undefined, 'no timer during 10 seconds offscreen');
    assert.equal(h.cards[0].dataset.position, 'active');
    h.setVisible(true);
    assert.equal(h.cards[0].dataset.position, 'active');
    assert.equal(h.timer.delay, 3000);
    h.timer.fn();
    assert.equal(h.cards[1].dataset.position, 'active');
    h.setVisible(false);
    assert.equal(h.timer, undefined);
    h.setVisible(true);
    assert.equal(h.cards[1].dataset.position, 'active');
    h.timer.fn();
    assert.equal(h.cards[2].dataset.position, 'active');
    h.timer.fn(); h.timer.fn();
    assert.equal(h.cards[0].dataset.position, 'active');
  }
});

test('edge contact then scroll enters and exits even without another observer notification', () => {
  for (const observer of [true, false]) {
    const h = carouselHarness({ visible: false, observer });
    h.setVisible('edge');
    assert.equal(h.timer, undefined);
    h.move(true);
    assert.equal(h.cards[0].dataset.position, 'active');
    const timer = h.timer;
    assert.equal(timer.delay, 3000);
    h.notifyObserver(); h.move(true, 'resize');
    assert.equal(h.timer, timer, 'duplicate notifications do not restart the interval');
    h.move('edge');
    assert.equal(h.timer, undefined);
    h.move(true);
    assert.equal(h.cards[0].dataset.position, 'active');
    h.timer.fn();
    assert.equal(h.cards[1].dataset.position, 'active');
  }
});

test('timer advances, focus shows all cards and blur resumes, reduced motion changes live', () => {
  const h = carouselHarness();
  assert.equal(h.timer.delay, 3000);
  assert.equal(h.grid.classList.contains('is-carousel'), true);
  assert.deepEqual(h.cards.map(c => c.dataset.position), ['active', 'next', 'back', 'prev']);
  h.timer.fn();
  assert.deepEqual(h.cards.map(c => c.dataset.position), ['prev', 'active', 'next', 'back']);
  h.section.fire('focusin');
  assert.equal(h.timer, undefined);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  let openPrevented = false;
  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() { openPrevented = true; } });
  assert.equal(openPrevented, false, 'expanded text must remain selectable');
  assert.equal(h.grid.attrs.tabindex, '0');
  h.section.fire('focusout', { relatedTarget: null });
  assert.equal(h.grid.classList.contains('is-carousel'), true);
  assert.equal(h.timer.delay, 3000);
  h.preference.matches = true; h.preference.fire('change');
  assert.equal(h.timer, undefined);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  assert.equal(h.cards.length, 4);
  assert.equal(h.grid.attrs.tabindex, undefined);
  h.preference.matches = false; h.preference.fire('change');
  assert.equal(h.grid.classList.contains('is-carousel'), true);
  assert.equal(h.timer.delay, 3000);
  h.section.fire('pointerenter', { pointerType: 'touch' });
  assert.equal(h.timer.delay, 3000);
  h.section.fire('pointerenter', { pointerType: 'mouse' });
  assert.equal(h.timer.delay, 3000);
  h.section.fire('pointerleave', { pointerType: 'mouse' });
  assert.equal(h.timer.delay, 3000);
});

test('shared carousel mounts, updates its accessible description and cleans up on remount', () => {
  const h = carouselHarness({ trajectory: true });
  assert.equal(h.timer, undefined, 'trajectory is not auto-initialized');
  const cleanup = h.window.initHomeTeamCarousel(h.section);
  assert.equal(h.timer.delay, 3000);
  assert.equal(h.grid.getAttribute('aria-describedby'), 'home-team-help');
  h.preference.matches = true; h.preference.fire('change');
  assert.equal(h.help.hidden, true);
  assert.equal(h.grid.getAttribute('aria-describedby'), null);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  h.preference.matches = false; h.preference.fire('change');
  assert.equal(h.help.hidden, false);
  assert.equal(h.grid.getAttribute('aria-describedby'), 'home-team-help');
  cleanup();
  assert.equal(h.timer, undefined);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  assert.equal(h.document.events.pointerdown.length, 0);
  assert.equal(h.preference.events.change.length, 0);
  const cleanupAgain = h.window.initHomeTeamCarousel(h.section);
  assert.equal(h.document.events.pointerdown.length, 1);
  h.timer.fn();
  assert.equal(h.cards[1].dataset.position, 'active');
  cleanupAgain();
});

test('mouse hover keeps rotating; click opens and leaving closes, while touch stays open', () => {
  const h = carouselHarness();
  h.section.fire('pointerenter', { pointerType: 'mouse' });
  h.timer.fn();
  assert.equal(h.cards[1].dataset.position, 'active');
  let prevented = false;
  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() { prevented = true; } });
  h.grid.fire('click', { detail: 1 });
  assert.equal(prevented, true);
  assert.equal(h.timer, undefined);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  let preventedWhileOpen = false;
  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() { preventedWhileOpen = true; } });
  assert.equal(preventedWhileOpen, false);
  h.section.fire('focusin'); // Native mouse selection may focus the grid.
  h.section.fire('pointerleave', { pointerType: 'mouse' });
  assert.equal(h.grid.classList.contains('is-carousel'), true);
  assert.equal(h.timer.delay, 3000);
  h.grid.fire('pointerdown', { pointerType: 'touch' });
  h.grid.fire('click', { detail: 1 });
  h.section.fire('pointerleave', { pointerType: 'touch' });
  assert.equal(h.timer, undefined);
  h.document.fire('pointerdown', { target: {} });
  assert.equal(h.timer.delay, 3000);
});

test('interrupted layout measures live geometry before cancellation and reduced motion cancels animations', () => {
  const h = carouselHarness({ animated: true });
  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() {} });
  h.grid.fire('click', { detail: 1 });
  assert.equal(h.log.filter(x => x === 'animate').length, 5);
  h.log.length = 0;
  h.section.fire('pointerleave', { pointerType: 'mouse' });
  assert.deepEqual(h.log.slice(0, 5), Array(5).fill('measure'));
  assert.equal(h.log[5], 'cancel');
  h.preference.matches = true; h.preference.fire('change');
  assert.equal(h.grid.classList.contains('is-layout-changing'), false);
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  assert.equal(h.timer, undefined);
});

test('drag without click cannot suppress later keyboard focus, including pointer cancellation', () => {
  for (const ending of ['pointerup', 'pointercancel', 'keydown']) {
    const h = carouselHarness();
    h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() {} });
    h.document.fire(ending, ending === 'keydown' ? { key: 'Tab' } : { target: {} });
    h.section.fire('focusin');
    assert.equal(h.grid.classList.contains('is-carousel'), false, ending);
    assert.equal(h.timer, undefined, ending);
    h.section.fire('focusout', { relatedTarget: null });
    assert.equal(h.timer.delay, 3000, ending);
  }
});

test('inside release without click expires modality, while synchronous mouse and touch clicks retain it', () => {
  const h = carouselHarness();
  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() {} });
  h.document.fire('pointerup', { target: h.grid });
  h.flushTimeouts();
  h.section.fire('focusin'); // Programmatic or assistive focus, no keydown.
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  assert.equal(h.timer, undefined);
  h.section.fire('focusout', { relatedTarget: null });

  h.grid.fire('pointerdown', { pointerType: 'mouse', preventDefault() {} });
  h.document.fire('pointerup', { target: h.grid });
  h.grid.fire('click', { detail: 1 });
  h.flushTimeouts();
  h.section.fire('pointerleave', { pointerType: 'mouse' });
  assert.equal(h.grid.classList.contains('is-carousel'), true);

  h.grid.fire('pointerdown', { pointerType: 'touch' });
  h.document.fire('pointerup', { target: h.grid });
  h.grid.fire('click', { detail: 1 });
  h.flushTimeouts();
  h.section.fire('pointerleave', { pointerType: 'mouse' });
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  h.document.fire('pointerdown', { target: {} });
  assert.equal(h.timer.delay, 3000);
});

test('failed carousel initialization and initial reduced motion retain static cards', () => {
  for (const h of [carouselHarness({ fail: true }), carouselHarness({ reduced: true })]) {
    assert.equal(h.grid.classList.contains('is-carousel'), false);
    assert.equal(h.cards.length, 4);
    assert.equal(h.timer, undefined);
  }
});

test('click opens list, outside pointer closes it, and visibility suspends autoplay', () => {
  const h = carouselHarness();
  h.grid.fire('click', { detail: 1 });
  assert.equal(h.grid.classList.contains('is-carousel'), false);
  assert.equal(h.timer, undefined);
  h.document.fire('pointerdown', { target: {} });
  assert.equal(h.grid.classList.contains('is-carousel'), true);
  assert.equal(h.timer.delay, 3000);
  h.document.hidden = true; h.document.fire('visibilitychange');
  assert.equal(h.timer, undefined);
  h.document.hidden = false; h.document.fire('visibilitychange');
  assert.equal(h.timer.delay, 3000);
});

// Run with HOME_TEAM_BASE_URL=http://127.0.0.1:<port> against a local Next server.
// This verifies the public route and actual stylesheet response, not just source text.
test('GET / serves the static landing with its reachable team stylesheet', {
  skip: !process.env.HOME_TEAM_BASE_URL,
}, async () => {
  const origin = process.env.HOME_TEAM_BASE_URL;
  const root = await fetch(new URL('/', origin), { redirect: 'manual' });
  const direct = await fetch(new URL('/landing-primary/index.html', origin), { redirect: 'manual' });
  assert.equal(root.status, 200, '/ must respond directly, not with a 3xx redirect');
  assert.equal(root.headers.get('location'), null, '/ must not set a redirect Location');
  assert.equal(direct.status, 200);
  assert.match(root.headers.get('content-type') ?? '', /text\/html/);
  const body = await root.text();
  assert.equal(body, await direct.text(), 'rewrite / must serve the landing HTML, not src/app/page.tsx');
  const normalized = normalizeHtml(body);
  assertTeamBeforeTools(normalized);
  assertTeamHelp(normalized);
  const href = normalized.match(/<link rel="stylesheet" href="([^"]*\/css\/home-team\.css(?:\?[^\"]*)?)"/)?.[1];
  assert.ok(href, 'the served HTML must link the team stylesheet');
  const css = await fetch(new URL(href, origin), { redirect: 'manual' });
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type') ?? '', /text\/css/);
  assert.match(await css.text(), /\.home-team__grid\s*\{\s*display:\s*grid/);
  assert.equal(href, '/landing-primary/css/home-team.css?v=20261112-team-6');
  const script = normalized.match(/<script src="([^\"]*\/js\/home-team-motion\.js(?:\?[^\"]*)?)" defer>/)?.[1];
  assert.equal(script, '/landing-primary/js/home-team-motion.js?v=20261113-team-10');
  const js = await fetch(new URL(script, origin), { redirect: 'manual' });
  assert.equal(js.status, 200);
  assert.match(js.headers.get('content-type') ?? '', /javascript/);
  assert.match(await js.text(), /prefers-reduced-motion: reduce/);
  const image = await fetch(new URL('/assets/img/Stefani-Sale.png', origin));
  assert.equal(image.status, 200);
  assert.match(image.headers.get('content-type') ?? '', /image\/png/);
  const christopher = await fetch(new URL('/assets/img/Christopher-Director.png', origin));
  assert.equal(christopher.status, 200);
  assert.match(christopher.headers.get('content-type') ?? '', /image\/png/);
  const camila = await fetch(new URL('/assets/img/Camila-Arquitecta.png', origin));
  assert.equal(camila.status, 200);
  assert.match(camila.headers.get('content-type') ?? '', /image\/png/);
});
