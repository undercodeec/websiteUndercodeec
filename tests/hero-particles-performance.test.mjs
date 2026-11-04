import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("mobile hero mounts no canvas or WebGPU experience", async () => {
  const source = await readFile("public/landing-primary/js/home-hero-particles.js", "utf8");
  const frames = [];
  let drawnParticles = 0;
  let gpuRequests = 0;
  const classes = new Set();
  const context = {
    setTransform() {}, clearRect() {},
    fillRect() { drawnParticles += 1; },
  };
  const canvas = { style: {}, getContext: () => context };
  let createdCanvases = 0;
  const host = {
    clientWidth: 390,
    clientHeight: 800,
    replaceChildren() { this.canvas = null; },
    append(element) { this.canvas = element; },
    getBoundingClientRect: () => ({ left: 0, top: 0 }),
  };
  const clip = {
    dataset: {}, style: { setProperty() {} }, isConnected: true,
    classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); } },
    querySelector: () => host,
    setAttribute() {}, append() {},
  };
  const hero = {
    closest: (selector) => selector === "[data-primary-page]" ? {} : null,
    getBoundingClientRect: () => ({ top: 0, bottom: 800, height: 800 }),
    addEventListener() {}, removeEventListener() {},
  };
  const mobileMedia = { matches: true, addEventListener() {}, removeEventListener() {} };
  const scope = {
    document: {
      readyState: "loading", hidden: false,
      createElement: () => { createdCanvases += 1; return canvas; },
      addEventListener() {}, removeEventListener() {},
    },
    navigator: { gpu: { requestAdapter() { gpuRequests += 1; throw new Error("WebGPU should not load"); } } },
    matchMedia: (query) => query === "(max-width: 767px)" ? mobileMedia : { matches: false },
    innerWidth: 390, innerHeight: 800, devicePixelRatio: 3,
    addEventListener() {}, removeEventListener() {},
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    cancelAnimationFrame() {},
    IntersectionObserver: class { observe() {} disconnect() {} },
    performance: { now: () => 0 },
  };
  scope.window = scope;
  scope.IntersectionObserver = scope.IntersectionObserver;
  runInNewContext(source, scope);

  const dispose = scope.mountHeroParticles(hero, clip);
  assert.equal(gpuRequests, 0);
  assert.equal(createdCanvases, 0);
  assert.equal(clip.dataset.heroParticlesMounted, undefined);
  for (const frame of frames.splice(0)) frame(100);
  assert.equal(drawnParticles, 0);
  assert.equal(classes.size, 0);
  dispose();
});

test("desktop WebGPU scene limits particles, resolution and updates", async () => {
  const source = await readFile("public/landing-primary/js/home-hero-particles.js", "utf8");
  let now = 40;
  let updates = 0;
  let pixelRatio = 0;
  let particleCount = 0;
  const scene = {
    particles: {
      parameters: { particleCount: 40960, simulationSpeed: 1 },
      updateParticleCount() { particleCount = this.parameters.particleCount; },
    },
    renderer: { setPixelRatio(value) { pixelRatio = value; } },
    cameras: { main: { position: {} } },
    resize() {}, render() {}, update() { updates += 1; },
  };
  const experience = { particles: scene, dispose() {} };
  const host = { clientWidth: 1100, clientHeight: 800, isConnected: true, replaceChildren() {} };
  const clip = {
    dataset: {}, isConnected: true,
    classList: { add() {}, remove() {} },
    style: { setProperty() {} },
    querySelector: () => host,
    setAttribute() {},
  };
  const hero = {
    closest: (selector) => selector === "[data-primary-page]" ? {} : null,
    getBoundingClientRect: () => ({ top: 0, bottom: 800, height: 800 }),
  };
  const scope = {
    document: { readyState: "loading", hidden: false, addEventListener() {}, removeEventListener() {} },
    navigator: { gpu: { requestAdapter: async () => ({}) } },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    __createHeroParticleExperience(_host, onReady) {
      queueMicrotask(onReady);
      return experience;
    },
    innerWidth: 1200, innerHeight: 800, devicePixelRatio: 2,
    addEventListener() {}, removeEventListener() {},
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    performance: { now: () => now },
  };
  scope.window = scope;
  runInNewContext(source, scope);

  const dispose = scope.mountHeroParticles(hero, clip);
  await new Promise(setImmediate);
  assert.equal(particleCount, 16384);
  assert.equal(pixelRatio, 1.25);
  assert.equal(scene.particles.parameters.simulationSpeed, 1.5);
  for (let frame = 0; frame < 60; frame += 1) {
    now = 40 + frame * (1000 / 60);
    scene.update();
  }
  assert.ok(updates >= 39 && updates <= 41, `expected about 40 updates, received ${updates}`);
  dispose();
});

test("generated WebGPU engine starts with the smaller simulation", async () => {
  const bundle = await readFile("public/landing-primary/js/auros-hero-particles.bundle.js", "utf8");
  assert.match(bundle, /maxParticles=16384;gridSize1d=48;/);
  assert.match(bundle, /parameters=\{particleCount:16384,simulationSpeed:1\}/);
  assert.match(bundle, /setPixelRatio\(Jr\.clamp\(window\.devicePixelRatio,1,1\.25\)\)/);
});
