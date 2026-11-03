/*
 * Run against a production server, for example:
 *   pnpm build
 *   pnpm start --port 3100
 *   PUPPETEER_CORE_PATH=/path/to/puppeteer-core node scripts/check-carousel-hydration.cjs
 * Chrome must be installed. Set CHROME_PATH or TARGET_PORT if needed.
 */
const assert = require('node:assert/strict');

const puppeteer = require(process.env.PUPPETEER_CORE_PATH || 'puppeteer-core');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const base = `http://localhost:${process.env.TARGET_PORT || '3100'}`;
const widths = [320, 375, 412, 520, 521, 768, 1440];
const routes = [
  { path: '/servicios/', loop: true, count: 19 },
  { path: '/aplicaciones-moviles/', loop: false, count: 5 },
];

function inspect() {
  const swiper = document.querySelector('.swiper');
  const slides = [...(swiper?.querySelectorAll('.swiper-slide') || [])];
  const firstOriginal = slides.find(slide => slide.getAttribute('data-swiper-slide-index') === '0' && !slide.classList.contains('swiper-slide-duplicate')) || slides[0];
  const active = swiper?.querySelector('.swiper-slide-active');
  const box = element => {
    const rect = element?.getBoundingClientRect();
    return rect && { x: rect.x, width: rect.width };
  };
  return {
    count: slides.length,
    original: box(firstOriginal),
    active: box(active),
    realIndex: swiper?.swiper?.realIndex,
    initialized: Boolean(swiper?.swiper?.initialized),
    overflow: document.documentElement.scrollWidth - innerWidth,
    brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).length,
  };
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
  try {
    for (const route of routes) {
      for (const width of widths) {
        const server = await browser.newPage();
        await server.setViewport({ width, height: 823 });
        await server.setJavaScriptEnabled(false);
        await server.goto(base + route.path, { waitUntil: 'domcontentloaded' });
        await server.waitForFunction(() => document.styleSheets.length > 0, { timeout: 10000 });
        await server.evaluate(() => document.fonts.ready);
        const before = await server.evaluate(inspect);
        await server.close();

        const client = await browser.newPage();
        await client.setViewport({ width, height: 823 });
        const errors = [];
        client.on('pageerror', error => errors.push(error.message));
        await client.goto(base + route.path, { waitUntil: 'domcontentloaded' });
        await client.waitForFunction(() => document.querySelector('.swiper')?.swiper?.initialized, { timeout: 10000 });
        await client.evaluate(() => document.fonts.ready);
        const after = await client.evaluate(inspect);
        await client.close();

        const label = `${route.path} ${width}px`;
        assert.deepEqual(errors, [], `${label}: browser errors`);
        assert.equal(before.count, route.count, `${label}: server slide count`);
        assert.equal(after.count, before.count, `${label}: hydration changed slide count`);
        assert.equal(after.realIndex, 0, `${label}: first slide changed`);
        assert.equal(before.overflow, 0, `${label}: server-rendered horizontal overflow`);
        assert.equal(after.overflow, 0, `${label}: horizontal overflow`);
        assert.equal(after.brokenImages, 0, `${label}: broken images`);
        assert.ok(before.original && after.active, `${label}: first slide is missing`);
        assert.ok(Math.abs(before.original.x - after.active.x) <= 12, `${label}: first slide shifted horizontally`);
        assert.ok(Math.abs(before.original.width - after.active.width) <= 12, `${label}: first slide changed width`);
        console.log(`PASS ${label}: ${after.count} slides, no hydration error`);
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
