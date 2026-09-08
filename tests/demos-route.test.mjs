import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const port = 3227;
const externalBaseUrl = process.env.DEMO_BASE_URL;
const baseUrl = externalBaseUrl ?? `http://127.0.0.1:${port}`;

function startServer() {
  const nextCli = fileURLToPath(
    new URL("../node_modules/next/dist/bin/next", import.meta.url),
  );

  return spawn(
    process.execPath,
    [nextCli, "dev", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: process.cwd(), stdio: "ignore" },
  );
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Next.js is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next development server did not start in time");
}

test("serves the supplied OFF+BRAND export as an isolated static demo", async (t) => {
  const server = externalBaseUrl ? null : startServer();
  if (server) t.after(() => server.kill());
  await waitForServer();

  const response = await fetch(`${baseUrl}/demos/`);
  const page = await response.text();

  assert.equal(response.status, 200);
  assert.match(page, /<title>OFF\+BRAND\. \| Global Creative &amp; Technology Studio<\/title>/);
  assert.match(page, /A different/i);
  assert.match(page, /Creative/i);
  assert.match(page, /Trusted by/i);
  assert.match(page, /Featured work/i);
  assert.match(page, /How about/i);
  assert.match(page, /Microsoft/i);
  assert.match(page, /Trevor Noah/i);
  assert.match(page, /Lando Norris/i);
  assert.match(page, /Vizcom/i);

  assert.match(page, /<base href="\/demos-offbrand\/">/);
  assert.match(page, /\/demos-offbrand\/css\/offbrand-2023\.shared\.0746f2a75\.min\.css/);
  assert.match(page, /\/demos-offbrand\/media\/OFF_siteclips_13\.mp4/);
  assert.match(page, /\/demos-offbrand\/js\/ob\.2026\.index\.23\.js/);

  for (const forbidden of [
    "data-promo-banner",
    "Abrir asistente",
    "codeCursorGradient",
    "solid-grad-telon-single",
    "intellimize",
    "google_tags_first_party",
    "googletagmanager",
    "cloudflarestream.com",
    "assets.itsoffbrand.io",
    "w-webflow-badge",
  ]) {
    assert.doesNotMatch(page, new RegExp(forbidden, "i"));
  }

  assert.doesNotMatch(page, /<(?:script|link|source)\b[^>]+(?:src|href)="https?:\/\//i);
  assert.doesNotMatch(page, /<a\b[^>]+href="(?:https?:\/\/|\/(?!demos-offbrand\/))/i);
  assert.doesNotMatch(page, /<form\b/i);

  const assets = [
    ["/demos-offbrand/css/offbrand-2023.shared.0746f2a75.min.css", /^text\/css/],
    ["/demos-offbrand/fonts/64ff29f82f284681edeb53a9_AtAero-Retina-dot-edit.woff2", /^font\/woff2/],
    ["/demos-offbrand/images/64ce56bd39c2f116181f1aa5_ob-2023-logomark-svg.svg", /^image\/svg\+xml/],
    ["/demos-offbrand/images/6a54f691c4624186bbeb1157_cs-trevor-main-image.webp", /^image\/webp/],
    ["/demos-offbrand/images/68ece3e91ef2f1125c5b57eb_lando-cs-hero-img.jpg", /^image\/jpeg/],
    ["/demos-offbrand/images/ob_texture-old.webp", /^image\/webp/],
    ["/demos-offbrand/images/ob_texture-old-2.jpg", /^image\/jpeg/],
    ["/demos-offbrand/media/OFF_siteclips_13.mp4", /^video\/mp4/],
    ["/demos-offbrand/js/ob.2026.index.23.js", /^(?:text|application)\/javascript/],
    ["/demos-offbrand/js/hls.light.min.js", /^(?:text|application)\/javascript/],
    ["/demos-offbrand/js/demo-local.js", /^(?:text|application)\/javascript/],
  ];

  for (const [pathname, contentTypePattern] of assets) {
    const assetResponse = await fetch(`${baseUrl}${pathname}`);
    assert.equal(assetResponse.status, 200, pathname);
    assert.match(assetResponse.headers.get("content-type") ?? "", contentTypePattern);
  }

  const safetyScriptResponse = await fetch(`${baseUrl}/demos-offbrand/js/demo-local.js`);
  const safetyScript = await safetyScriptResponse.text();
  assert.match(safetyScript, /removeAttribute\("data-start"\)/);
  assert.match(safetyScript, /classList\.remove\("anti-flicker", "lenis-stopped"\)/);
  assert.match(safetyScript, /animationRuntimeReady/);
  assert.doesNotMatch(safetyScript, /setTimeout\(releasePage,\s*1400\)/);

  const animationScriptResponse = await fetch(
    `${baseUrl}/demos-offbrand/js/ob.2026.index.23.js`,
  );
  const animationScript = await animationScriptResponse.text();
  assert.match(animationScript, /\/demos-offbrand\/images\/ob_texture-old\.webp/);
  assert.match(animationScript, /\/demos-offbrand\/images\/ob_texture-old-2\.jpg/);
  assert.match(animationScript, /\/demos-offbrand\/js\/hls\.light\.min\.js/);
  assert.doesNotMatch(animationScript, /https:\/\/assets\.itsoffbrand\.io/i);
  assert.doesNotMatch(animationScript, /https:\/\/cdn\.jsdelivr\.net/i);
});
